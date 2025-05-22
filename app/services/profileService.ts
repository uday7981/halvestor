import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

// Helper function to create a new user profile
async function createNewUserProfile(user: User) {
  try {
    console.log('Creating new profile for user:', user.id);
    
    // Get user metadata
    const metadata = user.user_metadata;
    const firstName = metadata?.full_name ? metadata.full_name.split(' ')[0] : '';
    const lastName = metadata?.full_name ? metadata.full_name.split(' ').slice(1).join(' ') : '';
    
    try {
      // First check if profile already exists to avoid duplicate key errors
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (existingProfile) {
        console.log('Profile already exists, using existing profile');
        return {
          profile: existingProfile,
          error: null
        };
      }
      
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            cash_balance: 500, // Default cash balance
            first_login: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      
      if (insertError) {
        // If it's a duplicate key error, try to fetch the existing profile
        if (insertError.code === '23505') { // PostgreSQL duplicate key error code
          console.log('Profile already exists (duplicate key), fetching existing profile');
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (existingProfile) {
            return {
              profile: existingProfile,
              error: null
            };
          }
        }
        
        console.error('Error creating profile:', insertError.message);
        return { 
          profile: null, 
          error: 'Unable to create profile. Please try again later.' 
        };
      }
      
      return { 
        profile: newProfile, 
        error: null 
      };
    } catch (error: any) {
      // One last attempt to get the profile if creation failed
      if (error.message?.includes('duplicate key')) {
        console.log('Caught duplicate key error, attempting to fetch existing profile');
        const { data: fallbackProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (fallbackProfile) {
          return {
            profile: fallbackProfile,
            error: null
          };
        }
      }
      
      return {
        profile: null,
        error: 'Error creating profile: ' + (error.message || 'Unknown error')
      };
    }
  } catch (error: any) {
    console.error('Exception during profile creation:', error);
    return {
      profile: null,
      error: 'Exception during profile creation: ' + (error.message || 'Unknown error')
    };
  }
}

// Get user profile including cash balance
export const getUserProfile = async () => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('Auth error when fetching user:', userError.message);
      return { profile: null, error: 'Authentication error' };
    }
    
    if (!userData.user) {
      console.log('No authenticated user found');
      return { profile: null, error: null }; // Not an error, just no user logged in
    }
    
    // Get profile data from profiles table
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .limit(1)
        .maybeSingle();
      
      if (profileError) {
        // Log the error but don't throw it to the UI in production
        console.error('Error fetching profile:', profileError.message);
        
        // For specific known errors, we can handle them gracefully
        if (profileError.code === 'PGRST116') {
          // This is the "JSON object requested, multiple (or no) rows returned" error
          // We'll treat this as if no profile was found and create one
          console.log('No profile found or multiple profiles returned, will attempt to create one');
          return await createNewUserProfile(userData.user);
        }
        
        // For other errors, return a generic error message
        return { 
          profile: null, 
          error: 'Unable to retrieve profile. Please try again later.' 
        };
      }
      
      // If profile doesn't exist, create one
      if (!profileData) {
        // Use the helper function to create a new profile
        return await createNewUserProfile(userData.user);
      }
      
      // If we have a profile, return it
      return { 
        profile: profileData, 
        error: null 
      };
    } catch (error: any) {
      // Handle any errors that might have occurred during profile fetching
      console.error('Error in profile fetching process:', error);
      return {
        profile: null,
        error: 'Error retrieving profile: ' + (error.message || 'Unknown error')
      };
    }
  } catch (error: any) {
    // Handle any unexpected errors
    console.error('Unexpected error in getUserProfile:', error);
    return {
      profile: null,
      error: 'An unexpected error occurred: ' + (error.message || 'Unknown error')
    };
  }
};

// Format currency for display
export const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Update user's cash balance directly
 */
export const updateCashBalance = async (amount: number): Promise<{ success: boolean, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    console.log('Updating cash balance for user:', userId, 'to amount:', amount);
    
    // Update the cash balance directly
    const { error } = await supabase
      .from('profiles')
      .update({ cash_balance: amount })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating cash balance:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception updating cash balance:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
