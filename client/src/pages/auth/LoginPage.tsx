import { useEffect } from "react";
import { Phone } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { OtpInput } from "../../components/ui/otp-input";
import { useAuthStore } from "../../stores/authStore";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const {
    step,
    mobile,
    otp,
    isSending,
    isVerifying,
    error,
    countdown,
    setMobile,
    setOtp,
    sendOtp,
    verifyOtp,
    resendOtp,
    reset,
    tick,
  } = useAuthStore();

  useEffect(() => {
    if (step !== "otp" || countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      tick();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, countdown, tick]);

  if (step === "success") {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="auth-bg min-h-screen w-full px-4 py-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center">
        <section className="auth-panel w-full">
          <Card className="auth-card w-full p-5 sm:p-7 md:p-8">
            <div className="govt-banner mb-5">
              <div className="india-tricolor" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="chakra-mark" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-900">
                      Government of India Services
                    </p>
                    <p className="text-xs text-slate-700">
                      SUVIDHA Digital Citizen Access Portal
                    </p>
                  </div>
                </div>
                <div
                  className="india-badge"
                  aria-label="India themed badge"
                  title="India themed badge"
                >
                  GOV.IN
                </div>
              </div>
            </div>

            <>
              <CardHeader>
                <p className="mb-2 inline-flex w-fit rounded-full border border-[#c9d5e7] bg-[#eef4fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b2e59]">
                  Suvidha Login
                </p>
                <CardTitle className="font-display text-3xl text-[#0b2e59]">
                  {step === "mobile" ? "Login" : "Verify OTP"}
                </CardTitle>
                <CardDescription className="text-slate-700">
                  {step === "mobile"
                    ? "Enter your registered mobile number to continue."
                    : `OTP sent to +91 ${mobile}.`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {step === "mobile" ? (
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile number</Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="9876543210"
                        value={mobile}
                        onChange={(event) =>
                          setMobile(
                            event.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className="pl-9 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:border-[#1f6aa5] focus-visible:ring-[#1f6aa5]/35"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">One-time password</Label>
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>
                )}

                {error ? (
                  <p className="rounded-xl border border-[#f3c8c3] bg-[#fff3f2] px-3 py-2 text-sm text-[#b42318]">
                    {error}
                  </p>
                ) : null}
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-3">
                {step === "mobile" ? (
                  <Button
                    onClick={sendOtp}
                    disabled={isSending || mobile.length !== 10}
                    size="lg"
                    className="bg-[#0b2e59] text-white hover:bg-[#1f6aa5] focus-visible:ring-[#1f6aa5]/60"
                  >
                    {isSending ? "Sending OTP..." : "Send OTP"}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={verifyOtp}
                      disabled={isVerifying || otp.length !== 6}
                      size="lg"
                      className="bg-[#0b2e59] text-white hover:bg-[#1f6aa5] focus-visible:ring-[#1f6aa5]/60"
                    >
                      {isVerifying ? "Verifying..." : "Login"}
                    </Button>
                    <div className="flex flex-col items-start justify-between gap-2 text-sm text-slate-700 sm:flex-row sm:items-center">
                      <Button
                        variant="ghost"
                        className="h-auto px-0 py-0 text-[#0b2e59] hover:bg-transparent hover:text-[#1f6aa5]"
                        onClick={reset}
                      >
                        Change number
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto border-[#c3d2e6] bg-white px-2 py-1 text-[#0b2e59] hover:bg-[#eef4fb]"
                        onClick={resendOtp}
                        disabled={isSending || countdown > 0}
                      >
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend OTP"}
                      </Button>
                    </div>
                  </>
                )}
              </CardFooter>
            </>
          </Card>
        </section>
      </div>
    </main>
  );
}
