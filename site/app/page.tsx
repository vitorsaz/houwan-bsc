'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getSupabase, Token, Trade, SystemStatus } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// 猴王 - 主仪表板
// ═══════════════════════════════════════════════════════════════

// 模拟数据 - 用于演示
const MOCK_STATUS: SystemStatus = {
    id: 1,
    status: '在线',
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE58',
    balance_bnb: 2.4567,
    total_pnl: 0.3421,
    total_trades: 47,
    wins: 31,
    losses: 16,
    win_rate: 65.96,
    updated_at: new Date().toISOString()
};

const MOCK_TOKENS: Token[] = [
    {
        ca: '0x1234567890abcdef1234567890abcdef12345678',
        nome: 'PepeBSC',
        simbolo: 'PEPEB',
        logo: '/monkey-logo.png',
        market_cap: 125000,
        preco: 0.00000234,
        holders: 1523,
        liquidity: 45000,
        volume_24h: 89000,
        score: 78,
        claude_score: 78,
        claude_decision: 'BUY',
        status: 'holding',
        criado_em: new Date(Date.now() - 3600000).toISOString()
    },
    {
        ca: '0xabcdef1234567890abcdef1234567890abcdef12',
        nome: 'MoonDog',
        simbolo: 'MDOG',
        logo: '/monkey-logo.png',
        market_cap: 89000,
        preco: 0.00000156,
        holders: 876,
        liquidity: 32000,
        volume_24h: 56000,
        score: 72,
        claude_score: 72,
        claude_decision: 'BUY',
        status: 'sold_tp',
        criado_em: new Date(Date.now() - 7200000).toISOString()
    },
    {
        ca: '0x9876543210fedcba9876543210fedcba98765432',
        nome: 'SafeElonMars',
        simbolo: 'SEM',
        logo: '/monkey-logo.png',
        market_cap: 45000,
        preco: 0.00000089,
        holders: 234,
        liquidity: 12000,
        volume_24h: 23000,
        score: 45,
        claude_score: 45,
        claude_decision: 'SKIP',
        status: 'rejected',
        criado_em: new Date(Date.now() - 10800000).toISOString()
    },
    {
        ca: '0xfedcba9876543210fedcba9876543210fedcba98',
        nome: 'BabyDragon',
        simbolo: 'BDRG',
        logo: '/monkey-logo.png',
        market_cap: 156000,
        preco: 0.00000345,
        holders: 2341,
        liquidity: 67000,
        volume_24h: 134000,
        score: 82,
        claude_score: 82,
        claude_decision: 'BUY',
        status: 'analyzing',
        criado_em: new Date(Date.now() - 1800000).toISOString()
    }
];

const MOCK_TRADES: Trade[] = [
    {
        id: '1',
        token_id: '0x1234567890abcdef1234567890abcdef12345678',
        tipo: 'buy',
        valor_bnb: 0.05,
        preco: 0.00000234,
        pnl_bnb: null,
        tx_signature: '0xabc123...',
        data: new Date(Date.now() - 3600000).toISOString(),
        tokens: MOCK_TOKENS[0]
    },
    {
        id: '2',
        token_id: '0xabcdef1234567890abcdef1234567890abcdef12',
        tipo: 'buy',
        valor_bnb: 0.05,
        preco: 0.00000156,
        pnl_bnb: null,
        tx_signature: '0xdef456...',
        data: new Date(Date.now() - 7200000).toISOString(),
        tokens: MOCK_TOKENS[1]
    },
    {
        id: '3',
        token_id: '0xabcdef1234567890abcdef1234567890abcdef12',
        tipo: 'sell',
        valor_bnb: 0.0785,
        preco: 0.00000245,
        pnl_bnb: 0.0285,
        tx_signature: '0xghi789...',
        data: new Date(Date.now() - 5400000).toISOString(),
        tokens: MOCK_TOKENS[1]
    },
    {
        id: '4',
        token_id: '0x5555666677778888999900001111222233334444',
        tipo: 'buy',
        valor_bnb: 0.05,
        preco: 0.00000067,
        pnl_bnb: null,
        tx_signature: '0xjkl012...',
        data: new Date(Date.now() - 14400000).toISOString(),
        tokens: { ...MOCK_TOKENS[0], simbolo: 'FLOKI2', nome: 'FlokiBSC' }
    },
    {
        id: '5',
        token_id: '0x5555666677778888999900001111222233334444',
        tipo: 'sell',
        valor_bnb: 0.0342,
        preco: 0.00000045,
        pnl_bnb: -0.0158,
        tx_signature: '0xmno345...',
        data: new Date(Date.now() - 12600000).toISOString(),
        tokens: { ...MOCK_TOKENS[0], simbolo: 'FLOKI2', nome: 'FlokiBSC' }
    }
];

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [activeTab, setActiveTab] = useState<'terminal' | 'watching' | 'about'>('terminal');
    const [useMockData, setUseMockData] = useState(false);

    // 加载数据
    useEffect(() => {
        async function loadData() {
            try {
                const supabase = getSupabase();

                // 获取系统状态
                const { data: statusData, error: statusError } = await supabase
                    .from('system_status')
                    .select('*')
                    .eq('id', 1)
                    .single();

                // 如果数据库没有数据或出错，使用模拟数据
                if (statusError || !statusData) {
                    setUseMockData(true);
                    setStatus(MOCK_STATUS);
                    setTrades(MOCK_TRADES);
                    setTokens(MOCK_TOKENS);
                    setLoading(false);
                    return;
                }

                setStatus(statusData);

                // 获取交易记录
                const { data: tradesData } = await supabase
                    .from('trades')
                    .select('*, tokens(*)')
                    .order('data', { ascending: false })
                    .limit(50);
                if (tradesData && tradesData.length > 0) {
                    setTrades(tradesData);
                } else {
                    setTrades(MOCK_TRADES);
                    setUseMockData(true);
                }

                // 获取代币
                const { data: tokensData } = await supabase
                    .from('tokens')
                    .select('*')
                    .order('criado_em', { ascending: false })
                    .limit(100);
                if (tokensData && tokensData.length > 0) {
                    setTokens(tokensData);
                } else {
                    setTokens(MOCK_TOKENS);
                    setUseMockData(true);
                }

                setLoading(false);
            } catch (e) {
                console.error('加载数据错误:', e);
                // 使用模拟数据
                setUseMockData(true);
                setStatus(MOCK_STATUS);
                setTrades(MOCK_TRADES);
                setTokens(MOCK_TOKENS);
                setLoading(false);
            }
        }

        loadData();

        // 轮询更新
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    // 加载画面
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="mb-8"
                >
                    <Image
                        src="/monkey-logo.png"
                        alt="猴王"
                        width={128}
                        height={128}
                        className="rounded-full shadow-2xl shadow-[#f0b90b]/30"
                    />
                </motion.div>
                <p className="text-xl text-gray-400">加载中...</p>
                <div className="flex gap-1 mt-4">
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                        className="text-2xl"
                    >
                        🍌
                    </motion.span>
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                        className="text-2xl"
                    >
                        🍌
                    </motion.span>
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        className="text-2xl"
                    >
                        🍌
                    </motion.span>
                </div>
            </div>
        );
    }

    // 计算统计
    const isOnline = status?.status === '在线' || status?.status === 'ONLINE';
    const balance = status?.balance_bnb || 0;
    const totalPnl = status?.total_pnl || 0;
    const winRate = status?.win_rate || 0;

    // 心情系统
    const getMood = () => {
        if (totalPnl > 1) return { emoji: '🤩', text: '狂喜', color: 'text-green-400' };
        if (totalPnl > 0.1 || winRate > 60) return { emoji: '😊', text: '开心', color: 'text-green-300' };
        if (isOnline) return { emoji: '🐵', text: '正常', color: 'text-yellow-400' };
        if (totalPnl < -0.5) return { emoji: '😰', text: '恐慌', color: 'text-red-400' };
        return { emoji: '😐', text: '离线', color: 'text-gray-400' };
    };

    const mood = getMood();

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* 头部统计 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Image
                                    src="/monkey-logo.png"
                                    alt="猴王"
                                    width={80}
                                    height={80}
                                    className="rounded-full shadow-lg shadow-[#f0b90b]/20"
                                />
                            </motion.div>
                            <div>
                                <h1 className="text-4xl font-bold gradient-text">猴王</h1>
                                <p className="text-gray-400">BSC 智能交易机器人</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {useMockData && (
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                                    演示模式
                                </span>
                            )}
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${isOnline ? 'status-online' : 'status-offline'}`} />
                                <span className={mood.color}>{mood.emoji} {mood.text}</span>
                            </div>
                        </div>
                    </div>

                    {/* 统计卡片 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass rounded-xl p-4 card-hover"
                        >
                            <p className="text-gray-400 text-sm mb-1">余额</p>
                            <p className="text-2xl font-bold bnb-gold">{balance.toFixed(4)} BNB</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass rounded-xl p-4 card-hover"
                        >
                            <p className="text-gray-400 text-sm mb-1">总盈亏</p>
                            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(4)} BNB
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass rounded-xl p-4 card-hover"
                        >
                            <p className="text-gray-400 text-sm mb-1">胜率</p>
                            <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass rounded-xl p-4 card-hover"
                        >
                            <p className="text-gray-400 text-sm mb-1">总交易</p>
                            <p className="text-2xl font-bold text-white">{status?.total_trades || 0}</p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* 标签栏 */}
                <div className="flex gap-2 mb-6">
                    {(['terminal', 'watching', 'about'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                activeTab === tab
                                    ? 'bg-[#f0b90b] text-black font-semibold'
                                    : 'bg-[#1a2332] text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab === 'terminal' && '📟 终端'}
                            {tab === 'watching' && '👀 观察中'}
                            {tab === 'about' && '📖 关于'}
                        </button>
                    ))}
                </div>

                {/* 终端 - 交易历史 */}
                {activeTab === 'terminal' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/10">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <span className="text-[#f0b90b]">📟</span> 交易终端
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-black/20 text-gray-400 text-sm">
                                        <th className="px-4 py-3 text-left">时间</th>
                                        <th className="px-4 py-3 text-left">代币</th>
                                        <th className="px-4 py-3 text-left">合约地址</th>
                                        <th className="px-4 py-3 text-center">类型</th>
                                        <th className="px-4 py-3 text-right">BNB</th>
                                        <th className="px-4 py-3 text-right">盈亏</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                🐵 还没有交易记录...
                                            </td>
                                        </tr>
                                    ) : (
                                        trades.map((trade) => (
                                            <tr key={trade.id} className="table-row border-b border-white/5">
                                                <td className="px-4 py-3 text-gray-400 text-sm">
                                                    {new Date(trade.data).toLocaleString('zh-CN')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-medium">
                                                        {trade.tokens?.simbolo || '???'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="text-xs bg-black/30 px-2 py-1 rounded">
                                                        {trade.token_id?.slice(0, 6)}...{trade.token_id?.slice(-4)}
                                                    </code>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        trade.tipo === 'buy'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {trade.tipo === 'buy' ? '买入' : '卖出'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono">
                                                    {trade.valor_bnb?.toFixed(4)}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-mono ${
                                                    (trade.pnl_bnb || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {trade.pnl_bnb
                                                        ? `${trade.pnl_bnb >= 0 ? '+' : ''}${trade.pnl_bnb.toFixed(4)}`
                                                        : '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 观察中 - 分析的代币 */}
                {activeTab === 'watching' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {tokens.length === 0 ? (
                            <div className="col-span-full glass rounded-xl p-8 text-center">
                                <span className="text-4xl">🔍</span>
                                <p className="text-gray-400 mt-4">还没有分析的代币...</p>
                            </div>
                        ) : (
                            tokens.map((token) => (
                                <motion.div
                                    key={token.ca}
                                    whileHover={{ scale: 1.02 }}
                                    className="glass rounded-xl p-4 card-hover"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {token.logo && (
                                                <img
                                                    src={token.logo}
                                                    alt={token.simbolo}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            )}
                                            <div>
                                                <p className="font-semibold">{token.simbolo}</p>
                                                <p className="text-xs text-gray-400">{token.nome}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            token.status === 'approved' || token.status === 'holding'
                                                ? 'bg-green-500/20 text-green-400'
                                                : token.status === 'rejected'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {token.status === 'approved' && '已批准'}
                                            {token.status === 'holding' && '持有中'}
                                            {token.status === 'rejected' && '已拒绝'}
                                            {token.status === 'analyzing' && '分析中'}
                                            {token.status === 'sold_tp' && '止盈卖出'}
                                            {token.status === 'sold_sl' && '止损卖出'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-400">分数</p>
                                            <p className={`font-semibold ${
                                                (token.claude_score || 0) >= 60 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {token.claude_score || 0}/100
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">市值</p>
                                            <p className="font-semibold">
                                                ${token.market_cap?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <code className="text-xs text-gray-500 break-all">
                                            {token.ca}
                                        </code>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {/* 关于 */}
                {activeTab === 'about' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-xl p-6"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <Image
                                src="/monkey-logo.png"
                                alt="猴王"
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                            <h2 className="text-2xl font-bold gradient-text">关于猴王</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 bnb-gold">这是什么?</h3>
                                <p className="text-gray-300">
                                    猴王是一个 AI 驱动的交易机器人，它会实时监控 BSC 网络上的新代币，
                                    使用 AI 分析每个代币的潜力，并自动执行交易。所有交易都是透明的，
                                    实时显示在此仪表板上。
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 bnb-gold">它是如何工作的?</h3>
                                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                    <li>机器人通过 DexScreener 监控 BSC 上的新代币</li>
                                    <li>对每个代币进行实时分析 (市值、流动性、交易量等)</li>
                                    <li>AI 评估代币并给出 0-100 的分数</li>
                                    <li>如果分数高于阈值，机器人自动通过 PancakeSwap 购买</li>
                                    <li>机器人监控持仓并在达到止盈或止损时卖出</li>
                                    <li>所有交易实时显示在此仪表板上</li>
                                </ol>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 bnb-gold">交易参数</h3>
                                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                                    <p className="text-gray-300"><span className="bnb-gold">买入阈值:</span> 分数 &gt;= 60</p>
                                    <p className="text-gray-300"><span className="bnb-gold">最大交易:</span> 0.05 BNB</p>
                                    <p className="text-gray-300"><span className="bnb-gold">止盈:</span> +50%</p>
                                    <p className="text-gray-300"><span className="bnb-gold">止损:</span> -25%</p>
                                    <p className="text-gray-300"><span className="bnb-gold">滑点:</span> 15%</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 bnb-gold">心情系统</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    <div className="bg-green-500/10 rounded-lg p-2 text-center">
                                        <span className="text-2xl">🤩</span>
                                        <p className="text-xs text-green-400">狂喜</p>
                                    </div>
                                    <div className="bg-green-400/10 rounded-lg p-2 text-center">
                                        <span className="text-2xl">😊</span>
                                        <p className="text-xs text-green-300">开心</p>
                                    </div>
                                    <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                                        <span className="text-2xl">🐵</span>
                                        <p className="text-xs text-yellow-400">正常</p>
                                    </div>
                                    <div className="bg-orange-500/10 rounded-lg p-2 text-center">
                                        <span className="text-2xl">😰</span>
                                        <p className="text-xs text-orange-400">紧张</p>
                                    </div>
                                    <div className="bg-red-500/10 rounded-lg p-2 text-center">
                                        <span className="text-2xl">😱</span>
                                        <p className="text-xs text-red-400">恐慌</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-6 border-t border-white/10">
                                <div className="flex items-center justify-center gap-2">
                                    <Image
                                        src="/monkey-logo.png"
                                        alt="猴王"
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <p className="text-gray-500">
                                        由猴王用爱制作 🍌
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
