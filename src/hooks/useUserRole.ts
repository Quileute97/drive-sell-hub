import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'seller' | 'buyer' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (userRoles && userRoles.length > 0) {
          // Prioritize admin role
          if (userRoles.some(r => r.role === 'admin')) {
            setRole('admin');
          } else if (userRoles.some(r => r.role === 'seller')) {
            setRole('seller');
          } else {
            setRole('buyer');
          }
        } else {
          setRole('buyer');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole(null);
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

  return { role, loading, isAdmin: role === 'admin', isSeller: role === 'seller' };
};
