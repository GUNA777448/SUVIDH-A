import { BottomNav } from "../../components/navigation/BottomNav";

export default function TransactionsPage() {
  return (
    <main className="auth-bg min-h-screen w-full px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="font-display text-3xl text-[#0b2e59]">Transactions</h1>
        <p className="mt-2 text-sm text-slate-600">
          View your utility bill payments, receipts, and transaction history.
        </p>
      </div>
      <BottomNav />
    </main>
  );
}
