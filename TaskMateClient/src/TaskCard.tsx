import React from 'react';
import { formatDateTime, formatTime } from './utils/FormattingFunctions';
import { TIME_SLOT_HEIGHT } from './utils/constants';
import {  LatestDropContext, DropContextData  } from './App';

type TaskData = {
    id: number,
    name: string,
    dueTime: string,
    dueDate: string,
    duration: string,
}

const dragOffset = 16;

export default function TaskCard({  id, name, dueTime, dueDate, duration}: TaskData) {
    const thisElemRef = React.useRef<HTMLDivElement>(null);
    const dropContext = React.useContext(LatestDropContext);
    const [isScheduled, setIsScheduled] = React.useState<boolean>(false);
    const [isDragging, setIsDragging] = React.useState<boolean>(false);

    const formattedDueDateTime = formatDateTime(dueDate, dueTime);
    const formattedDuration = formatTime(duration);
    const slotsRequired = formattedDuration.hour * 4 + parseInt(formattedDuration.minute) / 15;

    function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
        if (!thisElemRef.current) return;
        const target = thisElemRef.current;

        dropContext.setDrop({  completion: 'incomplete'  });
        setIsDragging(true);
        setIsScheduled(true);
        
        if (!isScheduled) {
            target.style.position = "relative";
            target.style.left = `${e.clientX - 32 - dragOffset}px`;
        }

        e.dataTransfer.setData('cardID', target.id);        
        e.dataTransfer.setDragImage(target, dragOffset, dragOffset);

        //hide the original card, using set timeout to prevent the "dragged" version from being hidden too
        setTimeout(()=>{
            target.style.display="none";
            target.style.left = "0";
        }, 0)
    };

    //prevent cards from being dropped on top of each other
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.stopPropagation;
    }

    React.useEffect(()=>{
        if (!isDragging || dropContext.drop.completion == 'incomplete') return;

        if (dropContext.drop.location == 'UnscheduledTaskList') {
            setIsScheduled(false);
        } else if (dropContext.drop.location == 'WeeklyView') {
            setIsScheduled(true);
        }
        setIsDragging(false);        
    }, [dropContext.drop])


    return (
        <div 
            id={`TaskCard${id}`}
            ref={thisElemRef}
            data-slots-required={slotsRequired}
            draggable 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            style={isScheduled && isDragging? {height: `${slotsRequired*TIME_SLOT_HEIGHT}px`, width:'11vw'} 
            : isScheduled ? {height: `${slotsRequired*TIME_SLOT_HEIGHT}px`, width:'100%'} 
            : {}} 
            className={`${isScheduled ? `px-1 top-0` :`p-1`} bg-slate-300 br-10 text-left rounded-lg border-slate-400 border-2 z-10 cursor-grab overflow-hidden`}>
            <div className={`${isScheduled ?  '' :  `grid grid-cols-3`} overflow-hidden`}>
                <h3 style={isScheduled ? {height:"100%"} : {}}className='font-bold text-sm'>{name}</h3>
                <p style={isScheduled ? {display:"none"} : {}} className='text-xs'>due <strong>{formattedDueDateTime.date}</strong> at <strong>{formattedDueDateTime.time}</strong></p>
                <p style={isScheduled ? {display:"none"} : {}} className='text-xs'>takes <strong>{`${formattedDuration.hour}:${formattedDuration.minute}`}</strong> to complete</p>
            </div>
        </div>
    );
}