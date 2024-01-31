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
            ).catch(
                ()=>{
                    dropContext.setDrop({  completion: 'failed'  });
                }
            );
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
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
                    selfDestruct={()=>{}}
                    />
            ) : <></>}
        </div>
    )
}