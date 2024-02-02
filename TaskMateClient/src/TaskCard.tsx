import React from 'react';
import { formatDateTime, formatTime } from './utils/FormattingFunctions';
import { TIME_SLOT_HEIGHT } from './utils/constants';
import {  LatestDropContext  } from './App';
import ModifyTaskOverlay from './ModifyTaskOverlay';


export type TaskData = {
    id: number,
    name: string,
    dueTime: string,
    dueDate: string,
    duration: string,
    isScheduledDefault: boolean,
    startTime: string | null,
    startDate: string | null
}

const dragOffset = 16;

export default function TaskCard({  id, name, dueTime, dueDate, duration, isScheduledDefault, startTime, startDate  }: TaskData) {
    const thisElemRef = React.useRef<HTMLDivElement>(null);
    const dropContext = React.useContext(LatestDropContext);
    const [isScheduled, setIsScheduled] = React.useState<boolean>(isScheduledDefault);
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const [modifyTaskOverlayOpen, setModifyTaskOverlayOpen] = React.useState<boolean>(false);


    const formattedDueDateTime = formatDateTime(dueDate, dueTime);
    const formattedDuration = formatTime(duration);
    const slotsRequired = formattedDuration.hour * 4 + parseInt(formattedDuration.minute) / 15;


    //Draggable functionality ------------------------------------------------------------------
    function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
        if (!thisElemRef.current) return;
        const target = thisElemRef.current;

        dropContext.setDrop({  completion: 'dragging'  });
        setIsDragging(true);
        
        if (!isScheduled) {
            target.style.position = "relative";
            target.style.left = `${e.clientX - 32 - dragOffset}px`;
        }

        e.dataTransfer.setData('cardID', target.id); 
        e.dataTransfer.setData('id', id.toString());       
        e.dataTransfer.setData('name', name);
        e.dataTransfer.setData('dueTime', dueTime);
        e.dataTransfer.setData('dueDate', dueDate);
        e.dataTransfer.setData('duration', duration);
        e.dataTransfer.setData('slotsRequired', slotsRequired.toString());
        e.dataTransfer.setDragImage(target, dragOffset, dragOffset);

        // hide the original card, using set timeout to prevent the "dragged" version from being hidden too
        setTimeout(()=>{
            console.log(target.id);
            target.style.display="none";
            target.style.left = "0";
        }, 0)
        
        e.stopPropagation();
    };

    //prevent cards from being dropped on top of each other
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.stopPropagation();
    }

    function handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
        if (dropContext.drop.completion != 'dropped') {
            dropContext.setDrop({  completion: 'failed'  });
        } else {
        }
        e.stopPropagation();
    }

    React.useEffect(()=>{
        if (!isDragging || dropContext.drop.completion == 'dragging' || dropContext.drop.completion == 'dropped') return;
        if (dropContext.drop.completion == 'failed') {
            if(!thisElemRef.current) return;
            thisElemRef.current.style.display='block';
        }
        if (dropContext.drop.completion == 'complete') {
        }
        setIsDragging(false);        
    }, [dropContext.drop])
    
    function getTop () {
        const formattedStartTime = formatTime(startTime as string);     //function will only be called if startTime is defined
        const slotsRequired = formattedStartTime.hour * 4 + parseInt(formattedStartTime.minute) / 15;
        const top = slotsRequired * TIME_SLOT_HEIGHT;
        return `${top}px`;
    }

    //Modify overlay functionality ------------------------------------------------------------------

    return (
        <>
        {modifyTaskOverlayOpen
        ? <ModifyTaskOverlay 
            taskID={id} 
            name={name} 
            dueTime={dueTime} 
            dueDate={dueDate} 
            duration={duration} 
            startTime={startTime} 
            startDate={startDate} 
            closeOverlay={()=>{setModifyTaskOverlayOpen(false)}}/>
        : null}
        <div 
            id={`TaskCard${id}`}
            ref={thisElemRef}
            data-slots-required={slotsRequired}
            draggable 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDoubleClick={()=>{setModifyTaskOverlayOpen(true)}}
            style={{
                height: isScheduled || isDragging ? `${slotsRequired * TIME_SLOT_HEIGHT}px` : 'auto',
                width: isDragging ? '11vw' : (isScheduled ? '100%' : 'auto'),
                top: isScheduledDefault ? getTop() : '0',
                position: isScheduledDefault ? 'absolute' : 'static',
                display: 'block'
            }}
            className={`${isScheduled || isDragging ? `px-1` :`p-1`} bg-slate-300 br-10 text-left rounded-lg border-slate-400 border-2 z-10 cursor-grab overflow-hidden`}>
            <div className={`${isScheduled || isDragging ?  '' :  `grid grid-cols-3`} overflow-hidden`}>
                <h3 style={isScheduled || isDragging ? {height:"100%"} : {}}className='font-bold text-sm'>{name}</h3>
                <p style={isScheduled || isDragging ? {display:"none"} : {}} className='text-xs'>due <strong>{formattedDueDateTime.date}</strong> at <strong>{formattedDueDateTime.time}</strong></p>
                <p style={isScheduled || isDragging ? {display:"none"} : {}} className='text-xs'>takes <strong>{`${formattedDuration.hour}:${formattedDuration.minute}`}</strong> to complete</p>
            </div>
        </div>
        </>
    );
}