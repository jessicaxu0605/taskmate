import "./App.css";
import React from "react";
import LoginPage from "./LoginPage";
import WeeklyViewPage from "./WeeklyViewPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./RegisterPage";

type UserEmailContextType = {
  email: number | null;
  setEmail: React.Dispatch<React.SetStateAction<number | null>>;
};
export const UserEmailContext = React.createContext<UserEmailContextType>({
  email: null,
  setEmail: () => {},
});

export default function App() {
  const [activeUserEmail, setActiveUserEmail] = React.useState<number | null>(
    null
  );
  return (
    <UserEmailContext.Provider
      value={{ email: activeUserEmail, setEmail: setActiveUserEmail }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/weekly-view" element={<WeeklyViewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </UserEmailContext.Provider>
  );
}
