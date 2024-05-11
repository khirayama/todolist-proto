import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { type SupabaseClient, type AuthUser } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
  user: AuthUser | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SupabaseContext = createContext<SupabaseContextType>({
  supabase,
  user: null,
});

export const SupabaseProvider = (props: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        setInitialized(true);
      }

      console.log(event, session);
      if (session) {
        console.log(session.expires_in, new Date(session.expires_at * 1000));
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
        user,
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
