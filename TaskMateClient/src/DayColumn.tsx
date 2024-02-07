import { useState, useContext, useRef, useEffect } from "react";
import axios from "./config/axiosConfig";
import { useNavigate } from "react-router-dom";
import { TIME_SLOT_HEIGHT } from "./utils/constants";
import { LatestDropContext } from "./WeeklyViewPage";
import { workingTaskFormat } from "./utils/globalTypes";
import TaskCard from "./TaskCard";
import { validateAccessToken } from "./utils/authTokenRefresh";

type DayBoardProps = {
  date: Date;
  id: string;
  defaultTasksList: workingTaskFormat[];
  dataFetched: boolean;
  shiftWeeks: (num: number) => void;
};

type DayHeaderProps = {
  date: Date;
};

export function DayHeader({ date }: DayHeaderProps) {
  const dayOfWeekStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div
      className={`p-2 flex flex-row items-center h-11 border-x border-slate-800 text-slate-100 bg-`}
    >
      <span className="bg-violet-700 rounded-full w-6 h-6 flex flex-col justify-center bg">
        <h2 className="text-white font-bold text-sm pt-0.5">
          {date.getDate()}
        </h2>
      </span>
      <h3 className={`text-left font-medium pl-2`}>
        {dayOfWeekStrings[date.getDay()]}
      </h3>
    </div>
  );
}

export function DayBoard({
  date,
  id,
  defaultTasksList,
  dataFetched,
  shiftWeeks,
}: DayBoardProps) {
  // @ts-ignore
  const implementLater = shiftWeeks;

  const thisElemRef = useRef<HTMLDivElement>(null);
  const [tasksList, setTasksList] =
    useState<workingTaskFormat[]>(defaultTasksList);
  const navigate = useNavigate();

  useEffect(() => {
    if (dataFetched) {
      setTasksList(defaultTasksList);
    }
  }, [dataFetched]);

  const dropContext = useContext(LatestDropContext);

  // helper functions:

  //get startTime depending on number of 15 min slots from the top of the card to the top of the board
  function getStartTimeIn15Mins(e: React.DragEvent<HTMLDivElement>) {
    if (!thisElemRef.current) return;
    const dayBoardBoundingBox = thisElemRef.current.getBoundingClientRect();
    const cursorToCardTop = 16; //distance from mouse to top of card (upon dragStart)
    const taskCardTop = e.clientY - cursorToCardTop; //absolute Y of card (upon drop)
    const cardTopToBoardTop = taskCardTop - dayBoardBoundingBox.top; //distance from top of Board to Y of card (upon drop)
    return Math.round(cardTopToBoardTop / TIME_SLOT_HEIGHT);
  }

  function getStartDateTime(startTimeIn15Mins: number) {
    const hour = Math.floor(startTimeIn15Mins / 4);
    const minute = (startTimeIn15Mins % 4) * 15;
    const startDate = new Date(date);
    startDate.setHours(hour);
    startDate.setMinutes(minute);
    startDate.setSeconds(0);
    return startDate;
  }

  // function formatTimeHHMMSS_Local(startTimeIn15Mins: number) {
  //   const hour = Math.floor(startTimeIn15Mins / 4);
  //   const minute = (startTimeIn15Mins % 4) * 15;
  //   return `${hour}:${minute}:00`;
  // }

  // function formatTimeHHMMSS_UTC(startTimeIn15Mins: number) {
  //   const totalMinutes_UTC = startTimeIn15Mins -
  //   const hour = Math.floor(startTimeIn15Mins / 4);
  //   const minute = (startTimeIn15Mins % 4) * 15;
  //   return `${hour}:${minute}:00`;
  // }

  // function formatDateYYYYMMDD_UTC() {
  //   return date.toISOString().substring(0, 10);
  // }

  //drag and drop:
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    dropContext.setDrop({ completion: "dropped" });
    e.preventDefault();
    e.stopPropagation();

    //number of 15 minute time slots from the top of the board
    const startTimeIn15Mins = getStartTimeIn15Mins(e);
    if (startTimeIn15Mins == null) {
      dropContext.setDrop({ completion: "failed" });
      return;
    }
    const startDateTime = getStartDateTime(startTimeIn15Mins);
    const startISOString = startDateTime.toISOString();
    const startDate_UTC = startISOString.slice(0, 10);
    const startTime_UTC = startISOString.slice(11, 19);
    // const endTime = formatTime(endTimeIn15Mins);

    const reqBody = {
      taskID: parseInt(e.dataTransfer.getData("id")),
      newData: {
        startDate: startDate_UTC,
        startTime: startTime_UTC,
      },
    };
    // const newTask: rawTaskFormat = {
    //   id: parseInt(e.dataTransfer.getData("id")),
    //   name: e.dataTransfer.getData("name"),
    //   dateCreated: null,
    //   dueDate: e.dataTransfer.getData("dueDate"),
    //   dueTime: e.dataTransfer.getData("dueTime"),
    //   duration: e.dataTransfer.getData("duration"),
    //   startDate: formatDate(),
    //   startTime: startTime,
    //   eventTypeID: null, //to be implemented
    //   properties: null, //to be implemented
    //   calendarID: null, //field not needed here, only relevant for fetching
    // };
    const newTask: workingTaskFormat = {
      id: parseInt(e.dataTransfer.getData("id")),
      name: e.dataTransfer.getData("name"),
      dueDateTime: new Date(e.dataTransfer.getData("dueDateTimeISOString")),
      duration: e.dataTransfer.getData("duration"),
      startDateTime: startDateTime,
    };

    validateAccessToken().then((isValidToken) => {
      if (isValidToken) {
        const accessToken = localStorage.getItem("accessToken");
        axios
          .put("/app/task/", reqBody, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })
          .then(() => {
            setTasksList((tasksList) => [...tasksList, newTask]);
            dropContext.setDrop({ completion: "complete" });
          })
          .catch(() => {
            dropContext.setDrop({ completion: "failed" });
          });
      } else {
        navigate("/login");
      }
    });
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div
      ref={thisElemRef}
      id={id}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ height: `${96 * TIME_SLOT_HEIGHT}px` }}
      className={`border-slate-800 border-x relative`}
    >
      {dataFetched ? (
        tasksList.map((val, index) => (
          <TaskCard
            key={index}
            id={val.id}
            name={val.name}
            dueDateTime={val.dueDateTime}
            duration={val.duration}
            isScheduledDefault={true}
            startDateTime={val.startDateTime}
          />
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
