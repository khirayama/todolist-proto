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
  taskInsertPosition: "BOTTOM" | "TOP";
  taskListIds: string[];
};

type Profile = {
  displayName: string;
  email: string;
};

type Preferences = {
  lang: "EN" | "JA";
  theme: "SYSTEM" | "LIGHT" | "DARK";
};

type State = {
  app: App;
  profile: Profile;
  preferences: Preferences;
  taskLists: {
    [id: string]: TaskList;
  };
};
