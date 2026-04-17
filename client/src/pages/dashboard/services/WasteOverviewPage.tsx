import { Calendar, ArrowRight, AlertTriangle } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function WasteOverviewPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#131314] pb-24 pt-4 text-[#E3E3E3]">
      <div className="space-y-4 px-4">
        <h1 className="material-headline text-white">Waste Management</h1>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#2A2B2C] p-4">
              <p className="material-label text-slate-400">Next Pickup</p>
              <p className="material-headline mt-2 text-white">Apr 18</p>
              <p className="material-label mt-1 text-slate-500">Tuesday</p>
            </div>
            <div className="rounded-xl bg-[#2A2B2C] p-4">
              <p className="material-label text-slate-400">Frequency</p>
              <p className="material-headline mt-2 text-white">Bi-Weekly</p>
              <p className="material-label mt-1 text-slate-500">Scheduled</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          {[
            {
              title: "Schedule Pickup",
              icon: Calendar,
              to: "/services/waste/pickup",
            },
            {
              title: "Report Issue",
              icon: AlertTriangle,
              to: "/services/waste/complaint",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => navigate(item.to)}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#1E1F20] p-4 hover:border-green-400"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-5 text-green-400" />
                  <p className="material-body font-medium text-white">
                    {item.title}
                  </p>
                </div>
                <ArrowRight className="size-4 text-slate-500" />
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}
