import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/**
 * Role-based route guard.
 * allowedRoles = array of roles permitted to access the wrapped routes.
 * Allows parents with an active child session to access student dashboard routes.
 */
export default function RoleRoute({ allowedRoles }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.app_role || user?.role;
  const isAdmin = user?.role === "admin" || user?.app_role === "admin" || user?.is_admin === true;

  // No role set yet — send to RoleSetup unless admin
  if (!isAdmin && (!role || !["student", "parent"].includes(role))) {
    return <Navigate to="/role-setup" replace />;
  }

  // Check if parent has selected an active child profile
  const hasActiveChildSession = Boolean(
    localStorage.getItem("active_child_session") ||
    localStorage.getItem("selected_child_id")
  );

  // Permit access if role matches OR if parent is operating in active child session mode OR user is admin
  const isAllowed =
    isAdmin ||
    allowedRoles.includes(role) ||
    (role === "parent" && allowedRoles.includes("student") && hasActiveChildSession);

  if (!isAllowed) {
    return <Navigate to={role === "parent" || isAdmin ? "/parent" : "/"} replace />;
  }

  return <Outlet />;
}