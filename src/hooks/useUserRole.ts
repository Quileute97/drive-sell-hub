import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'seller' | 'buyer' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [roles, setRoles] = useState<Exclude<UserRole, null>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setRole(null);
          setRoles([]);
          setLoading(false);
          return;
        }

        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (userRoles && userRoles.length > 0) {
          const roleList = userRoles
            .map((r) => r.role)
            .filter((r): r is Exclude<UserRole, null> => r === 'admin' || r === 'seller' || r === 'buyer');
          setRoles(roleList);

          // Prioritize display role while keeping full roles list for permissions
          if (roleList.includes('admin')) {
            setRole('admin');
          } else if (roleList.includes('seller')) {
            setRole('seller');
          } else {
            setRole('buyer');
          }
        } else {
          setRoles(['buyer']);
          setRole('buyer');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole(null);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = roles.includes('admin') || role === 'admin';
  // Admin accounts also have full access to the Seller Dashboard and selling tools
  const isSeller = roles.includes('seller') || isAdmin;

  return { role, roles, loading, isAdmin, isSeller };
};
