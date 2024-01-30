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
  completion: 'dragging'|'dropped'|'failed'|null;
}
export type DropContextData = DropContextDataComplete| DropContextDataIncomplete;

type DropContext = {
  drop: DropContextData;
  setDrop: Dispatch<SetStateAction<DropContextData>>
}

export const LatestDropContext = React.createContext<DropContext>({drop:{completion: null}, setDrop: ()=>{}});

type WeeklyViewChildrenType = {
  [key: number]: React.ReactElement
}

function App() {
  const [drop, setDrop] = React.useState<DropContextData>({completion: null});
  const [weeksFromToday, setWeeksFromToday] = React.useState<number>(0);
  // const [weeklyViewChildren, setWeeklyViewChildren] = React.useState<WeeklyViewChildrenType>({0:<WeeklyView weeksFromToday1={0}/>})

  return (
      <LatestDropContext.Provider value={{  drop, setDrop  }}>
        {/* {Object.entries(weeklyViewChildren).map(([key, value])=>(<div key={key}>{value}</div>))} */}
        <WeeklyView/>
        <UnscheduledTaskList/>
      </LatestDropContext.Provider>
  )
}

export default App
