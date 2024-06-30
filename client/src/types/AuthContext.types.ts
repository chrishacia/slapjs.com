export interface AuthContextProps {
    isAuthenticated: boolean;
    accessToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateToken: (accessToken: string | null, refreshToken: string | null) => Promise<void>;
    refreshAccessToken: (refreshToken: string | null) => Promise<boolean>;
    userId: string | null;
}

export interface AuthProviderProps {
    children: React.ReactNode;
}
