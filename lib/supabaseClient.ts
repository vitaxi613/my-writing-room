import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * 延迟创建客户端，避免在 import 阶段因缺少环境变量导致 Next 构建失败。
 * Vercel 部署需在 Environment Variables 中配置 NEXT_PUBLIC_SUPABASE_*。
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}
