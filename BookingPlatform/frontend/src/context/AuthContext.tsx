import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthService } from "../api/auth.api";
import type { User, LoginRequest, RegisterRequest } from "../types/auth.types";


interface AuthContextType {
    user: User | null;
    login: (request: LoginRequest) => Promise<void>;
    register: (request: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only restore user info from localStorage (not tokens - they're in cookies)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await AuthService.login(credentials);
            const { user } = response.data;
            // Only store user info, tokens are in HTTP-only cookies
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Re-throw so caller can handle it
        }
    };

    const register = async (userData: RegisterRequest) => {
        try {
            const response = await AuthService.register(userData);
            const { user } = response.data;
            // Only store user info, tokens are in HTTP-only cookies
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
        } catch (error) {
            console.error('Register failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

