import chalk from 'chalk';
import fs from 'fs';

// ═══════════════════════════════════════════════════════════════
// 猴子交易员 - 日志系统 (中文版)
// ═══════════════════════════════════════════════════════════════

// 创建日志文件夹
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
const logFileName = `./logs/${new Date().toISOString().split('T')[0]}.log`;
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });

function saveToFile(message) {
    const clean = message.replace(/\x1b\[[0-9;]*m/g, ''); // 移除 ANSI 颜色代码
    logStream.write(clean + '\n');
}

// ═══════════════════════════════════════════════════════════════
// 格式化工具
// ═══════════════════════════════════════════════════════════════
function padRight(str, len) {
    str = String(str);
    return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function padLeft(str, len) {
    str = String(str);
    return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
}

function formatMC(value) {
    if (!value) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toFixed(2);
}

function formatPercent(value) {
    if (value === undefined || value === null) return '+0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(0)}%`;
}

function formatBNB(value) {
    if (!value) return '0.00';
    return value.toFixed(4);
}

function formatVol(value) {
    if (!value) return '0';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toFixed(0);
}

function timestamp() {
    return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

// 音量条带颜色
function volumeBar(percent, width = 5) {
    const p = Math.max(0, Math.min(100, percent || 0));
    const filled = Math.round((p / 100) * width);
    const empty = width - filled;

    let color;
    if (p >= 70) color = chalk.bgGreen;
    else if (p >= 40) color = chalk.bgYellow;
    else color = chalk.bgRed;

    return color(' '.repeat(filled)) + chalk.bgGray(' '.repeat(empty));
}

// ═══════════════════════════════════════════════════════════════
// 完整代币日志 (专业风格)
// ═══════════════════════════════════════════════════════════════
export function logToken(data) {
    const {
        action,      // '买入', '卖出', '跳过', '信息', '购买'
        symbol,
        name,
        mc,
        mcChange,
        bnb,
        vol5m,
        volTotal,
        volPercent,
        ath,
        athPercent,
        cw,          // 当前价值
        vr,          // 价值比率
        extra
    } = data;

    // 操作标签
    let badge;
    switch (action) {
        case '买入':
        case '购买':
        case 'BUY':
            badge = chalk.bgGreen.black(` 买入  `);
            break;
        case '卖出':
        case 'SELL':
            badge = chalk.bgRed.white(` 卖出  `);
            break;
        case '跳过':
        case 'SKIP':
            badge = chalk.bgYellow.black(` 跳过  `);
            break;
        default:
            badge = chalk.bgBlue.white(` 信息  `);
    }

    // 符号颜色
    const symColor = action === '买入' || action === '购买' || action === 'BUY' ? chalk.green :
                     action === '卖出' || action === 'SELL' ? chalk.red :
                     action === '跳过' || action === 'SKIP' ? chalk.yellow : chalk.white;

    // 市值变化颜色
    const mcChgColor = (mcChange || 0) >= 0 ? chalk.green : chalk.red;

    // 构建日志行
    const parts = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.gray('[') + badge + chalk.gray(']'),
        symColor(padRight(symbol || name || '???', 14)),
        chalk.magenta('市值:'),
        chalk.white(padLeft(formatMC(mc), 9)),
        mcChgColor(padLeft(formatPercent(mcChange), 5)),
        chalk.gray('|'),
        chalk.cyan('BNB:'),
        chalk.white(padLeft(formatBNB(bnb), 6)),
        chalk.gray('|'),
        volumeBar(volPercent || 50),
        chalk.gray('|'),
        chalk.gray('5分钟量:'),
        chalk.white(padLeft(formatVol(vol5m), 8)),
        chalk.gray('/'),
        chalk.white(padLeft(formatVol(volTotal), 8)),
        chalk.gray('|'),
    ];

    // ATH 信息
    if (ath !== undefined) {
        parts.push(chalk.cyan('历史高点:'));
        parts.push(chalk.white(padLeft(formatPercent(athPercent), 6)));
        parts.push(chalk.gray('|'));
    }

    // 当前价值和价值比率
    if (cw !== undefined) {
        parts.push(chalk.cyan('当前:'));
        parts.push(chalk.white(padLeft(formatBNB(cw), 5)));
        parts.push(chalk.gray('|'));
    }

    if (vr !== undefined) {
        parts.push(chalk.cyan('比率:'));
        parts.push(chalk.white(padLeft(vr.toFixed(2), 5)));
        parts.push(chalk.gray('|'));
    }

    if (extra) {
        parts.push(chalk.gray(extra));
    }

    const line = parts.join(' ');
    console.log(line);
    saveToFile(line);
}

// ═══════════════════════════════════════════════════════════════
// 简化日志函数
// ═══════════════════════════════════════════════════════════════
export function logBuy(symbol, mc, bnb, extra = '') {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgGreen.black(' 买入  '),
        chalk.green(padRight(symbol, 14)),
        chalk.magenta('市值:'),
        chalk.white(formatMC(mc)),
        chalk.gray('|'),
        chalk.cyan('BNB:'),
        chalk.white(formatBNB(bnb)),
        extra ? chalk.gray('| ' + extra) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logSell(symbol, mc, bnb, pnl, extra = '') {
    const pnlColor = pnl >= 0 ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgRed.white(' 卖出  '),
        chalk.red(padRight(symbol, 14)),
        chalk.magenta('市值:'),
        chalk.white(formatMC(mc)),
        chalk.gray('|'),
        chalk.cyan('盈亏:'),
        pnlColor(formatPercent(pnl)),
        chalk.gray('|'),
        chalk.cyan('BNB:'),
        chalk.white(formatBNB(bnb)),
        extra ? chalk.gray('| ' + extra) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logSkip(symbol, mc, reason) {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgYellow.black(' 跳过  '),
        chalk.yellow(padRight(symbol, 14)),
        chalk.magenta('市值:'),
        chalk.white(formatMC(mc)),
        chalk.gray('|'),
        chalk.gray(reason)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logAnalysis(symbol, score, decision, thought = '') {
    const scoreColor = score >= 75 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;
    const decBadge = decision === 'BUY' || decision === '买入'
        ? chalk.bgGreen.black(' 买入 ')
        : chalk.bgRed.white(' 跳过 ');
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgMagenta.white('  AI   '),
        chalk.white(padRight(symbol, 14)),
        chalk.cyan('分数:'),
        scoreColor(padLeft(String(score), 3)),
        chalk.gray('|'),
        decBadge,
        thought ? chalk.gray('| ' + thought) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logTrade(type, symbol, bnb, tx) {
    const badge = type === 'buy' || type === '买入'
        ? chalk.bgGreen.black(' 买入  ')
        : chalk.bgRed.white(' 卖出  ');
    const symColor = type === 'buy' || type === '买入' ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        badge,
        symColor(padRight(symbol, 14)),
        chalk.cyan('BNB:'),
        chalk.white(formatBNB(bnb)),
        chalk.gray('|'),
        chalk.gray('交易哈希:'),
        chalk.blue(tx ? tx.slice(0, 20) + '...' : '待处理')
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logPosition(symbol, entryPrice, currentPrice, pnlPercent, bnb) {
    const pnlColor = pnlPercent >= 0 ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgCyan.black(' 持仓  '),
        chalk.white(padRight(symbol, 14)),
        chalk.gray('入场价:'),
        chalk.white('$' + entryPrice.toFixed(8)),
        chalk.gray('|'),
        chalk.gray('现价:'),
        chalk.white('$' + currentPrice.toFixed(8)),
        chalk.gray('|'),
        chalk.cyan('盈亏:'),
        pnlColor(formatPercent(pnlPercent)),
        chalk.gray('|'),
        chalk.cyan('BNB:'),
        chalk.white(formatBNB(bnb))
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

// ═══════════════════════════════════════════════════════════════
// 系统日志
// ═══════════════════════════════════════════════════════════════
export function logStatus(status, balance, pnl, winRate, extra = '') {
    const pnlColor = pnl >= 0 ? chalk.green : chalk.red;
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgCyan.black(' 系统  '),
        chalk.white(padRight(status, 12)),
        chalk.gray('|'),
        chalk.cyan('余额:'),
        chalk.white(formatBNB(balance) + ' BNB'),
        chalk.gray('|'),
        chalk.cyan('盈亏:'),
        pnlColor((pnl >= 0 ? '+' : '') + formatBNB(pnl) + ' BNB'),
        chalk.gray('|'),
        chalk.cyan('胜率:'),
        chalk.white(winRate.toFixed(1) + '%'),
        extra ? chalk.gray('| ' + extra) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logWS(event, message = '') {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgBlue.white(' 网络  '),
        chalk.blue(padRight(event, 12)),
        message ? chalk.gray('| ' + message) : ''
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logError(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.red('[错误]'),
        chalk.bgRed.white(' 错误  '),
        chalk.red(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logSuccess(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.green('[信息]'),
        chalk.bgGreen.black(' 成功  '),
        chalk.green(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logInfo(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.gray('[信息]'),
        chalk.bgGray.white(' 信息  '),
        chalk.white(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

export function logWarning(message) {
    const line = [
        chalk.gray(timestamp()),
        chalk.yellow('[警告]'),
        chalk.bgYellow.black(' 警告  '),
        chalk.yellow(message)
    ].join(' ');
    console.log(line);
    saveToFile(line);
}

// ═══════════════════════════════════════════════════════════════
// 标题和分隔符
// ═══════════════════════════════════════════════════════════════
export function logHeader(title) {
    console.log('');
    console.log(chalk.cyan('═'.repeat(70)));
    console.log(chalk.cyan('  ' + title));
    console.log(chalk.cyan('═'.repeat(70)));
    console.log('');
    saveToFile(`\n${'═'.repeat(70)}\n  ${title}\n${'═'.repeat(70)}\n`);
}

export function logSeparator() {
    const line = chalk.gray('─'.repeat(70));
    console.log(line);
    saveToFile('─'.repeat(70));
}

export function logBox(lines, color = 'cyan') {
    const colorFn = chalk[color] || chalk.cyan;
    const maxLen = Math.max(...lines.map(l => l.length));
    const top = colorFn('╔' + '═'.repeat(maxLen + 2) + '╗');
    const bot = colorFn('╚' + '═'.repeat(maxLen + 2) + '╝');

    console.log(top);
    lines.forEach(line => {
        console.log(colorFn('║ ') + chalk.white(padRight(line, maxLen)) + colorFn(' ║'));
    });
    console.log(bot);
}

// ═══════════════════════════════════════════════════════════════
// 统计信息框 (美观摘要)
// ═══════════════════════════════════════════════════════════════
export function logStats(stats) {
    const { balance, pnl, winRate, wins, losses, totalTrades } = stats;
    const pnlColor = pnl >= 0 ? chalk.green : chalk.red;

    console.log('');
    console.log(chalk.cyan('╔════════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.white('                           统计信息                               ') + chalk.cyan('║'));
    console.log(chalk.cyan('╠════════════════════════════════════════════════════════════════════╣'));
    console.log(chalk.cyan('║') + `  余额:     ${chalk.white(formatBNB(balance) + ' BNB')}`.padEnd(69) + chalk.cyan('║'));
    console.log(chalk.cyan('║') + `  盈亏:     ${pnlColor((pnl >= 0 ? '+' : '') + formatBNB(pnl) + ' BNB')}`.padEnd(78) + chalk.cyan('║'));
    console.log(chalk.cyan('║') + `  胜率:     ${chalk.white(winRate.toFixed(1) + '%')} (${chalk.green(wins + '胜')} / ${chalk.red(losses + '负')})`.padEnd(78) + chalk.cyan('║'));
    console.log(chalk.cyan('║') + `  交易数:   ${chalk.white(totalTrades)}`.padEnd(69) + chalk.cyan('║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝'));
    console.log('');
}
