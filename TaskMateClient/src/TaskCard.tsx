import React from 'react';
import { formatDateTime, formatTime } from './FormattingFunctions';
import { TIME_SLOT_HEIGHT } from './WeeklyView';

type TaskData = {
    display: string,
    id: number,
    name: string,
    dueTime: string,
    dueDate: string,
    duration: string,
}

const dragOffset = 16;

export default function TaskCard({  id, name, dueTime, dueDate, duration, display }: TaskData) {
    const formattedDueDateTime = formatDateTime(dueDate, dueTime);
    const formattedDuration = formatTime(duration);
    const slotsRequired = formattedDuration.hour * 4 + parseInt(formattedDuration.minute) / 15;
    const thisElemRef = React.useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = React.useState(false);
    const [isScheduled, setIsScheduled] = React.useState(true);

    function handleMouseDown(e: React.DragEvent<HTMLDivElement>) {
        if (isScheduled) {
            setIsScheduled(false);
            
            if (!thisElemRef.current) return;

            const target = thisElemRef.current;
            target.style.position = "relative";
            target.style.left = `${e.clientX - 32 - dragOffset}px`;
            e.stopPropagation;
        }
    }


    function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
        const target = e.target as HTMLElement;
        if (target instanceof HTMLElement) {
            e.dataTransfer.setData('cardID', target.id);
            e.dataTransfer.setData('offsetY', `${e.nativeEvent.offsetY}`);
            e.dataTransfer.setDragImage(target, dragOffset, dragOffset);
            setIsDragging(true);
            //hide the original card, using set timeout to prevent the "dragged" version from being hidden too
            setTimeout(()=>{
                target.style.display="none";
                target.style.left = "0";
            }, 0)
        }
    };

    //prevent cards from being dropped on top of each other
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        console.log("over");
        e.stopPropagation;
    }

    function handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        if(!thisElemRef.current) return;
        thisElemRef.current.style.display='block';

        const dropType =  e.dataTransfer.getData('dropType');
        console.log(dropType);
        if (dropType == 'scheduled') {
            setIsScheduled(false);
        } else if (dropType == 'false') {
            setIsScheduled(true);
        }
    }

    return (
        <div 
            id={`TaskCard${id}`}
            ref={thisElemRef}
            data-slots-required={slotsRequired}
            draggable 
            onMouseDown={handleMouseDown}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            style={isScheduled ? {} : {height: `${slotsRequired*TIME_SLOT_HEIGHT}px`, width: "12%"}} 
            className={`${isScheduled ? `p-1` : `px-1`} bg-slate-300 br-10 text-left rounded-lg border-slate-400 border-2 z-10 cursor-grab overflow-hidden`}>
            <div className={`${isScheduled ?  `grid grid-cols-3 ` :  null}`}>
                <h3 style={isScheduled ? {} : {height:"100%"}}className='font-bold text-sm'>{name}</h3>
                <p style={isScheduled ? {} : {display:"none"}} className='text-xs'>due <strong>{formattedDueDateTime.date}</strong> at <strong>{formattedDueDateTime.time}</strong></p>
                <p style={isScheduled ? {} : {display:"none"}} className='text-xs'>takes <strong>{`${formattedDuration.hour}:${formattedDuration.minute}`}</strong> to complete</p>
            </div>
        </div>
    );
}