import { useState, useContext } from "react";
import axios from "./config/axiosConfig";
import { CalendarContext } from "./App";

// type FormInputs = {
//   name: string | null;
//   dueDate: string | null;
//   dueTime: string | null;
//   durationHour: string | null;
//   durationMinute: string | null;
// };

type CreateTaskOverlayProps = {
  closeOverlay: () => void;
};

type inputErrors =
  | "error: time needed to complete task cannot be 0"
  | "error: time needed to complete task cannot be more than 24 hours"
  | null;

export default function CreateTaskOverlay({
  closeOverlay,
}: CreateTaskOverlayProps) {
  const [formInputs, setFormInputs] = useState({
    name: null,
    dueDate: null,
    dueTime: null,
    durationHour: "0",
    durationMinute: "00",
  });
  //prettier-ignore
  const durationHourOptions: string[] = [ "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24",
  ];
  const [inputError, setInputError] = useState<inputErrors>(null);
  const calendarID = useContext(CalendarContext).calendarID;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formInputs.durationHour == "0" && formInputs.durationMinute == "00") {
      setInputError("error: time needed to complete task cannot be 0");
      return;
    }
    if (formInputs.durationHour == "24" && formInputs.durationMinute != "00") {
      setInputError(
        "error: time needed to complete task cannot be more than 24 hours"
      );
      return;
    }

    const reqBody = {
      calendarID: calendarID,
      name: formInputs.name,
      dueDate: formInputs.dueDate,
      dueTime: formInputs.dueTime + ":00",
      duration:
        formInputs.durationHour + ":" + formInputs.durationMinute + ":00",
    };
    axios.post("/app/task/", reqBody).then(() => {
      closeOverlay();
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
    closeOverlay();
  }
  function buttonExit() {
    closeOverlay();
  }

  const inputStyles = "bg-slate-900 border-slate-500 border-b-2 text-slate-100";

  return (
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
          {inputError == null ? null : (
            <div className="flex justify-center m-2">
              <h2 className="text-red-600">{inputError}</h2>
            </div>
          )}
          <div className="flex flex-row justify-center m-4">
            <input
              type="submit"
              value="CREATE TASK"
              className="bg-violet-700 rounded-full text-white font-bold py-3 px-6 bg-"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
