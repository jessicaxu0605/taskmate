import React, { Dispatch, SetStateAction } from 'react';
import './App.css';

//Components:
import UnscheduledTaskList from './UnscheduledTaskList';
import WeeklyView from './WeeklyView';
import CreateTaskOverlay from './CreateTaskOverlay';


type DropContextData = {
  completion: 'dragging'|'dropped'|'failed'|'complete'|null;
}
type DropContext = {
  drop: DropContextData,
  setDrop: Dispatch<SetStateAction<DropContextData>>
}
export const LatestDropContext = React.createContext<DropContext>({drop:{completion: null}, setDrop: ()=>{}});

type ModifyTaskOverlayContext = {
  modifyTaskOverlayOpen: boolean,
  setModifyTaskOverlayOpen: Dispatch<SetStateAction<boolean>>
}
export const ModifyTaskOverlayContext = React.createContext<ModifyTaskOverlayContext>({modifyTaskOverlayOpen: false, setModifyTaskOverlayOpen: ()=>{}});

function App() {
  const [drop, setDrop] = React.useState<DropContextData>({completion: null});
  const [createTaskOverlayOpen, setCreateTaskOverlayOpen] = React.useState<boolean>(false);
  const [modifyTaskOverlayOpen, setModifyTaskOverlayOpen] = React.useState<boolean>(false);


  return (
      <LatestDropContext.Provider value={{  drop, setDrop  }}>
          {createTaskOverlayOpen ? <CreateTaskOverlay closeOverlay={()=> setCreateTaskOverlayOpen(false)}/> : null}
          <WeeklyView />
          <button onClick={()=> setCreateTaskOverlayOpen(true)} className='bg-red-800 rounded-full text-white font-bold py-3 px-6'>CREATE NEW TASK</button>
          <UnscheduledTaskList/>
      </LatestDropContext.Provider>
  )
}

export default App
