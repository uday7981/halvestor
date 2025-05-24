import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUserProfile } from '../services/profileService';
import { getCurrentUser } from '../services/authService';

// Define the shape of our user profile data
type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  cash_balance: number;
  first_login: boolean;
  created_at: string;
  updated_at: string;
};

// Define the context type
type UserContextType = {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
  forceRefreshUserProfile: () => Promise<void>;
  lastRefreshed: number | null;
};

// Create the context with default values
const UserContext = createContext<UserContextType>({
  userProfile: null,
  isLoading: false,
  error: null,
  refreshUserProfile: async () => {},
  forceRefreshUserProfile: async () => {},
  lastRefreshed: null,
});

// Hook to use the user context
export const useUser = () => useContext(UserContext);

// Provider component
type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Function to force fetch user profile regardless of cache
  const forceRefreshUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check if user is authenticated
      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }
      
      // Fetch user profile
      const { profile, error: profileError } = await getUserProfile();
      
      if (profileError) {
        setError(profileError);
        // Use log instead of error for expected conditions like no profile found
        // Safely log the error without accessing potentially undefined properties
        console.log('Profile fetch issue:', profileError);
        // Don't show this as an error in the UI
      } else if (profile) {
        setUserProfile(profile as UserProfile);
        setLastRefreshed(Date.now());
        console.log('Profile loaded in context:', profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Exception in fetchUserProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch user profile with caching
  const refreshUserProfile = async () => {
    // If we have a profile and it was refreshed within the cache duration, don't refresh
    if (userProfile && lastRefreshed && (Date.now() - lastRefreshed < CACHE_DURATION)) {
      console.log('Using cached profile data');
      return;
    }
    
    // Otherwise, force refresh
    await forceRefreshUserProfile();
  };

  // Fetch user profile on initial load
  useEffect(() => {
    refreshUserProfile();
  }, []);

  // Provide the context value
  const contextValue: UserContextType = {
    userProfile,
    isLoading,
    error,
    refreshUserProfile,
    forceRefreshUserProfile,
    lastRefreshed
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
