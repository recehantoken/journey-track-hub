
import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async (email: string, password: string) => {
  try {
    // Create the user
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Admin User',
        },
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    // Make sure the profile record exists with admin role
    if (userData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          full_name: 'Admin User',
          role: 'admin'
        });

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    return userData;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};
