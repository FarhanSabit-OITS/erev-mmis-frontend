// components/auth/protected-route.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'STAKEHOLDER';
  requiredPermission?: string;
  requiredAdminLevel?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  requiredAdminLevel,
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard if role doesn't match
        router.push(user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard');
      } else if (requiredAdminLevel && user.adminLevel !== requiredAdminLevel) {
        // Redirect based on admin level
        router.push('/dashboard');
      } else if (requiredPermission && !hasPermission(requiredPermission, 'READ')) {
        // Redirect if doesn't have required permission
        router.push('/dashboard/unauthorized');
      }
    }
  }, [user, isLoading, requiredRole, requiredAdminLevel, requiredPermission, router, hasPermission]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

// Example usage in a page:
// app/dashboard/admin/page.tsx
/*
import ProtectedRoute from '@/components/auth/protected-route';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" requiredAdminLevel="MARKET_MASTER">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
*/