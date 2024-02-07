import { useState, useContext, useEffect } from "react";
import axios from "./config/axiosConfig";
import { useNavigate } from "react-router";

import { UserEmailContext } from "./App";
import CalendarCard from "./CalendarCard";
import CreateCalendarOverlay from "./CreateCalendarOverlay";
import { validateAccessToken } from "./utils/authTokenRefresh";

type Calendar = {
  id: number;
  owner: number;
  name: string;
  sharedUsers: [];
  dateCreated: string;
  dateModified: string;
};

export default function CalendarsPage() {
  const userEmail = useContext(UserEmailContext).email; //component shouldn't be able to overwrite user email
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [ownedEmails, setOwnedEmails] = useState<Calendar[]>([]);
  const [createCalendarOverlayOpen, setCreateCalendarOverlayOpen] =
    useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDataFetched(false);
    validateAccessToken().then((isValidToken) => {
      if (isValidToken) {
        const accessToken = localStorage.getItem("accessToken");
        axios
          .get(`/app/user-calendars/?user=${userEmail}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }) //replace with userEmail later
          .then((response) => {
            setOwnedEmails(response.data);
            setDataFetched(true);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        navigate("/login");
      }
    });
  }, []);

  function handleClick() {
    setCreateCalendarOverlayOpen(true);
  }

  return (
    <>
      {createCalendarOverlayOpen ? (
        <CreateCalendarOverlay
          closeOverlay={() => {
            setCreateCalendarOverlayOpen(false);
          }}
        />
      ) : null}
      <div className="bg-slate-900 text-white h-screen w-screen p-28">
        <h1 className="text-4xl font-semibold text-left">My Calendars:</h1>
        <hr className="border-slate-700 border-b-2 my-6" />
        <div className="text-left">
          {dataFetched
            ? ownedEmails.map((val, index) => (
                <CalendarCard
                  key={index}
                  id={val.id}
                  name={val.name}
                  owner={val.owner}
                  dateModified={val.dateModified}
                  dateCreated={val.dateCreated}
                />
              ))
            : null}
          {dataFetched ? (
            <button
              onClick={handleClick}
              className="bg-violet-700 text-white text-xl font-semibold w-60 h-40 m-2 p-2 rounded-md cursor-pointer inline-block"
            >
              CREATE NEW CALENDAR
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
