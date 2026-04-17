import { useState } from "react";
import { Truck, Check } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useBookings } from "../../../hooks/useBookings";

export default function WaterTankerPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { addBooking } = useBookings();

  const [selectedQty, setSelectedQty] = useState<number>(1000);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const handleTankerRequest = () => {
    if (!deliveryDate) {
      alert("Please select a delivery date");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      addBooking("water", `Water Tanker Request - ${selectedQty}L`, {
        quantity: selectedQty,
        price: selectedQty / 500,
        deliveryDate,
      });
      setBookingConfirmed(true);
      setIsProcessing(false);

      setTimeout(() => {
        navigate("/home");
      }, 2000);
    }, 1000);
  };

  if (bookingConfirmed) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#131314] pb-24 pt-4 text-[#E3E3E3]">
        <div className="flex h-full flex-col items-center justify-center space-y-4 px-4 py-16">
          <div className="rounded-full bg-green-900/30 p-6">
            <Check className="size-12 text-green-400" />
          </div>
          <h1 className="material-headline text-center text-white">
            Request Confirmed!
          </h1>
          <p className="material-body text-center text-slate-300">
            Your water tanker request has been recorded successfully.
          </p>
          <p className="material-label text-cyan-400">
            Redirecting to dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#131314] pb-24 pt-4 text-[#E3E3E3]">
      <div className="space-y-4 px-4">
        <header className="flex items-center gap-3 pb-2">
          <button
            onClick={() => navigate("/services/water")}
            className="text-cyan-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="material-headline flex-1 text-white">
            Tanker Request
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-cyan-400">REQUEST DETAILS</p>
          <div className="mt-4 space-y-3">
            <div>
              <p className="material-label text-slate-400">QUANTITY</p>
              <div className="mt-2 space-y-2">
                {[1000, 2000, 5000].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setSelectedQty(qty)}
                    className={`w-full rounded-lg border p-3 transition-all ${
                      selectedQty === qty
                        ? "border-cyan-400 bg-cyan-900/20"
                        : "border-white/10 bg-[#2A2B2C] hover:border-cyan-400"
                    }`}
                  >
                    <p className="material-body text-white">
                      {qty} Liters - ₹{qty / 500}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="material-label mt-4 text-slate-400">
                DELIVERY DATE
              </p>
              <input
                type="date"
                className="material-body mt-2 w-full rounded-lg border border-white/10 bg-[#2A2B2C] p-3 text-white focus:border-cyan-400 focus:outline-none"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleTankerRequest}
          disabled={isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 py-3 font-semibold text-black transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Truck className="size-4" />
          {isProcessing ? "Processing..." : "Request Tanker"}
        </button>
      </div>
    </main>
  );
}
