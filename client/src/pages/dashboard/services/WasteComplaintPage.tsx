import { Send } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function WasteComplaintPage() {
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
            onClick={() => navigate("/services/waste")}
            className="text-green-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="material-headline flex-1 text-white">Report Issue</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-green-400">ISSUE TYPE</p>
          <div className="mt-3 space-y-2">
            {[
              "Missed Pickup",
              "Inadequate Space",
              "Unhygienic Handling",
              "Billing Issue",
              "Others",
            ].map((type) => (
              <button
                key={type}
                type="button"
                className="flex w-full items-center rounded-lg border border-white/10 bg-[#2A2B2C] p-3 hover:border-green-400"
              >
                <input type="radio" name="issue-type" className="mr-3" />
                <p className="material-body text-white">{type}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-green-400">DESCRIPTION</p>
          <textarea
            placeholder="Describe the issue..."
            className="material-body mt-3 w-full rounded-lg border border-white/10 bg-[#2A2B2C] p-3 text-white placeholder:text-slate-500 focus:border-green-400 focus:outline-none"
            rows={4}
          />
        </section>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-green-400 py-3 font-semibold text-black hover:bg-white"
        >
          <Send className="size-4" />
          Submit Complaint
        </button>
      </div>
    </main>
  );
}
