import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      <Header />
      <div
        className="flex items-start
 grow"
      >
        <Sidebar />
        <main className="flex-1 bg-gray-900 rounded-lg shadow-md p-8 max-w-2xl mx-auto mt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
