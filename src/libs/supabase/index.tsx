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
};

let ss: Session = null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SupabaseContext = createContext<SupabaseContextType>({
  supabase,
  isLoggedIn: false,
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

  return initialized ? (
    <SupabaseContext.Provider
      value={{
        supabase,
        isLoggedIn: !!user,
      }}
    >
      {props.children}
    </SupabaseContext.Provider>
  ) : (
    <h1>Loading...</h1>
  );
};

export const useSupabase = (): SupabaseContextType => {
  return useContext(SupabaseContext);
};

export const getSession = (): Session => ss;
