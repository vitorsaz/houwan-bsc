import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// ═══════════════════════════════════════════════════════════════
// 猴王 - Supabase 数据库模块
// ═══════════════════════════════════════════════════════════════

export const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY || config.SUPABASE_ANON_KEY
);

// ═══════════════════════════════════════════════════════════════
// 系统状态
// ═══════════════════════════════════════════════════════════════
export async function updateSystemStatus(data) {
    const { error } = await supabase
        .from('system_status')
        .upsert({ id: 1, ...data, updated_at: new Date().toISOString() });
    if (error) console.error('[SUPABASE] 状态更新错误:', error.message);
    return !error;
}

export async function getSystemStatus() {
    const { data, error } = await supabase
        .from('system_status')
        .select('*')
        .eq('id', 1)
        .single();
    if (error) console.error('[SUPABASE] 获取状态错误:', error.message);
    return data;
}

// ═══════════════════════════════════════════════════════════════
// 代币操作
// ═══════════════════════════════════════════════════════════════
export async function upsertToken(token) {
    const { data, error } = await supabase
        .from('tokens')
        .upsert({ ...token, atualizado_em: new Date().toISOString() }, { onConflict: 'ca' })
        .select()
        .single();
    if (error) console.error('[SUPABASE] 代币更新错误:', error.message);
    return data;
}

export async function getToken(ca) {
    const { data } = await supabase.from('tokens').select('*').eq('ca', ca).single();
    return data;
}

export async function getAllTokens(status = null) {
    let query = supabase.from('tokens').select('*').order('criado_em', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data } = await query;
    return data || [];
}

// ═══════════════════════════════════════════════════════════════
// 交易记录
// ═══════════════════════════════════════════════════════════════
export async function recordTrade(trade) {
    const { data, error } = await supabase.from('trades').insert(trade).select().single();
    if (error) console.error('[SUPABASE] 交易记录错误:', error.message);
    return data;
}

export async function getTrades(limit = 50) {
    const { data } = await supabase
        .from('trades')
        .select('*, tokens(*)')
        .order('data', { ascending: false })
        .limit(limit);
    return data || [];
}

// ═══════════════════════════════════════════════════════════════
// 持仓管理
// ═══════════════════════════════════════════════════════════════
export async function createPosition(position) {
    const { data, error } = await supabase.from('positions').insert(position).select().single();
    if (error) console.error('[SUPABASE] 创建持仓错误:', error.message);
    return data;
}

export async function getOpenPositions() {
    const { data } = await supabase
        .from('positions')
        .select('*, tokens(*)')
        .eq('status', 'open');
    return data || [];
}

export async function updatePosition(id, updates) {
    const { data, error } = await supabase
        .from('positions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) console.error('[SUPABASE] 更新持仓错误:', error.message);
    return data;
}

export async function closePosition(id, pnl) {
    const { data, error } = await supabase
        .from('positions')
        .update({
            status: 'closed',
            pnl_bnb: pnl,
            fechado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    if (error) console.error('[SUPABASE] 关闭持仓错误:', error.message);
    return data;
}

// ═══════════════════════════════════════════════════════════════
// 钱包余额
// ═══════════════════════════════════════════════════════════════
export async function updateWalletBalance(walletAddress, balance) {
    const { error } = await supabase
        .from('wallet_balance')
        .upsert({
            wallet_address: walletAddress,
            bnb_balance: balance,
            updated_at: new Date().toISOString()
        }, { onConflict: 'wallet_address' });
    if (error) console.error('[SUPABASE] 钱包余额更新错误:', error.message);
    return !error;
}

export async function getWalletBalance(walletAddress) {
    const { data } = await supabase
        .from('wallet_balance')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
    return data;
}
