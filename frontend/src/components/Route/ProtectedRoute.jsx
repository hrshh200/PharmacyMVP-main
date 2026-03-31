import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("medVisionToken");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "admin") return <Navigate to="/admindashboard" replace />;
    if (user?.role === "Store") return <Navigate to="/storeDashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;