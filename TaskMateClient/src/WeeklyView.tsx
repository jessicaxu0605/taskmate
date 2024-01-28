import React, { ReactNode } from 'react'
import axios from './config/axiosConfig';
import { TIME_SLOT_HEIGHT } from './utils/constants';
import {  DayHeader, DayBoard  } from './DayColumn'

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




type rawTaskFormat = {
    "id": number,
    "name": string,
    "dateCreated": string, //ISODateString
    "dueDate": string,
    "dueTime": string,
    "duration": string,
    "startDate": string | null,
    "startTime": string | null,
    "endTime": string | null,
    "eventTypeID": string | null,       //to be implemented
    "properties": string | null,        //to be implemented
    "calendarID": number
}

export default function WeeklyView() {
    const [weeksFromToday, setWeeksFromToday] = React.useState<number>(0)
    const [weekDays, setWeekDays] = React.useState<Date[]>([])
    const [tasksByDay, setTasksByDay] = React.useState<rawTaskFormat[][]>([[], [], [], [], [], [], []])

    React.useEffect(()=>{
        setWeekDaysState(weeksFromToday);
    }, [weeksFromToday])

    React.useEffect(()=>{
        const startOfWeek = weekDays[0];
        if (!startOfWeek) return;

        const startOfWeekParam = startOfWeek.toISOString().slice(0, 10);
        axios.get(`/app/weekly-scheduled-tasks/?calendar=${1}/?startDate=${startOfWeekParam}`).then(
            (result) => {
                const allTasks:rawTaskFormat[] = result.data;
                const tempTasksByDay: rawTaskFormat[][] = [[], [], [], [], [], [], []];

                let taskIndex = 0;
                for (let weekDayIndex = 0; weekDayIndex < 7; weekDayIndex++) {
                    while (taskIndex < allTasks.length && allTasks[taskIndex].startDate === weekDays[weekDayIndex].toISOString().slice(0, 10)) {
                        tempTasksByDay[weekDayIndex].push(allTasks[taskIndex]);
                        taskIndex++;
                    }
                }
            }
        )
    }, [weekDays])

    // using actual Date object so I don't have to deal w crossing over months
    function setWeekDaysState(weeksFromToday: number) { 
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek - (7 * weeksFromToday))

        const weekDaysTemp = []
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(startOfWeek.getDate() + i);
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

