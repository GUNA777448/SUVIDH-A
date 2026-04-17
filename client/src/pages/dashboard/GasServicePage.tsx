import { AlertTriangle, ArrowRight, Cylinder, FileWarning } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const gasActions = [
  {
    title: "Book Cylinder Refill",
    description: "Place refill request and track delivery stages.",
    icon: Cylinder,
  },
  {
    title: "Raise Service Complaint",
    description: "Report delay, leakage, or billing concerns quickly.",
    icon: FileWarning,
  },
  {
    title: "Emergency Support",
    description: "Immediate support for urgent leakage incidents.",
    icon: AlertTriangle,
  },
];

export default function GasServicePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen w-full bg-[#F4F6FB] px-4 pb-24 pt-5">
      <div className="mx-auto w-full max-w-md space-y-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#1977F3]">
            Gas Services
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#0B2E59]">
            Hello, {user.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage booking, delivery verification and complaints in one place.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Last Booking
            </p>
            <p className="mt-2 text-base font-semibold text-[#0B2E59]">
              Delivered
            </p>
            <p className="mt-1 text-xs text-slate-500">2 days ago</p>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Distributor
            </p>
            <p className="mt-2 text-base font-semibold text-[#0B2E59]">
              Assigned
            </p>
            <p className="mt-1 text-xs text-slate-500">Local branch linked</p>
          </article>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-[#0B2E59]">
            Available Actions
          </h2>
          <div className="mt-3 space-y-3">
            {gasActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#1977F3]"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-[#F4F6FB] p-2 text-[#1977F3]">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#0B2E59]">
                        {action.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
