import { useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

function useAuth() {
  const { signIn, signOut } = useAuthContext();
  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  const signInWithCredentials = useCallback((options) => {
    return signIn("credentials-signin", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [signIn, callbackUrl])

  const signUpWithCredentials = useCallback((options) => {
    return signIn("credentials-signup", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [signIn, callbackUrl])

  const signInWithGoogle = useCallback((options) => {
    return signIn("google", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [signIn, callbackUrl]);

  const signInWithFacebook = useCallback((options) => {
    return signIn("facebook", options);
  }, [signIn]);

  const signInWithTwitter = useCallback((options) => {
    return signIn("twitter", options);
  }, [signIn]);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
  }
}

export default useAuth;