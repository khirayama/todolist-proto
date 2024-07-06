import { useSupabase } from "libs/supabase";
import { ParamsLink } from "libs/components/ParamsLink";

export default function IndexPage() {
  const { isLoggedIn } = useSupabase();

  const params = !isLoggedIn ? { drawer: "opened", sheet: "user" } : {};

  return (
    <div>
      <div className="pb-8">
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

      <div className="bg-gray-100 pt-8">
        <div className="relative aspect-video overflow-hidden max-w-3xl mx-auto">
          <img
            className="absolute shadow-2xl bottom-[-100px] w-[80%] min-w-[320px] left-[32px]"
            src="/screenshot_ja_desktop.png"
          />
          <img
            className="absolute shadow-2xl bottom-[-60px] w-[24%] min-w-[105px] right-[32px] rotate-6"
            src="/screenshot_ja_mobile.png"
          />
        </div>
      </div>

      <footer className="p-12 text-center">
        <div className="text-center p-4">
          <ParamsLink
            href="/app"
            params={params}
            className="border py-2 px-4 rounded-full"
          >
            はじめる
          </ParamsLink>
        </div>
      </footer>
    </div>
  );
}
