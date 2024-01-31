import React, { Dispatch, SetStateAction } from 'react';
import './App.css';

//Components:
import UnscheduledTaskList from './UnscheduledTaskList'
import WeeklyView from './WeeklyView'



type DropContextData = {
  completion: 'dragging'|'dropped'|'failed'|'complete'|null;
}

type DropContext = {
  drop: DropContextData;
  setDrop: Dispatch<SetStateAction<DropContextData>>
}

export const LatestDropContext = React.createContext<DropContext>({drop:{completion: null}, setDrop: ()=>{}});


function App() {
  const [drop, setDrop] = React.useState<DropContextData>({completion: null});

  return (
      <LatestDropContext.Provider value={{  drop, setDrop  }}>
        <WeeklyView/>
        <UnscheduledTaskList/>
      </LatestDropContext.Provider>
  )
}

export default App
