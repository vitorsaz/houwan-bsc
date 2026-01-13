-- ═══════════════════════════════════════════════════════════════
-- 猴王 BSC - 实时订阅修复
-- 在 Supabase SQL 编辑器中运行此脚本
-- ═══════════════════════════════════════════════════════════════

-- 移除并重新添加
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tokens;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.system_status;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.trades;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.positions;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.wallet_balance;

-- REPLICA IDENTITY (UPDATE/DELETE 实时所需)
ALTER TABLE public.tokens REPLICA IDENTITY FULL;
ALTER TABLE public.system_status REPLICA IDENTITY FULL;
ALTER TABLE public.trades REPLICA IDENTITY FULL;
ALTER TABLE public.positions REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_balance REPLICA IDENTITY FULL;

-- 添加到实时
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_balance;

-- 启用 RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balance ENABLE ROW LEVEL SECURITY;

-- 删除现有策略
DROP POLICY IF EXISTS "public_read" ON public.tokens;
DROP POLICY IF EXISTS "public_read" ON public.system_status;
DROP POLICY IF EXISTS "public_read" ON public.trades;
DROP POLICY IF EXISTS "public_read" ON public.positions;
DROP POLICY IF EXISTS "public_read" ON public.wallet_balance;

-- 创建公共读取策略
CREATE POLICY "public_read" ON public.tokens FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.system_status FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.trades FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.positions FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.wallet_balance FOR SELECT USING (true);

-- 允许服务角色进行所有操作
DROP POLICY IF EXISTS "service_all" ON public.tokens;
DROP POLICY IF EXISTS "service_all" ON public.system_status;
DROP POLICY IF EXISTS "service_all" ON public.trades;
DROP POLICY IF EXISTS "service_all" ON public.positions;
DROP POLICY IF EXISTS "service_all" ON public.wallet_balance;

CREATE POLICY "service_all" ON public.tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON public.system_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON public.trades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON public.positions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON public.wallet_balance FOR ALL USING (true) WITH CHECK (true);
