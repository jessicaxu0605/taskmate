import { useState, createContext, Dispatch, SetStateAction } from "react";

//Components:
import UnscheduledTaskList from "./UnscheduledTaskList";
import WeeklyView from "./WeeklyView";
import CreateTaskOverlay from "./CreateTaskOverlay";
import { Link } from "react-router-dom";
import { LeftArrow } from "./assets/SelectionArrows";
import { LogoutButton } from "./LogoutButton";

type DropContextData = {
  completion: "dragging" | "dropped" | "failed" | "complete" | null;
};
type DropContext = {
  drop: DropContextData;
  setDrop: Dispatch<SetStateAction<DropContextData>>;
};
export const LatestDropContext = createContext<DropContext>({
  drop: { completion: null },
  setDrop: () => {},
});

export default function WeeklyViewPage() {
  const [drop, setDrop] = useState<DropContextData>({ completion: null });
  const [createTaskOverlayOpen, setCreateTaskOverlayOpen] =
    useState<boolean>(false);

  return (
    <LatestDropContext.Provider value={{ drop, setDrop }}>
      {createTaskOverlayOpen ? (
        <CreateTaskOverlay
          closeOverlay={() => setCreateTaskOverlayOpen(false)}
        />
      ) : null}
      <div className="h-screen w-screen bg-slate-900">
        <div className="text-white bg-violet-700 fixed w-screen z-10 flex flex-row items-center justify-between pt-1 h-12">
          <Link to="/calendars">
            <div className="w-3 top-1 relative mx-4 inline-block">
              <LeftArrow />
            </div>
            <h2 className="text-white inline-block font-semibold">
              BACK TO CALENDARS
            </h2>
          </Link>
          <div className="flex flex-row justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              height="1.5rem"
              width="1.5rem"
            >
              {/* <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
              <path
                fill="white"
                d="M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44v-36c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v36c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z"
              />
            </svg>
            <h2 className="text-2xl pt-1 pl-2 font-semibold">
              {sessionStorage.getItem("activeCalendarName")}
            </h2>
          </div>
          <LogoutButton />
        </div>

        <div className="px-10 pb-5 pt-16 flex flex-row">
          <div style={{ width: "25%" }} className="pr-5">
            <div className="flex flex-row justify-start items-center h-14 overflow-visible"></div>
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
