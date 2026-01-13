#!/usr/bin/env node
/**
 * 猴王 - 创建新钱包脚本
 * 用法: node scripts/create-wallet.js
 */

import { ethers } from 'ethers';
import fs from 'fs';

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              🔐 猴王 创建新钱包                             ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// 创建新钱包
const wallet = ethers.Wallet.createRandom();

console.log('✅ 新钱包已创建!');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('钱包地址:', wallet.address);
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('私钥:', wallet.privateKey);
console.log('');
console.log('助记词:', wallet.mnemonic?.phrase);
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('⚠️  重要提示:');
console.log('1. 请安全保存私钥和助记词');
console.log('2. 永远不要分享你的私钥');
console.log('3. 将私钥添加到 .env 文件中:');
console.log('');
console.log(`   WALLET_PRIVATE_KEY=${wallet.privateKey}`);
console.log('');
console.log('4. 向此地址转入 BNB 以开始交易');
console.log('');

// 询问是否自动添加到 .env
console.log('═══════════════════════════════════════════════════════════════');
console.log('是否将私钥自动添加到 .env 文件? (运行时会覆盖现有的)');
console.log('如果需要，请手动复制上面的私钥。');
console.log('═══════════════════════════════════════════════════════════════');

// 保存到文件 (仅供参考，实际使用时应该手动复制)
const walletInfo = `
# 猴王钱包信息 - 创建于 ${new Date().toISOString()}
# ⚠️ 请妥善保管此文件!

地址: ${wallet.address}
私钥: ${wallet.privateKey}
助记词: ${wallet.mnemonic?.phrase}

# 要使用此钱包，将以下内容添加到 .env:
WALLET_PRIVATE_KEY=${wallet.privateKey}
`;

const filename = `wallet-${wallet.address.slice(0, 10)}.txt`;
fs.writeFileSync(filename, walletInfo);
console.log('');
console.log(`💾 钱包信息已保存到: ${filename}`);
console.log('   请将此文件移动到安全的位置并删除此处的副本。');
