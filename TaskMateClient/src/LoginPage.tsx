import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "./config/axiosConfig";
import { UserEmailContext } from "./App";

type FormInputs = {
  email: string | null;
  password: string | null;
};

type inputErrors =
  | "Password is incorrect!"
  | "No account was found with this email."
  | null;

function LoginForm() {
  const userEmailContext = React.useContext(UserEmailContext);
  const [formInputs, setFormInputs] = React.useState<FormInputs>({
    email: null,
    password: null,
  });
  const [inputError, setInputError] = React.useState<inputErrors>(null);
  const navigate = useNavigate();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setFormInputs((values) => ({ ...values, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(formInputs);

    axios
      .post("/auth/login/", formInputs)
      .then((result) => {
        console.log(result);
        userEmailContext.setEmail(result.data.email);
        sessionStorage.setItem("activeUserEmail", result.data.email);
        navigate("/calendars");
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response.data);
        if (
          err.response.data.email == "Enter a valid email address." ||
          err.response.data == "User Does Not Exist"
        ) {
          console.log("here");
          setInputError("No account was found with this email.");
        } else if (err.data == "Enter a valid email address.") {
        }
      });
  }

  const inputStyle =
    "border-slate-200 border-2 rounded-md text-xl p-2 bg-slate-900 text-slate-100";
  return (
    <form onSubmit={handleSubmit} className="w-96">
      <div style={{ width: "100%" }} className="p-4">
        <input
          required
          type="email"
          name="email"
          placeholder="email"
          value={formInputs.email || ""}
          onChange={handleInputChange}
          style={{ width: "100%" }}
          className={inputStyle}
        />
      </div>
      <div style={{ width: "100%" }} className="px-4 pb-4">
        <input
          required
          type="password"
          name="password"
          placeholder="password"
          value={formInputs.password || ""}
          onChange={handleInputChange}
          style={{ width: "100%" }}
          className={inputStyle}
        />
      </div>
      {inputError == null ? null : (
        <div className="flex justify-center m-2">
          <h2 className="text-violet-700">{inputError}</h2>
          {inputError == "No account was found with this email." ? (
            <Link to="/register">
              <h2 className="text-violet-700 pl-1 underline font-bold">
                Sign Up
              </h2>
            </Link>
          ) : null}
        </div>
      )}
      <input
        type="submit"
        value="LOGIN"
        style={{ width: "90%" }}
        className="bg-violet-700 rounded-full text-white font-bold py-3"
      />
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen relative top-0 left-0 bg-slate-900">
      <div className="p-10 border-slate-200 border-2 rounded-md">
        <h1 className="text-4xl text-slate-100">Welcome Back!</h1>
        <LoginForm />
      </div>
    </div>
  );
}
