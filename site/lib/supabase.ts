import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// 猴王 - Supabase 客户端 (延迟初始化)
// ═══════════════════════════════════════════════════════════════

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (supabaseInstance) return supabaseInstance;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // 在构建期间返回占位客户端
        if (typeof window === 'undefined') {
            console.warn('[SUPABASE] 构建期间环境变量不可用');
            return createClient('https://placeholder.supabase.co', 'placeholder');
        }
        throw new Error('缺少 Supabase 环境变量');
    }

    supabaseInstance = createClient(url, key);
    return supabaseInstance;
}

// 为了兼容性导出
export const supabase = typeof window !== 'undefined' ? getSupabase() : null;

// ═══════════════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════════════

export interface Token {
    id: string;
    ca: string;
    nome: string;
    simbolo: string;
    logo: string | null;
    image_url: string | null;
    market_cap: number | null;
    preco: number | null;
    holders: number | null;
    liquidity: number | null;
    volume_24h: number | null;
    score: number | null;
    narrative_score: number | null;
    ticker_score: number | null;
    claude_score: number | null;
    claude_decision: string | null;
    claude_reasons: string[] | null;
    claude_red_flags: string[] | null;
    analysis_reason: string | null;
    status: string;
    criado_em: string;
    atualizado_em: string;
}

export interface Trade {
    id: string;
    token_id: string;
    tipo: 'buy' | 'sell';
    valor_bnb: number;
    preco: number;
    pnl_bnb: number | null;
    tx_signature: string;
    narrative_score: number | null;
    ticker_score: number | null;
    analysis_reason: string | null;
    data: string;
    tokens?: Token;
}

export interface Position {
    id: string;
    token_id: string;
    status: 'open' | 'closed';
    valor_bnb: number;
    entry_price: number;
    current_price: number;
    pnl_percent: number;
    pnl_bnb: number;
    aberto_em: string;
    fechado_em: string | null;
    tokens?: Token;
}

export interface SystemStatus {
    id: number;
    status: string;
    wallet_address: string | null;
    balance_bnb: number;
    total_pnl: number;
    total_trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    updated_at: string;
}

export interface WalletBalance {
    wallet_address: string;
    bnb_balance: number;
    updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// 实时订阅
// ═══════════════════════════════════════════════════════════════

export function subscribeToTokens(callback: (token: Token) => void) {
    const client = getSupabase();
    return client
        .channel('tokens')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, (payload) => {
            callback(payload.new as Token);
        })
        .subscribe();
}

export function subscribeToStatus(callback: (status: SystemStatus) => void) {
    const client = getSupabase();
    return client
        .channel('status')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, (payload) => {
            callback(payload.new as SystemStatus);
        })
        .subscribe();
}

export function subscribeToTrades(callback: (trade: Trade) => void) {
    const client = getSupabase();
    return client
        .channel('trades')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades' }, (payload) => {
            callback(payload.new as Trade);
        })
        .subscribe();
}

export function subscribeToPositions(callback: (position: Position) => void) {
    const client = getSupabase();
    return client
        .channel('positions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, (payload) => {
            callback(payload.new as Position);
        })
        .subscribe();
}
