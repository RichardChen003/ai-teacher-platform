import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import Syllabus from "./pages/Syllabus";
import Classroom from "./pages/Classroom";
import ClassroomAll from "./pages/ClassroomAll";
import ClassroomPersonalized from "./pages/ClassroomPersonalized";
import ClassroomFull from "./pages/ClassroomFull";
import ClassroomRemedial from "./pages/ClassroomRemedial";
import KnowledgePointDetail from "./pages/KnowledgePointDetail";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./lib/auth";

/** 受保护页面包装：未登录一律重定向到登录页 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          正在进入学习空间…
        </div>
      </div>
    );
  }
  if (status === "guest") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** 登录/注册页包装：已登录用户访问登录页时直接进主页 */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === "authed") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/diagnosis" element={<Diagnosis />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/classroom" element={<Classroom />} />
        <Route path="/classroom/all" element={<ClassroomAll />} />
        <Route path="/classroom/personalized" element={<ClassroomPersonalized />} />
        <Route path="/classroom/personalized/full" element={<ClassroomFull />} />
        <Route path="/classroom/personalized/full/:subject/:grade/:index" element={<KnowledgePointDetail />} />
        <Route path="/classroom/personalized/remedial" element={<ClassroomRemedial />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
