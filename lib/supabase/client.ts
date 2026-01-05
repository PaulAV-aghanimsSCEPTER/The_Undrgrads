import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  "https://upqorsbydfxnljcxardd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcW9yc2J5ZGZ4bmxqY3hhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTcyNzgsImV4cCI6MjA3Nzk3MzI3OH0.hlUd9ESrWGPuZo5A_tvVzs_Mf8IwH9MXJ4tBNUaA8HI"
)
