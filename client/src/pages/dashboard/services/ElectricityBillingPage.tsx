import { useState } from "react";
import { CreditCard, Smartphone } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useServiceBills } from "../../../hooks/useServiceBills";

export default function ElectricityBillingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { getBillsByService } = useServiceBills();

  const electricityBills = getBillsByService("electricity");
  const firstPendingBill = electricityBills.find(
    (bill) => bill.status === "pending",
  );

  const [selectedBillId, setSelectedBillId] = useState<string>(
    firstPendingBill?.id || electricityBills[0]?.id || "",
  );
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "credit_card">(
    "upi",
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const selectedBill = electricityBills.find(
    (bill) => bill.id === selectedBillId,
  );

  const handlePayment = () => {
    const bill = selectedBill;
    if (!bill) return;
    if (bill.status === "paid") {
      setPaymentError("This bill is already paid.");
      return;
    }

    setPaymentError(null);
    navigate("/payments/pin", {
      state: {
        serviceType: "electricity",
        billService: "electricity",
        billId: bill.id,
        bookingTitle: `Electricity Bill Payment - ${bill.month}`,
        domainService: "electricity-service",
        domainReferenceId: bill.id,
        amountMinor: bill.amountMinor,
        amountLabel: bill.amountLabel,
        paymentMethod: selectedMethod,
        returnPath: "/transactions",
        successMessage:
          "Your electricity e-bill has been paid and updated across dashboard.",
      },
    });
  };

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
          <h1 className="material-headline flex-1 text-white">Bills</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">SELECT BILL TO PAY</p>
          <div className="mt-3 space-y-2">
            {electricityBills.map((bill) => (
              <button
                key={bill.id}
                type="button"
                onClick={() =>
                  bill.status === "pending" && setSelectedBillId(bill.id)
                }
                disabled={bill.status === "paid"}
                className={`flex w-full items-center justify-between rounded-xl border p-4 transition-all ${
                  selectedBillId === bill.id && bill.status === "pending"
                    ? "border-yellow-400 bg-yellow-900/20"
                    : "border-white/10 bg-[#2A2B2C]"
                } ${bill.status === "paid" ? "opacity-60 cursor-not-allowed" : "hover:border-yellow-400"}`}
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
                  <p className="material-title text-white">
                    {bill.amountLabel}
                  </p>
                  <p
                    className={`material-label mt-1 ${bill.status === "paid" ? "text-green-400" : "text-yellow-400"}`}
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
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">PAYMENT METHOD</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod("upi")}
              className={`rounded-xl border p-3 text-left ${
                selectedMethod === "upi"
                  ? "border-yellow-400 bg-yellow-900/20"
                  : "border-white/10 bg-[#2A2B2C]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-yellow-400" />
                <p className="material-body font-medium text-white">UPI</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("credit_card")}
              className={`rounded-xl border p-3 text-left ${
                selectedMethod === "credit_card"
                  ? "border-yellow-400 bg-yellow-900/20"
                  : "border-white/10 bg-[#2A2B2C]"
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-yellow-400" />
                <p className="material-body font-medium text-white">
                  Credit Card
                </p>
              </div>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">PAYMENT SUMMARY</p>
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Bill Month</p>
              <p className="material-body font-medium text-white">
                {selectedBill?.month || "-"}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Amount Due</p>
              <p className="material-body font-medium text-yellow-400">
                {selectedBill?.amountLabel || "₹0"}
              </p>
            </div>
            <div className="border-t border-white/10 pt-2">
              <div className="flex justify-between">
                <p className="material-title text-white">Total</p>
                <p className="material-title text-yellow-400">
                  {selectedBill?.amountLabel || "₹0"}
                </p>
              </div>
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
          className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-3 font-semibold text-black transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CreditCard className="size-4" />
          {`Proceed to PIN & Pay via ${selectedMethod === "upi" ? "UPI" : "Credit Card"}`}
        </button>
      </div>
    </main>
  );
}
