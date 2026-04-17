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
    <main
      className="min-h-screen w-full px-4 py-6 sm:py-8"
      style={{ backgroundColor: "#F4F6FB" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center">
        <section
          className="w-full"
          style={{ animation: "riseIn 420ms ease-out" }}
        >
          <Card
            className="w-full p-5 sm:p-7 md:p-8"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#1977F3" }}
          >
            <>
              <CardHeader>
                <p
                  className="mb-2 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: "#F4F6FB",
                    color: "#1977F3",
                    borderColor: "#1977F3",
                    borderWidth: "1px",
                  }}
                >
                  Suvidha Login
                </p>
                <CardTitle
                  className="font-display text-3xl"
                  style={{ color: "#1977F3" }}
                >
                  {step === "mobile" ? "Login" : "Verify OTP"}
                </CardTitle>
                <CardDescription style={{ color: "#1977F3", opacity: 0.8 }}>
                  {step === "mobile"
                    ? "Enter your registered mobile number to continue."
                    : `OTP sent to +91 ${mobile}.`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {step === "mobile" ? (
                  <div className="space-y-2">
                    <Label htmlFor="mobile" style={{ color: "#1977F3" }}>
                      Mobile number
                    </Label>
                    <div className="relative">
                      <Phone
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                        style={{ color: "#1977F3", opacity: 0.6 }}
                      />
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
                        style={{
                          backgroundColor: "#F4F6FB",
                          borderColor: "#1977F3",
                          color: "#1977F3",
                        }}
                        className="pl-9 border placeholder:text-[#1977F3] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1977F3] focus-visible:ring-opacity-50"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp" style={{ color: "#1977F3" }}>
                      One-time password
                    </Label>
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>
                )}

                {error ? (
                  <p
                    className="rounded-xl px-3 py-2 text-sm"
                    style={{
                      backgroundColor: "#F4F6FB",
                      color: "#1977F3",
                      borderColor: "#1977F3",
                      borderWidth: "1px",
                    }}
                  >
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
                    style={{
                      backgroundColor:
                        isSending || mobile.length !== 10
                          ? "#1977F3"
                          : "#1977F3",
                      color: "#FFFFFF",
                      opacity: isSending || mobile.length !== 10 ? 0.6 : 1,
                      cursor:
                        isSending || mobile.length !== 10
                          ? "not-allowed"
                          : "pointer",
                    }}
                    className="rounded-md font-medium transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1977F3] focus-visible:ring-opacity-50"
                  >
                    {isSending ? "Sending OTP..." : "Send OTP"}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={verifyOtp}
                      disabled={isVerifying || otp.length !== 6}
                      size="lg"
                      style={{
                        backgroundColor:
                          isVerifying || otp.length !== 6
                            ? "#1977F3"
                            : "#1977F3",
                        color: "#FFFFFF",
                        opacity: isVerifying || otp.length !== 6 ? 0.6 : 1,
                        cursor:
                          isVerifying || otp.length !== 6
                            ? "not-allowed"
                            : "pointer",
                      }}
                      className="rounded-md font-medium transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1977F3] focus-visible:ring-opacity-50"
                    >
                      {isVerifying ? "Verifying..." : "Login"}
                    </Button>
                    <div className="flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
                      <Button
                        variant="ghost"
                        style={{ color: "#1977F3", padding: 0 }}
                        className="h-auto px-0 py-0 hover:bg-transparent hover:opacity-70 transition-opacity"
                        onClick={reset}
                      >
                        Change number
                      </Button>
                      <Button
                        style={{
                          backgroundColor:
                            isSending || countdown > 0
                              ? "transparent"
                              : "transparent",
                          color:
                            isSending || countdown > 0 ? "#1977F3" : "#1977F3",
                          borderColor: "#1977F3",
                          opacity: isSending || countdown > 0 ? 0.5 : 1,
                          cursor:
                            isSending || countdown > 0
                              ? "not-allowed"
                              : "pointer",
                        }}
                        className="h-auto border px-2 py-1 rounded-md font-medium transition-opacity hover:opacity-80"
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
