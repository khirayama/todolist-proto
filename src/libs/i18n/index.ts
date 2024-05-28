import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

export const useCustomTranslation = (prefix: string) => {
  const tr = useTranslation();
  return {
    ...tr,
    t: (key: string) => tr.t(`${prefix}.${key}`),
  };
};

export function init() {
  i18n.use(initReactI18next).init({
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
              "Add task list to top": "Add task list to top",
              "Add task list to bottom": "Add task list to bottom",
            },
            UserSheet: {
              "Log In": "Log In",
            },
            SharingSheet: {
              Share: "Share",
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
              "Add task list to top": "タスクリストを先頭に追加",
              "Add task list to bottom": "タスクリストを末尾に追加",
            },
            UserSheet: {
              "Log In": "ログイン",
            },
            SharingSheet: {
              Share: "共有",
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
