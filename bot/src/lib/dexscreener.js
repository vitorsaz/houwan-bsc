import { config } from '../config.js';
import { withRetry } from './utils.js';

// ═══════════════════════════════════════════════════════════════
// 猴王 - DexScreener API 模块 (免费，不需要密钥)
// ═══════════════════════════════════════════════════════════════

let bnbPriceUsd = 0;
let bnbPriceLastUpdate = 0;

// 带重试的 Fetch
async function fetchWithRetry(url, options = {}) {
    return withRetry(async () => {
        const r = await fetch(url, options);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
    }, { retries: 3, delay: 1000 });
}

// ═══════════════════════════════════════════════════════════════
// 获取 BNB 价格 (60秒缓存)
// ═══════════════════════════════════════════════════════════════
export async function getBnbPrice() {
    const now = Date.now();
    if (bnbPriceUsd > 0 && now - bnbPriceLastUpdate < 60000) return bnbPriceUsd;
    try {
        const json = await fetchWithRetry(`${config.DEXSCREENER_API}/tokens/${config.WBNB}`);
        if (json.pairs && json.pairs.length > 0) {
            bnbPriceUsd = parseFloat(json.pairs[0].priceUsd) || 600;
            bnbPriceLastUpdate = now;
            console.log(`[DEXSCREENER] BNB 价格: $${bnbPriceUsd.toFixed(2)}`);
        }
    } catch (e) {
        console.error('[DEXSCREENER] 获取 BNB 价格错误:', e.message);
    }
    return bnbPriceUsd > 0 ? bnbPriceUsd : 600;
}

// ═══════════════════════════════════════════════════════════════
// 获取代币信息
// ═══════════════════════════════════════════════════════════════
export async function getTokenInfo(ca) {
    try {
        const json = await fetchWithRetry(`${config.DEXSCREENER_API}/tokens/${ca}`);
        if (json.pairs && json.pairs.length > 0) {
            // 获取流动性最高的交易对
            const pair = json.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
            return {
                name: pair.baseToken?.name || '未知',
                symbol: pair.baseToken?.symbol || '???',
                address: pair.baseToken?.address,
                price: parseFloat(pair.priceUsd) || 0,
                priceNative: parseFloat(pair.priceNative) || 0,
                mc: pair.marketCap || pair.fdv || 0,
                liquidity: pair.liquidity?.usd || 0,
                volume24h: pair.volume?.h24 || 0,
                volume1h: pair.volume?.h1 || 0,
                priceChange24h: pair.priceChange?.h24 || 0,
                priceChange1h: pair.priceChange?.h1 || 0,
                txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
                buys24h: pair.txns?.h24?.buys || 0,
                sells24h: pair.txns?.h24?.sells || 0,
                pairAddress: pair.pairAddress,
                dexId: pair.dexId,
                url: pair.url,
                logo: pair.info?.imageUrl || null
            };
        }
    } catch (e) {
        console.error('[DEXSCREENER] 获取代币信息错误:', e.message);
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════
// 获取最新交易对 (发现新代币)
// ═══════════════════════════════════════════════════════════════
export async function getLatestPairs(chain = 'bsc') {
    try {
        const json = await fetchWithRetry(`https://api.dexscreener.com/latest/dex/pairs/${chain}`);
        if (json.pairs) {
            return json.pairs.map(pair => ({
                name: pair.baseToken?.name || '未知',
                symbol: pair.baseToken?.symbol || '???',
                address: pair.baseToken?.address,
                price: parseFloat(pair.priceUsd) || 0,
                mc: pair.marketCap || pair.fdv || 0,
                liquidity: pair.liquidity?.usd || 0,
                pairAddress: pair.pairAddress,
                pairCreatedAt: pair.pairCreatedAt,
                dexId: pair.dexId,
                volume24h: pair.volume?.h24 || 0,
                priceChange24h: pair.priceChange?.h24 || 0
            }));
        }
    } catch (e) {
        console.error('[DEXSCREENER] 获取最新交易对错误:', e.message);
    }
    return [];
}

// ═══════════════════════════════════════════════════════════════
// 搜索代币
// ═══════════════════════════════════════════════════════════════
export async function searchTokens(query) {
    try {
        const json = await fetchWithRetry(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
        if (json.pairs) {
            return json.pairs.filter(p => p.chainId === 'bsc').map(pair => ({
                name: pair.baseToken?.name,
                symbol: pair.baseToken?.symbol,
                address: pair.baseToken?.address,
                mc: pair.marketCap || pair.fdv || 0,
                liquidity: pair.liquidity?.usd || 0
            }));
        }
    } catch (e) {
        console.error('[DEXSCREENER] 搜索代币错误:', e.message);
    }
    return [];
}

// ═══════════════════════════════════════════════════════════════
// 获取热门代币
// ═══════════════════════════════════════════════════════════════
export async function getTrendingTokens() {
    try {
        // 获取 BSC 上最新的交易对并按交易量排序
        const pairs = await getLatestPairs('bsc');
        return pairs
            .filter(p => p.liquidity > 1000 && p.mc > 5000)
            .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
            .slice(0, 20);
    } catch (e) {
        console.error('[DEXSCREENER] 获取热门代币错误:', e.message);
    }
    return [];
}

// ═══════════════════════════════════════════════════════════════
// 获取代币历史价格 (OHLCV)
// ═══════════════════════════════════════════════════════════════
export async function getTokenOHLCV(pairAddress) {
    try {
        // DexScreener 不提供 OHLCV，但可以获取当前价格变化
        const json = await fetchWithRetry(`https://api.dexscreener.com/latest/dex/pairs/bsc/${pairAddress}`);
        if (json.pair) {
            return {
                price: parseFloat(json.pair.priceUsd) || 0,
                priceChange5m: json.pair.priceChange?.m5 || 0,
                priceChange1h: json.pair.priceChange?.h1 || 0,
                priceChange6h: json.pair.priceChange?.h6 || 0,
                priceChange24h: json.pair.priceChange?.h24 || 0,
                volume5m: json.pair.volume?.m5 || 0,
                volume1h: json.pair.volume?.h1 || 0,
                volume24h: json.pair.volume?.h24 || 0
            };
        }
    } catch (e) {
        console.error('[DEXSCREENER] 获取价格历史错误:', e.message);
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════
// 检查代币是否有效 (基本过滤)
// ═══════════════════════════════════════════════════════════════
export async function isValidToken(ca) {
    const info = await getTokenInfo(ca);
    if (!info) return { valid: false, reason: '无法获取代币信息' };

    if (info.liquidity < 1000) {
        return { valid: false, reason: '流动性太低' };
    }

    if (info.mc < 5000) {
        return { valid: false, reason: '市值太低' };
    }

    if (info.mc > 1000000) {
        return { valid: false, reason: '市值太高' };
    }

    return { valid: true, info };
}
