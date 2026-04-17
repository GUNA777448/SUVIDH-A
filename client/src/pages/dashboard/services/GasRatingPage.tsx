import { Star, Send } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function GasRatingPage() {
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
          <h1 className="material-headline flex-1 text-white">Rate Service</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">ORDER GAS-REF-2024</p>
          <p className="material-body mt-2 text-slate-300">
            Delivery completed on Apr 16, 2026
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">
            RATE DELIVERY EXPERIENCE
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="material-body font-medium text-white">
                Delivery Agent: Rajesh Kumar
              </p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-6 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-500"}`}
                    />
                  </button>
                ))}
              </div>
              <p className="material-label mt-2 text-slate-400">
                Rating: 4/5 - Good service
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="material-body font-medium text-white">
                Distributor: City Gas Retail
              </p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-6 ${star <= 5 ? "fill-yellow-400 text-yellow-400" : "text-slate-500"}`}
                    />
                  </button>
                ))}
              </div>
              <p className="material-label mt-2 text-slate-400">
                Rating: 5/5 - Excellent
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">FEEDBACK (OPTIONAL)</p>
          <textarea
            placeholder="Share your experience..."
            className="material-body mt-3 w-full rounded-lg border border-white/10 bg-[#2A2B2C] p-3 text-white placeholder:text-slate-500 focus:border-[#A8C7FA] focus:outline-none"
            rows={4}
          />
        </section>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#A8C7FA] py-3 font-semibold text-[#062E6F] hover:bg-white"
        >
          <Send className="size-4" />
          Submit Rating
        </button>
      </div>
    </main>
  );
}
