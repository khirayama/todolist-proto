import { useSupabase } from "libs/supabase";
import { ParamsLink } from "libs/components/ParamsLink";

export default function IndexPage() {
  const { isLoggedIn } = useSupabase();

  const params = !isLoggedIn ? { drawer: "opened", sheet: "user" } : {};

  return (
    <div>
      <div>
        <div className="text-center pt-24 pb-4">
          <img
            src="/logo.svg"
            alt="Lightlist"
            className="m-auto w-[80px] py-4"
          />
          <h1 className="p-4 text-center">Lightlist</h1>
        </div>
        <div className="text-center p-4">
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
        <div className="p-8 max-w-lg m-auto text-justify">
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
