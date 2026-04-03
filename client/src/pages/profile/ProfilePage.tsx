import { useEffect, useState } from "react";
import { Phone, Mail, IdCard, Hash } from "lucide-react";
import { getProfile } from "../../api/authApi";
import { BottomNav } from "../../components/navigation/BottomNav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuthStore } from "../../stores/authStore";

type ProfileUser = {
  id: string;
  name: string;
  mobile: string;
  gmail: string;
  aadharnumber: string;
  consumer_id: string;
  created_at: string;
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.mobile) {
        setError("No active login session found.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getProfile(user.mobile);
        setProfile(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user?.mobile]);

  return (
    <main className="auth-bg min-h-screen w-full px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="auth-card p-5 sm:p-7">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-display text-3xl text-[#0b2e59]">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            {isLoading ? (
              <p className="text-sm text-slate-600">Loading profile...</p>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-[#f3c8c3] bg-[#fff3f2] px-3 py-2 text-sm text-[#b42318]">
                {error}
              </p>
            ) : null}

            {!isLoading && !error && profile ? (
              <div className="space-y-3 rounded-2xl border border-[#d7e5f5] bg-[#f8fbff] p-4 text-sm text-slate-800">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#0b2e59]">
                    {profile.name}
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-[#1A73E8]" />
                    <span>{profile.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-[#1A73E8]" />
                    <span>{profile.gmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdCard className="size-4 text-[#1A73E8]" />
                    <span>{profile.aadharnumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="size-4 text-[#1A73E8]" />
                    <span>{profile.consumer_id}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </main>
  );
}
