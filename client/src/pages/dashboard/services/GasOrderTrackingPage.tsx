import { Truck, MapPin, Clock, ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

const orders = [
  {
    id: "GAS-REF-2024",
    status: "Out for Delivery",
    date: "Apr 16, 2026",
    time: "02:30 PM",
    eta: "30 mins",
  },
  {
    id: "GAS-REF-2023",
    status: "Delivered",
    date: "Apr 10, 2026",
    time: "11:45 AM",
    eta: "Completed",
  },
];

export default function GasOrderTrackingPage() {
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
            Order Tracking
          </h1>
        </header>

        {orders.map((order) => (
          <section
            key={order.id}
            className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="material-label text-[#A8C7FA]">{order.id}</p>
                <p className="material-title mt-1 text-white">{order.status}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  order.status === "Delivered"
                    ? "bg-green-900/20 text-green-400"
                    : "bg-[#0B57D0]/20 text-[#A8C7FA]"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-[#A8C7FA]" />
                <div>
                  <p className="material-label text-slate-400">Booking Date</p>
                  <p className="material-body text-white">
                    {order.date} at {order.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Truck className="size-4 text-[#A8C7FA]" />
                <div>
                  <p className="material-label text-slate-400">ETA</p>
                  <p className="material-body text-white">{order.eta}</p>
                </div>
              </div>

              {order.status === "Out for Delivery" && (
                <div className="flex items-center gap-3 rounded-lg bg-[#0B57D0]/10 p-3">
                  <MapPin className="size-4 text-[#A8C7FA]" />
                  <p className="material-body text-[#A8C7FA]">
                    Real-time GPS tracking active
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#A8C7FA] py-2 font-semibold text-[#062E6F] hover:bg-white"
            >
              Track Live
              <ArrowRight className="size-4" />
            </button>
          </section>
        ))}
      </div>
    </main>
  );
}
