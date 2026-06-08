import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

// Routes accessible to all users (non-admins)
const PUBLIC_ROUTES = ["/my-profile", "/jira-issues", "/feature-releases"];

export default function RouteGuard() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (isAdmin) return;

    const isAllowed = PUBLIC_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r + "/"));
    if (!isAllowed) {
      navigate("/my-profile", { replace: true });
    }
  }, [user, isAdmin, location.pathname, navigate]);

  return null;
}