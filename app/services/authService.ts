import { supabase } from '../config/supabase';
import { AuthError } from '@supabase/supabase-js';

type ErrorWithMessage = {
  message: string;
};

// Email sign up with first name and last name
export const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    console.log('Starting signup process for:', email);
    
    // Simple signup approach with minimal options
    const signUpResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
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
    
    // Create a profile entry for the user if we have a user ID
    if (data?.user?.id) {
      console.log('Creating profile for user:', data.user.id);
      
      try {
        const profileResponse = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            cash_balance: 500.00,
            first_login: true,
            created_at: new Date().toISOString(),
          });
        
        if (profileResponse.error) {
          console.error('Profile creation error:', profileResponse.error.message);
          console.warn('Continuing despite profile creation error');
        } else {
          console.log('Profile created successfully');
        }
      } catch (profileError) {
        console.error('Exception during profile creation:', profileError);
        console.warn('Continuing despite profile creation exception');
      }
    }
    
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

    return { profile: data, error };
  } catch (error) {
    return { profile: null, error: error as AuthError | ErrorWithMessage };
  }
};
