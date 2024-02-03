import React from "react";

const timeSlotHeight = 16; //px     keep this in number form to do math with

type DayBoardProps = {
  slotsAvail: (
    boardID: string,
    slotNum: number,
    slotsRequired: number
  ) => boolean;
  fillSlots: (boardID: string, slotNum: number, slotsRequired: number) => void;
  clearSlots: (boardID: string, slotNum: number, slotsRequired: number) => void;
  date: Date;
  id: string;
};

type DayHeaderProps = {
  date: Date;
};

function DayHeader({ date }: DayHeaderProps) {
  const dayOfWeekStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className={`border p-2 flex flex-row h-11`}>
      <span className="bg-red-800 rounded-full w-6 h-6 flex flex-col justify-center">
        <h2 className="text-white font-bold text-sm">{date.getDate()}</h2>
      </span>
      <h3 className={`text-left font-medium pl-2`}>
        {dayOfWeekStrings[date.getDay()]}
      </h3>
    </div>
  );
}

//MAYBE: RESTRUCTURE THIS SO THAT SLOTS ARE PURELY DECORATIVE
//JUST SET TOP VALUE OF CARD TO CERTAIN AMOUNT TO LINE IT UP WITH A BACKGROUND GRID
function DayBoard({
  slotsAvail,
  fillSlots,
  clearSlots,
  date,
  id,
}: DayBoardProps) {
  //frequency array: index corresponds to slotID, value of 0: slot is open; 1: slot is filled
  const filledTimeSlots = React.useRef<number[]>(
    Array.from({ length: 96 }, () => 0)
  );
  const thisElemRef = React.useRef<HTMLDivElement>(null);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const cardID = e.dataTransfer.getData("cardID");
    const card = document.getElementById(cardID);
    if (!card) return; //assert the card was found
    //make card visible again whether drop failed or succeeded
    card.style.display = "block";

    //get bounding  box of the DayBoard element
    if (!thisElemRef.current) return; //assert ref is mounted
    const boundingBox = thisElemRef.current.getBoundingClientRect();

    //calculate which slot from the top to place the element, based on the coordinate of the top of the card
    const offsetY = e.dataTransfer.getData("offsetY"); //distance from mouse to top of card (upon dragStart)
    const cardY = e.clientY - parseInt(offsetY); //absolute Y of card (upon drop)
    const relativeMouseY = cardY - boundingBox.top; //distance from top of Board to Y of card (upon drop)
    const slotNum = Math.round(relativeMouseY / timeSlotHeight);
    const slot = document.getElementById(`${id}slot${slotNum}`);

    //get number of slots the card takes up
    const tempSlotsRequired = card.dataset.slotsRequired;
    if (!tempSlotsRequired) return;
    const slotsRequired = parseInt(tempSlotsRequired);

    if (slot && slotsAvail(id, slotNum, slotsRequired)) {
      //fill time slots
      fillSlots(id, slotNum, slotsRequired);

      //if the card has already been dragged onto a board, remove the element
      const dragOriginSlot = card.parentNode as HTMLElement;
      if (dragOriginSlot instanceof HTMLElement) {
        const dragOriginSlotID = dragOriginSlot.id;
        const IDParts = dragOriginSlotID.split("slot"); //slotIDs are of format "<DayBoardID>slot<slotNum>"
        if (IDParts[0].startsWith("DayBoard")) {
          //check if the parent element is a slot, or it card is unscheduled
          clearSlots(IDParts[0], parseInt(IDParts[1]), slotsRequired);
        }
      }

      // card.style.top = `${top}px`;
      card.style.width = "100%";
      slot.appendChild(card);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function renderSlots() {
    const slots = [];
    for (let i = 0; i < 96; i++) {
      slots.push(
        <div
          id={`${id}slot${i}`}
          key={i}
          style={{ height: `${timeSlotHeight}px` }}
          className={`${i % 4 == 0 ? "border-t" : null} border-x`}
        ></div>
      );
    }
    return slots;
  }

  return (
    <div
      ref={thisElemRef}
      id={id}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`border-slate-400`}
    >
      <div className={`grid grid-rows-96`}>{renderSlots()}</div>
    </div>
  );
}

interface FilledSlots {
  [key: string]: number[];
}

export default function WeeklyView() {
  //O(1) lookup for status of slots (excepting hash collisions)
  //Board identified by key; slot identified by index of the array corresponeding its Board
  //value of 0 = slot available, 1 = slot is filled
  const filledSlots = React.useRef<FilledSlots>({
    DayBoard0: Array.from({ length: 96 }, () => 0),
    DayBoard1: Array.from({ length: 96 }, () => 0),
    DayBoard2: Array.from({ length: 96 }, () => 0),
    DayBoard3: Array.from({ length: 96 }, () => 0),
    DayBoard4: Array.from({ length: 96 }, () => 0),
    DayBoard5: Array.from({ length: 96 }, () => 0),
    DayBoard6: Array.from({ length: 96 }, () => 0),
  });

  function slotsAvail(boardID: string, slotNum: number, slotsRequired: number) {
    const boardFilledSlots = filledSlots.current[boardID];
    console.log(boardFilledSlots);
    for (let i = 0; i < slotsRequired; i++) {
      if (boardFilledSlots[slotNum + i] == 1) return false; //if any of the required slots are filled (value of 1), return false
    }
    return true; //else return true
  }

  function fillSlots(boardID: string, slotNum: number, slotsRequired: number) {
    const boardFilledSlots = filledSlots.current[boardID];
    for (let i = 0; i < slotsRequired; i++) {
      boardFilledSlots[slotNum + i] = 1;
    }
    filledSlots.current[boardID] = boardFilledSlots;
    console.log(boardFilledSlots);
  }

  function clearSlots(boardID: string, slotNum: number, slotsRequired: number) {
    const boardFilledSlots = filledSlots.current[boardID];
    for (let i = 0; i < slotsRequired; i++) {
      boardFilledSlots[slotNum + i] = 0;
    }
    filledSlots.current[boardID] = boardFilledSlots;
    console.log(boardFilledSlots);
  }

  const [weeksFromToday, setWeeksFromToday] = React.useState<number>(0);
  const [weekDays, setWeekDays] = React.useState<Date[]>([]);
  // using actual Date object so I don't have to deal w crossing over months
  function getWeekDays(weeksFromToday: number) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek - 7 * weeksFromToday);

    const weekDaysTemp = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(startDate.getDate() + i);
      weekDaysTemp.push(date);
    }
    setWeekDays(weekDaysTemp);
  }

  function renderTimeLabels() {
    const timeLabels = [];
    timeLabels.push(<div key="empty" className="h-11"></div>);
    for (let i = 1; i <= 12; i++) {
      timeLabels.push(
        <div
          key={`t${i}`}
          style={{ height: `${4 * timeSlotHeight}px` }}
        >{`${i}:00 AM`}</div>
      );
    }
    for (let i = 1; i <= 12; i++) {
      timeLabels.push(
        <div
          key={`t${i + 12}`}
          style={{ height: `${4 * timeSlotHeight}px` }}
        >{`${i}:00 PM`}</div>
      );
    }
    return timeLabels;
  }

  React.useEffect(() => {
    getWeekDays(weeksFromToday);
  }, [weeksFromToday]);

  return (
    <div
      style={{ height: "500px" }}
      className={`grid grid-cols-8 border-slate-200 overflow-scroll h-1/2 relative`}
    >
      <div className="text-right pr-2">{renderTimeLabels()}</div>
      {weekDays.map((val, index) => (
        <div key={index}>
          <DayHeader date={val} />
          <DayBoard
            slotsAvail={slotsAvail}
            fillSlots={fillSlots}
            clearSlots={clearSlots}
            id={`DayBoard${index}`}
            date={val}
          />
        </div>
      ))}
    </div>
  );
}

export { timeSlotHeight };
