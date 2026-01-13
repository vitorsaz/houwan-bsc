import 'dotenv/config';

// ═══════════════════════════════════════════════════════════════
// 猴子交易员 - BSC 配置文件
// ═══════════════════════════════════════════════════════════════

export const config = {
    // ═══════════════════════════════════════════════════════════
    // BSC RPC (币安智能链)
    // ═══════════════════════════════════════════════════════════
    BSC_RPC: process.env.BSC_RPC || 'https://bsc-dataseed1.binance.org',
    BSC_RPC_BACKUP: 'https://bsc-dataseed2.binance.org',
    BSC_RPC_ANKR: 'https://rpc.ankr.com/bsc',
    CHAIN_ID: 56, // BSC 主网
    CHAIN_ID_TESTNET: 97, // BSC 测试网

    // ═══════════════════════════════════════════════════════════
    // PancakeSwap 路由器 V2
    // ═══════════════════════════════════════════════════════════
    PANCAKE_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    PANCAKE_FACTORY: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',

    // ═══════════════════════════════════════════════════════════
    // DexScreener API (免费，不需要密钥)
    // ═══════════════════════════════════════════════════════════
    DEXSCREENER_API: 'https://api.dexscreener.com/latest/dex',

    // ═══════════════════════════════════════════════════════════
    // BSCScan API (可选，用于验证)
    // ═══════════════════════════════════════════════════════════
    BSCSCAN_API_KEY: process.env.BSCSCAN_API_KEY || '',
    BSCSCAN_API: 'https://api.bscscan.com/api',

    // ═══════════════════════════════════════════════════════════
    // Claude AI (从 .env 读取)
    // ═══════════════════════════════════════════════════════════
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,

    // ═══════════════════════════════════════════════════════════
    // Supabase (从 .env 读取)
    // ═══════════════════════════════════════════════════════════
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

    // ═══════════════════════════════════════════════════════════
    // 钱包 (从 .env 读取)
    // ═══════════════════════════════════════════════════════════
    WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY,

    // ═══════════════════════════════════════════════════════════
    // 服务器
    // ═══════════════════════════════════════════════════════════
    PORT: parseInt(process.env.PORT) || 3001,

    // ═══════════════════════════════════════════════════════════
    // Gas 设置
    // ═══════════════════════════════════════════════════════════
    GAS_LIMIT: 300000,
    GAS_PRICE_GWEI: 5, // BSC 很便宜
};

// ═══════════════════════════════════════════════════════════════
// 验证必需的环境变量
// ═══════════════════════════════════════════════════════════════
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = required.filter(k => !config[k] && !process.env[k]);
if (missing.length > 0) {
    console.error('❌ 缺少必需的环境变量:', missing.join(', '));
    console.error('❌ 请在 .env 文件中配置这些变量');
    process.exit(1);
}

console.log('✅ 配置加载成功');
console.log(`   链: BSC 主网 (Chain ID: ${config.CHAIN_ID})`);
console.log(`   RPC: ${config.BSC_RPC}`);
console.log(`   PancakeSwap 路由器: ${config.PANCAKE_ROUTER}`);
