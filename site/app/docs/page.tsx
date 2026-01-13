export default function Docs() {
    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 gradient-text">文档</h1>
            <p className="text-gray-400 mb-8">了解猴王机器人的工作原理和使用方法。</p>

            {/* 什么是猴王 */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 bnb-gold">🐵 什么是猴王?</h2>
                <p className="text-gray-300 mb-4">
                    猴王是一个 AI 驱动的交易机器人，它会实时监控 BSC (币安智能链) 上的新代币。
                    它会分析每个代币的各种指标，并根据分析结果自动执行交易。
                    所有交易都是 100% 透明的，实时显示在仪表板上。
                </p>
            </section>

            {/* 工作原理 */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 bnb-gold">⚙️ 工作原理</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>机器人通过 DexScreener API 监控 BSC 上的新代币</li>
                    <li>对每个代币进行实时分析 (市值、流动性、交易量等)</li>
                    <li>使用 AI 或智能过滤器评估代币潜力</li>
                    <li>给出 0-100 的分数，分数越高越好</li>
                    <li>如果分数高于 60，机器人自动通过 PancakeSwap 购买</li>
                    <li>机器人持续监控持仓</li>
                    <li>达到止盈 (+50%) 或止损 (-25%) 时自动卖出</li>
                </ol>
            </section>

            {/* 交易参数 */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 bnb-gold">📊 交易参数</h2>
                <div className="bg-[#1a2332] rounded-lg p-4 space-y-2">
                    <p className="text-gray-300"><span className="bnb-gold">最低买入分数:</span> 60/100</p>
                    <p className="text-gray-300"><span className="bnb-gold">最大交易金额:</span> 0.05 BNB</p>
                    <p className="text-gray-300"><span className="bnb-gold">最小交易金额:</span> 0.01 BNB</p>
                    <p className="text-gray-300"><span className="bnb-gold">止盈:</span> +50%</p>
                    <p className="text-gray-300"><span className="bnb-gold">止损:</span> -25%</p>
                    <p className="text-gray-300"><span className="bnb-gold">滑点:</span> 15%</p>
                    <p className="text-gray-300"><span className="bnb-gold">市值范围:</span> $5,000 - $500,000</p>
                    <p className="text-gray-300"><span className="bnb-gold">最低流动性:</span> $1,000</p>
                </div>
            </section>

            {/* 分析指标 */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 bnb-gold">🔍 分析指标</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-white">市值检查</h3>
                        <p className="text-gray-400">评估代币的市值是否在理想范围内 ($5K-$50K 最佳)</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">流动性检查</h3>
                        <p className="text-gray-400">确保有足够的流动性进行交易</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">交易量检查</h3>
                        <p className="text-gray-400">评估 24 小时交易量是否活跃</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">买卖比检查</h3>
                        <p className="text-gray-400">分析买单和卖单的比率</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">蜜罐检测</h3>
                        <p className="text-gray-400">检查代币是否可以正常卖出</p>
                    </div>
                </div>
            </section>

            {/* 常见问题 */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 bnb-gold">❓ 常见问题</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-white">这是投资建议吗?</h3>
                        <p className="text-gray-400">
                            不是。这是一个实验性项目。请自行研究，永远不要投资超过你能承受损失的金额。
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-white">我可以看到所有交易吗?</h3>
                        <p className="text-gray-400">
                            是的! 所有交易都是 100% 透明的，实时显示在仪表板上。
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-white">机器人使用什么链?</h3>
                        <p className="text-gray-400">
                            机器人在 BSC (币安智能链) 上运行，使用 PancakeSwap 进行交易。
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-white">交易费用是多少?</h3>
                        <p className="text-gray-400">
                            BSC 的交易费用非常低，通常每笔交易不到 $0.10。
                        </p>
                    </div>
                </div>
            </section>

            {/* 链接 */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 bnb-gold">🔗 链接</h2>
                <div className="flex gap-4">
                    <a href="/" className="text-[#f0b90b] hover:text-[#fcd535]">仪表板</a>
                    <a href="/privacy" className="text-[#f0b90b] hover:text-[#fcd535]">隐私政策</a>
                    <a href="/terms" className="text-[#f0b90b] hover:text-[#fcd535]">服务条款</a>
                </div>
            </section>
        </div>
    );
}
