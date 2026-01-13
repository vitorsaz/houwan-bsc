export default function Terms() {
    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 gradient-text">服务条款</h1>
            <p className="text-gray-400 mb-4">最后更新: {new Date().toLocaleDateString('zh-CN')}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">条款接受</h2>
            <p className="text-gray-300 mb-4">
                使用本服务即表示您同意这些条款。这是一个实验性项目。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">风险免责声明</h2>
            <p className="text-gray-300 mb-4">
                加密货币交易涉及重大风险。您可能会损失所有资金。
                这不是投资建议。在交易前请自行研究。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">无保证</h2>
            <p className="text-gray-300 mb-4">
                我们不保证利润或性能。过去的表现不代表未来的结果。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">责任限制</h2>
            <p className="text-gray-300 mb-4">
                我们不对使用本服务造成的任何损失负责。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">服务变更</h2>
            <p className="text-gray-300 mb-4">
                我们保留随时修改或终止服务的权利，恕不另行通知。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3 bnb-gold">适用法律</h2>
            <p className="text-gray-300">
                本条款受适用法律管辖。使用本服务即表示您同意遵守所有适用的法律法规。
            </p>
        </div>
    );
}
