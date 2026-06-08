import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

/**
 * Returns true if the current user is an admin — either via
 * the built-in auth role OR via UserProfile.role_type === 'Admin'.
 */
export function useIsAdmin() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ auth_user_id: user.id }),
    enabled: !!user?.id,
    select: (data) => data?.[0] ?? null,
    staleTime: 60_000,
  });

  if (!user) return false;
  if (user.role === 'admin') return true;
  if (profile?.role_type === 'Admin') return true;
  return false;
}