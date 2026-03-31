import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("medVisionToken");
  const role = localStorage.getItem("medVisionUserType");

  // If already logged in → redirect to dashboard
  if (token) {
    if (role === "admin") return <Navigate to="/admindashboard" replace />;
    if (role === "store") return <Navigate to="/storeDashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;