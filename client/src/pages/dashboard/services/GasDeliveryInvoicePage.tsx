import { useState } from "react";
import { Shield, Download, CreditCard, Smartphone } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function GasDeliveryInvoicePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "credit_card">(
    "upi",
  );
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const handleInvoicePayment = () => {
    setPaymentMessage(null);
    navigate("/payments/pin", {
      state: {
        serviceType: "gas",
        billId: "gas-invoice-2026-04",
        bookingTitle: "Gas Invoice Payment - April 2026",
        domainService: "gas-distribution-service",
        domainReferenceId: "gas-invoice-2026-04",
        amountMinor: 73000,
        amountLabel: "₹730",
        paymentMethod: selectedMethod,
        returnPath: "/transactions",
        successMessage: "Payment successful. Invoice status updated.",
      },
    });
  };

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
            Delivery & Invoice
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">OTP VERIFICATION</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[#0B57D0] bg-[#0B57D0]/10 p-4">
              <p className="material-label text-[#A8C7FA]">Delivery Agent</p>
              <p className="material-title mt-2 text-white">Rajesh Kumar</p>
              <p className="material-label mt-1 text-slate-400">
                License: DL-2024-1847
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#2A2B2C] p-4">
              <p className="material-label text-slate-400">
                Share 4-digit OTP with delivery agent
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                className="material-headline mt-3 w-full border-b-2 border-[#A8C7FA] bg-transparent text-center text-white placeholder:text-slate-500 focus:outline-none"
                maxLength={4}
              />
              <p className="material-label mt-2 text-slate-500">
                OTP valid for 10 minutes
              </p>
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-[#A8C7FA] py-2 font-semibold text-[#062E6F] hover:bg-white"
            >
              <span className="inline-flex items-center gap-2">
                <Shield className="size-4" />
                Verify OTP
              </span>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">INVOICE</p>
          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Cylinder (14kg)</p>
              <p className="material-body font-medium text-white">₹680</p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Delivery Charge</p>
              <p className="material-body font-medium text-white">₹50</p>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between">
                <p className="material-title text-white">Total Amount</p>
                <p className="material-title text-[#A8C7FA]">₹730</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#A8C7FA] py-2 font-semibold text-[#A8C7FA] hover:bg-[#A8C7FA] hover:text-[#062E6F]"
          >
            <Download className="size-4" />
            Download Invoice
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">PAYMENT</p>
          <div className="mt-3 space-y-3 rounded-xl bg-[#2A2B2C] p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod("upi")}
                className={`rounded-lg border p-2 text-left ${
                  selectedMethod === "upi"
                    ? "border-[#A8C7FA] bg-[#0B57D0]/20"
                    : "border-white/10"
                }`}
              >
                <span className="inline-flex items-center gap-2 material-body text-white">
                  <Smartphone className="size-4 text-[#A8C7FA]" /> UPI
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("credit_card")}
                className={`rounded-lg border p-2 text-left ${
                  selectedMethod === "credit_card"
                    ? "border-[#A8C7FA] bg-[#0B57D0]/20"
                    : "border-white/10"
                }`}
              >
                <span className="inline-flex items-center gap-2 material-body text-white">
                  <CreditCard className="size-4 text-[#A8C7FA]" /> Credit Card
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleInvoicePayment}
              className="w-full rounded-full bg-[#A8C7FA] py-2 font-semibold text-[#062E6F] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {`Proceed to PIN & Pay ₹730 via ${selectedMethod === "upi" ? "UPI" : "Card"}`}
            </button>

            {paymentMessage ? (
              <p className="material-body text-slate-300">{paymentMessage}</p>
            ) : null}

            <p className="material-body font-medium text-slate-300">
              You will enter a PIN on the next screen to complete payment.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
