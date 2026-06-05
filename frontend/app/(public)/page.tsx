import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'DocuMind AI — Transform Your Knowledge Base',
  description: 'AI-powered document intelligence platform. Upload PDFs, chat with documents, extract insights with cited sources.',
};

export default function LandingPage() {
  return (
    <div className="bg-background text-on-surface selection:bg-secondary/20">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm flex justify-between items-center h-16 px-margin-desktop max-w-full mx-auto">
        <div className="flex items-center gap-xl">
          <span className="text-headline-sm font-bold text-primary" style={{ fontFamily: 'Inter' }}>DocuMind AI</span>
          <div className="hidden md:flex gap-lg">
            <Link className="text-primary font-semibold border-b-2 border-primary text-body-md transition-all duration-300" href="/">Product</Link>
            <Link className="text-on-surface-variant hover:text-primary text-body-md transition-all duration-300" href="/pricing">Pricing</Link>
            <Link className="text-on-surface-variant hover:text-primary text-body-md transition-all duration-300" href="#">Solutions</Link>
            <Link className="text-on-surface-variant hover:text-primary text-body-md transition-all duration-300" href="#">Resources</Link>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <Link href="/login" className="hidden sm:block text-on-surface-variant text-body-md hover:bg-surface-container/50 px-md py-sm rounded-lg transition-all active:scale-95">Log In</Link>
          <Link href="/signup" className="primary-gradient text-on-primary text-body-md px-lg py-sm rounded-xl inner-glow shadow-lg hover:shadow-xl transition-all active:scale-95">Get Started</Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center justify-center overflow-hidden hero-gradient px-margin-mobile md:px-margin-desktop">
          <div className="max-w-[900px] text-center z-10">
            <div className="inline-flex items-center gap-sm bg-surface-container px-md py-xs rounded-full border border-outline-variant/30 mb-xl">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-label-lg text-secondary font-semibold">V2.0 Intelligence Now Live</span>
            </div>
            <h1 className="text-display md:text-[64px] md:leading-[72px] text-primary mb-lg" style={{ fontFamily: 'Inter', fontWeight: 700 }}>
              Upload PDFs and Chat With Your <span className="text-secondary">Knowledge Base</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-xxl max-w-[700px] mx-auto">
              Transform documents into an intelligent AI-powered knowledge assistant. Seamlessly extract insights, cite sources, and collaborate across enterprise data.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <Link href="/signup" className="primary-gradient text-on-primary text-body-md px-[40px] py-md rounded-xl inner-glow shadow-lg hover:scale-105 transition-transform">Start Chatting Now</Link>
              <button className="bg-surface-container-high text-primary text-body-md px-[40px] py-md rounded-xl border border-outline-variant/50 hover:bg-surface-variant/50 transition-all">Watch Demo</button>
            </div>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]"></div>
        </section>

        {/* Trusted By */}
        <section className="py-xxl bg-surface-container-low/50">
          <div className="px-margin-desktop text-center">
            <p className="text-label-lg text-on-surface-variant uppercase tracking-widest mb-xl font-semibold">Trusted by high-stakes enterprise teams</p>
            <div className="flex flex-wrap justify-center items-center gap-xxl opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="h-8 w-32 bg-on-surface/20 rounded-md"></div>
              <div className="h-8 w-24 bg-on-surface/20 rounded-md"></div>
              <div className="h-8 w-40 bg-on-surface/20 rounded-md"></div>
              <div className="h-8 w-28 bg-on-surface/20 rounded-md"></div>
              <div className="h-8 w-36 bg-on-surface/20 rounded-md"></div>
            </div>
          </div>
        </section>

        {/* Product Preview */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-[1100px] mx-auto">
            <div className="glass-panel rounded-[24px] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col md:flex-row h-[600px]">
              {/* Mini Sidebar */}
              <div className="hidden md:flex w-[240px] bg-surface-container-low/80 p-md flex-col gap-md border-r border-outline-variant/20">
                <div className="flex items-center gap-sm p-sm bg-secondary/10 rounded-lg text-secondary font-semibold">
                  <span className="material-symbols-outlined">forum</span>
                  <span className="text-label-lg">Q1 Research Deep-Dive</span>
                </div>
                <div className="flex items-center gap-sm p-sm text-on-surface-variant hover:bg-surface-variant/30 rounded-lg transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">folder</span>
                  <span className="text-label-lg">Legal Audit 2024</span>
                </div>
                <div className="mt-auto">
                  <div className="bg-primary-container p-md rounded-xl text-on-primary-container">
                    <p className="text-label-md font-bold mb-xs">Storage Used</p>
                    <div className="w-full bg-surface-dim/30 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full w-[65%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Chat Area */}
              <div className="flex-1 flex flex-col bg-white/40">
                <div className="p-lg border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="text-headline-sm text-primary font-semibold">Intelligence Console</h3>
                  <div className="flex gap-sm">
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">settings</span>
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">share</span>
                  </div>
                </div>
                <div className="flex-1 p-lg overflow-y-auto space-y-lg">
                  <div className="flex flex-col gap-xs max-w-[80%]">
                    <div className="bg-surface-container p-md rounded-2xl rounded-tl-none text-body-md text-on-surface">
                      Analyze the fiscal impact mentioned on page 14 of the Q3 Annual Report.
                    </div>
                    <span className="text-label-md text-on-surface-variant px-sm">User • 10:24 AM</span>
                  </div>
                  <div className="flex flex-col gap-xs max-w-[90%] ml-auto items-end">
                    <div className="bg-white border-l-4 border-secondary p-md rounded-2xl rounded-tr-none shadow-sm text-body-md text-on-surface">
                      Based on the Q3 report (p.14), the fiscal impact is estimated at $4.2M due to operational shifts. This aligns with the &quot;Efficiency Goal&quot; stated in your internal handbook.
                      <div className="mt-md flex flex-wrap gap-xs">
                        <div className="bg-surface-container-low px-sm py-1 rounded-full border border-outline-variant/30 flex items-center gap-xs cursor-pointer hover:bg-surface-dim transition-colors">
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                          <span className="text-[11px] font-semibold">Q3_Report.pdf (p.14)</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-label-md text-secondary px-sm">DocuMind AI • Just now</span>
                  </div>
                </div>
                <div className="p-lg border-t border-outline-variant/10">
                  <div className="relative">
                    <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-md px-xl focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all pr-[120px]" placeholder="Ask anything about your documents..." type="text" />
                    <div className="absolute right-2 top-2 flex items-center gap-xs">
                      <button className="p-sm text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">attach_file</span></button>
                      <button className="primary-gradient p-sm rounded-full text-on-primary"><span className="material-symbols-outlined">send</span></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-xxl">
              <h2 className="text-headline-lg text-primary mb-md" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Built for Precision</h2>
              <p className="text-body-md text-on-surface-variant max-w-[600px] mx-auto">Everything you need to manage complex knowledge at scale without the noise.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
              <div className="md:col-span-8 glass-panel p-xxl rounded-[32px] group overflow-hidden relative min-h-[320px]">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-secondary text-[40px] mb-lg block">manage_search</span>
                  <h3 className="text-headline-md text-primary mb-md font-semibold">Context-Aware AI Search</h3>
                  <p className="text-body-md text-on-surface-variant max-w-[400px]">DocuMind doesn&apos;t just look for keywords. It understands the intent and relationships across thousands of pages instantly.</p>
                </div>
              </div>
              <div className="md:col-span-4 bg-primary-container p-xxl rounded-[32px] text-on-primary-container relative overflow-hidden">
                <span className="material-symbols-outlined text-secondary-fixed text-[40px] mb-lg block">verified_user</span>
                <h3 className="text-headline-md text-white mb-md font-semibold">Enterprise Security</h3>
                <p className="text-body-sm opacity-80">SOC2 Type II compliant with end-to-end encryption. Your data stays in your environment, never used for training.</p>
              </div>
              <div className="md:col-span-4 bg-surface-dim p-xxl rounded-[32px]">
                <span className="material-symbols-outlined text-secondary text-[40px] mb-lg block">fact_check</span>
                <h3 className="text-headline-sm text-primary mb-md font-semibold">Exact Citations</h3>
                <p className="text-body-sm text-on-surface-variant">Every claim is backed by a clickable source card. Zero hallucinations, just verified data extraction.</p>
              </div>
              <div className="md:col-span-8 glass-panel p-xxl rounded-[32px] flex flex-col md:flex-row items-center gap-xl">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-secondary text-[40px] mb-lg block">group_work</span>
                  <h3 className="text-headline-md text-primary mb-md font-semibold">Collaborative Workspaces</h3>
                  <p className="text-body-md text-on-surface-variant">Share chat threads and document collections with your entire team. Built-in permissioning for secure access.</p>
                </div>
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full border-4 border-surface bg-surface-dim"></div>
                    <div className="w-12 h-12 rounded-full border-4 border-surface bg-secondary"></div>
                    <div className="w-12 h-12 rounded-full border-4 border-surface bg-primary-container"></div>
                    <div className="w-12 h-12 rounded-full border-4 border-surface bg-surface-container-high flex items-center justify-center text-label-md font-bold">+12</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-[1000px] mx-auto text-center">
            <h2 className="text-headline-lg text-primary mb-xxl" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Three Steps to Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xxl relative">
              <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-outline-variant/30 z-0"></div>
              {[
                { num: '1', title: 'Sync Documents', desc: 'Upload PDFs, connect Notion, or sync Google Drive in seconds.', primary: true },
                { num: '2', title: 'AI Processing', desc: 'Our engine indexes your knowledge base with neural embeddings.', primary: false },
                { num: '3', title: 'Ask & Extract', desc: 'Start chatting. Get instant answers with cited sources and logic.', primary: false },
              ].map((step) => (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-headline-md mb-lg shadow-xl ${step.primary ? 'primary-gradient text-on-primary' : 'bg-white border-2 border-secondary text-secondary'}`} style={{ fontFamily: 'Inter', fontWeight: 600 }}>
                    {step.num}
                  </div>
                  <h4 className="text-headline-sm text-primary mb-sm font-semibold">{step.title}</h4>
                  <p className="text-body-sm text-on-surface-variant">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-xxl bg-surface-container-low">
          <div className="px-margin-desktop max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row gap-xl items-center">
              <div className="md:w-1/3">
                <h2 className="text-headline-lg text-primary mb-md" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Trusted by Experts</h2>
                <p className="text-body-md text-on-surface-variant">Join 2,000+ organizations leveraging DocuMind to outpace the competition.</p>
              </div>
              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-lg">
                {[
                  { quote: '"DocuMind has reduced our research time by over 70%. The citation feature is a game-changer for our legal compliance team."', name: 'Sarah Chen', title: 'Head of R&D, TechNova' },
                  { quote: '"The glassmorphic UI is as beautiful as the engine is powerful. It finally makes interacting with thousands of PDFs feel effortless."', name: 'Marcus Thorne', title: 'Principal Architect, Cold Winter Co.' },
                ].map((t) => (
                  <div key={t.name} className="bg-white p-xl rounded-2xl shadow-sm border border-outline-variant/20">
                    <p className="text-body-md text-primary mb-lg italic">{t.quote}</p>
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-full bg-surface-dim"></div>
                      <div>
                        <p className="text-label-lg text-primary">{t.name}</p>
                        <p className="text-label-md text-on-surface-variant">{t.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-xxl">
              <h2 className="text-headline-lg text-primary mb-md" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Simple, Scalable Plans</h2>
              <p className="text-body-md text-on-surface-variant">Start free, upgrade as your knowledge base grows.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-end">
              <div className="bg-surface-container-lowest p-xl rounded-[24px] border border-outline-variant/20 flex flex-col h-fit">
                <h3 className="text-headline-sm text-primary mb-sm font-semibold">Starter</h3>
                <p className="text-display text-primary mb-lg" style={{ fontWeight: 700 }}>$0<span className="text-body-md font-normal text-on-surface-variant">/mo</span></p>
                <ul className="space-y-md mb-xxl flex-1">
                  {['10 Documents / Month', 'Basic AI Search', 'Mobile Web Access'].map((f) => (
                    <li key={f} className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span>{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className="w-full py-md rounded-xl border border-secondary text-secondary font-semibold hover:bg-secondary/5 transition-colors text-center block">Start for Free</Link>
              </div>
              <div className="primary-gradient p-[1px] rounded-[24px] shadow-2xl scale-105 z-10">
                <div className="bg-white p-xl rounded-[23px] flex flex-col">
                  <div className="bg-secondary/10 text-secondary text-label-md font-bold py-1 px-3 rounded-full self-start mb-md">MOST POPULAR</div>
                  <h3 className="text-headline-sm text-primary mb-sm font-semibold">Precision Plan</h3>
                  <p className="text-display text-primary mb-lg" style={{ fontWeight: 700 }}>$29<span className="text-body-md font-normal text-on-surface-variant">/mo</span></p>
                  <ul className="space-y-md mb-xxl">
                    {['Unlimited Documents', 'Advanced Reasoning Engine', 'Priority Citations', 'API Access (V1)'].map((f) => (
                      <li key={f} className="flex items-center gap-sm text-body-sm font-semibold"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/signup" className="w-full primary-gradient text-on-primary py-md rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-center block">Go Pro Now</Link>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-xl rounded-[24px] border border-outline-variant/20 flex flex-col h-fit">
                <h3 className="text-headline-sm text-primary mb-sm font-semibold">Enterprise</h3>
                <p className="text-display text-primary mb-lg" style={{ fontWeight: 700 }}>Custom</p>
                <ul className="space-y-md mb-xxl flex-1">
                  {['Single Sign-On (SSO)', 'Private Cloud Deployment', 'Dedicated Success Manager'].map((f) => (
                    <li key={f} className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span>{f}</li>
                  ))}
                </ul>
                <button className="w-full py-md rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-dim transition-colors">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-headline-lg text-primary text-center mb-xxl" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Common Inquiries</h2>
            <div className="space-y-md">
              {[
                { q: 'Is my data secure and private?', a: 'Absolutely. We employ enterprise-grade AES-256 encryption and are SOC2 compliant. Your data is never used to train global AI models.' },
                { q: 'Which file formats do you support?', a: 'We currently support PDF, DOCX, TXT, and Markdown. We are rolling out Notion and Google Drive integrations this quarter.' },
              ].map((faq) => (
                <details key={faq.q} className="glass-panel p-lg rounded-2xl cursor-pointer group">
                  <summary className="flex justify-between items-center list-none">
                    <h4 className="text-headline-sm text-primary font-semibold">{faq.q}</h4>
                    <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="mt-md text-body-sm text-on-surface-variant">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop">
          <div className="max-w-[1200px] mx-auto primary-gradient rounded-[40px] p-xxl text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-display text-on-primary mb-lg" style={{ fontFamily: 'Inter', fontWeight: 700 }}>Ready to talk to your documents?</h2>
              <p className="text-body-lg text-primary-fixed mb-xxl opacity-80">Join the thousands of teams making smarter decisions with DocuMind AI.</p>
              <Link href="/signup" className="bg-white text-primary px-xxl py-md rounded-xl font-bold shadow-2xl hover:scale-105 transition-transform inline-block">Get Started for Free</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
