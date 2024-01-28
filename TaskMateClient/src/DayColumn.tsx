import React from 'react'
import axios from './config/axiosConfig';
import { TIME_SLOT_HEIGHT } from './utils/constants';
import {  LatestDropContext, DropContextData  } from './App';

type DayBoardProps = {
    date:Date,
    id:string
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

export function DayBoard({ date, id }:DayBoardProps) {
    const thisElemRef = React.useRef<HTMLDivElement>(null);
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

    function formatReqBody(startTimeIn15Mins: number, taskCard:HTMLElement) {
        const hour = Math.floor(startTimeIn15Mins / 4);
        const minute = (startTimeIn15Mins % 4) * 15;
        const startTime = `${hour}:${minute}:00`;
        const startDate = date.toISOString().substring(0, 10);
        const taskID = parseInt(taskCard.id.slice(8));

        return {
            "taskID": taskID,
            "newData":{
                "startTime": startTime,
                "startDate": startDate,
            }
        }        
    }

    //drag and drop:
    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const taskCardID = e.dataTransfer.getData('cardID');
        const taskCard = document.getElementById(taskCardID); 
        if (!taskCard) return;

        e.dataTransfer.setData('dropType', 'scheduled');

        //number of 15 minute time slots from the top of the board
        const startTimeIn15Mins = getStartTime(e);
        if(!startTimeIn15Mins) return;
        
        const reqBody = formatReqBody(startTimeIn15Mins, taskCard);
        axios.put('/app/task/', reqBody).then(
            ()=>{
                //styling
                let top = startTimeIn15Mins * TIME_SLOT_HEIGHT;
                if (top < 0) top = 0;
                else if (top > 1472) top = 1472;
                taskCard.style.top = `${top}px`;
                taskCard.style.width = "100%";
                taskCard.style.position="absolute";
                taskCard.style.display="block";

                //append child
                if (!thisElemRef.current) return;
                thisElemRef.current.appendChild(taskCard);

                //update dropContext to complete
                const dropContextData:DropContextData = {
                    completion: 'complete',
                    location: 'WeeklyView'
                }
                dropContext.setDrop(dropContextData);
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
            className={`border-slate-200 border-x relative`}
        ></div>
    )
}