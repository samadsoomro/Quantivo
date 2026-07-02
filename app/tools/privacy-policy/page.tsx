import { AIToolPage } from '@/components/AIToolPage'

export default function PrivacyPolicyPage() {
  return (
    <AIToolPage
      toolId="privacy"
      title="Privacy Policy Generator"
      description="Generate a GDPR & CCPA compliant Privacy Policy for your website or app in seconds with AI."
      inputLabel="Company / Product Name & Description"
      inputPlaceholder="e.g. Quantivo — a personal finance platform that collects user emails and financial data"
      inputType="textarea"
      icon="privacy_tip"
      outputLabel="Generated Privacy Policy"
    />
  )
}
