import { Send, Upload } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function GasComplaintPage() {
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
          <h1 className="material-headline flex-1 text-white">
            Raise Complaint
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">COMPLAINT TYPE</p>
          <div className="mt-3 space-y-2">
            {[
              "Delay in Delivery",
              "Gas Leakage",
              "Damaged Cylinder",
              "Billing Issue",
              "Others",
            ].map((type) => (
              <button
                key={type}
                type="button"
                className="flex w-full items-center rounded-lg border border-white/10 bg-[#2A2B2C] p-3 hover:border-[#A8C7FA]"
              >
                <input type="radio" name="complaint-type" className="mr-3" />
                <p className="material-body text-white">{type}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">DETAILS</p>
          <textarea
            placeholder="Describe your issue in detail..."
            className="material-body mt-3 w-full rounded-lg border border-white/10 bg-[#2A2B2C] p-3 text-white placeholder:text-slate-500 focus:border-[#A8C7FA] focus:outline-none"
            rows={5}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">
            ATTACHMENTS (OPTIONAL)
          </p>
          <button
            type="button"
            className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 bg-[#2A2B2C] py-6 hover:border-[#A8C7FA]"
          >
            <Upload className="size-5 text-[#A8C7FA]" />
            <span className="material-body text-[#A8C7FA]">
              Upload photos or documents
            </span>
            <span className="material-label text-slate-500">
              Max 5 files, 5MB each
            </span>
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">PRIORITY</p>
          <div className="mt-3 space-y-2">
            {["Normal", "High", "Emergency"].map((priority) => (
              <button
                key={priority}
                type="button"
                className="flex w-full items-center rounded-lg border border-white/10 bg-[#2A2B2C] p-3 hover:border-[#A8C7FA]"
              >
                <input
                  type="radio"
                  name="priority"
                  className="mr-3"
                  defaultChecked={priority === "Normal"}
                />
                <p className="material-body text-white">{priority}</p>
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#A8C7FA] py-3 font-semibold text-[#062E6F] hover:bg-white"
        >
          <Send className="size-4" />
          Submit Complaint
        </button>
      </div>
    </main>
  );
}
