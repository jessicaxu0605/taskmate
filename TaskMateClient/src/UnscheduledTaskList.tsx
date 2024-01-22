import React, { useEffect } from 'react';
// import axios from 'axios';
import axios from './axiosConfig.js';
import UnscheduledTaskCard from './UnscheduledTaskCard';

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

    //fetch data
    return (
        <div>
            <ul>
                {/* {dataFetched
                ? tasksList.map((val)=><UnscheduledTaskCard id={val.id} name={val.name} dueTime={val.dueTime} dueDate={val.dueDate} duration={val.duration}/>) 
                : null} */}
            </ul>
        </div>
    )
}