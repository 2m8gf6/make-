import Link from 'next/link';

export default function Header() {
  return (
    <header className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl" style={{ color: 'var(--primary)' }}>
          zuoyenan
        </Link>
        <div className="space-x-6">
          <Link href="/portfolio" className="hover:text-white transition-colors">
            作品集
          </Link>
          <Link href="/qanything" className="hover:text-white transition-colors">
            AI 问答
          </Link>
        </div>
      </nav>
    </header>
  );
} 