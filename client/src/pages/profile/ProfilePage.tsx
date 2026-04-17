import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  Home,
  Wallet,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const params = useParams();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const routeUserId = params.userId || user.id;
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const quickActions = [
    {
      title: "My Requests",
      subtitle: "View all service history",
      to: "/transactions",
      icon: ClipboardList,
    },
    {
      title: "Payments",
      subtitle: "Open pending bill flows",
      to: "/services/electricity/billing",
      icon: Wallet,
    },
    {
      title: "Home Dashboard",
      subtitle: "Return to your overview",
      to: "/home",
      icon: Home,
    },
    {
      title: "Service Support",
      subtitle: "Check officers and help",
      to: "/officers",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#131314] px-4 pb-24 pt-5 text-[#E3E3E3]">
      <div className="mx-auto w-full max-w-md space-y-4">
        <section className="rounded-3xl border border-white/10 bg-[#1E1F20] p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]">
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-[#2A2B2C] text-lg font-semibold text-white">
              {initials || <UserCircle2 className="size-8 text-[#A8C7FA]" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="material-label uppercase text-[#A8C7FA]">Profile</p>
              <h1 className="material-headline mt-1 truncate text-white">
                {user.name}
              </h1>
              <p className="material-body mt-1 text-slate-300">
                Citizen account overview and quick access to your civic
                activity.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] p-3">
              <p className="material-label text-slate-400">User ID</p>
              <p className="material-body mt-1 truncate font-medium text-white">
                {routeUserId}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] p-3">
              <p className="material-label text-slate-400">Status</p>
              <p className="material-body mt-1 font-medium text-green-400">
                Active
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] p-3">
              <p className="material-label text-slate-400">Joined</p>
              <p className="material-body mt-1 font-medium text-white">
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#1E1F20] p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="material-label text-[#A8C7FA]">Account Details</p>
              <h2 className="material-title mt-1 text-white">
                Contact profile
              </h2>
            </div>
          </div>

          <dl className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] px-4 py-3">
              <dt className="material-label text-slate-400">Mobile</dt>
              <dd className="material-body mt-1 font-medium text-white">
                {user.mobile}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] px-4 py-3">
              <dt className="material-label text-slate-400">Email</dt>
              <dd className="material-body mt-1 font-medium text-white">
                {user.email || "-"}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] px-4 py-3">
              <dt className="material-label text-slate-400">Aadhar</dt>
              <dd className="material-body mt-1 font-medium text-white">
                {user.aadhar || "-"}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] px-4 py-3">
              <dt className="material-label text-slate-400">Last updated</dt>
              <dd className="material-body mt-1 font-medium text-white">
                {formatDate(user.updated_at)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="material-title text-white">Quick Actions</h2>
            <ArrowRight className="size-4 text-[#A8C7FA]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4 text-left"
                >
                  <span className="inline-flex rounded-xl bg-[#2A2B2C] p-2 text-[#A8C7FA]">
                    <Icon className="size-4" />
                  </span>
                  <p className="material-label mt-3 text-white">
                    {action.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-400">
                    {action.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#1E1F20] p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]">
          <p className="material-label text-[#A8C7FA]">Account Safety</p>
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-[#2A2B2C] p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-400" />
            <p className="material-body text-slate-300">
              Your account is active and ready for civic service access. Keep
              your mobile number updated for OTP-based sign in.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#1E1F20] p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
            className="w-full rounded-full border border-white/10 bg-[#2A2B2C] px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </section>
      </div>
    </main>
  );
}
