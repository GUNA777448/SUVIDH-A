import { create } from "zustand";
import {
  AuthApiError,
  requestOtp,
  verifyOtp as verifyOtpApi,
} from "../api/authApi";

type AuthStep = "mobile" | "otp" | "success";

type AuthState = {
  step: AuthStep;
  mobile: string;
  otp: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    gmail: string;
    aadharnumber: string;
    consumer_id: string;
    created_at: string;
  } | null;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  countdown: number;
  setMobile: (mobile: string) => void;
  setOtp: (otp: string) => void;
  sendOtp: () => Promise<void>;
  verifyOtp: () => Promise<void>;
  resendOtp: () => Promise<void>;
  reset: () => void;
  tick: () => void;
};

function toErrorMessage(error: unknown) {
  if (error instanceof AuthApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  step: "mobile",
  mobile: "",
  otp: "",
  user: null,
  isSending: false,
  isVerifying: false,
  error: null,
  countdown: 0,
  setMobile: (mobile) => set({ mobile, error: null }),
  setOtp: (otp) => set({ otp, error: null }),
  sendOtp: async () => {
    const mobile = get().mobile.trim();
    if (!/^\d{10}$/.test(mobile)) {
      set({ error: "Enter a valid 10-digit mobile number." });
      return;
    }

    set({ isSending: true, error: null });

    try {
      await requestOtp({
        identifier: "mobile",
        value: mobile,
      });

      set({ isSending: false, step: "otp", countdown: 30, otp: "" });
    } catch (error) {
      set({
        isSending: false,
        error: toErrorMessage(error),
      });
    }
  },
  verifyOtp: async () => {
    const { otp, mobile } = get();
    if (otp.length !== 6) {
      set({ error: "Enter the 6-digit OTP." });
      return;
    }

    set({ isVerifying: true, error: null });

    try {
      const data = await verifyOtpApi({
        identifier: "mobile",
        value: mobile,
        otp,
      });

      set({
        isVerifying: false,
        step: "success",
        error: null,
        user: data.user,
      });
    } catch (error) {
      set({
        isVerifying: false,
        error: toErrorMessage(error),
      });
    }
  },
  resendOtp: async () => {
    const { countdown, mobile } = get();
    if (countdown > 0) {
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      set({ error: "Enter a valid 10-digit mobile number." });
      return;
    }

    set({ isSending: true, error: null });

    try {
      await requestOtp({
        identifier: "mobile",
        value: mobile,
      });
      set({ isSending: false, countdown: 30, otp: "" });
    } catch (error) {
      set({ isSending: false, error: toErrorMessage(error) });
    }
  },
  reset: () =>
    set({
      step: "mobile",
      mobile: "",
      otp: "",
      error: null,
      countdown: 0,
      isSending: false,
      isVerifying: false,
      user: null,
    }),
  tick: () => {
    const countdown = get().countdown;
    if (countdown > 0) {
      set({ countdown: countdown - 1 });
    }
  },
}));
