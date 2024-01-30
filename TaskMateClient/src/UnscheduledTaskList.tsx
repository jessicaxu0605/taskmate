import React, { useEffect } from 'react';
// import axios from 'axios';
import axios from './config/axiosConfig';
import TaskCard from './TaskCard';
import {  LatestDropContext, DropContextData  } from './App'

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


function UnscheduledTaskBoard() {
    const [dataFetched, setDataFetched] = React.useState<boolean>(false)
    const [tasksList, setTasksList] = React.useState<rawTaskFormat[]>([])
    const thisElemRef = React.useRef<HTMLDivElement>(null);
    const dropContext = React.useContext(LatestDropContext);

    // TEMP:
    const calendarID = 1;

    React.useEffect(()=>{
        axios.get(`/app/all-unscheduled-tasks/?calendar=${calendarID}`).then(
            (response)=>{
                setTasksList(response.data);
                setDataFetched(true);
            }
        )
    }, [])

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        dropContext.setDrop({  completion: 'dropped'  });
        const taskCardID = e.dataTransfer.getData('cardID');        
        const taskCard = document.getElementById(taskCardID);
        if (!taskCard) {
            dropContext.setDrop({  completion: 'failed'  })
            return;
        }

        const reqBody = {
            "taskID": parseInt(taskCardID.slice(8)),
            "newData":{
                "startTime": 'null',
                "startDate": 'null'
            }
            
        }
        axios.put('/app/task/', reqBody).then(
            ()=>{
                if(!thisElemRef.current) {
                    dropContext.setDrop({  completion: 'failed'  })
                    return;
                }
                thisElemRef.current.appendChild(taskCard);
                taskCard.style.top = '0';
                taskCard.style.top = '0';
                taskCard.style.position="static";
                taskCard.style.display="block";
        
                const dropContextData:DropContextData = {
                    completion: 'complete',
                    location: 'UnscheduledTaskList'
                }
                dropContext.setDrop(dropContextData);
            }
        );
        
    }
    
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }


    //fetch data
    return (
        <div ref={thisElemRef} id='unscheduled' className='bg-slate-100 min-h-8'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {dataFetched ? tasksList.map((val, index)=>
                <TaskCard key={index} id={val.id} name={val.name} dueTime={val.dueTime} dueDate={val.dueDate} duration={val.duration} isScheduledDefault={false} startTime={null}/>
            ) : null}
        </div>
    )
}


export default function UnscheduledTaskList() {
    return <div className='z-10'>
        <h3>Unscheduled Tasks:</h3>
        <UnscheduledTaskBoard/>
    </div>
}