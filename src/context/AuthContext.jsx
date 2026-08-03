import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("kunash_auth") === "true"
  );
  const [admin, setAdmin] = useState(() => {
    const stored = sessionStorage.getItem("kunash_admin");
    if (!stored || stored === "undefined") return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const markLoggedIn = (profile) => {
    // profile = { mobile, adminId, role } from the login response body
    sessionStorage.setItem("kunash_auth", "true");
    sessionStorage.setItem("kunash_admin", JSON.stringify(profile));
    setIsAuthenticated(true);
    setAdmin(profile);
  };

  const markLoggedOut = () => {
    sessionStorage.removeItem("kunash_auth");
    sessionStorage.removeItem("kunash_admin");
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, markLoggedIn, markLoggedOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);