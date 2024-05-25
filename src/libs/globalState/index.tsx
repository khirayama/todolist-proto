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
      taskIds: [],
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
      tasks: {},
    };
  },
};

let snapshot: GlobalState = null;

const GlobalStateContext = createContext<
  [GlobalState, (newState: GlobalState) => void, () => GlobalState]
>([snapshot, () => {}, () => snapshot]);

const loadGlobalState = () => {
  return (
    JSON.parse(window.localStorage.getItem(config.key)) || config.initialValue()
  );
};

export const GlobalStateProvider = (props: { children: ReactNode }) => {
  const changeLanguage = () => {
    const lang = snapshot.preferences.lang.toLowerCase();
    if (i18n.resolvedLanguage !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  const [globalState, nativeSetGlobalState] = useState(loadGlobalState());
  const { i18n } = useTranslation();

  snapshot = globalState;
  changeLanguage();

  const setGlobalState = (newState: GlobalState) => {
    window.localStorage.setItem(config.key, JSON.stringify(newState));
    changeLanguage();
    snapshot = newState;
    nativeSetGlobalState(snapshot);
  };

  const getGlobalStateSnapshot = () => snapshot;

  return (
    <GlobalStateContext.Provider
      value={[globalState, setGlobalState, getGlobalStateSnapshot]}
    >
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): [
  GlobalState,
  (newState: GlobalState) => void,
  () => GlobalState,
] => {
  return useContext(GlobalStateContext);
};
