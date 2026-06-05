import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-xxl bg-surface-dim border-t border-outline-variant/30 px-margin-desktop">
      <div className="flex flex-col md:flex-row justify-between items-center gap-lg max-w-full mx-auto">
        <div className="flex flex-col items-center md:items-start gap-md">
          <span className="text-label-lg font-black text-primary" style={{ fontFamily: 'Inter' }}>DocuMind AI</span>
          <p className="text-body-sm text-on-surface-variant max-w-[300px] text-center md:text-left">
            © 2024 DocuMind AI. Built for Cold Winter Technology environments.
          </p>
        </div>
        <div className="flex gap-lg">
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-body-sm">Privacy Policy</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-body-sm">Terms of Service</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-body-sm">Security</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-body-sm">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
