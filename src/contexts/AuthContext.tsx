import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { name: string; role: string } | null;
  login: (id: string, password: string) => boolean;
  adminLogin: (password: string) => boolean;
  logout: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const login = (id: string, password: string) => {
    // Demo login - will be replaced with Supabase
    if (id && password) {
      setIsAuthenticated(true);
      setUser({ name: id, role: "Opérateur" });
      return true;
    }
    return false;
  };

  const adminLogin = (password: string) => {
    // Demo admin - will be replaced with Supabase
    if (password === "admin") {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, adminLogin, logout, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
