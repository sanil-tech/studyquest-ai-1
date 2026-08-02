import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const userRole = user?.app_role || user?.role;

  // Admin — go to Admin Dashboard
  if (user?.role === "admin" || user?.app_role === "admin" || user?.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  // No role set — go to RoleSetup
  if (!userRole || !["student", "parent", "pelajar"].includes(userRole)) {
    return <Navigate to="/role-setup" replace />;
  }

  // Redirect based on role
  return <Navigate to={userRole === "parent" ? "/parent" : "/dashboard"} replace />;
}