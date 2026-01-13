import { ethers } from 'ethers';
import { config } from '../config.js';
import { getWallet, getProvider, getGasPrice } from './wallet.js';
import { logInfo, logError, logSuccess } from './logger.js';

// ═══════════════════════════════════════════════════════════════
// 猴王 - PancakeSwap 交易模块
// ═══════════════════════════════════════════════════════════════

// 最小 ABI
const ROUTER_ABI = [
    'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable',
    'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external',
    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'
];

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
];

// ═══════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════
function getRouter() {
    const wallet = getWallet();
    if (!wallet) throw new Error('钱包未加载');
    return new ethers.Contract(config.PANCAKE_ROUTER, ROUTER_ABI, wallet);
}

function getTokenContract(tokenAddress) {
    const wallet = getWallet();
    if (!wallet) throw new Error('钱包未加载');
    return new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
}

// ═══════════════════════════════════════════════════════════════
// 买入 (BNB → 代币)
// ═══════════════════════════════════════════════════════════════
export async function buyToken(tokenAddress, amountBnb, slippage = 15) {
    const wallet = getWallet();
    if (!wallet) {
        logError('钱包未配置');
        return null;
    }

    try {
        const router = getRouter();
        const amountIn = ethers.parseEther(String(amountBnb));
        const path = [config.WBNB, tokenAddress];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 分钟

        // 计算预期输出
        let amountOutMin = 0n;
        try {
            const amounts = await router.getAmountsOut(amountIn, path);
            const expectedOut = amounts[1];
            amountOutMin = expectedOut * BigInt(100 - slippage) / 100n;
        } catch (e) {
            // 如果无法计算，使用 0 (接受任何数量)
            logInfo('无法计算预期输出，使用 0');
        }

        const gasPrice = await getGasPrice();

        logInfo(`买入 ${amountBnb} BNB 的 ${tokenAddress.slice(0, 10)}...`);

        const tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            amountOutMin,
            path,
            wallet.address,
            deadline,
            {
                value: amountIn,
                gasLimit: config.GAS_LIMIT,
                gasPrice
            }
        );

        const receipt = await tx.wait();
        logSuccess(`交易成功: ${receipt.hash}`);
        return receipt.hash;

    } catch (e) {
        logError(`买入错误: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// 卖出 (代币 → BNB)
// ═══════════════════════════════════════════════════════════════
export async function sellToken(tokenAddress, percentOrAmount = 100, slippage = 15) {
    const wallet = getWallet();
    if (!wallet) {
        logError('钱包未配置');
        return null;
    }

    try {
        const router = getRouter();
        const token = getTokenContract(tokenAddress);
        const path = [tokenAddress, config.WBNB];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

        // 获取代币余额
        const balance = await token.balanceOf(wallet.address);
        if (balance === 0n) {
            logError('没有代币可卖');
            return null;
        }

        // 计算卖出数量
        let amountIn;
        if (percentOrAmount >= 100) {
            amountIn = balance;
        } else {
            amountIn = balance * BigInt(percentOrAmount) / 100n;
        }

        // 检查/执行授权
        const allowance = await token.allowance(wallet.address, config.PANCAKE_ROUTER);
        if (allowance < amountIn) {
            logInfo('授权代币中...');
            const approveTx = await token.approve(
                config.PANCAKE_ROUTER,
                ethers.MaxUint256,
                { gasLimit: 100000 }
            );
            await approveTx.wait();
            logSuccess('代币授权成功');
        }

        // 计算最小输出
        let amountOutMin = 0n;
        try {
            const amounts = await router.getAmountsOut(amountIn, path);
            const expectedOut = amounts[1];
            amountOutMin = expectedOut * BigInt(100 - slippage) / 100n;
        } catch (e) {
            logInfo('无法计算预期输出，使用 0');
        }

        const gasPrice = await getGasPrice();

        logInfo(`卖出 ${percentOrAmount}% 的 ${tokenAddress.slice(0, 10)}...`);

        const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            amountOutMin,
            path,
            wallet.address,
            deadline,
            {
                gasLimit: config.GAS_LIMIT,
                gasPrice
            }
        );

        const receipt = await tx.wait();
        logSuccess(`交易成功: ${receipt.hash}`);
        return receipt.hash;

    } catch (e) {
        logError(`卖出错误: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// 获取价格 (X BNB 能买多少代币)
// ═══════════════════════════════════════════════════════════════
export async function getAmountOut(amountBnb, tokenAddress) {
    try {
        const router = getRouter();
        const amountIn = ethers.parseEther(String(amountBnb));
        const path = [config.WBNB, tokenAddress];
        const amounts = await router.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (e) {
        return 0n;
    }
}

// ═══════════════════════════════════════════════════════════════
// 检查是否可以卖出 (基本蜜罐检测)
// ═══════════════════════════════════════════════════════════════
export async function canSell(tokenAddress) {
    try {
        const router = getRouter();
        const token = getTokenContract(tokenAddress);

        // 尝试模拟卖出 1 个代币
        const decimals = await token.decimals();
        const testAmount = ethers.parseUnits('1', decimals);
        const path = [tokenAddress, config.WBNB];

        await router.getAmountsOut(testAmount, path);
        return true;
    } catch (e) {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// 获取交易对储备
// ═══════════════════════════════════════════════════════════════
export async function getReserves(tokenAddress) {
    try {
        const FACTORY_ABI = ['function getPair(address, address) view returns (address)'];
        const PAIR_ABI = [
            'function getReserves() view returns (uint112, uint112, uint32)',
            'function token0() view returns (address)',
            'function token1() view returns (address)'
        ];

        const provider = getProvider();
        const factory = new ethers.Contract(config.PANCAKE_FACTORY, FACTORY_ABI, provider);
        const pairAddress = await factory.getPair(config.WBNB, tokenAddress);

        if (pairAddress === ethers.ZeroAddress) {
            return null;
        }

        const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
        const [reserve0, reserve1] = await pair.getReserves();
        const token0 = await pair.token0();

        // 确定哪个储备是 BNB，哪个是代币
        const isToken0BNB = token0.toLowerCase() === config.WBNB.toLowerCase();
        const bnbReserve = isToken0BNB ? reserve0 : reserve1;
        const tokenReserve = isToken0BNB ? reserve1 : reserve0;

        return {
            pairAddress,
            bnbReserve: ethers.formatEther(bnbReserve),
            tokenReserve: tokenReserve.toString()
        };
    } catch (e) {
        logError(`获取储备错误: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// 计算价格影响
// ═══════════════════════════════════════════════════════════════
export async function getPriceImpact(tokenAddress, amountBnb) {
    try {
        const reserves = await getReserves(tokenAddress);
        if (!reserves) return 100; // 如果没有储备，价格影响是 100%

        const bnbReserve = parseFloat(reserves.bnbReserve);
        const impact = (amountBnb / bnbReserve) * 100;
        return impact;
    } catch (e) {
        return 100;
    }
}
