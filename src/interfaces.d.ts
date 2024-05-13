type Task = {
  id: string;
  text: string;
  completed: boolean;
  date: string;
};

type TaskList = {
  id: string;
  name: string;
  tasks: Task[];
};

type App = {
  taskInsertPosition: "bottom" | "top";
  taskListIds: string[];
};

type Profile = {
  displayName: string;
  email: string;
};

type Preferences = {
  lang: "en" | "ja";
  theme: "system" | "light" | "dark";
};

type State = {
  app: App;
  profile: Profile;
  preferences: Preferences;
  taskLists: {
    [id: string]: TaskList;
  };
};
