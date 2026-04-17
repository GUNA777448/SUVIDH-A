import { Gauge, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function GasPNGManagementPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#131314] pb-24 pt-4 text-[#E3E3E3]">
      <div className="space-y-4 px-4">
        <header className="flex items-center gap-3 pb-2">
          <button
            type="button"
            onClick={() => navigate("/services/gas")}
            className="text-[#A8C7FA] hover:text-white"
          >
            ← Back
          </button>
          <h1 className="material-headline flex-1 text-white">
            Meter & Billing
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">METER READING</p>
          <div className="mt-4 rounded-xl border border-white/10 bg-[#2A2B2C] p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="material-label text-slate-400">Current Reading</p>
                <p className="material-headline mt-2 text-white">156.4 kg</p>
              </div>
              <Gauge className="size-6 text-[#A8C7FA]" />
            </div>
            <p className="material-label mt-3 text-slate-500">
              Last updated: Apr 10, 2026
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">MONTHLY CONSUMPTION</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-[#2A2B2C] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="material-label text-slate-400">March 2026</p>
                  <p className="material-body mt-1 font-medium text-white">
                    12.5 kg
                  </p>
                </div>
                <TrendingUp className="size-4 text-[#A8C7FA]" />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#2A2B2C] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="material-label text-slate-400">February 2026</p>
                  <p className="material-body mt-1 font-medium text-white">
                    11.8 kg
                  </p>
                </div>
                <TrendingUp className="size-4 text-[#A8C7FA]" />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#2A2B2C] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="material-label text-slate-400">January 2026</p>
                  <p className="material-body mt-1 font-medium text-white">
                    13.2 kg
                  </p>
                </div>
                <TrendingUp className="size-4 text-[#A8C7FA]" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">MONTHLY BILLS</p>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#2A2B2C] p-3 hover:border-[#A8C7FA]"
            >
              <div className="text-left">
                <p className="material-body font-medium text-white">
                  April 2026 Bill
                </p>
                <p className="material-label mt-1 text-slate-400">
                  ₹850 • Due: Apr 25
                </p>
              </div>
              <ArrowRight className="size-4 text-[#A8C7FA]" />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <div className="flex items-start gap-3 rounded-lg bg-yellow-900/20 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-yellow-400" />
            <p className="material-body text-yellow-300">
              Unusual consumption detected. Possible leakage?
            </p>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-full bg-[#A8C7FA] py-2 font-semibold text-[#062E6F] hover:bg-white"
          >
            Report Issue
          </button>
        </section>
      </div>
    </main>
  );
}
