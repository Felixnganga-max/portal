import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SimulationAuthProvider } from "./context/SimulationAuthContext";
import DashboardShell from "./components/layouts/DashboardShell";
import SimulationShell from "./components/simulation/SimulationShell";
import Login from "./pages/Login";
import Placeholder from "./pages/Placeholder";
import Simulation from "./pages/Simulation";
import WebApplications from "./pages/admin/WebApplications";

import AdminHome from "./pages/admin/Home";
import StudentsList from "./pages/admin/StudentsList";
import StudentDetail from "./pages/admin/StudentDetail";
import FeeStructures from "./pages/admin/FeeStructures";
import ArrearsReport from "./pages/admin/ArrearsReport";
import Programs from "./pages/admin/Programs";
import ProgramDetail from "./pages/admin/ProgramDetail";
import Units from "./pages/admin/Units";
import UnitDetail from "./pages/admin/UnitDetail";
import UnitAssignment from "./pages/admin/UnitAssignment";
import Semesters from "./pages/admin/Semesters";
import AdminResults from "./pages/admin/AdminResults";
import RegistrationRequests from "./pages/admin/RegistrationRequests";

import FinanceHome from "./pages/finance/Home";
import InstructorHome from "./pages/instructor/Home";
import PostPayment from "./pages/finance/PostPayment";
import Ledgers from "./pages/finance/Ledgers";
import Waivers from "./pages/finance/Waivers";
import HelbUpdate from "./pages/finance/HelbUpdate";
import Results from "./pages/instructor/Results";
import Assignments from "./pages/instructor/Assignments";
import Attendance from "./pages/instructor/Attendance";
import Materials from "./pages/instructor/Materials";
import Admissions from "./pages/admin/Admissions";
import Promotion from "./pages/admin/Promotions";
import AdminAttachment from "./pages/admin/Attachment";
import InstructorAttachment from "./pages/instructor/Attachment";
import StudentAttachment from "./pages/student/Attachment";
import StudentAssignments from "./pages/student/Assignments";
import StudentMaterials from "./pages/student/Materials";
import Funding from "./pages/student/Funding";
import Grades from "./pages/student/Grades";

import StudentHome from "./pages/student/Home";
import StudentUnits from "./pages/student/Units";
import RegisterUnits from "./pages/student/RegisterUnits";
import UnitHistory from "./pages/student/UnitHistory";
import StudentFinance from "./pages/student/Finance";

// Only the matching role gets in; anyone else is sent to their own home.
const RequireAuth = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={`/${user.role}/home`} replace />;
  return children;
};

const guarded = (role) => (
  <RequireAuth role={role}>
    <DashboardShell />
  </RequireAuth>
);

// Public counterpart to guarded(): no auth check, seeds a fixed demo user
// for the role instead. Used only under /simulation/*.
const simulated = (role) => (
  <SimulationAuthProvider role={role}>
    <SimulationShell />
  </SimulationAuthProvider>
);

const ph = (title) => <Placeholder title={title} />;

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Public product demo — no auth, mock data only */}
      <Route path="/simulation" element={<Simulation />} />

      <Route element={simulated("admin")}>
        <Route
          path="/simulation/admin/home"
          element={ph("Admin home (demo)")}
        />
        <Route
          path="/simulation/admin/students"
          element={ph("All students (demo)")}
        />
        <Route
          path="/simulation/admin/students/admissions"
          element={ph("Admissions (demo)")}
        />
        <Route
          path="/simulation/admin/finance/ledgers"
          element={ph("Student ledgers (demo)")}
        />
        <Route
          path="/simulation/admin/finance/arrears"
          element={ph("Arrears report (demo)")}
        />
        <Route
          path="/simulation/admin/finance/waivers"
          element={ph("Waivers (demo)")}
        />
        <Route
          path="/simulation/admin/results"
          element={ph("Results (demo)")}
        />
      </Route>

      <Route element={simulated("instructor")}>
        <Route
          path="/simulation/instructor/home"
          element={ph("Instructor home (demo)")}
        />
        <Route
          path="/simulation/instructor/assignments"
          element={ph("Assignments (demo)")}
        />
        <Route
          path="/simulation/instructor/attendance"
          element={ph("Attendance (demo)")}
        />
        <Route
          path="/simulation/instructor/grades"
          element={ph("Results (demo)")}
        />
        <Route
          path="/simulation/instructor/enrolment"
          element={ph("Enrolment (demo)")}
        />
      </Route>

      <Route element={simulated("finance")}>
        <Route
          path="/simulation/finance/home"
          element={ph("Finance home (demo)")}
        />
        <Route
          path="/simulation/finance/payments"
          element={ph("Post payment (demo)")}
        />
        <Route
          path="/simulation/finance/ledgers"
          element={ph("Student ledgers (demo)")}
        />
        <Route
          path="/simulation/finance/arrears"
          element={ph("Arrears report (demo)")}
        />
        <Route
          path="/simulation/finance/waivers"
          element={ph("Waivers (demo)")}
        />
      </Route>

      <Route element={simulated("student")}>
        <Route
          path="/simulation/student/home"
          element={ph("Student home (demo)")}
        />
        <Route path="/simulation/student/units" element={ph("Units (demo)")} />
        <Route
          path="/simulation/student/grades"
          element={ph("Transcript (demo)")}
        />
        <Route
          path="/simulation/student/finance"
          element={ph("My fees (demo)")}
        />
        <Route
          path="/simulation/student/funding"
          element={ph("Funding & HELB (demo)")}
        />
      </Route>

      {/* Admin */}
      <Route element={guarded("admin")}>
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/students" element={<StudentsList />} />
        <Route path="/admin/students/:id" element={<StudentDetail />} />
        <Route path="/admin/students/admissions" element={<Admissions />} />
        <Route path="/admin/students/promotion" element={<Promotion />} />
        <Route path="/admin/instructors" element={ph("Instructors")} />
        <Route path="/admin/programs" element={<Programs />} />
        <Route path="/admin/programs/:id" element={<ProgramDetail />} />
        <Route path="/admin/units" element={<Units />} />
        <Route path="/admin/units/:id" element={<UnitDetail />} />
        <Route path="/admin/units/assignment" element={<UnitAssignment />} />
        <Route path="/admin/semesters" element={<Semesters />} />
        <Route
          path="/admin/registration/windows"
          element={<WebApplications />}
        />
        <Route
          path="/admin/registration/windows"
          element={ph("Registration windows")}
        />
        <Route
          path="/admin/registration/manual"
          element={ph("Force register / drop")}
        />
        <Route
          path="/admin/registration/requests"
          element={<RegistrationRequests />}
        />
        <Route path="/admin/finance/structures" element={<FeeStructures />} />
        <Route path="/admin/finance/ledgers" element={ph("Student ledgers")} />
        <Route path="/admin/finance/arrears" element={<ArrearsReport />} />
        <Route path="/admin/finance/waivers" element={ph("Waivers")} />
        <Route path="/admin/finance/helb" element={ph("HELB bulk update")} />
        <Route path="/admin/attachment" element={<AdminAttachment />} />
        <Route path="/admin/results" element={<AdminResults />} />
        <Route path="/admin/discussions" element={ph("Discussions")} />
        <Route path="/admin/reports" element={ph("Reports")} />
        <Route path="/admin/settings" element={ph("Settings")} />
      </Route>

      {/* Finance office */}
      <Route element={guarded("finance")}>
        <Route path="/finance/home" element={<FinanceHome />} />
        <Route path="/finance/payments" element={<PostPayment />} />
        <Route path="/finance/ledgers" element={<Ledgers />} />
        <Route path="/finance/arrears" element={<ArrearsReport />} />
        <Route path="/finance/structures" element={<FeeStructures />} />
        <Route path="/finance/waivers" element={<Waivers />} />
        <Route path="/finance/helb" element={<HelbUpdate />} />
        <Route path="/finance/settings" element={ph("Settings")} />
      </Route>

      {/* Department teachers */}
      <Route element={guarded("instructor")}>
        <Route path="/instructor/home" element={<InstructorHome />} />
        <Route path="/instructor/units" element={ph("My units")} />
        <Route path="/instructor/assignments" element={<Assignments />} />
        <Route path="/instructor/enrolment" element={<Admissions />} />
        <Route
          path="/instructor/attachment"
          element={<InstructorAttachment />}
        />
        <Route path="/instructor/attendance" element={<Attendance />} />
        <Route path="/instructor/grades" element={<Results />} />
        <Route path="/instructor/materials" element={<Materials />} />
        <Route path="/instructor/discussions" element={ph("Discussions")} />
        <Route path="/instructor/settings" element={ph("Settings")} />
      </Route>

      {/* Student */}
      <Route element={guarded("student")}>
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/student/units" element={<StudentUnits />} />
        <Route path="/student/units/register" element={<RegisterUnits />} />
        <Route path="/student/units/history" element={<UnitHistory />} />
        <Route path="/student/grades" element={<Grades />} />
        <Route path="/student/funding" element={<Funding />} />
        <Route path="/student/finance" element={<StudentFinance />} />
        <Route path="/student/attachment" element={<StudentAttachment />} />
        <Route path="/student/materials" element={<StudentMaterials />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/discussions" element={ph("Discussions")} />
        <Route path="/student/settings" element={ph("Settings")} />
      </Route>

      <Route
        path="/"
        element={
          <Navigate to={user ? `/${user.role}/home` : "/login"} replace />
        }
      />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
