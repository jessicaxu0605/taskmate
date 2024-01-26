import React from 'react'
import axios from './axiosConfig';

const TIME_SLOT_HEIGHT = 16; //px     keep this in number form to do math with

type DayBoardProps = {
    // slotsAvail: (boardID:string, slotNum:number, slotsRequired:number) => boolean;
    // fillSlots: (boardID:string, slotNum:number, slotsRequired:number) => void;
    // clearSlots: (boardID:string, slotNum:number, slotsRequired:number) => void;
    date:Date,
    id:string
}

type DayHeaderProps = {
    date:Date
}

function DayHeader({ date }:DayHeaderProps) {
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


function DayBoard({ date, id }:DayBoardProps) {
    const thisElemRef = React.useRef<HTMLDivElement>(null);

    function getTaskCardDuration(e: React.DragEvent<HTMLDivElement>) {
        if (!thisElemRef.current) return; 
        const dayBoardBoundingBox = thisElemRef.current.getBoundingClientRect();
        const cursorToCardTop = 16;                                             //distance from mouse to top of card (upon dragStart)
        const taskCardTop = e.clientY - cursorToCardTop;                        //absolute Y of card (upon drop)
        const cardTopToBoardTop = taskCardTop-dayBoardBoundingBox.top;          //distance from top of Board to Y of card (upon drop)
        return Math.round(cardTopToBoardTop / TIME_SLOT_HEIGHT);
    }

    function formatReqBody(timeIn15Mins: number, taskCard:HTMLElement) {
        const hour = Math.floor(timeIn15Mins / 4);
        const minute = (timeIn15Mins % 4) * 15;
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

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const taskCardID = e.dataTransfer.getData('cardID');
        const taskCard = document.getElementById(taskCardID); 
        if (!taskCard) return;

        e.dataTransfer.setData('dropType', 'scheduled');

        //make card visible again whether drop failed or succeeded
        taskCard.style.display = 'block'; 

        //calculate which slot from the top to place the element, based on the coordinate of the top of the card
        const timeIn15Mins = getTaskCardDuration(e);
        if(!timeIn15Mins) return;
        
        const reqBody = formatReqBody(timeIn15Mins, taskCard);
        //ensure that request is valid 100% of time
        axios.put('/app/task/', reqBody).then(
            (result)=>{
                if (result.status == 200) {
                    let top = timeIn15Mins * TIME_SLOT_HEIGHT;
                    if (top < 0) top = 0;
                    else if (top > 1472) top = 1472;
                    
                    taskCard.style.top = `${top}px`;
                    taskCard.style.width = "100%";
                    taskCard.style.position="absolute";
                }

                if (!thisElemRef.current) return;                               //assert ref mounted
                thisElemRef.current.appendChild(taskCard);
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

function GridBackground() {
    function renderGridLines() {
        const lines = [];
        for (let i = 0; i < 24; i++) {
            lines.push(
                <hr key={i} style={{height:`${4*TIME_SLOT_HEIGHT}px`}} className='border-b border-slate-100'></hr>
            )
        }
        return lines;
    }
    return(
    <div style={{width:"100%"}} className='grid grid-cols-24 absolute'>
        {renderGridLines()}
    </div>)
}


interface FilledSlots {
    [key: string]: number[];
}

export default function WeeklyView() {
    //O(1) lookup for status of slots (excepting hash collisions)
    //Board identified by key; slot identified by index of the array corresponeding its Board
    //value of 0 = slot available, 1 = slot is filled
    const filledSlots =React.useRef<FilledSlots>({
        "DayBoard0": Array.from({ length: 96 }, () => 0),
        "DayBoard1": Array.from({ length: 96 }, () => 0),
        "DayBoard2": Array.from({ length: 96 }, () => 0),
        "DayBoard3": Array.from({ length: 96 }, () => 0),
        "DayBoard4": Array.from({ length: 96 }, () => 0),
        "DayBoard5": Array.from({ length: 96 }, () => 0),
        "DayBoard6": Array.from({ length: 96 }, () => 0)
        });

    function slotsAvail(boardID:string, slotNum:number, slotsRequired:number) {
        const boardFilledSlots = filledSlots.current[boardID]
        console.log(boardFilledSlots);
        for (let i = 0; i < slotsRequired; i++) {
            if (boardFilledSlots[slotNum + i] == 1) return false;               //if any of the required slots are filled (value of 1), return false
        }
        return true                                                             //else return true
    }

    function fillSlots(boardID:string, slotNum:number, slotsRequired:number) {
        const boardFilledSlots = filledSlots.current[boardID]
        for (let i = 0; i < slotsRequired; i++) {
            boardFilledSlots[slotNum + i] = 1;
        }
        filledSlots.current[boardID] = boardFilledSlots;
        console.log(boardFilledSlots);
    }

    function clearSlots(boardID:string, slotNum:number, slotsRequired:number) {
        const boardFilledSlots = filledSlots.current[boardID]
        for (let i = 0; i < slotsRequired; i++) {
            boardFilledSlots[slotNum + i] = 0;
        }
        filledSlots.current[boardID] = boardFilledSlots;
        console.log(boardFilledSlots);
    }

    const [weeksFromToday, setWeeksFromToday] = React.useState<number>(0)
    const [weekDays, setWeekDays] = React.useState<Date[]>([])
    // using actual Date object so I don't have to deal w crossing over months
    function getWeekDays(weeksFromToday: number) { 
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek - (7 * weeksFromToday))

        const weekDaysTemp = []
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(startDate.getDate() + i);
            weekDaysTemp.push(date);
        }
        setWeekDays(weekDaysTemp);
    }
    
    function renderTimeLabels() {
        const timeLabels = [];
        timeLabels.push(<div key='empty' style={{height:`calc(${4*TIME_SLOT_HEIGHT}px - 1rem)`}}></div>)
        for (let i = 1; i <= 12; i++) {
            timeLabels.push(<div key={`t${i}`} style={{height:`${4*TIME_SLOT_HEIGHT}px`}}>{`${i}:00 AM`}</div>)
        }
        for (let i = 1; i <= 12; i++) {
            timeLabels.push(<div key={`t${i+12}`} style={{height:`${4*TIME_SLOT_HEIGHT}px`}}>{`${i}:00 PM`}</div>)
        }
        return timeLabels;
    }

    React.useEffect(()=>{
        getWeekDays(weeksFromToday)
    }, [weeksFromToday])


    return (
        <div className='border-slate-200 border'>
        <div className={`grid grid-cols-8 border-slate-200 overflow-y-scroll h-1/2 relative`}>
            <div key="empty"></div>
            {weekDays.map((val, index)=> 
            <div key={index}>
                <DayHeader date={val}/>
            </div>)}
        </div> 
        <hr/>
        <div style={{height:"70vh"}} className={`grid grid-cols-8 border-slate-200 overflow-y-scroll h-1/2 relative`}>
        <GridBackground/>
            <div className='text-right pr-2 bg-white z-10 relative'>{renderTimeLabels()}</div>
            {weekDays.map((val, index)=> 
            <div key={index}>
                <DayBoard id={`DayBoard${index}`} date={val} />
            </div>)}
        </div> 
        </div>  
    )
} 

export {TIME_SLOT_HEIGHT};