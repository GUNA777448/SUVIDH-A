import { useState } from "react";
import { CreditCard, Smartphone } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useServiceBills } from "../../../hooks/useServiceBills";

export default function WaterBillingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { getBillsByService } = useServiceBills();

  const waterBills = getBillsByService("water");
  const firstPendingBill = waterBills.find((bill) => bill.status === "pending");

  const [selectedBillId, setSelectedBillId] = useState<string>(
    firstPendingBill?.id || waterBills[0]?.id || "",
  );
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "credit_card">(
    "upi",
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const selectedBill = waterBills.find((bill) => bill.id === selectedBillId);

  const handlePayment = () => {
    const bill = selectedBill;
    if (!bill) {
      return;
    }

    if (bill.status === "paid") {
      setPaymentError("This water bill is already paid.");
      return;
    }

    setPaymentError(null);
    navigate("/payments/pin", {
      state: {
        serviceType: "water",
        billService: "water",
        billId: bill.id,
        bookingTitle: `Water Bill Payment - ${bill.month}`,
        domainService: "water-service",
        domainReferenceId: bill.id,
        amountMinor: bill.amountMinor,
        amountLabel: bill.amountLabel,
        paymentMethod: selectedMethod,
        returnPath: "/transactions",
        successMessage: "Your water e-bill has been paid and synced.",
      },
    });
  };

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
          <h1 className="material-headline flex-1 text-white">Bills</h1>
        </header>

        <div className="space-y-2">
          {waterBills.map((bill) => (
            <button
              key={bill.id}
              type="button"
              onClick={() =>
                bill.status === "pending" && setSelectedBillId(bill.id)
              }
              disabled={bill.status === "paid"}
              className={`flex w-full items-center justify-between rounded-xl border p-4 ${
                selectedBillId === bill.id && bill.status === "pending"
                  ? "border-cyan-400 bg-cyan-900/20"
                  : "border-white/10 bg-[#1E1F20]"
              } ${bill.status === "paid" ? "cursor-not-allowed opacity-60" : "hover:border-cyan-400"}`}
            >
              <div className="text-left">
                <p className="material-body font-medium text-white">
                  {bill.month}
                </p>
                <p className="material-label mt-1 text-slate-400">
                  {bill.dateLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="material-title text-white">{bill.amountLabel}</p>
                <p
                  className={`material-label mt-1 ${bill.status === "paid" ? "text-green-400" : "text-cyan-400"}`}
                >
                  {bill.status === "paid"
                    ? "✓ Paid"
                    : selectedBillId === bill.id
                      ? "Selected"
                      : "Pending"}
                </p>
              </div>
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-cyan-400">PAYMENT METHOD</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod("upi")}
              className={`rounded-xl border p-3 text-left ${
                selectedMethod === "upi"
                  ? "border-cyan-400 bg-cyan-900/20"
                  : "border-white/10 bg-[#2A2B2C]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-cyan-400" />
                <p className="material-body font-medium text-white">UPI</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("credit_card")}
              className={`rounded-xl border p-3 text-left ${
                selectedMethod === "credit_card"
                  ? "border-cyan-400 bg-cyan-900/20"
                  : "border-white/10 bg-[#2A2B2C]"
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-cyan-400" />
                <p className="material-body font-medium text-white">
                  Credit Card
                </p>
              </div>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-cyan-400">PAYMENT SUMMARY</p>
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Bill Month</p>
              <p className="material-body font-medium text-white">
                {selectedBill?.month || "-"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Amount Due</p>
              <p className="material-body font-medium text-cyan-400">
                {selectedBill?.amountLabel || "₹0"}
              </p>
            </div>
          </div>
        </section>

        {paymentError ? (
          <p className="material-label rounded-xl border border-red-500/30 bg-red-900/20 p-3 text-red-300">
            {paymentError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handlePayment}
          disabled={!selectedBill || selectedBill.status === "paid"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 py-3 font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CreditCard className="size-4" />
          {`Proceed to PIN & Pay via ${selectedMethod === "upi" ? "UPI" : "Credit Card"}`}
        </button>
      </div>
    </main>
  );
}
