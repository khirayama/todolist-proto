type Task = {
  id: string;
  text: string;
  complete: boolean;
  date: string;
};

type TaskList = {
  id: string;
  name: string;
  tasks: Task[];
};

type Preferences = {
  lang: string;
  theme: 'system' | 'light' | 'dark';
  taskInsertPosition: "bottom" | "top";
};

type App = {
  preferences: Preferences;
  taskListIds: string[];
};

type State = {
  app: App;
  taskLists: {
    [id: string]: TaskList;
  };
};
