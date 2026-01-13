#!/usr/bin/env node
/**
 * 猴王 - 自动设置脚本
 * 用法: node scripts/setup.js
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              🐵 猴王 自动设置                               ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

async function setup() {
    // 1. 检查 .env 是否存在
    console.log('[1/5] 检查 .env 文件...');
    if (!fs.existsSync('.env')) {
        if (fs.existsSync('.env.example')) {
            fs.copyFileSync('.env.example', '.env');
            console.log('      ✅ 已从 .env.example 创建 .env');
            console.log('      ⚠️  请在 .env 中填写 Supabase 凭据');
        } else {
            // 创建默认 .env
            const defaultEnv = `# ══════════════════════════════════════════════════════════════════
# 猴王 BSC 机器人 - 环境变量
# ══════════════════════════════════════════════════════════════════

# SUPABASE (必需 - 从 supabase.com 获取)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# BSC RPC (可选，默认使用公共 RPC)
BSC_RPC=https://bsc-dataseed1.binance.org

# BSCSCAN API (可选)
BSCSCAN_API_KEY=

# CLAUDE AI (可选)
CLAUDE_API_KEY=

# 钱包私钥 (必需用于交易)
WALLET_PRIVATE_KEY=

# 服务器端口
PORT=3001
`;
            fs.writeFileSync('.env', defaultEnv);
            console.log('      ✅ 已创建默认 .env 文件');
            console.log('      ⚠️  请填写必需的环境变量');
        }
    } else {
        console.log('      ✅ .env 已存在');
    }

    // 2. 安装依赖
    console.log('');
    console.log('[2/5] 安装依赖...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('      ✅ 依赖安装成功');
    } catch (e) {
        console.log('      ❌ 安装依赖失败');
        process.exit(1);
    }

    // 3. 创建日志文件夹
    console.log('');
    console.log('[3/5] 创建日志文件夹...');
    if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs');
    }
    console.log('      ✅ logs/ 文件夹已就绪');

    // 4. 检查必需的环境变量
    console.log('');
    console.log('[4/5] 检查环境变量...');

    const envContent = fs.readFileSync('.env', 'utf-8');
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = [];

    for (const varName of required) {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        if (!regex.test(envContent)) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        console.log('      ⚠️  缺少必需的环境变量:');
        missing.forEach(v => console.log(`         - ${v}`));
        console.log('');
        console.log('      请填写这些变量后再次运行。');
    } else {
        console.log('      ✅ 所有必需变量已配置');
    }

    // 5. 测试连接
    console.log('');
    console.log('[5/5] 测试连接...');
    console.log('      运行: node scripts/test-connections.js');

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('设置完成! 接下来的步骤:');
    console.log('');
    console.log('1. 在 .env 中填写环境变量 (如果还没有)');
    console.log('2. 运行: node scripts/test-connections.js');
    console.log('3. 如果一切正常，运行: npm start');
    console.log('═══════════════════════════════════════════════════════════════');
}

setup().catch(console.error);
