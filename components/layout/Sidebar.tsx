import Link from "next/link";
import { useRouter } from "next/router";
import { SignedIn } from "@clerk/clerk-react";

export function Sidebar() {
  const router = useRouter();
  const currentPath = router.pathname;

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
      <div className="self-stretch w-64 bg-white shadow-sm">
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
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
