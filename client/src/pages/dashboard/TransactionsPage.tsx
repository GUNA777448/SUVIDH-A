import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Flame, Bolt, Droplets, Recycle, Download } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useBookings } from "../../hooks/useBookings";
import {
  listPaymentHistory,
  type PaymentHistoryItem,
  subscribePaymentHistory,
} from "../../api/paymentApi";

const serviceIcons = {
  gas: Flame,
  electricity: Bolt,
  water: Droplets,
  waste: Recycle,
};

const serviceColors = {
  gas: { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-50" },
  electricity: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    badge: "bg-yellow-50",
  },
  water: { bg: "bg-cyan-100", text: "text-cyan-700", badge: "bg-cyan-50" },
  waste: { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-50" },
};

export default function TransactionsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { getAllBookings } = useBookings();
  const bookings = getAllBookings();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    [],
  );

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const refresh = () => {
      setPaymentHistory(listPaymentHistory(user.id));
    };

    refresh();
    const unsubscribe = subscribePaymentHistory(refresh);
    window.addEventListener("focus", refresh);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", refresh);
    };
  }, [user.id]);

  const completedCount = bookings.filter(
    (b) => b.status === "completed",
  ).length;
  const pendingCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const formatPaymentMethod = (method: "upi" | "credit_card") => {
    if (method === "credit_card") {
      return "Credit Card";
    }

    return "UPI";
  };

  const downloadReceipt = (payment: PaymentHistoryItem) => {
    const receiptText = [
      "SUVIDHA PAYMENT RECEIPT",
      "------------------------",
      `Transaction ID: ${payment.transaction_id}`,
      `Intent Number: ${payment.intent_number}`,
      `Provider Reference: ${payment.provider_reference}`,
      `Amount: ${(payment.amount_minor / 100).toFixed(2)} ${payment.currency}`,
      `Payment Method: ${formatPaymentMethod(payment.payment_method)}`,
      `Status: ${payment.status}`,
      `Captured At: ${new Date(payment.captured_at).toLocaleString("en-IN")}`,
      `Service: ${payment.domain_service}`,
      `Reference: ${payment.domain_reference_id}`,
      "------------------------",
      "Thank you for using SUVIDHA.",
    ].join("\n");

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `suvidha-receipt-${payment.transaction_id}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen w-full bg-[#F4F6FB] px-4 pb-24 pt-5">
      <div className="mx-auto w-full max-w-md space-y-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#1977F3]">
            Transactions
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#0B2E59]">
            Payment History
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {bookings.length > 0
              ? "View all your service requests and transactions."
              : "No service requests yet. Start by booking a service!"}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Completed
            </p>
            <p className="mt-2 text-xl font-semibold text-[#0B2E59]">
              {completedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">All time</p>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Pending
            </p>
            <p className="mt-2 text-xl font-semibold text-[#0B2E59]">
              {pendingCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">In progress</p>
          </article>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-[#0B2E59]">
            Payment Transactions
          </h2>
          {paymentHistory.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No local payment records yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {paymentHistory.map((payment) => (
                <article
                  key={payment.transaction_id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0B2E59]">
                        {payment.intent_number}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payment.transaction_id}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                      {payment.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#0B2E59]">
                        ₹{(payment.amount_minor / 100).toLocaleString("en-IN")}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPaymentMethod(payment.payment_method)} •{" "}
                        {formatDate(payment.captured_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadReceipt(payment)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#1977F3] px-2 py-1 text-xs font-semibold text-[#1977F3] hover:bg-blue-50"
                    >
                      <Download className="size-3" />
                      Receipt
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {bookings.length === 0 ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">No service requests found yet</p>
          </section>
        ) : (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-[#0B2E59]">
              Service Requests
            </h2>
            <div className="mt-3 space-y-3">
              {bookings.map((booking) => {
                const Icon =
                  serviceIcons[
                    booking.serviceType as keyof typeof serviceIcons
                  ];
                const colors =
                  serviceColors[
                    booking.serviceType as keyof typeof serviceColors
                  ];

                return (
                  <article
                    key={booking.id}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${colors.bg}`}>
                          <Icon className={`size-5 ${colors.text}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B2E59]">
                            {booking.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {booking.id}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#0B2E59]">
                        {typeof booking.details?.total === "number"
                          ? `₹${booking.details.total.toLocaleString("en-IN")}`
                          : booking.details?.amount || "---"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    {booking.details?.billStatus === "paid" ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-green-600">
                        E-bill paid and updated
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
