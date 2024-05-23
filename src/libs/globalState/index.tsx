import { v4 as uuid } from "uuid";
import { useTranslation } from "react-i18next";
import { createContext, useContext, ReactNode, useState } from "react";

type GlobalState = State;

const config = {
  key: "__global_state",
  initialValue: (): GlobalState => {
    const taskList = {
      id: uuid(),
      name: "やることリスト",
      tasks: [],
    };
    return {
      app: {
        taskInsertPosition: "BOTTOM",
        taskListIds: [taskList.id],
      },
      profile: {
        displayName: "",
        email: "",
      },
      preferences: {
        lang: "EN",
        theme: "SYSTEM",
      },
      taskLists: {
        [taskList.id]: taskList,
      },
    };
  },
};

const GlobalStateContext = createContext<
  [GlobalState, (newState: GlobalState) => void]
>([config.initialValue(), () => {}]);

const loadGlobalState = () => {
  return (
    JSON.parse(window.localStorage.getItem(config.key)) || config.initialValue()
  );
};

export const GlobalStateProvider = (props: { children: ReactNode }) => {
  const [globalState, nativeSetGlobalState] = useState(loadGlobalState);
  const { i18n } = useTranslation();

  const setGlobalState = (newState: GlobalState) => {
    window.localStorage.setItem(config.key, JSON.stringify(newState));
    const lang = newState.preferences.lang.toLowerCase();
    if (i18n.resolvedLanguage !== lang) {
      i18n.changeLanguage(lang);
    }
    return nativeSetGlobalState(newState);
  };

  return (
    <GlobalStateContext.Provider value={[globalState, setGlobalState]}>
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): [
  GlobalState,
  (newState: GlobalState) => void,
] => {
  return useContext(GlobalStateContext);
};
