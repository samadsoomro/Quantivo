import Link from 'next/link'

interface ToolUsageBannerProps {
  toolName: string
  usageCount: number
}

export function ToolUsageBanner({ toolName, usageCount }: ToolUsageBannerProps) {
  if (usageCount < 3) return null

  return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-red-500">warning</span>
        <p className="text-sm font-medium">
          You've used {toolName} 3 times today. Limit reached.
        </p>
      </div>
      <Link 
        href="/signup" 
        className="px-6 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors whitespace-nowrap"
      >
        Sign up free to unlock
      </Link>
    </div>
  )
}
