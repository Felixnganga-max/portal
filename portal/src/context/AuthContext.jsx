import { createContext, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/api";

// DEV ONLY: while true, the dashboard opens without logging in, and the
// dev user's role follows the URL (/student/..., /finance/..., /instructor/...,
// anything else = admin) so you can preview all four dashboards.
// Set to false to bring login enforcement back.
const BYPASS_AUTH = true;

const devUsers = {
  admin: { fullName: "Dev Admin", role: "admin" },
  finance: { fullName: "Dev Finance Officer", role: "finance" },
  instructor: {
    fullName: "Dev Teacher",
    role: "instructor",
    department: { name: "Department of Business", code: "BUS" },
  },
  student: { fullName: "Dev Student", role: "student" },
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async ({ email, password, institutionSlug }) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
      institutionSlug,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const { pathname } = useLocation();
  const devRole = pathname.split("/")[1];
  const devUser = {
    ...(devUsers[devRole] || devUsers.admin),
    institution: { name: "Demo College" },
  };

  // A real logged-in user always wins over the dev user.
  const effectiveUser = user || (BYPASS_AUTH ? devUser : null);

  return (
    <AuthContext.Provider value={{ user: effectiveUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
