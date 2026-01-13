export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 gradient-text">隐私政策</h1>
            <p className="text-gray-400 mb-4">最后更新: {new Date().toLocaleDateString('zh-CN')}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">我们收集的信息</h2>
            <p className="text-gray-300 mb-4">
                我们仅收集用于交易目的的钱包地址。我们不收集个人信息。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">我们如何使用信息</h2>
            <p className="text-gray-300 mb-4">
                钱包地址仅用于在 BSC 区块链上执行和显示交易。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">数据存储</h2>
            <p className="text-gray-300 mb-4">
                交易数据存储用于显示目的。所有区块链数据本质上是公开的。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">第三方服务</h2>
            <p className="text-gray-300 mb-4">
                我们使用以下第三方服务:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4">
                <li>Supabase - 数据库托管</li>
                <li>DexScreener - 代币数据</li>
                <li>PancakeSwap - 去中心化交易</li>
                <li>BSC RPC - 区块链连接</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">联系我们</h2>
            <p className="text-gray-300">
                如有关于本政策的问题，请通过 Twitter/X 联系我们。
            </p>
        </div>
    );
}
