import { useEffect } from "react";
import { useLocation } from "@/lib/router-compat";
import { captureAffiliateRef } from "@/lib/affiliate";

/** Captures ?ref=CODE on every navigation, stores cookie 30d, logs click. */
export const AffiliateTracker = () => {
  const location = useLocation();
  useEffect(() => {
    if (new URLSearchParams(location.search).has("ref")) {
      captureAffiliateRef();
    }
  }, [location.search, location.pathname]);
  return null;
};
