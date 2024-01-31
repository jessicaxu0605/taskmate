import React, { useEffect } from 'react';
import axios from './config/axiosConfig';
import TaskCard from './TaskCard';
import {  LatestDropContext  } from './App';
import {  rawTaskFormat  } from './utils/globalTypes';


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
        const reqBody = {
            "taskID": parseInt(e.dataTransfer.getData('id')),
            "newData":{
                "startTime": 'null',
                "startDate": 'null'
            }
        }
        const newTask = {
            "id": parseInt(e.dataTransfer.getData('id')),
            "name": e.dataTransfer.getData('name'),
            "dateCreated": null,
            "dueDate": e.dataTransfer.getData('dueDate'),
            "dueTime": e.dataTransfer.getData('dueTime'),
            "duration": e.dataTransfer.getData('duration'),
            "startDate": null,
            "startTime": null,
            "endTime": null,
            "eventTypeID": null,       //to be implemented
            "properties": null,        //to be implemented
            "calendarID": null,        //field not needed here, only relevant for fetching
        }
        axios.put('/app/task/', reqBody).then(
            ()=>{                
                const newTasksList = tasksList;
                newTasksList.push(newTask);
                setTasksList(newTasksList);

                dropContext.setDrop({  completion: 'complete'  });
            }
        );
    }
    
    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }


    return (
        <div ref={thisElemRef} id='unscheduled' className='bg-slate-100 min-h-8'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {dataFetched ? tasksList.map((val, index)=>
                <TaskCard 
                    key={index} 
                    id={val.id} 
                    name={val.name} 
                    dueTime={val.dueTime} 
                    dueDate={val.dueDate} 
                    duration={val.duration} 
                    isScheduledDefault={false} 
                    startTime={null} 
                    selfDestruct={()=>{}}
                    />
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