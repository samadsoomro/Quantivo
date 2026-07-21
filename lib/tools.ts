export const TOOLS = [
  // Dashboard Guest Tools
  {
    category: 'Track Your Finances — No Account Needed',
    color: '#ff33aa',
    items: [
      { href: '/tools/guest/finances', icon: 'payments', title: 'Finance Tracker', desc: 'Track income & expenses locally in your browser', badge: 'LOCAL' },
      { href: '/tools/guest/goals', icon: 'ads_click', title: 'Goal Setting', desc: 'Set financial goals and track progress', badge: 'LOCAL' },
      { href: '/tools/guest/habits', icon: 'repeat_on', title: 'Habit Tracker', desc: 'Build streaks and log daily progress', badge: 'LOCAL' },
    ]
  },
  // Utility Tools
  {
    category: 'Finance',
    color: '#fa8c00',
    items: [
      { href: '/tools/invoice', icon: 'receipt_long', title: 'Invoice Generator', desc: 'Create professional invoices with logo, watermark & PDF export', badge: '' },
      { href: '/tools/bank-statement', icon: 'account_balance', title: 'Bank Statement Generator', desc: 'Generate PDF bank statements with running balance & custom transactions', badge: '' },
      { href: '/tools/expense-report', icon: 'attach_money', title: 'Expense Report', desc: 'Create expense reports by category with PDF export', badge: '' },
      { href: '/tools/budget-planner', icon: 'savings', title: 'Budget Planner', desc: 'Plan monthly budgets with visual allocation bar and actual vs budgeted', badge: '' },
      { href: '/tools/loan-calculator', icon: 'calculate', title: 'Loan Calculator', desc: 'Monthly payments, total interest, and full amortization schedule', badge: '' },
      { href: '/tools/currency-converter', icon: 'currency_exchange', title: 'Currency Converter', desc: 'Live exchange rates for 30+ currencies with popular pairs', badge: '' },
    ]
  },
  {
    category: 'Documents & Files',
    color: '#60a5fa',
    items: [
      { href: '/tools/pdf', icon: 'picture_as_pdf', title: 'PDF Converter', desc: 'Convert TXT, HTML, or CSV files to PDF instantly', badge: '' },
      { href: '/tools/csv-to-excel', icon: 'table_chart', title: 'CSV to Excel', desc: 'Convert CSV/TSV to .xlsx with preview and bold headers', badge: '' },
    ]
  },
  {
    category: 'Generators',
    color: '#4ade80',
    items: [
      { href: '/tools/qr-code', icon: 'qr_code_2', title: 'QR Code Generator', desc: 'Generate QR codes for URLs, WiFi, email, phone — custom colors', badge: '' },
      { href: '/tools/barcode-generator', icon: 'barcode_reader', title: 'Barcode Generator', desc: 'Create barcodes in 8 formats (CODE128, EAN13, QR…)', badge: '' },
      { href: '/tools/password-generator', icon: 'key', title: 'Password Generator', desc: 'Cryptographically secure passwords with strength indicator', badge: '' },
    ]
  },
  {
    category: 'AI-Powered Tools',
    color: '#c084fc',
    badge: 'AI',
    items: [
      { href: '/tools/terms-generator', icon: 'gavel', title: 'Terms & Conditions Generator', desc: 'Generate legally-sound T&C for your app or website with AI', badge: 'AI' },
      { href: '/tools/privacy-policy', icon: 'privacy_tip', title: 'Privacy Policy Generator', desc: 'GDPR & CCPA compliant privacy policies in seconds', badge: 'AI' },
      { href: '/tools/code-explainer', icon: 'code', title: 'Code Explainer', desc: 'Paste any code and get a plain-English explanation with improvements', badge: 'AI' },
      { href: '/tools/product-description', icon: 'sell', title: 'Product Description', desc: 'Write conversion-optimized product descriptions with emotional hooks', badge: 'AI' },
    ]
  },
]
