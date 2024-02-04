import React from "react";
import {
  dateTimeToDateAndTimeString,
  getTimeInNumOf15Mins,
} from "./utils/FormattingFunctions";
import { TIME_SLOT_HEIGHT } from "./utils/constants";
import { LatestDropContext } from "./WeeklyViewPage";
import ModifyTaskOverlay, { CloseOverlayArgs } from "./ModifyTaskOverlay";

export type TaskProps = {
  id: number;
  name: string;
  dueTime: string;
  dueDate: string;
  duration: string;
  isScheduledDefault: boolean;
  startTime: string | null;
  startDate: string | null;
};

export type ModifiableTaskData = {
  name: string;
  dueTime: string;
  dueDate: string;
  duration: string;
  startTime: string | null;
  startDate: string | null;
};

const DRAG_OFFSET = 16;

//prettier-ignore
export default function TaskCard({id, name, dueTime, dueDate, duration, isScheduledDefault, startTime, startDate}: TaskProps) {
  const [taskData, setTaskData] = React.useState<ModifiableTaskData>({
    name: name,
    dueTime: dueTime,
    dueDate: dueDate,
    duration: duration,
    startTime: startTime,
    startDate: startDate,
  });
  const thisElemRef = React.useRef<HTMLDivElement>(null);
  const dropContext = React.useContext(LatestDropContext);
  const [isScheduled, setIsScheduled] =
    React.useState<boolean>(isScheduledDefault);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const [modifyTaskOverlayOpen, setModifyTaskOverlayOpen] =
    React.useState<boolean>(false);
  const [isDead, setIsDead] = React.useState<boolean>(false);

  //Draggable functionality ------------------------------------------------------------------
  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    if (!thisElemRef.current) return;
    const target = thisElemRef.current;

    dropContext.setDrop({ completion: "dragging" });
    setIsDragging(true);

    const boundingRect = thisElemRef.current.getBoundingClientRect();
    if (!isScheduled) {
      target.style.position = "relative";
      target.style.left = `${e.clientX - boundingRect.x - DRAG_OFFSET}px`;
      target.style.top = `${e.clientY - boundingRect.y - DRAG_OFFSET}px`;
    }

    e.dataTransfer.setData("cardID", target.id);
    e.dataTransfer.setData("id", id.toString());
    e.dataTransfer.setData("name", taskData.name);
    e.dataTransfer.setData("dueTime", taskData.dueTime);
    e.dataTransfer.setData("dueDate", taskData.dueDate);
    e.dataTransfer.setData("duration", taskData.duration);
    e.dataTransfer.setDragImage(target, DRAG_OFFSET, DRAG_OFFSET);

    // hide the original card, using set timeout to prevent the "dragged" version from being hidden too
    setTimeout(() => {
      target.style.display = "none";
      target.style.left = "0";
    }, 0);

    e.stopPropagation();
  }

  //prevent cards from being dropped on top of each other
  //   function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
  //     e.stopPropagation();
  //   }

  function handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
    if (dropContext.drop.completion != "dropped") {
      dropContext.setDrop({ completion: "failed" });
    } else {
    }
    e.stopPropagation();
  }

  React.useEffect(() => {
    if (
      !isDragging ||
      dropContext.drop.completion == "dragging" ||
      dropContext.drop.completion == "dropped"
    )
      return;
    if (dropContext.drop.completion == "failed") {
      if (!thisElemRef.current) return;
      thisElemRef.current.style.display = "block";
    }
    if (dropContext.drop.completion == "complete") {
    }
    setIsDragging(false);
  }, [dropContext.drop]);

  function getTop() {
    const startTimeIn15Mins = getTimeInNumOf15Mins(
      taskData.startTime as string
    ); //function will only be called if startTime is defined
    const top = startTimeIn15Mins * TIME_SLOT_HEIGHT;
    return `${top}px`;
  }

  //Modify overlay functionality ------------------------------------------------------------------

  function closeOverlay(result: CloseOverlayArgs) {
    if (result != null) {
      const newTaskData = taskData;
      for (const key in result.newData) {
        newTaskData[key as keyof ModifiableTaskData] = result.newData[
          key
        ] as string;
      }
      setTaskData(newTaskData);
    }
    setModifyTaskOverlayOpen(false);
  }

  function killTaskCard() {
    console.log("here")
    setIsDead(true);
  }

  if (isDead) return;

  return (
    <>
      {modifyTaskOverlayOpen ? (
        <ModifyTaskOverlay
          taskID={id}
          name={taskData.name}
          dueTime={taskData.dueTime}
          dueDate={taskData.dueDate}
          duration={taskData.duration}
          startTime={taskData.startTime}
          startDate={taskData.startDate}
          closeOverlay={closeOverlay}
          killTaskCard={killTaskCard}
        />
      ) : null}
      <div
        id={`TaskCard${id}`}
        ref={thisElemRef}
        draggable
        onDragStart={handleDragStart}
        // onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDoubleClick={() => {
          setModifyTaskOverlayOpen(true);
        }}
        style={{
          height:
            isScheduled || isDragging
              ? `${
                  getTimeInNumOf15Mins(taskData.duration) * TIME_SLOT_HEIGHT
                }px`
              : "auto",
          width: isDragging ? "8vw" : isScheduled ? "100%" : "auto",
          top: isScheduledDefault ? getTop() : "0",
          position: isScheduledDefault ? "absolute" : "static",
          display: "block",
        }}
        //prettier-ignore
        className={`${isScheduled || isDragging ? `px-1` : `p-2 m-1`} 
        bg-slate-700 br-10 text-left rounded-lg border-slate-600 border-2 z-10 cursor-grab overflow-hidden text-slate-100`}
      >
        <div
          className={`overflow-hidden`}
        >
          <h3
            style={isScheduled || isDragging ? { height: "100%" } : {}}
            className="font-bold text-sm"
          >
            {taskData.name}
          </h3>
          <p
            style={isScheduled || isDragging ? { display: "none" } : {}}
            className="text-xs"
          >
            due{" "}
            <strong>
              {dateTimeToDateAndTimeString(taskData.dueDate, taskData.dueTime)}
            </strong>
          </p>
          <p
            style={isScheduled || isDragging ? { display: "none" } : {}}
            className="text-xs"
          >
            takes <strong>{`${taskData.duration.slice(0, 5)}`}</strong> to
            complete
          </p>
        </div>
      </div>
    </>
  );
}
