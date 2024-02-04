//GOD I JATE TIME ZONES *SOB*
//FIX THEM LATER I STG THEYRE STILL FUCKED BEYOND BELIEF :(

import React from "react";
import axios from "./config/axiosConfig";

import { TIME_SLOT_HEIGHT } from "./utils/constants";
import { DayHeader, DayBoard } from "./DayColumn";
import { RightArrow, LeftArrow } from "./assets/SelectionArrows";
import { rawTaskFormat } from "./utils/globalTypes";
import { dateToLocalTimeZoneISOString } from "./utils/FormattingFunctions";
import { CalendarContext } from "./App";

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
      className="rounded-full bg-violet-700 h-8 w-8 flex flex-row justify-center items-center p-1"
      onClick={handleClick}
    >
      {weekChangeDirection == 1 ? <RightArrow /> : <LeftArrow />}
    </button>
  );
}

export default function WeeklyView() {
  const [weeksFromToday, setWeeksFromToday] = React.useState<number>(0);
  const [weekDays, setWeekDays] = React.useState<Date[]>([]);
  const [tasksByDay, setTasksByDay] = React.useState<rawTaskFormat[][]>([
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);
  const [dataFetched, setDataFetched] = React.useState<boolean>(false);
  const calendarID = React.useContext(CalendarContext).calendarID;

  React.useEffect(() => {
    setWeekDaysState(weeksFromToday);
  }, [weeksFromToday]);

  React.useEffect(() => {
    setDataFetched(false);
    const startOfWeek = weekDays[0];
    if (!startOfWeek) return;

    // scars of the timezone struggle:
    // const startOfWeekParts = startOfWeek.toLocaleString().split('/');
    // const startOfWeekParam = startOfWeekParts[2].slice(0, 4) + "-" + startOfWeekParts[0] + "-" + startOfWeekParts[1];
    // const startOfWeekParam = startOfWeek.toISOString().slice(0, 10);
    //prettier-ignore
    const startOfWeekParam = dateToLocalTimeZoneISOString(startOfWeek).slice(0, 10);

    // console.log(startOfWeek.toISOString());
    axios
      .get(
        `/app/scheduled-tasks-by-week/?calendar=${calendarID}&startofweek=${startOfWeekParam}`
      )
      .then((result) => {
        const allTasks: rawTaskFormat[] = result.data;
        const tempTasksByDay: rawTaskFormat[][] = [[], [], [], [], [], [], []];
        let taskIndex = 0;
        for (let weekDayIndex = 0; weekDayIndex < 7; weekDayIndex++) {
          // more shit that I need to fix for timezones
          const weekDayString = dateToLocalTimeZoneISOString(
            weekDays[weekDayIndex]
          ).slice(0, 10);
          while (
            taskIndex < allTasks.length &&
            allTasks[taskIndex].startDate === weekDayString
          ) {
            tempTasksByDay[weekDayIndex].push(allTasks[taskIndex]);
            taskIndex++;
          }
        }
        setTasksByDay(tempTasksByDay);
        setDataFetched(true);
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

  return (
    <>
      <div className="flex flex-row justify-center align-middle pb-10 pt-2 px-8">
        <WeekSelectorArrow
          weekChangeDirection={-1}
          shiftWeeksFunc={shiftWeeks}
        />
        <h2
          style={{ width: "28rem" }}
          className="text-xl text-slate-100 font-bold pt-2"
        >
          {weekDays[0]
            ? `Week of ${weekDays[0].toDateString().slice(4)} – ${weekDays[6]
                .toDateString()
                .slice(4)}`
            : ""}
        </h2>
        <WeekSelectorArrow
          weekChangeDirection={1}
          shiftWeeksFunc={shiftWeeks}
        />
      </div>
      <div
        className="border-slate-200 border-2 rounded-md"
        style={{ height: "75vh" }}
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
          style={{ height: "66vh" }}
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
