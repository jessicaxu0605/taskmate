import { useState, useRef, useEffect, useContext } from "react";
import { TIME_SLOT_HEIGHT } from "./utils/constants";
import { LatestDropContext } from "./WeeklyViewPage";
import ModifyTaskOverlay, { CloseOverlayArgs } from "./ModifyTaskOverlay";

export type TaskProps = {
  id: number;
  name: string;
  dueDateTime: Date;
  duration: string;
  isScheduledDefault: boolean;
  startDateTime: Date | null;
};

export type ModifiableTaskData = {
  name: string;
  dueDateTime: Date;
  duration: string;
  startDateTime: Date | null;
};

const DRAG_OFFSET = 16;

//prettier-ignore
export default function TaskCard({id, name, dueDateTime, duration, isScheduledDefault, startDateTime}: TaskProps) {
  const [taskData, setTaskData] = useState<ModifiableTaskData>({
    name: name,
    dueDateTime: dueDateTime,
    duration: duration,
    startDateTime: startDateTime
  });
  const thisElemRef = useRef<HTMLDivElement>(null);
  const dropContext = useContext(LatestDropContext);
  // @ts-ignore
  const [isScheduled, setIsScheduled] =
    useState<boolean>(isScheduledDefault);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [modifyTaskOverlayOpen, setModifyTaskOverlayOpen] =
    useState<boolean>(false);
  const [isDead, setIsDead] = useState<boolean>(false);

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

    // e.dataTransfer.setData("cardID", target.id);
    e.dataTransfer.setData("id", id.toString());
    e.dataTransfer.setData("name", taskData.name);
    // e.dataTransfer.setData("dueTime", taskData.dueTime);
    // e.dataTransfer.setData("dueDate", taskData.dueDate);
    e.dataTransfer.setData("dueDateTimeISOString", taskData.dueDateTime.toISOString());
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

  useEffect(() => {
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
    if (!startDateTime) return;
    const hours = startDateTime.getHours();
    const minutes = startDateTime.getMinutes();
    const startTimeIn15Mins = (hours * 4) + Math.floor(minutes / 15);
    console.log (startDateTime);
    const top = startTimeIn15Mins * TIME_SLOT_HEIGHT;
    return `${top}px`;
  }

  function getHeight() {
    const timeParts = taskData.duration.split(":");
    const durationIn15Mins =
      4 * parseInt(timeParts[0]) + parseInt(timeParts[1]) / 15;
    const height = durationIn15Mins  * TIME_SLOT_HEIGHT;
    return `${height}px`;
  }

  function DateToReadableDateTime(date: Date) {
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    };
    const timeFormatOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
    };
    const formattedDate = date.toLocaleString("en-US", dateFormatOptions);
    const formattedTime = date.toLocaleString("en-US", timeFormatOptions);
    return formattedDate + " at " + formattedTime;
  }

  //Modify overlay functionality ------------------------------------------------------------------

  function closeOverlay(result: CloseOverlayArgs) {
    if (result != null) {
      const newTaskData = taskData;
      for (const key in result.newData) {
        // prettier-ignore
        newTaskData[key as keyof ModifiableTaskData] = result.newData[key];
      }
      setTaskData(newTaskData);
    }
    setModifyTaskOverlayOpen(false);
  }

  function killTaskCard() {
    setIsDead(true);
  }

  if (isDead) return;

  return (
    <>
      {modifyTaskOverlayOpen ? (
        <ModifyTaskOverlay
          taskID={id}
          name={taskData.name}
          dueDateTime={taskData.dueDateTime}
          duration={taskData.duration}
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
          height: isScheduled || isDragging ? getHeight() : "auto",
          width: isDragging ? "8vw" : isScheduled ? "100%" : "auto",
          top: isScheduledDefault ? getTop() : "0",
          position: isScheduledDefault ? "absolute" : "static",
          display: "block",
        }}
        //prettier-ignore
        className={`${isScheduled || isDragging ? `px-1` : `p-2 m-1`} 
        bg-slate-700 br-10 text-left rounded-lg border-slate-600 border-2 z-10 cursor-grab overflow-hidden text-slate-100`}
      >
        <div className={`overflow-hidden`}>
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
              {/* fix this formatting actually later */}
              {DateToReadableDateTime(taskData.dueDateTime)}
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
