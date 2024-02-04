import React, { Dispatch, SetStateAction } from "react";

//Components:
import UnscheduledTaskList from "./UnscheduledTaskList";
import WeeklyView from "./WeeklyView";
import CreateTaskOverlay from "./CreateTaskOverlay";
import { CalendarContext } from "./App";
import { Link } from "react-router-dom";
import { LeftArrow } from "./assets/SelectionArrows";

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
  const calendarContext = React.useContext(CalendarContext);

  return (
    <LatestDropContext.Provider value={{ drop, setDrop }}>
      {createTaskOverlayOpen ? (
        <CreateTaskOverlay
          closeOverlay={() => setCreateTaskOverlayOpen(false)}
        />
      ) : null}
      <div className="h-screen w-screen bg-slate-900">
        <div className="text-white bg-violet-700 fixed w-screen z-10 flex flex-row items-center">
          <Link to="/calendars">
            <div className="w-2 mx-2 inline-block">
              <LeftArrow />
            </div>
            <h2 className="text-white inline-block">Back</h2>
          </Link>
          <div
            style={{ width: "90%" }}
            className="flex flex-row justify-center"
          >
            <h2 className="text-xl pt-1 font-semibold">
              {sessionStorage.getItem("activeCalendarName")}
            </h2>
          </div>
        </div>

        <div className="px-10 pb-5 pt-16 flex flex-row">
          <div style={{ width: "25%" }} className="pr-5">
            <button
              onClick={() => setCreateTaskOverlayOpen(true)}
              className="bg-violet-700 rounded-full text-white font-bold p-3 mb-6"
              style={{ width: "100%" }}
            >
              CREATE NEW TASK
            </button>
            <UnscheduledTaskList />
          </div>

          <div style={{ width: "75%" }}>
            <WeeklyView />
          </div>
        </div>
      </div>
    </LatestDropContext.Provider>
  );
}
