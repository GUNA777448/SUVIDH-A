import { useEffect, useState } from "react";
import { Check, CreditCard, Shield } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useBookings } from "../../hooks/useBookings";
import { useServiceBills } from "../../hooks/useServiceBills";
import {
  confirmPaymentIntent,
  createPaymentIntent,
  recordPaymentHistory,
  type PaymentMethod,
} from "../../api/paymentApi";

type PaymentCheckoutState = {
  serviceType: "gas" | "electricity" | "water";
  billService?: "electricity" | "water";
  billId: string;
  bookingTitle: string;
  domainService: string;
  domainReferenceId: string;
  amountMinor: number;
  amountLabel: string;
  paymentMethod: PaymentMethod;
  returnPath: string;
  successMessage: string;
};

export default function PaymentPinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { addBooking, updateBooking } = useBookings();
  const { markBillAsPaid } = useServiceBills();
  const checkoutState = location.state as PaymentCheckoutState | undefined;

  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<{
    intentNumber: string;
    transactionId: string;
    providerReference: string;
  } | null>(null);

  useEffect(() => {
    if (checkoutState) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate("/services");
    }, 800);

    return () => window.clearTimeout(timer);
  }, [checkoutState, navigate]);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (!checkoutState) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131314] px-4 text-white">
        <p className="text-sm text-slate-300">Loading payment details...</p>
      </main>
    );
  }

  const handleSubmitPin = async () => {
    if (pin.trim().length < 4) {
      setPaymentError("Enter the 4-digit PIN to continue.");
      return;
    }

    setPaymentError(null);
    setIsProcessing(true);

    try {
      const intent = await createPaymentIntent({
        idempotencyKey: `${checkoutState.domainService}-${checkoutState.domainReferenceId}-${user.id}`,
        domainService: checkoutState.domainService,
        domainReferenceId: checkoutState.domainReferenceId,
        amountMinor: checkoutState.amountMinor,
        currency: "INR",
        authUserId: user.id,
      });

      const capture = await confirmPaymentIntent({
        paymentIntentId: intent.payment_intent_id,
        authUserId: user.id,
        paymentMethod: checkoutState.paymentMethod,
        pin: pin.trim(),
      });

      recordPaymentHistory({
        payment_intent_id: intent.payment_intent_id,
        intent_number: intent.intent_number,
        transaction_id: capture.transaction_id,
        provider_reference: capture.provider_reference,
        payment_method: checkoutState.paymentMethod,
        status: capture.status,
        captured_at: capture.captured_at,
        amount_minor: checkoutState.amountMinor,
        currency: "INR",
        domain_service: checkoutState.domainService,
        domain_reference_id: checkoutState.domainReferenceId,
        auth_user_id: user.id,
      });

      const booking = addBooking(
        checkoutState.serviceType,
        checkoutState.bookingTitle,
        {
          amount: checkoutState.amountLabel,
          total: checkoutState.amountMinor / 100,
          paymentMethod:
            checkoutState.paymentMethod === "upi" ? "UPI" : "Credit Card",
          transactionId: capture.transaction_id,
          providerReference: capture.provider_reference,
          billStatus: "paid",
        },
      );
      updateBooking(booking.id, { status: "completed" });

      if (checkoutState.billService && checkoutState.billId) {
        markBillAsPaid({
          billId: checkoutState.billId,
          paymentMethod: checkoutState.paymentMethod,
          transactionId: capture.transaction_id,
        });
      }

      setPaymentSummary({
        intentNumber: intent.intent_number,
        transactionId: capture.transaction_id,
        providerReference: capture.provider_reference,
      });
      setIsPaid(true);

      window.dispatchEvent(new CustomEvent("suvidha:bill-refresh"));

      window.setTimeout(() => {
        navigate(checkoutState.returnPath);
      }, 1800);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Payment failed. Please retry.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPaid) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#131314] pb-24 pt-4 text-[#E3E3E3]">
        <div className="flex h-full flex-col items-center justify-center space-y-4 px-4 py-16">
          <div className="rounded-full bg-green-900/30 p-6">
            <Check className="size-12 text-green-400" />
          </div>
          <h1 className="material-headline text-center text-white">
            Payment Successful!
          </h1>
          <p className="material-body text-center text-slate-300">
            {checkoutState.successMessage}
          </p>
          {paymentSummary ? (
            <div className="rounded-2xl border border-white/10 bg-[#1E1F20] px-4 py-3 text-left text-sm text-slate-300">
              <p>Intent: {paymentSummary.intentNumber}</p>
              <p>Transaction: {paymentSummary.transactionId}</p>
            </div>
          ) : null}
          <p className="material-label text-yellow-400">
            Redirecting to transactions...
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
            onClick={() => navigate(checkoutState.returnPath)}
            className="text-yellow-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="material-headline flex-1 text-white">Enter PIN</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">PAYMENT SUMMARY</p>
          <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Amount</p>
              <p className="material-body font-medium text-white">
                {checkoutState.amountLabel}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="material-body text-slate-400">Method</p>
              <p className="material-body font-medium text-white">
                {checkoutState.paymentMethod === "upi" ? "UPI" : "Credit Card"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-yellow-400">PIN VERIFICATION</p>
          <div className="mt-3 space-y-3 rounded-xl bg-[#2A2B2C] p-3">
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-900/10 p-3 text-sm text-yellow-100">
              Enter the 4-digit PIN to authorize payment.
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, ""))
              }
              placeholder="••••"
              className="w-full rounded-xl border border-white/10 bg-[#131314] px-4 py-3 text-center text-lg tracking-[0.5em] text-white placeholder:text-slate-600 focus:border-yellow-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSubmitPin}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-3 font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Shield className="size-4" />
              {isProcessing
                ? "Verifying PIN..."
                : `Pay ${checkoutState.amountLabel}`}
            </button>
            {paymentError ? (
              <p className="rounded-xl border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">
                {paymentError}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 size-5 text-yellow-400" />
            <p className="material-body text-slate-300">
              This page sends the PIN-protected request to the payment module
              and updates your local transactions after success.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
