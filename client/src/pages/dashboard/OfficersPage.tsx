import { BottomNav } from "../../components/navigation/BottomNav";

const officers = [
  { name: "Anita Verma", ward: "Ward 11" },
  { name: "Rakesh Iyer", ward: "Ward 08" },
  { name: "Neha Kulkarni", ward: "Ward 15" },
  { name: "Vikram Das", ward: "Ward 04" },
];

export default function OfficersPage() {
  return (
    <main className="auth-bg min-h-screen w-full px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="font-display text-3xl text-[#0b2e59]">Officers</h1>
        <p className="mt-2 text-sm text-slate-600">
          Local ward officers directory.
        </p>

        <div className="mt-4 grid gap-3">
          {officers.map((officer) => (
            <div
              key={officer.name}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">
                {officer.name}
              </p>
              <p className="text-xs text-slate-600">{officer.ward}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
