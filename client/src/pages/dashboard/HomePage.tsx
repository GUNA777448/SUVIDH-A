import {
  Bell,
  ArrowRight,
  Bolt,
  ClipboardList,
  Droplets,
  Flame,
  Megaphone,
  Recycle,
  Search,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useBookings } from "../../hooks/useBookings";

const citizenActions = [
  {
    title: "Track Applications",
    description: "View status of your submitted service requests.",
    to: "/transactions",
    icon: ClipboardList,
  },
  {
    title: "Pay Utility Bills",
    description: "Check due amounts for gas and municipal services.",
    to: "/transactions",
    icon: Wallet,
  },
  {
    title: "Contact Officers",
    description: "Reach assigned officers for issue resolution support.",
    to: "/officers",
    icon: Users,
  },
  {
    title: "Emergency Support",
    description: "Report critical issues and request priority assistance.",
    to: "/services/gas",
    icon: ShieldAlert,
  },
];

const serviceModules = [
  {
    title: "Gas Services",
    subtitle: "Booking, refill and delivery complaints",
    to: "/services/gas",
    icon: Flame,
    active: true,
  },
  {
    title: "Electricity",
    subtitle: "Bills, meter and outage support",
    to: "/services",
    icon: Bolt,
    active: false,
  },
  {
    title: "Water",
    subtitle: "Connection, billing and tanker services",
    to: "/services",
    icon: Droplets,
    active: false,
  },
  {
    title: "Waste Management",
    subtitle: "Pickup requests and sanitation complaints",
    to: "/services",
    icon: Recycle,
    active: false,
  },
];

const announcements = [
  "Ward-level grievance camp on Saturday at 10:00 AM.",
  "System maintenance window: Sunday 01:00 AM to 03:00 AM.",
  "Emergency helpline is active 24x7 for gas leak reports.",
];

const others = [
  {
    title: "Officers Directory",
    subtitle: "Find officer contacts by service and ward",
    to: "/officers",
    icon: ShieldCheck,
  },
  {
    title: "Service History",
    subtitle: "Review previous requests and resolutions",
    to: "/transactions",
    icon: Ticket,
  },
  {
    title: "Citizen Profile",
    subtitle: "Update identity and communication details",
    to: "/profile",
    icon: Users,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { getAllBookings } = useBookings();
  const bookings = getAllBookings();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const today = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const profilePath = user?.id ? `/profile/userid/${user.id}` : "/profile";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#131314] pb-24 pt-4 text-[#E3E3E3]">
      <div className="space-y-5 px-4 sm:px-6">
        <header className="flex items-center gap-3">
          <div className="flex h-12 flex-1 max-w-xs items-center gap-3 rounded-full border border-white/10 bg-[#1E1F20] px-4">
            <Search className="size-4 shrink-0 text-[#BDC1C6]" />
            <p className="truncate material-body text-[#BDC1C6]">
              Search services
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(profilePath)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#2A2B2C] text-xs font-semibold text-white"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#1E1F20] p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="material-label uppercase text-[#A8C7FA]">
                Suvidha Citizen Dashboard
              </p>
              <p className="material-headline text-white">
                One place for all civic services
              </p>
              <p className="material-body max-w-72 text-slate-300">
                Track bookings, payments, and service updates in a clean
                dashboard built for fast action. Today: {today}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] px-3 py-2 text-right">
              <p className="material-label text-slate-400">Live status</p>
              <p className="material-body font-medium text-white">Active</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/services")}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#A8C7FA] bg-[#2A2B2C] px-4 py-2 text-sm font-medium text-[#E8EAED]"
          >
            Explore services
            <ArrowRight className="size-4" />
          </button>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <article className="rounded-2xl border border-white/10 bg-[#1E1F20] p-3">
            <p className="material-label text-slate-400">Requests</p>
            <p className="material-headline mt-1 text-white">
              {bookings.length}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#1E1F20] p-3">
            <p className="material-label text-slate-400">Services</p>
            <p className="material-headline mt-1 text-white">4</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#1E1F20] p-3">
            <p className="material-label text-slate-400">Alerts</p>
            <p className="material-headline mt-1 text-white">3</p>
          </article>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="material-title text-white">Services</h2>
            <button
              type="button"
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#A8C7FA]"
            >
              View all
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {serviceModules.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className={`rounded-2xl p-3 text-left ${
                    action.active
                      ? "bg-[#174EA6]"
                      : "border border-white/10 bg-[#1E1F20]"
                  }`}
                >
                  <span className="mb-2 inline-flex rounded-xl bg-[#2A2B2C] p-2 text-[#A8C7FA]">
                    <Icon className="size-4" />
                  </span>
                  <p className="material-label leading-4 text-white">
                    {action.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    {action.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="material-title text-white">Service Status</h2>
            <p className="material-label text-slate-400">Today</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <article className="rounded-xl border border-white/10 bg-[#1E1F20] p-3 text-center">
              <span className="inline-block rounded-lg bg-[#2A2B2C] p-2 text-blue-400">
                <Flame className="size-4" />
              </span>
              <p className="material-label mt-2 text-white">Gas</p>
              <p className="material-body mt-1 text-xs font-bold text-green-400">
                Operational
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-[#1E1F20] p-3 text-center">
              <span className="inline-block rounded-lg bg-[#2A2B2C] p-2 text-yellow-400">
                <Bolt className="size-4" />
              </span>
              <p className="material-label mt-2 text-white">Electricity</p>
              <p className="material-body mt-1 text-xs font-bold text-green-400">
                Operational
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-[#1E1F20] p-3 text-center">
              <span className="inline-block rounded-lg bg-[#2A2B2C] p-2 text-cyan-400">
                <Droplets className="size-4" />
              </span>
              <p className="material-label mt-2 text-white">Water</p>
              <p className="material-body mt-1 text-xs font-bold text-yellow-400">
                Maintenance
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-[#1E1F20] p-3 text-center">
              <span className="inline-block rounded-lg bg-[#2A2B2C] p-2 text-green-400">
                <Recycle className="size-4" />
              </span>
              <p className="material-label mt-2 text-white">Waste</p>
              <p className="material-body mt-1 text-xs font-bold text-green-400">
                Operational
              </p>
            </article>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="material-title text-white">
              My Requests {bookings.length > 0 && `(${bookings.length})`}
            </h2>
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#A8C7FA]"
            >
              View all
              <ArrowRight className="size-4" />
            </button>
          </div>
          {bookings.length === 0 ? (
            <article className="rounded-2xl border border-white/10 bg-[#1E1F20] px-4 py-6 text-center">
              <p className="material-body text-slate-400">
                No service requests yet. Start by booking a service!
              </p>
            </article>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking) => {
                const serviceIcon = {
                  gas: Flame,
                  electricity: Bolt,
                  water: Droplets,
                  waste: Recycle,
                }[booking.serviceType];
                const Icon = serviceIcon || Ticket;
                const statusColor =
                  {
                    confirmed: "text-yellow-400 bg-yellow-900/30",
                    "in-progress": "text-blue-400 bg-blue-900/30",
                    pending: "text-slate-400 bg-slate-900/30",
                    completed: "text-green-400 bg-green-900/30",
                  }[booking.status] || "text-slate-400";

                return (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-white/10 bg-[#1E1F20] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`rounded-lg p-2 ${statusColor}`}>
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p className="material-body font-medium text-white">
                            {booking.title}
                          </p>
                          <p className="material-label mt-1 text-slate-400">
                            Reference: {booking.id}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#2A2B2C] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#A8C7FA]">
                        {booking.status}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="material-title text-white">Notices & Alerts</h2>
            <Bell className="size-5 text-[#A8C7FA]" />
          </div>
          <div className="space-y-3">
            {announcements.map((item) => (
              <article
                key={item}
                className="rounded-2xl border border-white/10 bg-[#1E1F20] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-[#2A2B2C] p-2 text-[#A8C7FA]">
                    <Megaphone className="size-4" />
                  </span>
                  <p className="material-body text-slate-300">{item}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="material-title mb-3 text-white">Citizen Actions</h2>
          <div className="space-y-3">
            {citizenActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#1E1F20] px-4 py-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-[#2A2B2C] p-2 text-[#A8C7FA]">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="material-body font-medium text-white">
                        {action.title}
                      </p>
                      <p className="material-label mt-0.5 text-slate-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-slate-500" />
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="material-title mb-3 text-white">Services & others</h2>
          <div className="space-y-3">
            {others.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#1E1F20] px-4 py-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-[#2A2B2C] p-2 text-[#A8C7FA]">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="material-body font-medium text-white">
                        {item.title}
                      </p>
                      <p className="material-label mt-0.5 text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-slate-500" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
