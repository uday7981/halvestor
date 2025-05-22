import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUserProfile } from '../services/profileService';
import { getCurrentUser } from '../services/authService';

// Define the shape of our user profile data
type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
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
};

// Create the context with default values
const UserContext = createContext<UserContextType>({
  userProfile: null,
  isLoading: false,
  error: null,
  refreshUserProfile: async () => {},
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

  // Function to fetch user profile
  const fetchUserProfile = async () => {
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
        console.error('Error fetching profile:', profileError);
      } else if (profile) {
        setUserProfile(profile as UserProfile);
        console.log('Profile loaded in context:', profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Exception in fetchUserProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile on initial load
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Provide the context value
  const contextValue: UserContextType = {
    userProfile,
    isLoading,
    error,
    refreshUserProfile: fetchUserProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
