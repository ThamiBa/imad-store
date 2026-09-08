import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
    accessToken: string | null;
    refreshToken: string | null;
    user: { id: string; email: string; firstName: string; lastName: string; role: string } | null;
    setTokens: (access: string, refresh: string) => void;
    setUser: (user: AuthStore["user"]) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
            setUser: (user) => set({ user }),
            logout: () => set({ accessToken: null, refreshToken: null, user: null }),
            isAuthenticated: () => !!get().accessToken,
        }),
        { name: "imad-store-auth" }
    )
);
