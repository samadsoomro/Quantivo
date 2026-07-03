'use client'
import { AIToolPage } from '@/components/AIToolPage'

export default function TermsGeneratorPage() {
  return (
    <AIToolPage
      toolId="terms"
      title="Terms & Conditions Generator"
      description="Generate legally-sound Terms and Conditions for your app, website, or SaaS product using AI."
      inputLabel="Company / Product Name"
      inputPlaceholder="e.g. Quantivo — a personal finance SaaS"
      inputType="textarea"
      icon="gavel"
      outputLabel="Generated Terms & Conditions"
    />
  )
}
