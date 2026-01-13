-- ═══════════════════════════════════════════════════════════════
-- 猴王 BSC - 数据库架构
-- ═══════════════════════════════════════════════════════════════

-- 系统状态表
CREATE TABLE IF NOT EXISTS system_status (
    id INT PRIMARY KEY DEFAULT 1,
    status TEXT DEFAULT '离线',
    wallet_address TEXT,
    balance_bnb DECIMAL(20, 9) DEFAULT 0,
    total_pnl DECIMAL(20, 9) DEFAULT 0,
    total_trades INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入初始状态
INSERT INTO system_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 代币表
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ca TEXT UNIQUE NOT NULL,
    nome TEXT,
    simbolo TEXT,
    logo TEXT,
    market_cap DECIMAL(20, 2),
    preco DECIMAL(30, 18),
    holders INT,
    liquidity DECIMAL(20, 2),
    volume_24h DECIMAL(20, 2),
    score INT,
    narrative_score INT,
    ticker_score INT,
    claude_score INT,
    claude_decision TEXT,
    claude_reasons TEXT[],
    claude_red_flags TEXT[],
    analysis_reason TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'analyzing',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 交易表
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id TEXT REFERENCES tokens(ca),
    tipo TEXT NOT NULL,
    valor_bnb DECIMAL(20, 9),
    preco DECIMAL(30, 18),
    pnl_bnb DECIMAL(20, 9),
    tx_signature TEXT,
    narrative_score INT,
    ticker_score INT,
    analysis_reason TEXT,
    data TIMESTAMPTZ DEFAULT NOW()
);

-- 持仓表
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id TEXT REFERENCES tokens(ca),
    status TEXT DEFAULT 'open',
    valor_bnb DECIMAL(20, 9),
    entry_price DECIMAL(30, 18),
    current_price DECIMAL(30, 18),
    pnl_percent DECIMAL(10, 2),
    pnl_bnb DECIMAL(20, 9),
    aberto_em TIMESTAMPTZ DEFAULT NOW(),
    fechado_em TIMESTAMPTZ
);

-- 钱包余额表
CREATE TABLE IF NOT EXISTS wallet_balance (
    wallet_address TEXT PRIMARY KEY,
    bnb_balance DECIMAL(20, 9) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_tokens_ca ON tokens(ca);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_criado_em ON tokens(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_trades_data ON trades(data DESC);
CREATE INDEX IF NOT EXISTS idx_trades_tipo ON trades(tipo);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);

-- 注释
COMMENT ON TABLE system_status IS '系统状态 - 机器人运行状态';
COMMENT ON TABLE tokens IS '代币 - 分析的代币列表';
COMMENT ON TABLE trades IS '交易 - 买卖记录';
COMMENT ON TABLE positions IS '持仓 - 当前和历史持仓';
COMMENT ON TABLE wallet_balance IS '钱包余额 - 钱包 BNB 余额';
