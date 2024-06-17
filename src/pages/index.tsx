import { useSupabase } from "libs/supabase";
import { ParamsLink } from "libs/components/ParamsLink";

export default function IndexPage() {
  const { isLoggedIn } = useSupabase();

  const params = !isLoggedIn ? { drawer: "opened", sheet: "user" } : {};
  return (
    <div>
      <h1>Todo List</h1>
      <ParamsLink href="/app" params={params}>
        Log in
      </ParamsLink>
      {!isLoggedIn && <ParamsLink href="/app">Use without login</ParamsLink>}
    </div>
  );
}
