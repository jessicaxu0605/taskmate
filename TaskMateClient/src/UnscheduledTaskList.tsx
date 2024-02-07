import { useState, useEffect, useRef, useContext } from "react";
import axios from "./config/axiosConfig";
import { useNavigate } from "react-router-dom";

import TaskCard from "./TaskCard";
import { LatestDropContext } from "./WeeklyViewPage";
import { rawTaskFormat, workingTaskFormat } from "./utils/globalTypes";
import { CalendarContext } from "./App";
import { validateAccessToken } from "./utils/authTokenRefresh";

export default function UnscheduledTaskList() {
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [tasksList, setTasksList] = useState<workingTaskFormat[]>([]);
  const thisElemRef = useRef<HTMLDivElement>(null);
  const dropContext = useContext(LatestDropContext);
  const navigate = useNavigate();

  const calendarID = useContext(CalendarContext).calendarID;
  function getUnscheduledTasks() {
    setDataFetched(false); //on refresh, clear previously rendered components
    validateAccessToken().then((isValidToken) => {
      if (isValidToken) {
        const accessToken = localStorage.getItem("accessToken");
        axios
          .get(`/app/all-unscheduled-tasks/?calendar=${calendarID}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            const unscheduledTasksRaw: rawTaskFormat[] = response.data;
            const unscheduledTasks: workingTaskFormat[] =
              unscheduledTasksRaw.map((val) => {
                return {
                  id: val.id,
                  name: val.name,
                  dueDateTime: new Date(val.dueDate + "T" + val.dueTime + "Z"),
                  duration: val.duration,
                  startDateTime: null,
                };
              });
            setTasksList(unscheduledTasks);
            setDataFetched(true);
          });
      } else {
        navigate("/login");
      }
    });
  }

  useEffect(() => {
    getUnscheduledTasks();
  }, []);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    dropContext.setDrop({ completion: "dropped" });
    const reqBody = {
      taskID: parseInt(e.dataTransfer.getData("id")),
      newData: {
        startTime: "null",
        startDate: "null",
      },
    };
    const newTask: workingTaskFormat = {
      id: parseInt(e.dataTransfer.getData("id")),
      name: e.dataTransfer.getData("name"),
      dueDateTime: new Date(e.dataTransfer.getData("dueDateTimeISOString")),
      duration: e.dataTransfer.getData("duration"),
      startDateTime: null,
    };

    axios
      .put("/app/task/", reqBody)
      .then(() => {
        setTasksList((tasksList) => [...tasksList, newTask]);
        dropContext.setDrop({ completion: "complete" });
      })
      .catch(() => {
        dropContext.setDrop({ completion: "failed" });
      });
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div
      className="z-10 border-2 border-slate-100 text-slate-100 rounded-lg p-2 overflow-scroll hide-scrollbar"
      style={{ height: "75vh" }}
      ref={thisElemRef}
      id="unscheduled"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-row justify-center items-center p-2">
        <button
          onClick={getUnscheduledTasks}
          className="mr-3 p-1.5 rounded-full bg-violet-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            height="1rem"
            width="1rem"
          >
            {/* <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
            <path
              fill="white"
              d="M370.7 133.3C339.5 104 298.9 88 255.8 88c-77.5 .1-144.3 53.2-162.8 126.9-1.3 5.4-6.1 9.2-11.7 9.2H24.1c-7.5 0-13.2-6.8-11.8-14.2C33.9 94.9 134.8 8 256 8c66.4 0 126.8 26.1 171.3 68.7L463 41C478.1 25.9 504 36.6 504 57.9V192c0 13.3-10.7 24-24 24H345.9c-21.4 0-32.1-25.9-17-41l41.8-41.7zM32 296h134.1c21.4 0 32.1 25.9 17 41l-41.8 41.8c31.3 29.3 71.8 45.3 114.9 45.3 77.4-.1 144.3-53.1 162.8-126.8 1.3-5.4 6.1-9.2 11.7-9.2h57.3c7.5 0 13.2 6.8 11.8 14.2C478.1 417.1 377.2 504 256 504c-66.4 0-126.8-26.1-171.3-68.7L49 471C33.9 486.1 8 475.4 8 454.1V320c0-13.3 10.7-24 24-24z"
            />
          </svg>
        </button>
        <h2 className="text-lg font-bold">Unscheduled Tasks:</h2>
      </div>
      <div className="min-h-8">
        {dataFetched
          ? tasksList.map((val, index) => (
              <TaskCard
                key={index}
                id={val.id}
                name={val.name}
                dueDateTime={val.dueDateTime}
                duration={val.duration}
                isScheduledDefault={false}
                startDateTime={null}
              />
            ))
          : null}
      </div>
    </div>
  );
}
