import { ethers } from 'ethers';
import { config } from '../config.js';
import { logInfo, logError, logSuccess } from './logger.js';

// ═══════════════════════════════════════════════════════════════
// 猴王 - BSC 钱包模块
// ═══════════════════════════════════════════════════════════════

let wallet = null;
let provider = null;

// ═══════════════════════════════════════════════════════════════
// 提供者 (带备用)
// ═══════════════════════════════════════════════════════════════
export function getProvider() {
    if (provider) return provider;
    try {
        provider = new ethers.JsonRpcProvider(config.BSC_RPC);
        return provider;
    } catch (e) {
        logError(`提供者错误: ${e.message}`);
        // 尝试备用 RPC
        provider = new ethers.JsonRpcProvider(config.BSC_RPC_BACKUP);
        return provider;
    }
}

// ═══════════════════════════════════════════════════════════════
// 钱包
// ═══════════════════════════════════════════════════════════════
export function loadWallet() {
    try {
        if (!config.WALLET_PRIVATE_KEY) {
            logInfo('未配置钱包私钥');
            return null;
        }
        const pk = config.WALLET_PRIVATE_KEY.trim();
        // 如果没有 0x 前缀则添加
        const privateKey = pk.startsWith('0x') ? pk : `0x${pk}`;

        const prov = getProvider();
        wallet = new ethers.Wallet(privateKey, prov);
        logSuccess(`钱包已加载: ${wallet.address}`);
        return wallet;
    } catch (e) {
        logError(`钱包加载错误: ${e.message}`);
        return null;
    }
}

export function getWallet() {
    return wallet;
}

export function getWalletAddress() {
    return wallet ? wallet.address : null;
}

// ═══════════════════════════════════════════════════════════════
// 余额查询
// ═══════════════════════════════════════════════════════════════
export async function getBalance() {
    if (!wallet) return 0;
    try {
        const prov = getProvider();
        const balance = await prov.getBalance(wallet.address);
        return parseFloat(ethers.formatEther(balance));
    } catch (e) {
        logError(`获取余额错误: ${e.message}`);
        return 0;
    }
}

export async function getTokenBalance(tokenAddress) {
    if (!wallet) return 0;
    try {
        const prov = getProvider();
        const abi = [
            'function balanceOf(address) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)'
        ];
        const contract = new ethers.Contract(tokenAddress, abi, prov);
        const [balance, decimals] = await Promise.all([
            contract.balanceOf(wallet.address),
            contract.decimals()
        ]);
        return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (e) {
        logError(`获取代币余额错误: ${e.message}`);
        return 0;
    }
}

// ═══════════════════════════════════════════════════════════════
// 代币信息
// ═══════════════════════════════════════════════════════════════
export async function getTokenInfo(tokenAddress) {
    try {
        const prov = getProvider();
        const abi = [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function decimals() view returns (uint8)',
            'function totalSupply() view returns (uint256)'
        ];
        const contract = new ethers.Contract(tokenAddress, abi, prov);
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.totalSupply()
        ]);
        return {
            name,
            symbol,
            decimals,
            totalSupply: ethers.formatUnits(totalSupply, decimals)
        };
    } catch (e) {
        logError(`获取代币信息错误: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// 发送 BNB
// ═══════════════════════════════════════════════════════════════
export async function sendBNB(toAddress, amountBnb) {
    if (!wallet) {
        logError('钱包未加载');
        return null;
    }

    try {
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.parseEther(String(amountBnb))
        });
        const receipt = await tx.wait();
        logSuccess(`BNB 发送成功: ${receipt.hash}`);
        return receipt.hash;
    } catch (e) {
        logError(`发送 BNB 错误: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// 检查网络
// ═══════════════════════════════════════════════════════════════
export async function checkNetwork() {
    try {
        const prov = getProvider();
        const network = await prov.getNetwork();
        const chainId = Number(network.chainId);

        if (chainId !== config.CHAIN_ID) {
            logError(`错误的网络! 期望: ${config.CHAIN_ID}, 实际: ${chainId}`);
            return false;
        }

        logSuccess(`连接到 BSC 主网 (Chain ID: ${chainId})`);
        return true;
    } catch (e) {
        logError(`网络检查错误: ${e.message}`);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// 获取 Gas 价格
// ═══════════════════════════════════════════════════════════════
export async function getGasPrice() {
    try {
        const prov = getProvider();
        const feeData = await prov.getFeeData();
        return feeData.gasPrice || ethers.parseUnits(String(config.GAS_PRICE_GWEI), 'gwei');
    } catch (e) {
        logError(`获取 Gas 价格错误: ${e.message}`);
        return ethers.parseUnits(String(config.GAS_PRICE_GWEI), 'gwei');
    }
}

// ═══════════════════════════════════════════════════════════════
// 创建新钱包
// ═══════════════════════════════════════════════════════════════
export function createNewWallet() {
    const newWallet = ethers.Wallet.createRandom();
    return {
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic?.phrase
    };
}
