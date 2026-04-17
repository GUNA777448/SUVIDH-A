import { FileText, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

const steps = [
  { title: "Fill Application", status: "completed", date: "Apr 10, 2026" },
  {
    title: "Document Verification",
    status: "in-progress",
    date: "In Progress",
  },
  { title: "Field Inspection", status: "pending", date: "Scheduled: Apr 18" },
  {
    title: "Connection Activation",
    status: "pending",
    date: "Will be done post-inspection",
  },
];

export default function GasNewConnectionPage() {
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
            New Connection
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">APPLICATION STATUS</p>
          <div className="mt-4 space-y-4">
            {steps.map((step, idx) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step.status === "completed"
                        ? "bg-[#0B57D0]"
                        : step.status === "in-progress"
                          ? "bg-[#0B57D0]"
                          : "border border-white/20 bg-[#2A2B2C]"
                    }`}
                  >
                    {step.status === "completed" && (
                      <CheckCircle className="size-5 text-white" />
                    )}
                    {step.status === "in-progress" && (
                      <Clock className="size-5 text-white" />
                    )}
                    {step.status === "pending" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="my-1 h-6 w-0.5 bg-white/10" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="material-body font-medium text-white">
                    {step.title}
                  </p>
                  <p className="material-label mt-1 text-slate-400">
                    {step.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">REQUIRED DOCUMENTS</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#2A2B2C] p-3">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-[#A8C7FA]" />
                <p className="material-body text-white">Aadhar Card</p>
              </div>
              <CheckCircle className="size-4 text-green-400" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#2A2B2C] p-3">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-[#A8C7FA]" />
                <p className="material-body text-white">Address Proof</p>
              </div>
              <CheckCircle className="size-4 text-green-400" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#2A2B2C] p-3">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-[#A8C7FA]" />
                <p className="material-body text-white">Income Proof</p>
              </div>
              <CheckCircle className="size-4 text-green-400" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1E1F20] p-4">
          <p className="material-label text-[#A8C7FA]">NEXT STEP</p>
          <p className="material-body mt-2 text-slate-300">
            Field inspection scheduled for Apr 18. Our officer will verify the
            installation site.
          </p>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#A8C7FA] py-2 font-semibold text-[#062E6F] hover:bg-white"
          >
            Schedule Inspection
            <ArrowRight className="size-4" />
          </button>
        </section>
      </div>
    </main>
  );
}
