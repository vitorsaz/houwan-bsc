// ═══════════════════════════════════════════════════════════════
// 猴王 - 工具函数
// ═══════════════════════════════════════════════════════════════

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function formatBNB(amount) {
    return parseFloat(amount).toFixed(4);
}

export function formatMarketCap(value) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return `${value.toFixed(2)}`;
}

export function truncateAddress(addr, chars = 4) {
    if (!addr) return '';
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function isValidBSCAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}秒前`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
}

// ═══════════════════════════════════════════════════════════════
// 重试逻辑 (针对偶尔失败的API)
// ═══════════════════════════════════════════════════════════════
export async function withRetry(fn, options = {}) {
    const { retries = 3, delay = 1000, backoff = 2, onRetry = null } = options;
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === retries) break;

            const waitTime = delay * Math.pow(backoff, attempt - 1);

            if (onRetry) {
                onRetry(attempt, retries, error, waitTime);
            } else {
                console.log(`[重试] 第${attempt}/${retries}次尝试失败。等待${waitTime}毫秒...`);
            }

            await sleep(waitTime);
        }
    }

    throw lastError;
}

// ═══════════════════════════════════════════════════════════════
// IPFS 网关 (备用)
// ═══════════════════════════════════════════════════════════════
export async function fetchImageFromIPFS(metadataUri) {
    if (!metadataUri) return null;
    try {
        let url = metadataUri;
        const ipfsMatch = metadataUri.match(/ipfs[./]+(Qm[a-zA-Z0-9]+|bafk[a-zA-Z0-9]+)/i);
        if (ipfsMatch) url = `https://nftstorage.link/ipfs/${ipfsMatch[1]}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) return null;

        const json = await response.json();
        let imageUrl = json.image || json.imageUrl || null;

        if (imageUrl) {
            const imgMatch = imageUrl.match(/ipfs[./]+(Qm[a-zA-Z0-9]+|bafk[a-zA-Z0-9]+)/i);
            if (imgMatch) imageUrl = `https://nftstorage.link/ipfs/${imgMatch[1]}`;
        }
        return imageUrl;
    } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════
// 黑名单和白名单词汇
// ═══════════════════════════════════════════════════════════════
export const BLACKLIST_WORDS = [
    'scam', 'rug', 'rugpull', 'honeypot', 'honey', 'fake', 'test',
    'porn', 'xxx', 'sex', 'nude', 'nsfw', 'adult',
    'hitler', 'nazi', 'racist', 'nigger', 'hate',
    'elon', 'musk', 'trump', 'biden', 'politics',
    'airdrop', 'presale', 'private', 'whitelist'
];

export const WHITELIST_WORDS = [
    'pepe', 'doge', 'shib', 'shiba', 'inu', 'moon', 'rocket',
    'ape', 'monkey', 'banana', 'cat', 'dog', 'frog', 'chad',
    'wojak', 'based', 'king', 'queen', 'diamond', 'gem',
    'panda', 'dragon', 'tiger', 'lion', 'bear', 'bull',
    '猴', '猿', '狗', '猫', '龙', '虎', '王'
];

export function containsBlacklistWord(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return BLACKLIST_WORDS.some(word => lower.includes(word));
}

export function containsWhitelistWord(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return WHITELIST_WORDS.some(word => lower.includes(word));
}
