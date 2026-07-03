'use client'
import { AIToolPage } from '@/components/AIToolPage'

export default function ProductDescriptionPage() {
  return (
    <AIToolPage
      toolId="product-desc"
      title="Product Description Generator"
      description="Generate compelling, conversion-optimized product descriptions with emotional hooks, benefits, and a clear CTA."
      inputLabel="Product Name & What It Does"
      inputPlaceholder="e.g. Quantivo Pro — an AI-powered personal finance dashboard that tracks expenses and investments"
      inputType="textarea"
      extraFields={[
        { label: 'Target Audience', placeholder: 'e.g. Freelancers and small business owners', id: 'audience' },
        { label: 'Tone', placeholder: 'e.g. professional, casual, energetic, luxury', id: 'tone' },
      ]}
      icon="sell"
      outputLabel="Generated Product Description"
    />
  )
}
