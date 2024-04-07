import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export function init() {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: {
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
            },
            TaskListList: {
              "Add task list to top": "Add task list to top",
              "Add task list to bottom": "Add task list to bottom",
            },
            UserSheet: {
              "Log In": "Log In",
            },
            InvitationSheet: {
              Invite: "Invite",
            },
            PreferencesSheet: {
              Preferences: "Preferences",
            },
          },
        },
      },
      ja: {
        translation: {
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
            },
            TaskListList: {
              "Add task list to top": "タスクリストを先頭に追加",
              "Add task list to bottom": "タスクリストを末尾に追加",
            },
            UserSheet: {
              "Log In": "ログイン",
            },
            InvitationSheet: {
              Invite: "招待",
            },
            PreferencesSheet: {
              Preferences: "設定",
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
