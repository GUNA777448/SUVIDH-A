import {
  Home,
  Landmark,
  ClipboardList,
  CreditCard,
  UserCircle2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const tabs = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Landmark },
    { to: "/transactions", label: "My Requests", icon: ClipboardList },
    {
      to: "/services/electricity/billing",
      label: "Payments",
      icon: CreditCard,
    },
    {
      to: user?.id ? `/profile/userid/${user.id}` : "/profile",
      label: "Profile",
      icon: UserCircle2,
    },
  ];

  const isActiveTab = (tabPath: string) => {
    if (tabPath.startsWith("/profile")) {
      return location.pathname.startsWith("/profile");
    }

    return location.pathname === tabPath;
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-3 left-1/2 z-20 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-white/15 bg-[#1E1F20]/90 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl md:bottom-0 md:left-0 md:right-0 md:w-full md:max-w-none md:translate-x-0 md:rounded-none md:border-x-0 md:border-b-0"
    >
      <div className="mx-auto flex w-full items-center justify-around gap-1 md:max-w-3xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActiveTab(tab.to);
          return (
            <button
              key={tab.to}
              type="button"
              onClick={() => navigate(tab.to)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 min-w-12 items-center justify-center rounded-full px-3 py-2 transition-colors ${
                active
                  ? "bg-[#0B57D0] text-white"
                  : "text-[#BDC1C6] hover:text-[#E8EAED]"
              }`}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
