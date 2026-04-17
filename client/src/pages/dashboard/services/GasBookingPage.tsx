import { useState } from "react";
import { Calendar, ArrowRight, Check } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useBookings } from "../../../hooks/useBookings";

const slots = [
  { time: "09:00 AM - 11:00 AM", available: 5, price: "₹680" },
  { time: "11:00 AM - 01:00 PM", available: 2, price: "₹680" },
  { time: "01:00 PM - 03:00 PM", available: 8, price: "₹680" },
  { time: "03:00 PM - 05:00 PM", available: 1, price: "₹680" },
];

const distributors = [
  { name: "Local Gas Distributor - Zone A", distance: "2.3 km", rating: "4.8" },
  { name: "City Gas Retail - Branch B", distance: "3.1 km", rating: "4.5" },
];

export default function GasBookingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { addBooking } = useBookings();

  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const handleConfirmBooking = () => {
    if (!selectedDistributor || !selectedSlot) {
      alert("Please select both a distributor and a time slot");
      return;
    }

    setIsConfirming(true);

    // Simulate booking confirmation
    setTimeout(() => {
      const bookingDetails = {
        cylinderType: "14 kg Commercial",
        distributor: selectedDistributor,
        slot: selectedSlot,
        deliveryCharge: 50,
        cylinderPrice: 680,
        total: 730,
        customerName: user.name || "Customer",
      };

      addBooking(
        "gas",
        `Gas Cylinder Refill - ${selectedDistributor}`,
        bookingDetails,
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      );

      setBookingConfirmed(true);
      setIsConfirming(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    }, 800);
  };

  if (bookingConfirmed) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#131314] pb-24 pt-4 text-[#E3E3E3]">
        <div className="flex h-full flex-col items-center justify-center space-y-4 px-4 py-16">
          <div className="rounded-full bg-green-900/30 p-6">
            <Check className="size-12 text-green-400" />
          </div>
          <h1 className="material-headline text-center text-white">
            Booking Confirmed!
          </h1>
          <p className="material-body text-center text-slate-300">
            Your gas cylinder booking has been confirmed. You'll receive updates
            on the status soon.
          </p>
          <p className="material-label text-[#A8C7FA]">
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
            type="button"
            onClick={() => navigate("/services/gas")}
            className="text-[#A8C7FA] hover:text-white"
          >
            ← Back
          </button>
          <h1 className="material-headline flex-1 text-white">Book Refill</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">SELECT DISTRIBUTOR</p>
          <div className="mt-3 space-y-2">
            {distributors.map((dist) => (
              <button
                key={dist.name}
                type="button"
                onClick={() => setSelectedDistributor(dist.name)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 transition-all ${
                  selectedDistributor === dist.name
                    ? "border-[#A8C7FA] bg-[#0B57D0]/20"
                    : "border-white/10 bg-[#2A2B2C] hover:border-[#A8C7FA]"
                }`}
              >
                <div className="text-left">
                  <p className="material-body font-medium text-white">
                    {dist.name}
                  </p>
                  <p className="material-label mt-1 text-slate-400">
                    {dist.distance} • ⭐ {dist.rating}
                  </p>
                </div>
                {selectedDistributor === dist.name && (
                  <Check className="size-5 text-[#A8C7FA]" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">SELECT DELIVERY SLOT</p>
          <div className="mt-3 space-y-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => setSelectedSlot(slot.time)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 transition-all ${
                  selectedSlot === slot.time
                    ? "border-[#A8C7FA] bg-[#0B57D0]/20"
                    : "border-white/10 bg-[#2A2B2C] hover:border-[#A8C7FA]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-[#A8C7FA]" />
                  <div className="text-left">
                    <p className="material-body font-medium text-white">
                      {slot.time}
                    </p>
                    <p className="material-label text-slate-400">
                      {slot.available} slots available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="material-body font-semibold text-[#A8C7FA]">
                    {slot.price}
                  </p>
                  {selectedSlot === slot.time && (
                    <Check className="size-5 text-[#A8C7FA]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">BOOKING SUMMARY</p>
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Cylinder Type</p>
              <p className="material-body font-medium text-white">
                14 kg Commercial
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Distributor</p>
              <p className="material-body font-medium text-white">
                {selectedDistributor
                  ? selectedDistributor.split(" - ")[1]
                  : "Not selected"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Delivery Charge</p>
              <p className="material-body font-medium text-white">₹50</p>
            </div>
            <div className="border-t border-white/10 pt-2">
              <div className="flex justify-between">
                <p className="material-title text-white">Total</p>
                <p className="material-title text-[#A8C7FA]">₹730</p>
              </div>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleConfirmBooking}
          disabled={!selectedDistributor || !selectedSlot || isConfirming}
          className="w-full rounded-full bg-[#A8C7FA] py-3 font-semibold text-[#062E6F] transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center gap-2">
            {isConfirming ? "Confirming..." : "Confirm Booking"}
            {!isConfirming && <ArrowRight className="size-4" />}
          </span>
        </button>
      </div>
    </main>
  );
}
