import React, { Dispatch, SetStateAction } from 'react';
import axios from './config/axiosConfig';
import './App.css';

//Components:
import UnscheduledTaskList from './UnscheduledTaskList'
import WeeklyView from './WeeklyView'


type DropContextDataComplete = {
  completion: 'complete';
  location: 'WeeklyView' | 'UnscheduledTaskList';
}

type DropContextDataIncomplete = {
  completion: 'incomplete';
}

export type DropContextData = DropContextDataComplete| DropContextDataIncomplete;

type DropContext = {
  drop: DropContextData;
  setDrop: Dispatch<SetStateAction<DropContextData>>
}

export const LatestDropContext = React.createContext<DropContext>({drop:{completion: 'incomplete'}, setDrop: ()=>{}});

function App() {

  const [scheduledTasks, setScheduledTasks] = React.useState<JSON[]>([]);
  const [drop, setDrop] = React.useState<DropContextData>({completion: 'incomplete'});

  React.useEffect(()=>{
    axios.get(`/app/all-scheduled-tasks/?calendar=${1}`).then(
        (result)=>{
          setScheduledTasks(result.data);
        }
    );
  }, []);




  return (
      <LatestDropContext.Provider value={{  drop, setDrop  }}>
        <WeeklyView/>
        <UnscheduledTaskList/>
      </LatestDropContext.Provider>
  )
}

export default App
