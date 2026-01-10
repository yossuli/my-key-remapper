import type React from "react";
import type { JSX } from "react";
import { type BaseProps, findWithComponentType } from "@/components/control";

interface MainLayoutProps {
  children: JSX.Element[];
}

export const Header: React.FC<BaseProps> = ({ children }) => <>{children}</>;

export const Main: React.FC<BaseProps> = ({ children }) => <>{children}</>;

export const Side: React.FC<BaseProps> = ({ children }) => <>{children}</>;

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const header = findWithComponentType(children, Header);
  const main = findWithComponentType(children, Main);
  const side = findWithComponentType(children, Side);
  return (
    <div className="flex min-h-screen flex-col bg-background p-6 font-sans text-foreground">
      {header}
      <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        {main}
        {side}
      </main>
    </div>
  );
};
