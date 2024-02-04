import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarContext } from "./App";
import { ISOStringToDateAndTimeString } from "./utils/FormattingFunctions";

type CalendarCardProps = {
  id: number;
  name: string;
  dateCreated: string;
  dateModified: string;
  owner: number;
};

export default function CalendarCard({
  id,
  name,
  owner,
  dateModified,
  dateCreated,
}: CalendarCardProps) {
  const navigate = useNavigate();
  const calendarContext = React.useContext(CalendarContext);

  function handleClick() {
    calendarContext.setCalendarID(id);
    sessionStorage.setItem("activeCalendarID", id.toString());
    sessionStorage.setItem("activeCalendarName", name);
    navigate("/weekly-view");
  }

  return (
    <div
      className="w-60 h-40 m-2 p-2 border-2 border-slate-100 rounded-md cursor-pointer inline-block align-top"
      onClick={handleClick}
    >
      <h2 className="text-xl text-left">{name}</h2>
      <h2 className="text-sm text-left text-slate-500 italic">
        Modified {ISOStringToDateAndTimeString(dateModified)}
      </h2>
      {/* <button
        style={{ width: "100%" }}
        className="bg-violet-700 rounded-full text-white font-bold py-3 px-6 relative bottom-0"
      >
        OPEN
      </button> */}
    </div>
  );
}
