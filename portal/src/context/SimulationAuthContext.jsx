import { createContext, useContext } from "react";
import { institution, students, departments } from "../lib/mockData";

const SimulationAuthContext = createContext(null);

// Fixed demo users per role, same shape as the real AuthContext's `user`,
// so the forked shell/sidebar/topbar need no special-casing. Sourced
// straight from mockData.js — nothing here touches the real API.
const demoUsers = {
  admin: {
    role: "admin",
    fullName: "Demo Admin",
    institution,
  },
  instructor: {
    role: "instructor",
    fullName: "Demo Instructor",
    institution,
    department: departments[0],
  },
  finance: {
    role: "finance",
    fullName: "Demo Finance Officer",
    institution,
  },
  student: {
    role: "student",
    fullName: students[0].fullName,
    institution,
    department: departments.find((d) => d.code === students[0].dept),
  },
};

export const SimulationAuthProvider = ({ role, children }) => (
  <SimulationAuthContext.Provider value={{ user: demoUsers[role] }}>
    {children}
  </SimulationAuthContext.Provider>
);

export const useSimAuth = () => useContext(SimulationAuthContext);
