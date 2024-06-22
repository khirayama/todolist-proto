import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

export const useCustomTranslation = (prefix: string) => {
  const tr = useTranslation();
  return {
    ...tr,
    t: (key: string | string[], params?: any) =>
      tr.t(`${prefix}.${key}`, params) as string,
  };
};

export function init() {
  i18n.use(initReactI18next).init({
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          libs: {
            components: {
              DatePicker: {
                Sunday: "Su",
                Monday: "Mo",
                Tuesday: "Tu",
                Wednesday: "We",
                Thursday: "Th",
                Friday: "Fr",
                Saturday: "Sa",
                Reset: "Reset",
                Cancel: "Cancel",
              },
            },
          },
          pages: {
            index: {
              "Log In": "Log In",
              Preferences: "Preferences",
            },
          },
          components: {
            TaskList: {
              "Add task to top": "Add task to top",
              "Add task to bottom": "Add task to bottom",
              Sort: "Sort",
              "Clear Completed": "Clear Completed",
              "Task list name": "Task list name",
            },
            TaskListList: {
              "Add task list to bottom": "Add task list to bottom",
            },
            UserSheet: {
              Email: "Email",
              Password: "Password",
              "Log In": "Log In",
              "Sign Up": "Sign Up",
              "Logging In": "Logging Ip",
              "Signing Up": "Signing Up",
              "Send reset password instructions":
                "Send reset password instructions",
              "Already have an account? Log in":
                "Already have an account? Log in",
              "Don't have an account? Sign up":
                "Don't have an account? Sign up",
              "Forgot your password?": "Forgot your password?",
              "New display name": "New display name",
              "Change display name": "Change display name",
              "New email": "New email",
              "Change email": "Change email",
              "New password": "New password",
              "Confirm new password": "Confirm new password",
              "Update password": "Update password",
              "Log out": "Log out",
              "Delete account": "Delete account",
            },
            SharingSheet: {
              "Share {{name}} list": "Share {{name}} list",
              "Copied to clipboard": "Copied to clipboard",
              "Need to run this under https or localhost":
                "Need to run this under https or localhost",
              "Please join {{name}} list!": "Please join {{name}} list!",
              "Share with other apps": "Share with other apps",
              "Refresh share code": "Refresh share code",
            },
            PreferencesSheet: {
              Preferences: "Preferences",
              JA: "日本語",
              EN: "English",
              SYSTEM: "Use system setting",
              LIGHT: "Light",
              DARK: "Dark",
              Appearance: "Appearance",
              Language: "Language",
            },
            DatePickerSheet: {
              "Date Picker": "Date Picker",
            },
          },
        },
      },
      ja: {
        translation: {
          libs: {
            components: {
              DatePicker: {
                Sunday: "日",
                Monday: "月",
                Tuesday: "火",
                Wednesday: "水",
                Thursday: "木",
                Friday: "金",
                Saturday: "土",
                Reset: "リセット",
                Cancel: "キャンセル",
              },
            },
          },
          pages: {
            index: {
              "Log In": "ログイン",
              Preferences: "設定",
            },
          },
          components: {
            TaskList: {
              "Add task to top": "タスクを先頭に追加",
              "Add task to bottom": "タスクを末尾に追加",
              Sort: "並び替え",
              "Clear Completed": "完了タスクを削除",
              "Task list name": "タスクリスト名",
            },
            TaskListList: {
              "Add task list to bottom": "タスクリストを末尾に追加",
            },
            UserSheet: {
              Email: "メールアドレス",
              Password: "パスワード",
              "Log In": "ログイン",
              "Sign Up": "新規登録",
              "Logging In": "ログイン中",
              "Signing Up": "新規登録中",
              "Send reset password instructions":
                "パスワードリセットメールを送信",
              "Already have an account? Log in":
                "アカウントをお持ちの方はこちら",
              "Don't have an account? Sign up":
                "アカウントをお持ちでない方はこちら",
              "Forgot your password?": "パスワードを忘れた場合",
              "New display name": "新しい表示名",
              "Change display name": "表示名を変更",
              "New email": "新しいメールアドレス",
              "Change email": "メールアドレスを変更",
              "New password": "新しいパスワード",
              "Confirm new password": "新しいパスワードの確認",
              "Update password": "パスワードを更新",
              "Log out": "ログアウト",
              "Delete account": "アカウントを削除",
            },
            SharingSheet: {
              Share: "共有",
              "Share {{name}} list": "{{name}}リストを共有",
              "Copied to clipboard": "クリップボードにコピーしました",
              "Need to run this under https or localhost":
                "httpsまたはlocalhostで実行する必要があります",
              "Please join {{name}} list!":
                "{{name}}リストに参加してください！",
              "Share with other apps": "他のアプリで共有",
              "Refresh share code": "共有コードを更新",
            },
            PreferencesSheet: {
              Preferences: "設定",
              JA: "日本語",
              EN: "English",
              SYSTEM: "システム設定を使用する",
              LIGHT: "ライトモード",
              DARK: "ダークモード",
              Appearance: "表示設定",
              Language: "言語",
            },
            DatePickerSheet: {
              "Date Picker": "日付選択",
            },
          },
        },
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}
