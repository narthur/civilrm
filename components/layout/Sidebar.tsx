"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn } from "@clerk/nextjs";

export function Sidebar() {
  const currentPath = usePathname();

  const navigation = [
    { name: "Profile", href: "/" },
    { name: "Representatives", href: "/representatives" },
    { name: "Interactions", href: "/interactions" },
    { name: "Issues", href: "/issues" },
    { name: "Tasks", href: "/tasks" },
    { name: "Follow-ups", href: "/followups" },
  ];

  return (
    <SignedIn>
      <div className="self-stretch w-64 bg-gray-900 shadow-sm">
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? "bg-gray-700 text-gray-100"
                      : "text-gray-200 hover:bg-gray-700 hover:text-gray-100"
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </SignedIn>
  );
}
