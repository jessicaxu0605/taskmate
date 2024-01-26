import React, { useEffect } from 'react';
// import axios from 'axios';
import axios from './axiosConfig';
import TaskCard from './TaskCard';

type rawTaskFormat = {"id":1,
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


export default function UnscheduledTaskList() {
    const [dataFetched, setDataFetched] = React.useState<boolean>(false)
    const [tasksList, setTasksList] = React.useState<rawTaskFormat[]>([])
    const thisElemRef = React.useRef<HTMLDivElement>(null);

    // TEMP:
    const calendarID = 1;

    React.useEffect(()=>{
        console.log("Start")
        axios.get(`/app/all-tasks/?calendar=${calendarID}`).then(
            (response)=>{
                setTasksList(response.data);
                console.log(response.data);
                setDataFetched(true);
            }
        )
        console.log("End")
    }, [])

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        const cardID = e.dataTransfer.getData('cardID');
        const card = document.getElementById(cardID);
        if (!card) return;

        e.dataTransfer.setData('dropType', 'unscheduled');

        if(!thisElemRef.current) return;
        thisElemRef.current.appendChild(card);
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    //fetch data
    return (
        <div ref={thisElemRef} id='unscheduled'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
                {dataFetched ? tasksList.map((val, index)=>
                    <TaskCard key={index} id={val.id} name={val.name} dueTime={val.dueTime} dueDate={val.dueDate} duration={val.duration} display={'false'}/>
                ) : null}
        </div>
    )
}