import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SessionData } from '@/types/session';

interface SessionContextType {
  session: SessionData | null;
  setSession: (session: SessionData | null) => void;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load session from sessionStorage on mount
    const storedSession = sessionStorage.getItem('session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        console.log('Parsed session:', parsedSession); // Debug log

        // Validate session structure
        if (!parsedSession.email || !parsedSession.expiresAt) {
          console.error('Invalid session structure');
          sessionStorage.removeItem('session');
          setLoading(false);
          return;
        }

        // Check if session is expired
        if (new Date(parsedSession.expiresAt) > new Date()) {
          setSession(parsedSession);
        } else {
          console.log('Session expired'); // Debug log
          sessionStorage.removeItem('session');
        }
      } catch (error) {
        console.error('Invalid session data:', error);
        sessionStorage.removeItem('session');
      }
    } else {
      console.log('No session found'); // Debug log
    }
    setLoading(false);
  }, []);

  // Protect routes
  useEffect(() => {
    const publicPaths = ['/', '/signup'];
    const path = router.pathname;

    if (!loading) {
      if (!session && !publicPaths.includes(path)) {
        console.log('No session, redirecting to login'); // Debug log
        router.push('/');
      } else if (session && publicPaths.includes(path)) {
        console.log('Has session, redirecting to dashboard'); // Debug log
        router.push('/dashboard');
      }
    }
  }, [session, loading, router]);

  const value = {
    session,
    setSession,
    loading,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
