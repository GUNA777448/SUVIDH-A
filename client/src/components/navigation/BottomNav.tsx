import { Home, Landmark, Receipt, Users, UserCircle2 } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/services", label: "Services", icon: Landmark },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/officers", label: "Officers", icon: Users },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-slate-200 bg-white px-2 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium ${
                isActive ? "text-[#1A73E8]" : "text-slate-500"
              }`
            }
          >
            <Icon className="size-5" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
