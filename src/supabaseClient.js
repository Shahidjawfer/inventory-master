import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gfnrjjffiduyrfyhvjrz.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbnJqamZmaWR1eXJmeWh2anJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzUxODEsImV4cCI6MjA3OTQxMTE4MX0.IbZL01WIFIlkLWkDSrIijtOAdwloBg9mtpMp_noabMQ"
export const supabase = createClient(supabaseUrl, supabaseKey)

