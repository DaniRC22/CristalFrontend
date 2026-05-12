import { create } from 'zustand';

const SESSION_KEY = 'admin_session';

interface AuthState {
  token: string | null;
  email: string | null;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const loadSession = (): { token: string | null; email: string | null } => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { token: null, email: null };
  } catch {
    return { token: null, email: null };
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadSession(),
  setAuth: (token, email) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, email }));
    set({ token, email });
  },
  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    set({ token: null, email: null });
  },
  isAuthenticated: () => !!get().token,
}));
