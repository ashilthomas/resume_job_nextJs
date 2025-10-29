"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "candidate" | "recruiter";

export function useRequireRole(requiredRole: Role) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    
    async function checkRole() {
      try {
        const res = await fetch('/api/user/role');
        if (!res.ok) {
          if (!cancelled) router.push('/');
          return;
        }
        
        const data = await res.json();
        if (!cancelled) {
          if (data.role === requiredRole) {
            setAuthorized(true);
          } else {
            router.push('/');
            return;
          }
        }
      } catch {
        if (!cancelled) router.push('/');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    checkRole();
    return () => { cancelled = true; };
  }, [requiredRole, router]);

  return { loading, authorized };
}