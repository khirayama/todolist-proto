import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { type Session, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
  isLoggedIn: boolean;
  isInitialized: boolean;
};

let ss: Session = null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SupabaseContext = createContext<SupabaseContextType>({
  supabase,
  isLoggedIn: false,
  isInitialized: false,
});

export const SupabaseProvider = (props: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      ss = session;
      if (session) {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      ss = session;
      if (event === "INITIAL_SESSION") {
        setInitialized(true);
      }
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        isLoggedIn: !!user,
        isInitialized: initialized,
      }}
    >
      {props.children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  return useContext(SupabaseContext);
};

export const getSession = (): Session => ss;
