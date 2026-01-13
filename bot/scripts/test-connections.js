#!/usr/bin/env node
/**
 * 猴王 - 连接测试脚本
 * 用法: node scripts/test-connections.js
 */

import 'dotenv/config';

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              🔌 猴王 连接测试                               ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

const results = {
    bsc: false,
    supabase: false,
    dexscreener: false,
    claude: false
};

// 测试 BSC RPC
async function testBSC() {
    console.log('[1/4] 测试 BSC RPC...');
    try {
        const rpc = process.env.BSC_RPC || 'https://bsc-dataseed1.binance.org';

        const response = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_chainId',
                params: []
            })
        });

        const data = await response.json();

        if (data.result === '0x38') { // 0x38 = 56 (BSC 主网)
            console.log('      ✅ BSC 主网连接成功 (Chain ID: 56)');
            results.bsc = true;
        } else {
            console.log(`      ❌ 错误的网络: ${data.result}`);
        }
    } catch (e) {
        console.log(`      ❌ BSC RPC 错误: ${e.message}`);
    }
}

// 测试 Supabase
async function testSupabase() {
    console.log('[2/4] 测试 Supabase...');
    try {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.log('      ❌ SUPABASE_URL 或 SUPABASE_ANON_KEY 未配置');
            return;
        }

        const response = await fetch(`${url}/rest/v1/`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        if (response.ok || response.status === 404) {
            console.log('      ✅ Supabase 连接成功');
            results.supabase = true;
        } else {
            console.log(`      ❌ Supabase 错误: ${response.status}`);
        }
    } catch (e) {
        console.log(`      ❌ Supabase 错误: ${e.message}`);
    }
}

// 测试 DexScreener
async function testDexScreener() {
    console.log('[3/4] 测试 DexScreener API...');
    try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c');
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
            const bnbPrice = data.pairs[0].priceUsd;
            console.log(`      ✅ DexScreener 正常 (BNB = $${parseFloat(bnbPrice).toFixed(2)})`);
            results.dexscreener = true;
        } else {
            console.log('      ❌ DexScreener 返回数据异常');
        }
    } catch (e) {
        console.log(`      ❌ DexScreener 错误: ${e.message}`);
    }
}

// 测试 Claude (可选)
async function testClaude() {
    console.log('[4/4] 测试 Claude AI...');
    try {
        const apiKey = process.env.CLAUDE_API_KEY;

        if (!apiKey) {
            console.log('      ⚠️  CLAUDE_API_KEY 未配置 (可选)');
            return;
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 10,
                messages: [{ role: 'user', content: '说 "好"' }]
            })
        });

        if (response.ok) {
            console.log('      ✅ Claude AI 正常');
            results.claude = true;
        } else {
            const data = await response.json();
            console.log(`      ❌ Claude 错误: ${data.error?.message || response.status}`);
        }
    } catch (e) {
        console.log(`      ❌ Claude 错误: ${e.message}`);
    }
}

// 运行所有测试
async function runTests() {
    await testBSC();
    await testSupabase();
    await testDexScreener();
    await testClaude();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('测试结果:');
    console.log('');

    const required = ['bsc', 'supabase', 'dexscreener'];
    const allRequiredOk = required.every(k => results[k]);

    Object.entries(results).forEach(([name, ok]) => {
        const status = ok ? '✅' : '❌';
        const optional = name === 'claude' ? ' (可选)' : '';
        console.log(`  ${status} ${name}${optional}`);
    });

    console.log('');

    if (allRequiredOk) {
        console.log('🚀 一切正常! 可以运行: npm start');
    } else {
        console.log('⚠️  请先修复上述错误后再启动机器人。');
    }

    console.log('═══════════════════════════════════════════════════════════════');
}

runTests().catch(console.error);
