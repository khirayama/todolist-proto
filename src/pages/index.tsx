import { useSupabase } from "libs/supabase";
import { ParamsLink } from "libs/components/ParamsLink";

export default function IndexPage() {
  const { isLoggedIn } = useSupabase();

  const params = !isLoggedIn ? { drawer: "opened", sheet: "user" } : {};

  return (
    <div>
      <div>
        <div className="text-center py-16">
          <h1 className="p-4 text-center">Lightlist</h1>
          <ParamsLink
            href="/app"
            params={params}
            className="border py-2 px-4 rounded-full"
          >
            はじめる
          </ParamsLink>
        </div>
        {!isLoggedIn && (
          <ParamsLink href="/demo">ログインせずにさわってみる</ParamsLink>
        )}
        <div className="p-4 max-w-lg m-auto">
          <p className="my-4">
            Lightlistは、とてもシンプルなタスクリストサービスです。
          </p>
          <p>
            タスク管理としてのToDoリストや、買い物リストとしても利用できます。登録していない人ともリストを共有することができます。
          </p>
        </div>
      </div>
    </div>
  );
}
