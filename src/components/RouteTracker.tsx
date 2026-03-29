import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LAST_ROUTE_KEY = 'last_valid_route';
// Routes that should NOT be saved as "last valid"
const EXCLUDED = new Set(['/404']);

export function RouteTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!EXCLUDED.has(pathname)) {
      localStorage.setItem(LAST_ROUTE_KEY, pathname);
    }
  }, [pathname]);

  return null;
}
