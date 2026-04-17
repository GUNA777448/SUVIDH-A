import { Mail, Phone } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const officers = [
  {
    name: "A. Sharma",
    role: "Gas Support Officer",
    status: "Available",
    phone: "+91 90000 12345",
    email: "gas.support@suvidha.gov",
  },
  {
    name: "R. Naidu",
    role: "Billing Officer",
    status: "Busy",
    phone: "+91 90000 56789",
    email: "billing@suvidha.gov",
  },
  {
    name: "S. Iyer",
    role: "Complaint Resolution",
    status: "Available",
    phone: "+91 90000 24680",
    email: "complaints@suvidha.gov",
  },
];

export default function OfficersPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen w-full bg-[#F4F6FB] px-4 pb-24 pt-5">
      <div className="mx-auto w-full max-w-md space-y-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#1977F3]">
            Officers
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#0B2E59]">
            Contact & Support
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Reach your assigned officers for faster resolution.
          </p>
        </section>

        <section className="space-y-3">
          {officers.map((officer) => (
            <article
              key={officer.email}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#0B2E59]">
                    {officer.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{officer.role}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    officer.status === "Available"
                      ? "bg-[#EAF9F0] text-[#0F8A43]"
                      : "bg-[#FFF7E5] text-[#B7791F]"
                  }`}
                >
                  {officer.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-[#1977F3]" />
                  <span>{officer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-[#1977F3]" />
                  <span>{officer.email}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
