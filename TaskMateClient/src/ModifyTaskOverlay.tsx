import { useState, useContext } from "react";
import axios from "./config/axiosConfig";
import { useNavigate } from "react-router-dom";
import { CalendarContext } from "./App";
import { validateAccessToken } from "./utils/authTokenRefresh";

type FormInputs = {
  name: string | null;
  dueDate: string | null;
  dueTime: string | null;
  durationHour: string | null;
  durationMinute: string | null;
  startDate: string | null;
  startTime: string | null;
};

type ModifyTaskOverlayProps = {
  taskID: number;
  name: string;
  dueDate: string;
  dueTime: string;
  duration: string;
  startDate: string | null;
  startTime: string | null;
  closeOverlay: (result: CloseOverlayArgs) => void;
  killTaskCard: () => void;
};

type FormRequestBody = {
  taskID: number;
  calendarID: number;
  newData: {
    [key: string]: any;
  };
};

export type CloseOverlayArgs = FormRequestBody | null;

type inputErrors =
  | "error: time needed to complete task cannot be 0"
  | "error: time needed to complete task cannot be more than 24 hours"
  | "error: scheduled time conflicts with a pre-existing task"
  | null;

export default function ModifyTaskOverlay({
  taskID,
  name,
  dueDate,
  dueTime,
  duration,
  startDate,
  startTime,
  closeOverlay,
  killTaskCard,
}: ModifyTaskOverlayProps) {
  const [formInputs, setFormInputs] = useState<FormInputs>({
    name: name,
    dueDate: dueDate,
    dueTime: dueTime,
    durationHour: duration.slice(0, 2),
    durationMinute: duration.slice(3, 5),
    startDate: startDate,
    startTime: startTime,
  });
  //prettier-ignore
  const durationHourOptions: string[] = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
  const [inputError, setInputError] = useState<inputErrors>(null);
  const calendarID = useContext(CalendarContext).calendarID;
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formInputs.durationHour == "00" && formInputs.durationMinute == "00") {
      setInputError("error: time needed to complete task cannot be 0");
      return;
    }
    if (formInputs.durationHour == "24" && formInputs.durationMinute != "00") {
      setInputError(
        "error: time needed to complete task cannot be more than 24 hours"
      );
      return;
    }
    const reqBody: FormRequestBody = {
      taskID: taskID,
      calendarID: calendarID as number,
      newData: {},
    };
    const formInputDuration =
      formInputs.durationHour + ":" + formInputs.durationMinute + ":00";

    let isModified: boolean = false;

    if (formInputs.name != name) {
      reqBody.newData["name"] = formInputs.name;
      isModified = true;
    }
    if (formInputs.dueDate != dueDate) {
      reqBody.newData["dueDate"] = formInputs.dueDate;
      isModified = true;
    }
    if (formInputs.dueTime != dueTime) {
      reqBody.newData["dueTime"] = formInputs.dueTime + ":00";
      isModified = true;
    }
    if (formInputDuration != duration) {
      reqBody.newData["duration"] = formInputDuration;
      isModified = true;
    }
    if (formInputs.startDate != startDate) {
      reqBody.newData["startDate"] = formInputs.startDate;
      isModified = true;
    }
    if (formInputs.startTime != startTime) {
      reqBody.newData["startTime"] = formInputs.startTime + ":00";
      isModified = true;
    }

    if (!isModified) {
      closeOverlay(null);
      return;
    }
    validateAccessToken().then((isValidToken) => {
      if (isValidToken) {
        const accessToken = localStorage.getItem("accessToken");
        axios
          .put("/app/task/", reqBody, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })
          .then(() => {
            closeOverlay(reqBody);
          })
          .catch((err) => {
            if (err.response.status == 500) {
              //change this once I get a more specific error in place
              setInputError(
                "error: scheduled time conflicts with a pre-existing task"
              );
            }
          });
      } else {
        navigate("/login");
      }
    });
  }

  function deleteTask() {
    validateAccessToken().then((isValidToken) => {
      if (isValidToken) {
        const accessToken = localStorage.getItem("accessToken");
        axios
          .delete(`/app/task/?task=${taskID}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })
          .then(() => {
            killTaskCard();
          });
      } else {
        navigate("/login");
      }
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setFormInputs((values) => ({ ...values, [name]: value }));
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setFormInputs((values) => ({ ...values, [name]: value }));
  }

  function backgroundExit(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).id != "background") return;
    closeOverlay(null);
  }
  function buttonExit() {
    closeOverlay(null);
  }

  const inputStyles = "bg-slate-900 border-slate-500 border-b-2 text-slate-100";

  return (
    <>
      <div
        id="background"
        className="flex justify-center items-center w-screen h-screen top-0 right-0 fixed z-30 bg-slate-900 bg-opacity-80 text-slate-100"
        onClick={backgroundExit}
      >
        <div
          style={{ width: "40rem" }}
          className="bg-slate-900 br-10 text-left rounded-lg border-slate-100 border-2 opacity-100"
        >
          <div className="flex flex-row justify-end">
            <div onClick={buttonExit} className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 352 512"
                className="w-5 h-5 m-1"
              >
                {/* <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
                <path
                  fill="rgb(71 85 105)"
                  d="M242.7 256l100.1-100.1c12.3-12.3 12.3-32.2 0-44.5l-22.2-22.2c-12.3-12.3-32.2-12.3-44.5 0L176 189.3 75.9 89.2c-12.3-12.3-32.2-12.3-44.5 0L9.2 111.5c-12.3 12.3-12.3 32.2 0 44.5L109.3 256 9.2 356.1c-12.3 12.3-12.3 32.2 0 44.5l22.2 22.2c12.3 12.3 32.2 12.3 44.5 0L176 322.7l100.1 100.1c12.3 12.3 32.2 12.3 44.5 0l22.2-22.2c12.3-12.3 12.3-32.2 0-44.5L242.7 256z"
                />
              </svg>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="px-16 py-10">
            <div className="flex flex-row justify-evenly">
              <div style={{ width: "100%" }} className="m-4">
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Task Name"
                  value={formInputs.name || ""}
                  onChange={handleInputChange}
                  style={{ width: "100%" }}
                  className={inputStyles + " text-4xl"}
                />
              </div>
            </div>
            <div className="flex flex-row justify-evenly">
              <div style={{ width: "50%" }} className="m-4">
                <label>
                  Due Date: <br />
                  <input
                    required
                    name="dueDate"
                    type="date"
                    value={formInputs.dueDate || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%" }}
                    className={inputStyles + " text-2xl"}
                  />
                </label>
              </div>
              <div style={{ width: "50%" }} className="m-4">
                <label>
                  Due Time: <br />
                  <input
                    required
                    name="dueTime"
                    type="time"
                    value={formInputs.dueTime || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%" }}
                    className={inputStyles + " text-2xl"}
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-row justify-evenly">
              <div style={{ width: "100%" }} className="m-4">
                <label style={{ width: "100%" }}>
                  Estimated Time to Complete Task:
                  <select
                    required
                    name="durationHour"
                    value={formInputs.durationHour || ""}
                    onChange={handleSelectChange}
                    className={inputStyles + " text-2xl ml-1"}
                  >
                    {durationHourOptions.map((val) => (
                      <option key={val} value={val}>
                        {parseInt(val)}
                      </option>
                    ))}
                  </select>
                  Hours
                  <select
                    required
                    name="durationMinute"
                    value={formInputs.durationMinute || ""}
                    onChange={handleSelectChange}
                    className={inputStyles + " text-2xl ml-1"}
                  >
                    <option value={"00"}>00</option>
                    <option value={"15"}>15</option>
                    <option value={"30"}>30</option>
                    <option value={"45"}>45</option>
                  </select>
                  Minutes
                </label>
              </div>
            </div>
            {/* <hr
              style={{ borderWidth: "1px" }}
              className="border-slate-400 m-2 my-6"
            />
            <div className="flex flex-row justify-evenly">
              <div style={{ width: "50%" }} className="m-4">
                <label>
                  Scheduled Start Date: <br />
                  <input
                    required
                    name="startDate"
                    type="date"
                    value={formInputs.startDate || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%" }}
                    className={inputStyles + " text-2xl"}
                  />
                </label>
              </div>
              <div style={{ width: "50%" }} className="m-4">
                <label>
                  Scheduled Start Time: <br />
                  <input
                    required
                    name="startTime"
                    type="time"
                    value={formInputs.startTime || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%" }}
                    className={inputStyles + " text-2xl"}
                  />
                </label>
              </div>
            </div> */}
            {inputError == null ? null : (
              <div className="flex justify-center m-2">
                <h2 className="text-red-600">{inputError}</h2>
              </div>
            )}
            <div className="flex flex-row justify-center m-4">
              <button
                className="border-slate-500 border-2 bg-slate-900 rounded-full font-bold py-3 px-6 mx-5"
                onClick={deleteTask}
              >
                DELETE TASK
              </button>
              <input
                type="submit"
                value="MODIFY TASK"
                className="bg-violet-700 rounded-full text-white font-bold py-3 px-6 mx-5"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
