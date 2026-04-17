import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function ElectricityConsumptionPage() {
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
          <h1 className="material-headline flex-1 text-white">Consumption</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">THIS MONTH</p>
          <p className="material-headline mt-2 text-white">235 kWh</p>
          <p className="material-label mt-1 text-slate-400">Apr 1 - Apr 16</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">MONTHLY TREND</p>
          <div className="mt-3 space-y-2">
            {[
              { month: "April", usage: "235 kWh", cost: "₹2,450" },
              { month: "March", usage: "210 kWh", cost: "₹2,180" },
              { month: "February", usage: "224 kWh", cost: "₹2,320" },
            ].map((item) => (
              <div
                key={item.month}
                className="flex items-center justify-between rounded-lg bg-[#2A2B2C] p-3"
              >
                <div>
                  <p className="material-body font-medium text-white">
                    {item.month}
                  </p>
                  <p className="material-label text-slate-400">{item.usage}</p>
                </div>
                <p className="material-title text-white">{item.cost}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
