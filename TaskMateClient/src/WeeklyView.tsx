import { useState, useContext, useEffect } from "react";
import axios from "./config/axiosConfig";
import { useNavigate } from "react-router";

import {
  TIME_SLOT_HEIGHT,
  WEEKLY_BOARD_MAX_HEIGHT_VH,
} from "./utils/constants";
import { DayHeader, DayBoard } from "./DayColumn";
import { RightArrow, LeftArrow } from "./assets/SelectionArrows";
import { rawTaskFormat, workingTaskFormat } from "./utils/globalTypes";
import { CalendarContext } from "./App";
import { validateAccessToken } from "./utils/authTokenRefresh";

function GridBackground() {
  function renderGridLines() {
    const lines = [];
    for (let i = 0; i < 24; i++) {
      lines.push(
        <hr
          key={i}
          style={{ height: `${4 * TIME_SLOT_HEIGHT}px` }}
          className="border-b border-slate-800"
        ></hr>
      );
    }
    return lines;
  }
  return (
    <div style={{ width: "100%" }} className="grid grid-cols-24 absolute">
      {renderGridLines()}
    </div>
  );
}

type WeekSelectorArrowProps = {
  weekChangeDirection: 1 | -1;
  shiftWeeksFunc: (weeksFromCurrent: number) => void;
};

function WeekSelectorArrow({
  weekChangeDirection,
  shiftWeeksFunc,
}: WeekSelectorArrowProps) {
  function handleClick() {
    shiftWeeksFunc(weekChangeDirection);
  }
  return (
    <button
      className="rounded-full bg-violet-700 h-8 w-8 flex-row justify-center items-center p-1 inline-flex"
      onClick={handleClick}
    >
      {weekChangeDirection == 1 ? <RightArrow /> : <LeftArrow />}
    </button>
  );
}

export default function WeeklyView() {
  const [weeksFromToday, setWeeksFromToday] = useState<number>(0);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  // prettier-ignore
  const [tasksByDay, setTasksByDay] = useState<workingTaskFormat[][]>([[], [], [], [], [], [], [],]);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const calendarID = useContext(CalendarContext).calendarID;
  const navigate = useNavigate();

  useEffect(() => {
    setWeekDaysState(weeksFromToday);
  }, [weeksFromToday]);

  useEffect(() => {
    setDataFetched(false);
    const startOfWeek = weekDays[0];
    if (!startOfWeek) return;

    startOfWeek.setHours(0, 0, 0, 0); //set to start of day before converting to UTC
    const startOfWeekParam_UTC = startOfWeek.toISOString().slice(0, 10);

    validateAccessToken().then((isValidToken) => {
      if (isValidToken) {
        const accessToken = localStorage.getItem("accessToken");
        axios
          .get(
            `/app/scheduled-tasks-by-week/?calendar=${calendarID}&startofweek=${startOfWeekParam_UTC}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((result) => {
            const allTasksRaw: rawTaskFormat[] = result.data;
            const allTasks: workingTaskFormat[] = allTasksRaw.map((val) => {
              return {
                id: val.id,
                name: val.name,
                dueDateTime: new Date(val.dueDate + "T" + val.dueTime + "Z"),
                duration: val.duration,
                startDateTime: new Date(
                  val.startDate + "T" + val.startTime + "Z"
                ),
              };
            });
            // prettier-ignore
            const tempTasksByDay: workingTaskFormat[][] = [[], [], [], [], [], [], [],];
            let taskIndex = 0;
            for (let weekDayIndex = 0; weekDayIndex < 7; weekDayIndex++) {
              while (
                taskIndex < allTasks.length &&
                (allTasks[taskIndex].startDateTime as Date).toDateString() ===
                  weekDays[weekDayIndex].toDateString()
              ) {
                tempTasksByDay[weekDayIndex].push(allTasks[taskIndex]);
                taskIndex++;
              }
            }
            setTasksByDay(tempTasksByDay);
            setDataFetched(true);
          });
      } else {
        navigate("/login");
      }
    });
  }, [weekDays, calendarID]);

  function shiftWeeks(weekChangeDirection: number) {
    setWeeksFromToday(
      (prevWeeksFromToday) => prevWeeksFromToday + weekChangeDirection
    );
  }

  // using actual Date object so I don't have to deal w crossing over months
  function setWeekDaysState(weeksFromToday: number) {
    const today = new Date();
    const todayDayOfWeek = today.getDay();

    const weekDaysTemp = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - todayDayOfWeek + i + 7 * weeksFromToday);
      weekDaysTemp.push(date);
    }
    setWeekDays(weekDaysTemp);
  }

  function renderTimeLabels() {
    const timeLabels = [];
    timeLabels.push(
      <div
        key="empty"
        style={{ height: `calc(${4 * TIME_SLOT_HEIGHT}px - 1rem)` }}
      ></div>
    );
    for (let i = 1; i <= 11; i++) {
      timeLabels.push(
        <div
          key={`t${i}`}
          style={{ height: `${4 * TIME_SLOT_HEIGHT}px` }}
        >{`${i}:00 AM`}</div>
      );
    }
    timeLabels.push(
      <div
        key={`t${12}`}
        style={{ height: `${4 * TIME_SLOT_HEIGHT}px` }}
      >{`${12}:00 PM`}</div>
    );
    for (let i = 1; i <= 11; i++) {
      timeLabels.push(
        <div
          key={`t${i + 12}`}
          style={{ height: `${4 * TIME_SLOT_HEIGHT}px` }}
        >{`${i}:00 PM`}</div>
      );
    }
    timeLabels.push(
      <div
        key={`t${24}`}
        style={{ height: `${4 * TIME_SLOT_HEIGHT}px` }}
      >{`${12}:00 AM`}</div>
    );
    return timeLabels;
  }

  function DateToReadableDate(date: Date) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleString("en-US", options);
  }

  return (
    <>
      <div className="flex flex-row justify-center items-baseline relative h-14 py-2">
        <div>
          <WeekSelectorArrow
            weekChangeDirection={-1}
            shiftWeeksFunc={shiftWeeks}
          />
          <h2
            style={{ width: "24rem" }}
            className="text-xl text-slate-100 font-semibold inline-block"
          >
            {weekDays[0]
              ? `Week of ${DateToReadableDate(
                  weekDays[0]
                )} – ${DateToReadableDate(weekDays[6])}`
              : ""}
          </h2>
          <WeekSelectorArrow
            weekChangeDirection={1}
            shiftWeeksFunc={shiftWeeks}
          />
        </div>
      </div>
      <div
        className="border-slate-200 border-2 rounded-md"
        style={{ height: `${WEEKLY_BOARD_MAX_HEIGHT_VH}vh` }}
      >
        <div className={`grid grid-cols-8 overflow-y-scroll relative`}>
          <div key="empty"></div>
          {weekDays.map((val, index) => (
            <div key={index}>
              <DayHeader date={val} />
            </div>
          ))}
        </div>
        <hr />
        <div
          style={{ height: `${WEEKLY_BOARD_MAX_HEIGHT_VH - 8}vh` }}
          className={`grid grid-cols-8 overflow-y-scroll relative`}
        >
          <GridBackground />
          <div className="text-right pr-2 bg-slate-900 z-10 relative text-slate-400">
            {renderTimeLabels()}
          </div>
          {weekDays.map((val, index) => (
            <div key={index}>
              <DayBoard
                id={`DayBoard${index}`}
                date={val}
                defaultTasksList={tasksByDay[index]}
                dataFetched={dataFetched}
                shiftWeeks={shiftWeeks}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
