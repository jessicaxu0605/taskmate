import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LeftArrow } from "./assets/SelectionArrows";
import axios from "./config/axiosConfig";
import { validateAccessToken } from "./utils/authTokenRefresh";
import { UserEmailContext, CalendarContext } from "./App";

export function LogoutButton() {
  const navigate = useNavigate();
  const userEmailContext = useContext(UserEmailContext);
  const calendarContext = useContext(CalendarContext);
  function logout() {
    validateAccessToken().then((isValidToken) => {
      if (isValidToken) {
        const accessToken = localStorage.getItem("accessToken");
        axios.post(
          "/auth/logout/",
          { refreshToken: localStorage.getItem("refreshToken") },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      //regardless of access token validity, clear all stored values
      localStorage.clear();
      sessionStorage.clear();
      calendarContext.setCalendarID(null);
      userEmailContext.setEmail(null);

      navigate("/");
    });
  }

  return (
    <div onClick={logout} className="text-white font-semibold mr-4 ml-20">
      LOGOUT
    </div>
  );
}
