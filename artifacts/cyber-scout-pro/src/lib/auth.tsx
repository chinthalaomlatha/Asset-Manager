import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react/src/custom-fetch";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("csp_token");
  });
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  // Set the global token getter
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("csp_token"));
  }, []);

  const { data: meData, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
  }, [meData]);

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("csp_token", newToken);
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("csp_token");
    setTokenState(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {isLoading ? (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-primary">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <div className="font-mono text-sm tracking-widest uppercase">INITIALIZING SCIF UPLINK...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
