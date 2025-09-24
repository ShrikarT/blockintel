import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  const value = {
    session,
    signIn: async (provider, options) => {
      console.log('signIn', provider, options);
      // TODO: Implement real authentication
      setSession({
        user: {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      return true;
    },
    signOut: async () => {
      console.log('signOut');
      setSession(null);
      return true;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useSession() {
  const { session } = useAuth();
  return {
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
  };
}