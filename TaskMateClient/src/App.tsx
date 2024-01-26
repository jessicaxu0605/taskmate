import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import UnscheduledTaskList from './UnscheduledTaskList'
import WeeklyView from './WeeklyView'




function App() {
  return (
    <>
      <WeeklyView/>
      <UnscheduledTaskList/>
    </>
  )
}

export default App
