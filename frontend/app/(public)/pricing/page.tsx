'use client';

import Link from 'next/link';
import { useState } from 'react';
import Footer from '@/components/layout/Footer';

const plans = [
  {
    name: 'Starter', description: 'For individual precision.', price: '$0', period: '/mo',
    features: ['5 PDF uploads / month', 'Basic AI Chat', 'Single workspace'],
    disabledFeatures: ['Batch processing'],
    cta: 'Start Free', ctaStyle: 'border border-secondary text-secondary hover:bg-secondary/5',
  },
  {
    name: 'Precision', description: 'Unleash full AI potential.', price: '$29', period: '/mo',
    features: ['Unlimited uploads', 'Advanced LLM models', 'Collaborative Folders', 'Source Citations API'],
    isPopular: true,
    cta: 'Upgrade to Pro', ctaStyle: 'primary-gradient text-on-primary shadow-lg hover:shadow-xl',
  },
  {
    name: 'Enterprise', description: 'Global scale security.', price: 'Custom', period: '',
    features: ['Self-hosted option', 'SSO & SAML Login', 'Dedicated account lead', 'SLA Guarantees'],
    cta: 'Contact Sales', ctaStyle: 'border border-outline-variant text-on-surface-variant hover:bg-surface-dim',
  },
];

const comparisonRows = [
  { feature: 'Max File Size', starter: '10 MB', precision: '500 MB', enterprise: 'Unlimited' },
  { feature: 'AI Model Access', starter: 'Basic', precision: 'GPT-4 / Claude 3', enterprise: 'Custom/Fine-tuned' },
  { feature: 'Collaboration', starter: '—', precision: 'check', enterprise: 'check' },
  { feature: 'Data Sovereignty', starter: '—', precision: '—', enterprise: 'check' },
];

const faqs = [
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade, downgrade, or cancel at any time. Changes take effect immediately and we prorate billing automatically.' },
  { q: 'What document types are supported?', a: 'We support PDF, DOCX, TXT, and Markdown files. Notion and Google Drive integrations are coming soon.' },
  { q: 'How secure is my data?', a: 'Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC2 Type II compliant. Enterprise plans offer private cloud deployment.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-background text-on-surface">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm flex justify-between items-center h-16 px-margin-desktop">
        <div className="flex items-center gap-xl">
          <Link href="/" className="text-headline-sm font-bold text-primary" style={{ fontFamily: 'Inter' }}>DocuMind AI</Link>
          <div className="hidden md:flex gap-lg">
            <Link className="text-on-surface-variant hover:text-primary text-body-md transition-all" href="/">Product</Link>
            <Link className="text-primary font-semibold border-b-2 border-primary text-body-md" href="/pricing">Pricing</Link>
            <Link className="text-on-surface-variant hover:text-primary text-body-md transition-all" href="#">Solutions</Link>
            <Link className="text-on-surface-variant hover:text-primary text-body-md transition-all" href="#">Resources</Link>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <Link href="/login" className="hidden sm:block text-on-surface-variant text-body-md hover:bg-surface-container/50 px-md py-sm rounded-lg transition-all">Log In</Link>
          <Link href="/signup" className="primary-gradient text-on-primary text-body-md px-lg py-sm rounded-xl inner-glow shadow-lg hover:shadow-xl transition-all">Get Started</Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface hero-gradient text-center">
          <div className="inline-flex bg-secondary/10 text-secondary text-label-lg font-bold py-1 px-4 rounded-full mb-lg">Simple Pricing</div>
          <h1 className="text-display text-primary mb-md" style={{ fontFamily: 'Inter', fontWeight: 700 }}>
            Invest in clarity.<br />Precision scaled for you.
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-[600px] mx-auto">
            From solo researchers to global enterprises, DocuMind AI adapts to your workflow. No hidden fees. Just powerful, cold-winter technology.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="pb-xxl px-margin-mobile md:px-margin-desktop -mt-md">
          <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-lg items-end">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col ${plan.isPopular ? 'primary-gradient p-[1px] rounded-[24px] shadow-2xl md:scale-105 z-10' : ''}`}
              >
                <div className={`bg-surface-container-lowest p-xl rounded-[24px] border ${plan.isPopular ? 'border-none' : 'border-outline-variant/20'} flex flex-col h-full`}>
                  {plan.isPopular && (
                    <div className="bg-secondary/10 text-secondary text-label-md font-bold py-1 px-3 rounded-full self-start mb-md">Most Popular</div>
                  )}
                  <h3 className="text-headline-sm text-primary mb-xs font-semibold">{plan.name}</h3>
                  <p className="text-body-sm text-on-surface-variant mb-lg">{plan.description}</p>
                  <p className="text-display text-primary mb-lg" style={{ fontWeight: 700 }}>
                    {plan.price}<span className="text-body-md font-normal text-on-surface-variant">{plan.period}</span>
                  </p>
                  <ul className="space-y-md mb-xxl flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-sm text-body-sm">
                        <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>{f}
                      </li>
                    ))}
                    {plan.disabledFeatures?.map((f) => (
                      <li key={f} className="flex items-center gap-sm text-body-sm text-on-surface-variant/50 line-through">
                        <span className="material-symbols-outlined text-outline text-sm">cancel</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`w-full py-md rounded-xl font-semibold text-center block transition-all ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-headline-lg text-primary text-center mb-xxl" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Compare all features</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-outline-variant/30">
                    <th className="text-left py-md text-body-md text-on-surface-variant font-semibold">Capabilities</th>
                    <th className="text-center py-md text-body-md text-on-surface-variant font-semibold">Starter</th>
                    <th className="text-center py-md text-body-md text-secondary font-semibold">Precision</th>
                    <th className="text-center py-md text-body-md text-on-surface-variant font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-outline-variant/20">
                      <td className="py-lg text-body-md text-primary font-medium">{row.feature}</td>
                      {[row.starter, row.precision, row.enterprise].map((val, i) => (
                        <td key={i} className={`py-lg text-center text-body-sm ${i === 1 ? 'text-secondary font-semibold' : 'text-on-surface-variant'}`}>
                          {val === 'check' ? (
                            <span className="material-symbols-outlined text-secondary">check_circle</span>
                          ) : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-headline-lg text-primary text-center mb-xxl" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Frequently Asked Questions</h2>
            <div className="space-y-md">
              {faqs.map((faq, i) => (
                <div
                  key={faq.q}
                  className="glass-panel rounded-2xl cursor-pointer overflow-hidden"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="p-lg flex justify-between items-center">
                    <h4 className="text-headline-sm text-primary font-semibold">{faq.q}</h4>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                  {openFaq === i && (
                    <div className="px-lg pb-lg text-body-md text-on-surface-variant animate-[fadeIn_0.2s_ease-in-out]">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
