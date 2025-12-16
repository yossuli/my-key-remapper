import type { ReactNode } from "react";

interface MainLayoutProps {
  header: ReactNode;
  mainContent: ReactNode;
  sideContent: ReactNode;
}

export const Header = () => <div>Header</div>;

export function MainLayout({
  header,
  mainContent,
  sideContent,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background p-6 font-sans text-foreground">
      {header}
      <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        {mainContent}
        {sideContent}
      </main>
    </div>
  );
}
