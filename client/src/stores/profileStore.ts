import { create } from "zustand";
import { getProfileByUserId } from "../api/authApi";

type ProfileUser = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  aadhar: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileState = {
  profile: ProfileUser | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: (userId: string) => Promise<void>;
  clearProfile: () => void;
};

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load profile";
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  loadProfile: async (userId: string) => {
    if (!userId) {
      set({ error: "No active login session found.", isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await getProfileByUserId(userId);
      set({ profile: data.user, isLoading: false, error: null });
    } catch (error) {
      set({ profile: null, isLoading: false, error: toErrorMessage(error) });
    }
  },
  clearProfile: () => set({ profile: null, isLoading: false, error: null }),
}));
