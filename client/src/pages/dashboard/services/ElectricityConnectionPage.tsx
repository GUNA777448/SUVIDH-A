import { Zap, MapPin, FileText, ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function ElectricityConnectionPage() {
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
            onClick={() => navigate("/services/electricity")}
            className="text-yellow-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="material-headline flex-1 text-white">Connection</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">CONNECTION DETAILS</p>
          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Consumer No.</p>
              <p className="material-body font-medium text-white">
                ELEC-2024-5847
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Meter No.</p>
              <p className="material-body font-medium text-white">
                MNO-2024-1234
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Category</p>
              <p className="material-body font-medium text-white">
                Residential
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Status</p>
              <p className="material-body font-medium text-green-400">Active</p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Load</p>
              <p className="material-body font-medium text-white">5 kW</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#1E1F20] p-4 hover:border-yellow-400"
          >
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-yellow-400" />
              <p className="material-body text-white">Increase Load</p>
            </div>
            <ArrowRight className="size-4 text-slate-500" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#1E1F20] p-4 hover:border-yellow-400"
          >
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-yellow-400" />
              <p className="material-body text-white">Change Address</p>
            </div>
            <ArrowRight className="size-4 text-slate-500" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#1E1F20] p-4 hover:border-yellow-400"
          >
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-yellow-400" />
              <p className="material-body text-white">Disconnect</p>
            </div>
            <ArrowRight className="size-4 text-slate-500" />
          </button>
        </section>
      </div>
    </main>
  );
}
