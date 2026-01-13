import { config } from '../config.js';

// ═══════════════════════════════════════════════════════════════
// 猴王 - Claude AI 分析模块
// ═══════════════════════════════════════════════════════════════

export async function analyzeWithClaude(tokenInfo) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': config.CLAUDE_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1500,
                messages: [{
                    role: 'user',
                    content: `分析这个 BSC 上的迷因币是否值得交易:

名称: ${tokenInfo.name}
符号: ${tokenInfo.symbol}
市值: $${tokenInfo.mc?.toLocaleString() || 0}
流动性: $${tokenInfo.liquidity?.toLocaleString() || 0}
24小时交易量: $${tokenInfo.volume24h?.toLocaleString() || 0}
价格: $${tokenInfo.price || 0}
24小时涨跌: ${tokenInfo.priceChange24h || 0}%
买单数: ${tokenInfo.buys24h || 0}
卖单数: ${tokenInfo.sells24h || 0}
DEX: ${tokenInfo.dexId || 'PancakeSwap'}

请评估:
1. 叙事分数 (0-100): 迷因强度、病毒潜力、趋势相关性
2. 代号分数 (0-100): 符号朗朗上口度、记忆性、叙事契合度
3. 整体分数 (0-100): 综合评估

决定: 如果整体分数 >= 65 则买入，否则避免

只回复 JSON 格式:
{
    "narrative_score": 数字,
    "ticker_score": 数字,
    "overall_score": 数字,
    "decision": "BUY" 或 "AVOID",
    "reasons": ["原因1", "原因2", "原因3"],
    "red_flags": ["风险1", "风险2"]
}`
                }]
            })
        });

        const data = await response.json();
        const text = data.content[0].text;

        // 尝试解析 JSON
        try {
            const parsed = JSON.parse(text);
            return {
                narrative_score: parsed.narrative_score || 0,
                ticker_score: parsed.ticker_score || 0,
                score: parsed.overall_score || 0,
                decision: parsed.decision || 'AVOID',
                reasons: parsed.reasons || [],
                redFlags: parsed.red_flags || []
            };
        } catch (e) {
            // 如果解析失败，尝试从文本中提取
            console.error('[CLAUDE] JSON 解析失败:', e.message);
            return {
                score: 0,
                decision: 'AVOID',
                reasons: ['AI 分析失败'],
                redFlags: ['无法解析响应']
            };
        }
    } catch (e) {
        console.error('[CLAUDE] API 错误:', e.message);
        return {
            score: 0,
            decision: 'AVOID',
            reasons: ['分析失败'],
            redFlags: [e.message]
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 智能过滤器 (不使用 Claude)
// ═══════════════════════════════════════════════════════════════
export function analyzeTokenWithFilters(tokenInfo) {
    let score = 50; // 基础分数
    const reasons = [];
    const redFlags = [];

    // 市值检查
    const mc = tokenInfo.mc || 0;
    if (mc >= 5000 && mc <= 50000) {
        score += 20;
        reasons.push('市值在理想范围内 ($5K-$50K)');
    } else if (mc >= 50000 && mc <= 200000) {
        score += 10;
        reasons.push('市值中等 ($50K-$200K)');
    } else if (mc < 5000) {
        score -= 20;
        redFlags.push('市值太低');
    } else if (mc > 500000) {
        score -= 15;
        redFlags.push('市值太高');
    }

    // 流动性检查
    const liquidity = tokenInfo.liquidity || 0;
    if (liquidity >= 5000) {
        score += 15;
        reasons.push('流动性良好');
    } else if (liquidity >= 2000) {
        score += 5;
    } else if (liquidity < 1000) {
        score -= 20;
        redFlags.push('流动性太低');
    }

    // 交易量检查
    const volume = tokenInfo.volume24h || 0;
    if (volume >= 10000) {
        score += 15;
        reasons.push('交易量活跃');
    } else if (volume >= 5000) {
        score += 10;
    } else if (volume < 1000) {
        score -= 10;
        redFlags.push('交易量太低');
    }

    // 买卖比检查
    const buys = tokenInfo.buys24h || 0;
    const sells = tokenInfo.sells24h || 0;
    if (buys > 0 && sells > 0) {
        const ratio = buys / sells;
        if (ratio >= 1.5) {
            score += 10;
            reasons.push('买单多于卖单');
        } else if (ratio <= 0.5) {
            score -= 10;
            redFlags.push('卖压较大');
        }
    }

    // 价格变化检查
    const priceChange = tokenInfo.priceChange24h || 0;
    if (priceChange >= 10 && priceChange <= 100) {
        score += 10;
        reasons.push('价格上涨中');
    } else if (priceChange < -30) {
        score -= 15;
        redFlags.push('价格大跌');
    } else if (priceChange > 200) {
        score -= 10;
        redFlags.push('可能是抛售前的拉盘');
    }

    // 符号检查
    const symbol = (tokenInfo.symbol || '').toLowerCase();
    const name = (tokenInfo.name || '').toLowerCase();

    // 黑名单词汇
    const blacklist = ['scam', 'rug', 'honeypot', 'fake', 'test', 'porn', 'xxx'];
    if (blacklist.some(word => name.includes(word) || symbol.includes(word))) {
        score -= 40;
        redFlags.push('名称包含黑名单词汇');
    }

    // 白名单词汇 (迷因币常见)
    const whitelist = ['pepe', 'doge', 'shib', 'moon', 'ape', 'monkey', 'cat', 'dog', 'frog', '猴', '狗', '猫'];
    if (whitelist.some(word => name.includes(word) || symbol.includes(word))) {
        score += 15;
        reasons.push('符合迷因币趋势');
    }

    // 符号长度
    if (symbol.length <= 5) {
        score += 5;
        reasons.push('符号简短易记');
    }

    // 确保分数在 0-100 范围内
    score = Math.max(0, Math.min(100, score));

    // 决定
    const decision = score >= 60 && redFlags.length === 0 ? 'BUY' : 'AVOID';

    return {
        narrative_score: Math.round(score * 0.8),
        ticker_score: Math.round(score * 0.9),
        score,
        decision,
        reasons,
        redFlags
    };
}

// ═══════════════════════════════════════════════════════════════
// 综合分析 (优先使用 Claude，备用智能过滤器)
// ═══════════════════════════════════════════════════════════════
export async function analyzeToken(tokenInfo, useClaude = true) {
    if (useClaude && config.CLAUDE_API_KEY) {
        try {
            return await analyzeWithClaude(tokenInfo);
        } catch (e) {
            console.log('[CLAUDE] AI 分析失败，使用智能过滤器');
            return analyzeTokenWithFilters(tokenInfo);
        }
    }
    return analyzeTokenWithFilters(tokenInfo);
}
