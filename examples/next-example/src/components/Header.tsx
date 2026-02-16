import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xl">
            O
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            OpenUI
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#" className="transition-colors hover:text-foreground">
            Documentation
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Components
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Stories
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="rounded-full px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
            Log in
          </button>
          <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 hover:bg-primary/90">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
