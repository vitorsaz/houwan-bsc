import type { Metadata } from 'next';
import './globals.css';

// ═══════════════════════════════════════════════════════════════
// 猴王 - 项目配置
// ═══════════════════════════════════════════════════════════════
const PROJECT_NAME = '猴王';
const PROJECT_DESCRIPTION = 'BSC 智能链上的 AI 驱动迷因币交易机器人';
const TWITTER_URL = ''; // 你的 Twitter URL
const TELEGRAM_URL = ''; // 你的 Telegram URL
const TOKEN_CA = ''; // 代币合约地址

export const metadata: Metadata = {
    title: `${PROJECT_NAME} - BSC 交易机器人`,
    description: PROJECT_DESCRIPTION,
    keywords: ['BSC', 'BNB', 'PancakeSwap', '交易机器人', 'AI', '迷因币', '加密货币'],
    icons: {
        icon: '/monkey-logo.png',
        apple: '/monkey-logo.png',
    },
    openGraph: {
        title: `${PROJECT_NAME} - BSC 交易机器人`,
        description: PROJECT_DESCRIPTION,
        type: 'website',
        images: ['/monkey-logo.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${PROJECT_NAME} - BSC 交易机器人`,
        description: PROJECT_DESCRIPTION,
        images: ['/monkey-logo.png'],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN">
            <body className="min-h-screen flex flex-col bg-[#0a0f1c] text-white">
                {/* 导航栏 */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1c]/80 backdrop-blur-md border-b border-[#f0b90b]/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <a href="/" className="flex items-center gap-3">
                                <img
                                    src="/monkey-logo.png"
                                    alt="猴王"
                                    className="w-10 h-10 rounded-full"
                                />
                                <span className="text-2xl font-bold gradient-text">{PROJECT_NAME}</span>
                            </a>

                            <div className="hidden md:flex items-center gap-6">
                                <a href="/" className="text-gray-300 hover:text-[#f0b90b] transition-colors">
                                    仪表板
                                </a>
                                <a href="/docs" className="text-gray-300 hover:text-[#f0b90b] transition-colors">
                                    文档
                                </a>
                                {TWITTER_URL && (
                                    <a
                                        href={TWITTER_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-[#f0b90b] transition-colors"
                                    >
                                        Twitter
                                    </a>
                                )}
                                {TOKEN_CA && (
                                    <a
                                        href={`https://pancakeswap.finance/swap?outputCurrency=${TOKEN_CA}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary"
                                    >
                                        购买代币
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* 主内容 */}
                <main className="flex-1 pt-16">
                    {children}
                </main>

                {/* 页脚 */}
                <footer className="bg-[#070b14] border-t border-[#f0b90b]/20 py-8 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <img
                                        src="/monkey-logo.png"
                                        alt="猴王"
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <h3 className="text-lg font-bold gradient-text">{PROJECT_NAME}</h3>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    BSC 智能链上的 AI 驱动迷因币交易机器人
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">链接</h4>
                                <div className="flex flex-col gap-2">
                                    <a href="/" className="text-gray-400 hover:text-[#f0b90b] text-sm">仪表板</a>
                                    <a href="/docs" className="text-gray-400 hover:text-[#f0b90b] text-sm">文档</a>
                                    <a href="/privacy" className="text-gray-400 hover:text-[#f0b90b] text-sm">隐私政策</a>
                                    <a href="/terms" className="text-gray-400 hover:text-[#f0b90b] text-sm">服务条款</a>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">社交媒体</h4>
                                <div className="flex flex-col gap-2">
                                    {TWITTER_URL && (
                                        <a
                                            href={TWITTER_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-[#f0b90b] text-sm"
                                        >
                                            Twitter/X
                                        </a>
                                    )}
                                    {TELEGRAM_URL && (
                                        <a
                                            href={TELEGRAM_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-[#f0b90b] text-sm"
                                        >
                                            Telegram
                                        </a>
                                    )}
                                    <a
                                        href="https://bscscan.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-[#f0b90b] text-sm"
                                    >
                                        BSCScan
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-gray-500 text-xs">
                                &copy; {new Date().getFullYear()} {PROJECT_NAME}. 不构成投资建议。交易有风险，请自行承担。
                            </p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
