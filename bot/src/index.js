import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import {
    supabase,
    updateSystemStatus,
    upsertToken,
    recordTrade,
    createPosition,
    getOpenPositions,
    closePosition,
    updateWalletBalance
} from './lib/supabase.js';
import {
    getTokenInfo,
    getBnbPrice,
    getLatestPairs,
    getTrendingTokens
} from './lib/dexscreener.js';
import {
    loadWallet,
    getWallet,
    getBalance,
    getWalletAddress,
    getTokenBalance,
    checkNetwork
} from './lib/wallet.js';
import { buyToken, sellToken, canSell } from './lib/pancakeswap.js';
import { sleep, containsBlacklistWord, containsWhitelistWord } from './lib/utils.js';
import { analyzeToken, analyzeTokenWithFilters } from './lib/claude.js';
import {
    logHeader,
    logToken,
    logBuy,
    logSell,
    logSkip,
    logAnalysis,
    logStatus,
    logError,
    logSuccess,
    logInfo,
    logWarning,
    logPosition,
    logStats
} from './lib/logger.js';

// ═══════════════════════════════════════════════════════════════
// 猴王 - BSC 交易机器人
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 交易配置
// ═══════════════════════════════════════════════════════════════
const TRADING_CONFIG = {
    MIN_SCORE_TO_BUY: 60,           // 最低买入分数
    MAX_TRADE_BNB: 0.05,            // 每次交易最大 BNB
    MIN_TRADE_BNB: 0.01,            // 每次交易最小 BNB
    STOP_LOSS_PERCENT: -25,         // 止损百分比
    TAKE_PROFIT_PERCENT: 50,        // 止盈百分比
    POSITION_CHECK_INTERVAL: 30000, // 持仓检查间隔 (30秒)
    TOKEN_SCAN_INTERVAL: 60000,     // 扫描新代币间隔 (60秒)
    STATS_UPDATE_INTERVAL: 60000,   // 统计更新间隔 (60秒)
    BALANCE_UPDATE_INTERVAL: 10000, // 余额更新间隔 (10秒)
    SLIPPAGE: 15,                   // 滑点百分比
    MIN_LIQUIDITY: 1000,            // 最小流动性 ($)
    MIN_MC: 5000,                   // 最小市值 ($)
    MAX_MC: 500000,                 // 最大市值 ($)
    USE_CLAUDE: false,              // 是否使用 Claude AI
    MAX_TRADES_PER_MINUTE: 2,       // 每分钟最大交易数
    RATE_LIMIT_WINDOW: 60000        // 速率限制窗口 (60秒)
};

// 速率限制
let recentTrades = [];
const processedTokens = new Set();

// ═══════════════════════════════════════════════════════════════
// EXPRESS API 服务器
// ═══════════════════════════════════════════════════════════════
const app = express();
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', async (req, res) => {
    const balance = await getBalance();
    res.json({
        status: '在线',
        chain: 'BSC',
        wallet: getWalletAddress(),
        balance,
        uptime: process.uptime()
    });
});

// 手动买入
app.post('/buy', async (req, res) => {
    const { ca, amount, slippage } = req.body;
    const tx = await buyToken(ca, amount, slippage || TRADING_CONFIG.SLIPPAGE);
    res.json({ success: !!tx, hash: tx });
});

// 手动卖出
app.post('/sell', async (req, res) => {
    const { ca, percent, slippage } = req.body;
    const tx = await sellToken(ca, percent || 100, slippage || TRADING_CONFIG.SLIPPAGE);
    res.json({ success: !!tx, hash: tx });
});

// 获取持仓
app.get('/positions', async (req, res) => {
    const positions = await getOpenPositions();
    res.json(positions);
});

// 获取代币信息
app.get('/token/:ca', async (req, res) => {
    const info = await getTokenInfo(req.params.ca);
    res.json(info);
});

// 获取热门代币
app.get('/trending', async (req, res) => {
    const tokens = await getTrendingTokens();
    res.json(tokens);
});

app.listen(config.PORT, () => {
    logInfo(`API 服务器运行在 http://localhost:${config.PORT}`);
});

// ═══════════════════════════════════════════════════════════════
// 速率限制检查
// ═══════════════════════════════════════════════════════════════
function canTrade() {
    const now = Date.now();
    // 清理过期的交易记录
    recentTrades = recentTrades.filter(t => now - t < TRADING_CONFIG.RATE_LIMIT_WINDOW);
    return recentTrades.length < TRADING_CONFIG.MAX_TRADES_PER_MINUTE;
}

function recordTradeTime() {
    recentTrades.push(Date.now());
}

// ═══════════════════════════════════════════════════════════════
// 处理代币
// ═══════════════════════════════════════════════════════════════
async function processToken(tokenAddress, tokenInfo) {
    logInfo(`分析代币: ${tokenInfo.name} (${tokenInfo.symbol})`);

    // 基础过滤
    if (tokenInfo.liquidity < TRADING_CONFIG.MIN_LIQUIDITY) {
        logSkip(tokenInfo.symbol, tokenInfo.mc, '流动性太低');
        return null;
    }

    if (tokenInfo.mc < TRADING_CONFIG.MIN_MC || tokenInfo.mc > TRADING_CONFIG.MAX_MC) {
        logSkip(tokenInfo.symbol, tokenInfo.mc, '市值不在范围内');
        return null;
    }

    // 黑名单检查
    if (containsBlacklistWord(tokenInfo.name) || containsBlacklistWord(tokenInfo.symbol)) {
        logSkip(tokenInfo.symbol, tokenInfo.mc, '包含黑名单词汇');
        await upsertToken({ ca: tokenAddress, status: 'blacklisted' });
        return null;
    }

    // 蜜罐检查
    const sellable = await canSell(tokenAddress);
    if (!sellable) {
        logSkip(tokenInfo.symbol, tokenInfo.mc, '蜜罐检测');
        await upsertToken({ ca: tokenAddress, status: 'honeypot' });
        return null;
    }

    // 保存到数据库
    await upsertToken({
        ca: tokenAddress,
        nome: tokenInfo.name,
        simbolo: tokenInfo.symbol,
        logo: tokenInfo.logo,
        status: 'analyzing'
    });

    // 分析代币
    const analysis = await analyzeToken(tokenInfo, TRADING_CONFIG.USE_CLAUDE);
    logAnalysis(tokenInfo.symbol, analysis.score, analysis.decision);

    // 更新数据库
    await upsertToken({
        ca: tokenAddress,
        nome: tokenInfo.name,
        simbolo: tokenInfo.symbol,
        logo: tokenInfo.logo,
        market_cap: tokenInfo.mc,
        preco: tokenInfo.price,
        liquidity: tokenInfo.liquidity,
        volume_24h: tokenInfo.volume24h,
        claude_score: analysis.score,
        claude_decision: analysis.decision,
        claude_reasons: analysis.reasons,
        claude_red_flags: analysis.redFlags,
        narrative_score: analysis.narrative_score,
        ticker_score: analysis.ticker_score,
        status: analysis.decision === 'BUY' ? 'approved' : 'rejected'
    });

    // 格式化日志
    logToken({
        action: analysis.decision === 'BUY' ? '买入' : '跳过',
        symbol: tokenInfo.symbol,
        mc: tokenInfo.mc,
        mcChange: tokenInfo.priceChange24h || 0,
        bnb: 0,
        vol5m: tokenInfo.volume1h || 0,
        volTotal: tokenInfo.liquidity,
        volPercent: analysis.score,
        extra: `分数: ${analysis.score}`
    });

    // 自动买入
    if (analysis.score >= TRADING_CONFIG.MIN_SCORE_TO_BUY && analysis.decision === 'BUY') {
        if (!canTrade()) {
            logWarning('达到速率限制，跳过买入');
            return analysis;
        }

        const balance = await getBalance();
        const amountToBuy = Math.min(
            TRADING_CONFIG.MAX_TRADE_BNB,
            Math.max(TRADING_CONFIG.MIN_TRADE_BNB, balance * 0.1)
        );

        if (amountToBuy >= TRADING_CONFIG.MIN_TRADE_BNB && balance >= amountToBuy + 0.01) {
            const tx = await buyToken(tokenAddress, amountToBuy, TRADING_CONFIG.SLIPPAGE);

            if (tx) {
                recordTradeTime();
                logBuy(tokenInfo.symbol, tokenInfo.mc, amountToBuy, `交易哈希: ${tx.slice(0, 20)}...`);

                await recordTrade({
                    token_id: tokenAddress,
                    tipo: 'buy',
                    valor_bnb: amountToBuy,
                    preco: tokenInfo.price,
                    tx_signature: tx,
                    narrative_score: analysis.narrative_score,
                    ticker_score: analysis.ticker_score,
                    analysis_reason: analysis.reasons?.join('; ')
                });

                await createPosition({
                    token_id: tokenAddress,
                    status: 'open',
                    valor_bnb: amountToBuy,
                    entry_price: tokenInfo.price
                });

                await upsertToken({ ca: tokenAddress, status: 'holding' });
            }
        } else {
            logWarning('余额不足');
        }
    }

    return analysis;
}

// ═══════════════════════════════════════════════════════════════
// 监控持仓 (止损/止盈)
// ═══════════════════════════════════════════════════════════════
async function monitorPositions() {
    const positions = await getOpenPositions();

    for (const position of positions) {
        const info = await getTokenInfo(position.token_id);
        if (!info) continue;

        const pnlPercent = ((info.price - position.entry_price) / position.entry_price) * 100;

        // 更新持仓信息
        await supabase.from('positions').update({
            current_price: info.price,
            pnl_percent: pnlPercent,
            pnl_bnb: position.valor_bnb * (pnlPercent / 100)
        }).eq('id', position.id);

        logPosition(
            position.tokens?.simbolo || '???',
            position.entry_price,
            info.price,
            pnlPercent,
            position.valor_bnb
        );

        // 止盈
        if (pnlPercent >= TRADING_CONFIG.TAKE_PROFIT_PERCENT) {
            const tx = await sellToken(position.token_id, 100, TRADING_CONFIG.SLIPPAGE);
            if (tx) {
                const pnlBnb = position.valor_bnb * (pnlPercent / 100);
                logSell(
                    position.tokens?.simbolo,
                    info.mc,
                    position.valor_bnb + pnlBnb,
                    pnlPercent,
                    '止盈'
                );
                await closePosition(position.id, pnlBnb);
                await recordTrade({
                    token_id: position.token_id,
                    tipo: 'sell',
                    valor_bnb: position.valor_bnb + pnlBnb,
                    preco: info.price,
                    pnl_bnb: pnlBnb,
                    tx_signature: tx
                });
                await upsertToken({ ca: position.token_id, status: 'sold_tp' });
            }
        }

        // 止损
        if (pnlPercent <= TRADING_CONFIG.STOP_LOSS_PERCENT) {
            const tx = await sellToken(position.token_id, 100, TRADING_CONFIG.SLIPPAGE);
            if (tx) {
                const pnlBnb = position.valor_bnb * (pnlPercent / 100);
                logSell(
                    position.tokens?.simbolo,
                    info.mc,
                    position.valor_bnb + pnlBnb,
                    pnlPercent,
                    '止损'
                );
                await closePosition(position.id, pnlBnb);
                await recordTrade({
                    token_id: position.token_id,
                    tipo: 'sell',
                    valor_bnb: position.valor_bnb + pnlBnb,
                    preco: info.price,
                    pnl_bnb: pnlBnb,
                    tx_signature: tx
                });
                await upsertToken({ ca: position.token_id, status: 'sold_sl' });
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 更新统计数据
// ═══════════════════════════════════════════════════════════════
async function updateStats() {
    const wallet = getWallet();
    const balance = await getBalance();

    const { data: trades } = await supabase.from('trades').select('*').eq('tipo', 'sell');

    let totalPnl = 0;
    let wins = 0;
    let losses = 0;

    trades?.forEach(t => {
        if (t.pnl_bnb) {
            totalPnl += t.pnl_bnb;
            if (t.pnl_bnb > 0) wins++;
            else losses++;
        }
    });

    const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

    await updateSystemStatus({
        status: '在线',
        wallet_address: wallet?.address || null,
        balance_bnb: balance,
        total_pnl: totalPnl,
        total_trades: (trades?.length || 0),
        wins,
        losses,
        win_rate: winRate
    });

    logStats({
        balance,
        pnl: totalPnl,
        winRate,
        wins,
        losses,
        totalTrades: trades?.length || 0
    });
}

// ═══════════════════════════════════════════════════════════════
// 扫描新代币
// ═══════════════════════════════════════════════════════════════
async function scanNewTokens() {
    try {
        logInfo('扫描新代币中...');
        const pairs = await getLatestPairs('bsc');

        for (const pair of pairs.slice(0, 20)) {
            if (processedTokens.has(pair.address)) continue;
            processedTokens.add(pair.address);

            // 基础过滤
            if (pair.liquidity < TRADING_CONFIG.MIN_LIQUIDITY) continue;
            if (pair.mc < TRADING_CONFIG.MIN_MC || pair.mc > TRADING_CONFIG.MAX_MC) continue;

            // 获取完整信息
            const info = await getTokenInfo(pair.address);
            if (info) {
                await processToken(pair.address, info);
            }

            await sleep(2000); // 速率限制
        }
    } catch (e) {
        logError(`扫描错误: ${e.message}`);
    }
}

// ═══════════════════════════════════════════════════════════════
// 更新余额
// ═══════════════════════════════════════════════════════════════
async function updateBalance() {
    const address = getWalletAddress();
    if (address) {
        const balance = await getBalance();
        await updateWalletBalance(address, balance);
    }
}

// ═══════════════════════════════════════════════════════════════
// 主函数
// ═══════════════════════════════════════════════════════════════
async function main() {
    logHeader('猴王 BSC 交易机器人 启动中...');

    // 检查网络
    const networkOk = await checkNetwork();
    if (!networkOk) {
        logError('网络连接失败，请检查 RPC 设置');
        process.exit(1);
    }

    // 加载钱包
    const wallet = loadWallet();
    if (wallet) {
        const balance = await getBalance();
        logStatus('启动中', balance, 0, 0, `钱包: ${getWalletAddress().slice(0, 10)}...`);
    } else {
        logWarning('未配置钱包，机器人将在只读模式下运行');
    }

    // 初始状态
    await updateSystemStatus({
        status: '启动中',
        wallet_address: getWalletAddress(),
        balance_bnb: await getBalance()
    });

    // 获取 BNB 价格
    const bnbPrice = await getBnbPrice();
    logSuccess(`BNB 价格: $${bnbPrice.toFixed(2)}`);

    await updateSystemStatus({ status: '在线' });
    logSuccess('连接到 BSC 网络成功');

    // 初始扫描
    await scanNewTokens();

    // 启动定时任务
    setInterval(scanNewTokens, TRADING_CONFIG.TOKEN_SCAN_INTERVAL);
    setInterval(monitorPositions, TRADING_CONFIG.POSITION_CHECK_INTERVAL);
    setInterval(updateStats, TRADING_CONFIG.STATS_UPDATE_INTERVAL);
    setInterval(updateBalance, TRADING_CONFIG.BALANCE_UPDATE_INTERVAL);

    // 定期状态日志
    setInterval(async () => {
        const balance = await getBalance();
        const { data: trades } = await supabase.from('trades').select('*').eq('tipo', 'sell');

        let totalPnl = 0, wins = 0, losses = 0;
        trades?.forEach(t => {
            if (t.pnl_bnb) {
                totalPnl += t.pnl_bnb;
                if (t.pnl_bnb > 0) wins++; else losses++;
            }
        });
        const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

        logStatus('在线', balance, totalPnl, winRate, `${trades?.length || 0} 笔交易`);
    }, 60000);

    logSuccess('猴王启动成功!');
    logInfo('开始监控 BSC 网络上的新代币...');
}

// ═══════════════════════════════════════════════════════════════
// 优雅关闭
// ═══════════════════════════════════════════════════════════════
async function shutdown(signal) {
    logInfo(`收到 ${signal} 信号，正在关闭...`);

    try {
        await updateSystemStatus({ status: '离线' });
        logSuccess('状态已更新为离线');

        await new Promise(resolve => setTimeout(resolve, 1000));

        logHeader('猴王已关闭');

        process.exit(0);
    } catch (error) {
        logError(`关闭错误: ${error.message}`);
        process.exit(1);
    }
}

// 捕获终止信号
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // kill
process.on('uncaughtException', async (error) => {
    logError(`未捕获的异常: ${error.message}`);
    await updateSystemStatus({ status: '错误' });
    process.exit(1);
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('[致命错误] 未处理的 Promise 拒绝:', reason);
    await updateSystemStatus({ status: '错误' });
    process.exit(1);
});

main().catch(console.error);
