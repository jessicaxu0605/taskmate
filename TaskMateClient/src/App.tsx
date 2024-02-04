import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages:
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import WeeklyViewPage from "./WeeklyViewPage";
import CalendarsPage from "./CalendarsPage";
import LandingPage from "./LandingPage";

type UserEmailContextType = {
  email: string | null;
  setEmail: React.Dispatch<React.SetStateAction<string | null>>;
};
export const UserEmailContext = React.createContext<UserEmailContextType>({
  email: null,
  setEmail: () => {},
});

type CalendarContextType = {
  calendarID: number | null;
  setCalendarID: React.Dispatch<React.SetStateAction<number | null>>;
};
export const CalendarContext = React.createContext<CalendarContextType>({
  calendarID: null,
  setCalendarID: () => {},
});

type AuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  setAccessToken: () => {},
  setRefreshToken: () => {},
  logout: () => {},
});

export default function App() {
  const [activeUserEmail, setActiveUserEmail] = React.useState<string | null>(
    sessionStorage.getItem("activeUserEmail") != null
      ? sessionStorage.getItem("activeUserEmail")
      : null
  );
  const [activeCalendarID, setActiveCalendarID] = React.useState<number | null>(
    sessionStorage.getItem("activeCalendarID") != null
      ? parseInt(sessionStorage.getItem("activeCalendarID") as string)
      : null
  );

  return (
    <UserEmailContext.Provider
      value={{ email: activeUserEmail, setEmail: setActiveUserEmail }}
    >
      <CalendarContext.Provider
        value={{
          calendarID: activeCalendarID,
          setCalendarID: setActiveCalendarID,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/weekly-view" element={<WeeklyViewPage />} />
            <Route path="/calendars" element={<CalendarsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </CalendarContext.Provider>
    </UserEmailContext.Provider>
  );
}
