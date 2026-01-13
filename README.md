# 猴王 🐵 BSC 交易机器人

BSC (币安智能链) 上的 AI 驱动迷因币交易机器人。

## 🌐 链接

- **网站:** [待部署]
- **代币合约:** [待发布]
- **Twitter:** [待创建]

## 📦 项目结构

```
monkey-trader-bsc/
├── bot/         # 交易机器人 (Node.js)
├── site/        # 仪表板网站 (Next.js)
└── supabase/    # 数据库架构
```

## ⚙️ 设置步骤

### 前提条件
- Node.js 18+
- [Supabase](https://supabase.com) 账户
- BNB 用于交易 (可选)

### 1. 克隆仓库
```bash
git clone https://github.com/[用户名]/monkey-trader-bsc.git
cd monkey-trader-bsc
```

### 2. 配置机器人
```bash
cd bot
cp .env.example .env
# 在 .env 中填写凭据
npm install
```

### 3. 配置 Supabase
1. 在 [supabase.com](https://supabase.com) 创建项目
2. 进入 SQL 编辑器
3. 运行 `supabase/schema.sql`
4. 运行 `supabase/fix_realtime.sql`

### 4. 测试连接
```bash
node scripts/test-connections.js
```

### 5. 启动机器人
```bash
npm start
```

### 6. 配置网站 (可选)
```bash
cd ../site
cp .env.example .env.local
# 填写 NEXT_PUBLIC_SUPABASE_URL 和 KEY
npm install
npm run dev
```

## 🔧 环境变量

### 机器人 (.env)
```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
BSC_RPC=https://bsc-dataseed1.binance.org
BSCSCAN_API_KEY=      # 可选
CLAUDE_API_KEY=       # 可选
WALLET_PRIVATE_KEY=   # 交易必需
```

### 网站 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 📊 功能

- ✅ 实时监控 BSC 新代币
- ✅ AI 智能分析 (可选)
- ✅ 智能过滤器分析
- ✅ 自动通过 PancakeSwap 交易
- ✅ 止盈/止损自动执行
- ✅ 实时仪表板
- ✅ 蜜罐检测
- ✅ 黑名单/白名单过滤

## 📈 交易参数

| 参数 | 值 |
|------|-----|
| 最低买入分数 | 60/100 |
| 最大交易金额 | 0.05 BNB |
| 止盈 | +50% |
| 止损 | -25% |
| 滑点 | 15% |
| 市值范围 | $5K - $500K |

## 🛠️ 常用命令

```bash
# 自动设置
node scripts/setup.js

# 测试连接
node scripts/test-connections.js

# 创建新钱包
node scripts/create-wallet.js

# 启动机器人
npm start

# 开发模式 (自动重启)
npm run dev
```

## ⚠️ 免责声明

本项目仅供实验目的。加密货币交易涉及重大风险。
使用风险自负。这不是投资建议。

## 📄 许可证

MIT
