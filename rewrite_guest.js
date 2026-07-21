const fs = require('fs');

// FINANCES
let fin = fs.readFileSync('app/tools/guest/finances/page.tsx', 'utf8');
fin = fin.replace(/import \{ createClient \} from '@\/supabase\/client'/, 'import { ToolLayout } from \'@/components/ToolLayout\'');

fin = fin.replace(/const fetchTransactions = async \(\) => \{[\s\S]*?\}\n\n/m, `const fetchTransactions = async () => {
    setLoading(true)
    const localData = localStorage.getItem('qv-guest-transactions')
    if (localData) {
      setTransactions(JSON.parse(localData))
    }
    setLoading(false)
  }\n\n`);

fin = fin.replace(/const submitAddTransaction = async \(\) => \{[\s\S]*?setIsAdding\(false\)\n  \}\n\n/m, `const submitAddTransaction = async () => {
    const { type } = addModal
    const amt = parseFloat(addForm.amount)
    if (!addForm.desc || isNaN(amt)) return

    setIsAdding(true)
    const newTx = {
      id: Math.random().toString(36).substring(7),
      title: addForm.desc,
      amount: amt,
      type,
      date: format(new Date(), 'yyyy-MM-dd'),
      categories: { name: 'Other', color: '#6b7280' }
    }
    const newTxs = [newTx, ...transactions]
    setTransactions(newTxs)
    localStorage.setItem('qv-guest-transactions', JSON.stringify(newTxs))
    setAddModal({ isOpen: false, type: 'income' })
    setIsAdding(false)
    showToast('Saved locally (Guest)')
  }\n\n`);

fin = fin.replace(/const handleDelete = async \(id: string\) => \{[\s\S]*?setDeleteConfirm\(null\)\n  \}\n\n/m, `const handleDelete = async (id: string) => {
    const newTxs = transactions.filter(t => t.id !== id)
    setTransactions(newTxs)
    localStorage.setItem('qv-guest-transactions', JSON.stringify(newTxs))
    setDeleteConfirm(null)
    showToast('Deleted locally (Guest)')
  }\n\n`);

fin = fin.replace(/<div className="max-w-\[1440px\] mx-auto pb-12 space-y-6\">/, '<ToolLayout>\n      <div className="max-w-[1440px] mx-auto pb-12 space-y-6">');
fin = fin.replace(/<\/div>\n\n      \{\/\* Add Transaction Dialog \*\/\}/, '</div>\n\n      {/* Add Transaction Dialog */}');
fin = fin.replace(/\{\/\* Toast \*\/\}\n      \{toastMsg && \([\s\S]*?\)\}\n    <\/>/, '{/* Toast */}\n      {toastMsg && (\n        <div className="fixed bottom-6 right-6 z-50 glass-modal px-5 py-3 text-sm text-white animate-in slide-in-from-bottom-5 duration-300">\n          {toastMsg}\n        </div>\n      )}\n    </ToolLayout>\n    </>');

fs.writeFileSync('app/tools/guest/finances/page.tsx', fin);


// GOALS
let goals = fs.readFileSync('app/tools/guest/goals/page.tsx', 'utf8');
goals = goals.replace(/import \{ createClient \} from '@\/supabase\/client'/, 'import { ToolLayout } from \'@/components/ToolLayout\'');

goals = goals.replace(/const fetchGoals = async \(\) => \{[\s\S]*?\}\n\n/m, `const fetchGoals = async () => {
    setLoading(true)
    const localData = localStorage.getItem('qv-guest-goals')
    if (localData) {
      setGoals(JSON.parse(localData))
    }
    setLoading(false)
  }\n\n`);

goals = goals.replace(/const handleAddGoal = async \(\) => \{[\s\S]*?setIsAdding\(false\)\n  \}\n\n/m, `const handleAddGoal = async () => {
    const target = parseFloat(addForm.target)
    if (!addForm.title || isNaN(target) || target <= 0) return

    setIsAdding(true)
    const newGoal = {
      id: Math.random().toString(36).substring(7),
      title: addForm.title,
      target_amount: target,
      current_amount: 0,
      deadline: addForm.deadline || null,
      status: 'active',
      created_at: new Date().toISOString()
    }
    const newGoals = [newGoal, ...goals]
    setGoals(newGoals)
    localStorage.setItem('qv-guest-goals', JSON.stringify(newGoals))
    setShowAddModal(false)
    setAddForm({ title: '', target: '', deadline: '' })
    setIsAdding(false)
    showToast('Saved locally (Guest)')
  }\n\n`);

goals = goals.replace(/const handleAddMoney = async \(\) => \{[\s\S]*?\}\n\n/m, `const handleAddMoney = async () => {
    if (!addMoneyModal) return
    const amt = parseFloat(addMoneyAmount)
    if (isNaN(amt) || amt <= 0) return

    const newCurrent = addMoneyModal.current_amount + amt
    const newStatus = newCurrent >= addMoneyModal.target_amount ? 'completed' : addMoneyModal.status

    const newGoals = goals.map(g => g.id === addMoneyModal.id ? { ...g, current_amount: newCurrent, status: newStatus } : g)
    setGoals(newGoals)
    localStorage.setItem('qv-guest-goals', JSON.stringify(newGoals))
    setAddMoneyModal(null)
    setAddMoneyAmount('')
    showToast('Updated locally (Guest)')
  }\n\n`);

goals = goals.replace(/const handleToggleStatus = async \(goal: Goal\) => \{[\s\S]*?\}\n\n/m, `const handleToggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'paused' ? 'active' : 'paused'
    const newGoals = goals.map(g => g.id === goal.id ? { ...g, status: newStatus } : g)
    setGoals(newGoals)
    localStorage.setItem('qv-guest-goals', JSON.stringify(newGoals))
    showToast('Status toggled locally (Guest)')
  }\n\n`);

goals = goals.replace(/<div className=\"max-w-\[1440px\] mx-auto pb-12 space-y-6\">/, '<ToolLayout>\n      <div className="max-w-[1440px] mx-auto pb-12 space-y-6">');
goals = goals.replace(/\{\/\* Toast \*\/\}\n      \{toastMsg && \([\s\S]*?\)\}\n    <\/>/, '{/* Toast */}\n      {toastMsg && (\n        <div className="fixed bottom-6 right-6 z-50 glass-modal px-5 py-3 text-sm text-white animate-in slide-in-from-bottom-5 duration-300">\n          {toastMsg}\n        </div>\n      )}\n    </ToolLayout>\n    </>');

fs.writeFileSync('app/tools/guest/goals/page.tsx', goals);


// HABITS
let habits = fs.readFileSync('app/tools/guest/habits/page.tsx', 'utf8');
habits = habits.replace(/import \{ createClient \} from '@\/supabase\/client'/, 'import { ToolLayout } from \'@/components/ToolLayout\'');

habits = habits.replace(/const fetchHabits = async \(\) => \{[\s\S]*?\}\n\n/m, `const fetchHabits = async () => {
    setLoading(true)
    const localData = localStorage.getItem('qv-guest-habits')
    if (localData) {
      setHabits(JSON.parse(localData))
    }
    setLoading(false)
  }\n\n`);

habits = habits.replace(/const handleAddHabit = async \(\) => \{[\s\S]*?setIsAdding\(false\)\n  \}\n\n/m, `const handleAddHabit = async () => {
    if (!addForm.title) return
    setIsAdding(true)
    const newHabit = {
      id: Math.random().toString(36).substring(7),
      title: addForm.title,
      frequency: addForm.frequency,
      color: addForm.color,
      current_streak: 0,
      best_streak: 0,
      last_completed_date: null,
      created_at: new Date().toISOString()
    }
    const newHabits = [newHabit, ...habits]
    setHabits(newHabits)
    localStorage.setItem('qv-guest-habits', JSON.stringify(newHabits))
    setShowAddModal(false)
    setAddForm({ title: '', frequency: 'daily', color: '#6366f1' })
    setIsAdding(false)
    showToast('Saved locally (Guest)')
  }\n\n`);

habits = habits.replace(/const handleLogProgress = async \(habit: Habit\) => \{[\s\S]*?\}\n\n/m, `const handleLogProgress = async (habit: Habit) => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const localDateStr = today.toISOString().split('T')[0];
    
    let current_streak = habit.current_streak + 1
    const best_streak = Math.max(current_streak, habit.best_streak)
    
    const newHabits = habits.map(h => h.id === habit.id ? { ...h, current_streak, best_streak, last_completed_date: localDateStr } : h)
    setHabits(newHabits)
    localStorage.setItem('qv-guest-habits', JSON.stringify(newHabits))
    
    setConfettiPos(habit.id)
    setTimeout(() => setConfettiPos(null), 2000)
    showToast('Progress logged locally (Guest)')
  }\n\n`);

habits = habits.replace(/const handleDelete = async \(id: string\) => \{[\s\S]*?setDeleteConfirm\(null\)\n  \}\n\n/m, `const handleDelete = async (id: string) => {
    const newHabits = habits.filter(h => h.id !== id)
    setHabits(newHabits)
    localStorage.setItem('qv-guest-habits', JSON.stringify(newHabits))
    setDeleteConfirm(null)
    showToast('Deleted locally (Guest)')
  }\n\n`);

habits = habits.replace(/<div className=\"max-w-\[1440px\] mx-auto pb-12 space-y-6\">/, '<ToolLayout>\n      <div className="max-w-[1440px] mx-auto pb-12 space-y-6">');
habits = habits.replace(/\{\/\* Toast \*\/\}\n      \{toastMsg && \([\s\S]*?\)\}\n    <\/>/, '{/* Toast */}\n      {toastMsg && (\n        <div className="fixed bottom-6 right-6 z-50 glass-modal px-5 py-3 text-sm text-white animate-in slide-in-from-bottom-5 duration-300">\n          {toastMsg}\n        </div>\n      )}\n    </ToolLayout>\n    </>');

fs.writeFileSync('app/tools/guest/habits/page.tsx', habits);

console.log("Rewrite complete.");
