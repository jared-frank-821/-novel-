-- ============================================
-- Supabase Storage 策略 - Cover Bucket
-- ============================================
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 1. 创建 Storage Policy（如果尚不存在）
-- 这允许任何人访问 cover bucket 中的文件

DO $$
BEGIN
  -- 检查是否已存在同名策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Public cover access'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
  
    CREATE POLICY "Public cover access"
    ON storage.objects
    FOR ALL
    TO public
    USING (bucket_id = 'cover')
    WITH CHECK (bucket_id = 'cover');
    
    RAISE NOTICE 'Policy "Public cover access" created successfully';
  ELSE
    RAISE NOTICE 'Policy "Public cover access" already exists';
  END IF;
END $$;

-- 2. 验证 Storage 配置
-- SELECT name, public FROM storage.buckets WHERE name = 'cover';
