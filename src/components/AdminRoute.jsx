import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

/**
 * Admin-only route guard.
 * Checks role, app_role, or is_admin for administrator privilege.
 */
export default function AdminRoute() {
  const { user: contextUser } = useAuth();
  const [user, setUser] = useState(contextUser);
  const [loading, setLoading] = useState(!contextUser);

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setLoading(false);
      return;
    }

    const storedUserStr = localStorage.getItem('studyquest_user');
    let storedUser = null;
    try {
      if (storedUserStr) storedUser = JSON.parse(storedUserStr);
    } catch {}

    base44.auth.me()
      .then((u) => setUser(u || storedUser))
      .catch(() => setUser(storedUser))
      .finally(() => setLoading(false));
  }, [contextUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin" || user?.app_role === "admin" || user?.is_admin === true;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}