import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dihwovhytzrxubfgseai.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaHdvdmh5dHpyeHViZmdzZWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNTE0NjgsImV4cCI6MjA3NTcyNzQ2OH0.agEN715-zWnqRlp0aDCq5e0M6pubLmbVquZExlqFIzM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)