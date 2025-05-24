import { supabase } from '../config/supabase';
import { AuthError } from '@supabase/supabase-js';

type ErrorWithMessage = {
  message: string;
};

// Email sign up with first name, last name and country
export const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string, country: string = 'United Kingdom') => {
  try {
    console.log('Starting signup process for:', email);
    
    // Step 1: Sign up the user with metadata
    const signUpResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          country: country,
        },
      },
    });
    
    console.log('Signup response received');
    
    // Check for errors in the signup response
    if (signUpResponse.error) {
      console.error('Signup error:', signUpResponse.error.message);
      throw signUpResponse.error;
    }
    
    const data = signUpResponse.data;
    console.log('User created with ID:', data?.user?.id);
    
    // We'll skip profile creation here and do it during email verification
    // This ensures the user has a valid session when creating the profile
    
    console.log('Signup process completed successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Exception during signup process:', error);
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred during signup'
      } as ErrorWithMessage 
    };
  }
};

// Email sign in
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Starting sign in process for:', email);
    
    const signInResponse = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Sign in response received');
    
    if (signInResponse.error) {
      console.error('Sign in error:', signInResponse.error.message);
      return { data: null, error: signInResponse.error };
    }
    
    console.log('Sign in successful');
    return { data: signInResponse.data, error: null };
  } catch (error) {
    console.error('Exception during sign in process:', error);
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred during sign in'
      } as ErrorWithMessage 
    };
  }
};

// Verify OTP
export const verifyOTP = async (email: string, token: string) => {
  try {
    console.log('Starting OTP verification for:', email);
    
    const verifyResponse = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    
    console.log('OTP verification response received');
    
    if (verifyResponse.error) {
      console.error('OTP verification error:', verifyResponse.error.message);
      return { data: null, error: verifyResponse.error };
    }
    
    // After successful verification, ensure the user has a profile
    // This is the main place we create the profile since the user now has a valid session
    try {
      // Wait a moment to ensure the session is fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user?.id) {
        console.log('Creating profile after verification for user:', userData.user.id);
        
        // Get user metadata
        const firstName = userData.user.user_metadata?.first_name || 'New';
        const lastName = userData.user.user_metadata?.last_name || 'User';
        const country = userData.user.user_metadata?.country || 'United Kingdom';
        
        console.log('User metadata for profile creation:', {
          firstName,
          lastName,
          country,
          userId: userData.user.id
        });
        
        // First check if a profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();
          
        // Only log non-PGRST116 errors as actual errors
        // PGRST116 means "no rows found" which is expected for new users
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking for existing profile during verification:', checkError.message);
        }
        
        if (!existingProfile) {
          // Try with the service role client if available
          // If using the service role isn't an option, we'll use the regular client
          // and rely on the updated RLS policy
          
          // Profile doesn't exist, create it
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userData.user.id,
              first_name: firstName,
              last_name: lastName,
              country: country,
              cash_balance: 500.00, // Explicitly set cash balance to 500
              first_login: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (profileError) {
            // Check if it's a duplicate key error, which is actually fine (means profile already exists)
            if (profileError.code === '23505') { // PostgreSQL duplicate key error
              console.log('Profile already exists (duplicate key), continuing with verification');
            } else {
              // Only log non-duplicate key errors as actual errors
              console.log('Profile creation during verification had an issue:', profileError.message);
              
              // Don't fail the verification process
              console.log('Continuing verification process despite profile creation issue');
            }
          } else {
            console.log('Profile created successfully during verification with cash balance: 500.00');
          }
        } else {
          console.log('Profile already exists for user, skipping creation during verification');
        }
        
        // Update user metadata to ensure first_name and last_name are set
        const updateResponse = await supabase.auth.updateUser({
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        });
        
        if (updateResponse.error) {
          console.error('Error updating user metadata during verification:', updateResponse.error.message);
        } else {
          console.log('User metadata updated successfully during verification');
        }
      }
    } catch (profileError) {
      console.error('Error creating profile during verification:', profileError);
      // Continue despite profile creation error
    }
    
    console.log('OTP verification successful');
    return { data: verifyResponse.data, error: null };
  } catch (error) {
    console.error('Exception during OTP verification:', error);
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred during OTP verification'
      } as ErrorWithMessage 
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as AuthError | ErrorWithMessage };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  } catch (error) {
    return { user: null, error: error as AuthError | ErrorWithMessage };
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process');
    
    // For production TestFlight build
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'halvestor://auth/callback',
        scopes: 'email profile', // Request email and profile info
        skipBrowserRedirect: true, // Important for mobile apps
      },
    });
    
    if (error) {
      console.error('Google sign-in error:', error.message);
      return { data: null, error };
    }
    
    if (!data?.url) {
      console.error('No URL returned for Google sign-in');
      return { 
        data: null, 
        error: { message: 'No URL returned for Google sign-in' } as ErrorWithMessage 
      };
    }
    
    // Add a timestamp parameter to avoid caching issues
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${data.url}&_t=${timestamp}`;
    
    console.log('Google sign-in URL generated:', urlWithTimestamp);
    return { data: { ...data, url: urlWithTimestamp }, error: null };
  } catch (error) {
    console.error('Exception during Google sign-in:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : { message: 'An unknown error occurred' } as ErrorWithMessage 
    };
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (url: string) => {
  try {
    console.log('Handling OAuth callback URL:', url);
    
    // Extract the parameters from the URL
    if (url.includes('#')) {
      const params = new URLSearchParams(url.split('#')[1]);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        console.log('Access token found in callback URL');
        
        // Set the session using the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error('Error setting session:', error.message);
          return { data: null, error };
        }
        
        console.log('Session set successfully');
        return { data, error: null };
      }
    }
    
    console.error('No tokens found in callback URL');
    return { 
      data: null, 
      error: { message: 'No tokens found in callback URL' } as ErrorWithMessage 
    };
  } catch (error) {
    console.error('Exception during OAuth callback handling:', error);
    return { 
      data: null, 
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred during OAuth callback handling'
      } as ErrorWithMessage 
    };
  }
};
