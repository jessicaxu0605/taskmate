import React from 'react'
import axios from './config/axiosConfig';
import { TIME_SLOT_HEIGHT } from './utils/constants';
import {  LatestDropContext  } from './App';
import {  rawTaskFormat  } from './utils/globalTypes'
import TaskCard from './TaskCard';

type DayBoardProps = {
    date:Date,
    id:string,
    defaultTasksList: rawTaskFormat[];
    dataFetched: boolean;
    shiftWeeks: (num: number)=>void;
}

type DayHeaderProps = {
    date:Date
}

export function DayHeader({ date }:DayHeaderProps) {
    const dayOfWeekStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return(
        <div className={`p-2 flex flex-row h-11 border-x`}>
            <span className='bg-red-800 rounded-full w-6 h-6 flex flex-col justify-center'>
                <h2 className='text-white font-bold text-sm'>{date.getDate()}</h2>
            </span>
            <h3 className={`text-left font-medium pl-2`}>{dayOfWeekStrings[date.getDay()]}</h3>
        </div>
    )
}

export function DayBoard({ date, id, defaultTasksList, dataFetched, shiftWeeks }:DayBoardProps) {
    const thisElemRef = React.useRef<HTMLDivElement>(null);
    const [tasksList, setTasksList] = React.useState(defaultTasksList);
    const filledTimeSlots = React.useRef(Array.from({ length: 96 }, () => 0));

    React.useEffect(()=>{
        if (dataFetched) {
            setTasksList(defaultTasksList);
        }
    }, [dataFetched])

    React.useEffect(()=>{
        console.log(id);
        console.log(tasksList);
    }, [tasksList])


    const dropContext = React.useContext(LatestDropContext);

    // helper functions:

    function findTaskByTime(startTime: string): number {
        let start = 0;
        let end = tasksList.length;
        let mid = 0;
        let counter = 0;
        while (start <= end) {
            if (counter > 10) break;
            mid = Math.floor((start + end)/2);
            const midStartTime = tasksList[mid].startTime as string;
            //lexigaphical comparison works here to compare time in format "HH:MM:SS"!
            if (midStartTime == startTime)
                return mid;
            else if (midStartTime < startTime ) {
                start = mid;
            } else 
                end = mid;
            counter++;
        }
        return -1; //not found
    }

    function getAvailTimeIndex(startTime: string, endTime: string) {
        console.log("here");
        //if tasksList is empty, simply add at index 0;
        if (tasksList.length == 0) return 0;

        //1. find preceding task (task whose startTime is closest, yet still before the new startTime)
        let start = 0;
        let end = tasksList.length;
        let mid = -1;
        while (start < end) {
            mid = Math.floor((start + end)/2);
            if (mid==start) break;

            const midStartTime = tasksList[mid].startTime as string;
            //lexigaphical comparison works here to compare time in format "HH:MM:SS"!
            if (midStartTime <= startTime ) {
                start = mid;
            } else 
                end = mid;
        }
        const precedingTaskIndex = mid;
       
        //2. check if precedingTask.endTime is after newTask.startTime
        if (mid >= 0 &&                                                         //skip on edge case: no preceding task
            tasksList[precedingTaskIndex].endTime as string > startTime) {
                return -1;  //not available
        }
        //3. check if proceedingTask.startTime is before newTask.endTime
        if (precedingTaskIndex + 1 < tasksList.length &&                        //skip on edge case: preceding task is last element in array
            tasksList[precedingTaskIndex + 1].startTime as string < endTime) {
                return -1;  //not available
        }
        console.log(precedingTaskIndex);
        return precedingTaskIndex;
    }

    //get startTime depending on number of 15 min slots from the top of the card to the top of the board
    function getStartTime(e: React.DragEvent<HTMLDivElement>) {
        if (!thisElemRef.current) return; 
        const dayBoardBoundingBox = thisElemRef.current.getBoundingClientRect();
        const cursorToCardTop = 16;                                             //distance from mouse to top of card (upon dragStart)
        const taskCardTop = e.clientY - cursorToCardTop;                        //absolute Y of card (upon drop)
        const cardTopToBoardTop = taskCardTop-dayBoardBoundingBox.top;          //distance from top of Board to Y of card (upon drop)
        return Math.round(cardTopToBoardTop / TIME_SLOT_HEIGHT);
    }
    function getEndTime(startTimeIn15Mins: number, slotsRequired: number) {
        return startTimeIn15Mins + slotsRequired;
    }

    function formatTime(startTimeIn15Mins: number) {
        const hour = Math.floor(startTimeIn15Mins / 4);
        const minute = (startTimeIn15Mins % 4) * 15;
        const time = `${hour}:${minute}:00`;
        return time;
    }
    function formatDate() {
        return date.toISOString().substring(0, 10);
    }

    //drag and drop:
    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        dropContext.setDrop({  completion: 'dropped'  });
        e.preventDefault();
        e.stopPropagation;

        //number of 15 minute time slots from the top of the board
        const startTimeIn15Mins = getStartTime(e);
        if(startTimeIn15Mins == null) {
            dropContext.setDrop({  completion: 'failed'  })
            return;
        }
        const endTimeIn15Mins = getEndTime(startTimeIn15Mins, parseInt(e.dataTransfer.getData('slotsRequired')));

        const startTime = formatTime(startTimeIn15Mins);
        const endTime = formatTime(endTimeIn15Mins);

        const availableTimeIndex = getAvailTimeIndex(startTime, endTime);
        console.log("time index" + availableTimeIndex);
        if (availableTimeIndex < 0) {
            dropContext.setDrop({  completion: 'failed'  })
            console.log("FUCK MEFSDFSDFDSFd");
            return;
        }
        
        const reqBody = {
            "taskID": parseInt(e.dataTransfer.getData('id')),
            "newData":{
                "startDate": formatDate(),
                "startTime": startTime,
                "endTime": endTime
            }
        }
        const newTask: rawTaskFormat = {
            "id": parseInt(e.dataTransfer.getData('id')),
            "name": e.dataTransfer.getData('name'),
            "dateCreated": null,
            "dueDate": e.dataTransfer.getData('dueDate'),
            "dueTime": e.dataTransfer.getData('dueTime'),
            "duration": e.dataTransfer.getData('duration'),
            "startDate": formatDate(),
            "startTime": startTime,
            "endTime": endTime,
            "eventTypeID": null,       //to be implemented
            "properties": null,        //to be implemented
            "calendarID": null,        //field not needed here, only relevant for fetching
        }

        axios.put('/app/task/', reqBody).then(
            ()=>{
                const newTasksList = tasksList
                // newTasksList.splice(availableTimeIndex, 0, newTask)
                newTasksList.push(newTask);
                setTasksList(newTasksList);

                dropContext.setDrop({  completion: 'complete'  });
            }
        );
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function removeDraggedItem(taskID: number, startTime: string|null) {
        // const removeIndex = findTaskByTime(startTime as string);
        // console.log(tasksList);
        // console.log(id + "remove " + removeIndex);
        // if (removeIndex < 0) {
        //     dropContext.setDrop({  completion: 'failed'  });
        //     return;
        // }
        // const newTasksList = tasksList
        // newTasksList.splice(removeIndex, 1);
        // setTasksList(newTasksList);
    }

    return(
        <div ref={thisElemRef} id={id} 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{height:"1536px"}}
            className={`border-slate-200 border-x relative`}>
            {dataFetched ? tasksList.map((val, index)=>
                <TaskCard 
                    key={index} 
                    id={val.id} 
                    name={val.name} 
                    dueTime={val.dueTime} 
                    dueDate={val.dueDate} 
                    duration={val.duration} 
                    isScheduledDefault={true} 
                    startTime={val.startTime} 
                    selfDestruct={removeDraggedItem}
                    />
            ) : <></>}
        </div>
    )
}