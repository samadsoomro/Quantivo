import { AIToolPage } from '@/components/AIToolPage'

export default function CodeExplainerPage() {
  return (
    <AIToolPage
      toolId="code-explain"
      title="Code Explainer"
      description="Paste any code snippet and get a clear, plain-English explanation with analysis and improvement suggestions."
      inputLabel="Paste Your Code"
      inputPlaceholder={`// Paste your code here...\nfunction example() {\n  return 'Hello World'\n}`}
      inputType="code"
      icon="code"
      outputLabel="AI Explanation"
    />
  )
}
