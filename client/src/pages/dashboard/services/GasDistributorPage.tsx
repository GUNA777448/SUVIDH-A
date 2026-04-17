import { MapPin, Star, Phone, Clock, MapPinCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

const distributors = [
  {
    name: "City Gas Retail - Zone A",
    distance: "2.3 km",
    rating: 4.8,
    address: "Main Bazaar, Ward 12",
    phone: "9876543210",
    hours: "9 AM - 8 PM",
  },
  {
    name: "Local Gas Distributor - Zone B",
    distance: "3.1 km",
    rating: 4.5,
    address: "Industrial Area, Ward 15",
    phone: "9876543211",
    hours: "8 AM - 9 PM",
  },
  {
    name: "Premium Gas Services - Zone C",
    distance: "5.2 km",
    rating: 4.9,
    address: "City Center, Ward 8",
    phone: "9876543212",
    hours: "9 AM - 7 PM",
  },
];

export default function GasDistributorPage() {
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
            Find Distributor
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">NEARBY DISTRIBUTORS</p>
          <div className="mt-3 space-y-3">
            {distributors.map((dist) => (
              <button
                key={dist.name}
                type="button"
                className="w-full rounded-xl border border-white/10 bg-[#2A2B2C] p-4 text-left hover:border-[#A8C7FA]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="material-title font-medium text-white">
                      {dist.name}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <p className="material-label text-slate-400">
                        {dist.rating} • {dist.distance}
                      </p>
                    </div>
                  </div>
                  <MapPin className="size-4 text-[#A8C7FA]" />
                </div>

                <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
                  <p className="material-label text-slate-400">
                    {dist.address}
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3 text-[#A8C7FA]" />
                    <p className="material-label text-[#A8C7FA]">
                      {dist.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-3 text-[#A8C7FA]" />
                    <p className="material-label text-slate-400">
                      {dist.hours}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full rounded-full bg-[#A8C7FA] py-2 text-xs font-semibold text-[#062E6F] hover:bg-white"
                >
                  <span className="inline-flex items-center gap-1">
                    <MapPinCheck className="size-3" />
                    Set as Default
                  </span>
                </button>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
