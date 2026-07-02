export type Plan = 'free' | 'pro' | 'business'
export interface Profile {
  id: string; email: string; full_name: string | null; avatar_url: string | null
  currency: string; plan: Plan; stripe_customer_id: string | null
  stripe_subscription_id: string | null; plan_expires_at: string | null
  is_admin?: boolean
  created_at: string; updated_at: string
}
export type TransactionType = 'income' | 'expense'
export interface Category {
  id: string; user_id: string; name: string; icon: string
  color: string; type: 'income' | 'expense' | 'both'; is_default: boolean; created_at: string
}
export interface Transaction {
  id: string; user_id: string; category_id: string | null; title: string
  amount: number; type: TransactionType; date: string; notes: string | null
  is_recurring: boolean; recurring_interval: string | null
  created_at: string; updated_at: string; categories?: Category | null
}
export interface Goal {
  id: string; user_id: string; title: string; description: string | null
  target_amount: number; current_amount: number; deadline: string | null
  color: string; icon: string; status: 'active' | 'completed' | 'paused'
  created_at: string; updated_at: string
}
export interface Habit {
  id: string; user_id: string; title: string; description: string | null
  icon: string; color: string; frequency: 'daily' | 'weekly'
  current_streak: number; longest_streak: number; is_active: boolean; created_at: string
}
export interface Task {
  id: string; user_id: string; title: string; description: string | null
  due_date: string | null; priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done'; created_at: string; updated_at: string
}
export interface Invoice {
  id: string; user_id: string; invoice_number: string; client_name: string
  client_email: string | null; items: unknown[]; subtotal: number
  tax_rate: number | null; total: number; currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'; due_date: string | null
  created_at: string; updated_at: string
}
export interface Subscription {
  id: string; user_id: string; name: string; amount: number
  billing_cycle: 'weekly' | 'monthly' | 'yearly'; next_renewal_date: string | null
  color: string; is_active: boolean; created_at: string; updated_at: string
}
export interface DashboardStats {
  totalBalance: number; totalIncome: number; totalExpenses: number; totalSavings: number
  incomeChange: number; expenseChange: number; savingsChange: number
}
export interface ActionResult<T = void> { data?: T; error?: string; success: boolean }
