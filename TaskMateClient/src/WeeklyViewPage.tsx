import React, { Dispatch, SetStateAction } from "react";

//Components:
import UnscheduledTaskList from "./UnscheduledTaskList";
import WeeklyView from "./WeeklyView";
import CreateTaskOverlay from "./CreateTaskOverlay";

type DropContextData = {
  completion: "dragging" | "dropped" | "failed" | "complete" | null;
};
type DropContext = {
  drop: DropContextData;
  setDrop: Dispatch<SetStateAction<DropContextData>>;
};
export const LatestDropContext = React.createContext<DropContext>({
  drop: { completion: null },
  setDrop: () => {},
});

export default function WeeklyViewPage() {
  const [drop, setDrop] = React.useState<DropContextData>({ completion: null });
  const [createTaskOverlayOpen, setCreateTaskOverlayOpen] =
    React.useState<boolean>(false);

  return (
    <LatestDropContext.Provider value={{ drop, setDrop }}>
      {createTaskOverlayOpen ? (
        <CreateTaskOverlay
          closeOverlay={() => setCreateTaskOverlayOpen(false)}
        />
      ) : null}
      <div className="flex flex-row p-10 bg-slate-900">
        <div style={{ width: "30%" }} className="pr-5">
          <button
            onClick={() => setCreateTaskOverlayOpen(true)}
            className="bg-violet-700 rounded-full text-white font-bold py-3 px-6 mb-6"
            style={{ width: "100%" }}
          >
            CREATE A NEW TASK
          </button>
          <UnscheduledTaskList />
        </div>

        <div style={{ width: "70%" }}>
          <WeeklyView />
        </div>
      </div>
    </LatestDropContext.Provider>
  );
}
