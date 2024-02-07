import { useState, useContext } from "react";
import axios from "./config/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { UserEmailContext } from "./App";

type FormInputs = {
  email: string | null;
  password: string | null;
  verifyPassword: string | null;
};

//ADD CATCH FOR USER ALREADY EXISTS
type inputErrors =
  | "Please enter a valid email."
  | "Password fields do not match."
  | "You already have an account!"
  | null;

function RegisterForm() {
  const userEmailContext = useContext(UserEmailContext);
  const [formInputs, setFormInputs] = useState<FormInputs>({
    email: null,
    password: null,
    verifyPassword: null,
  });
  const [inputError, setInputError] = useState<inputErrors>(null);
  const navigate = useNavigate();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setFormInputs((values) => ({ ...values, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formInputs.password != formInputs.verifyPassword) {
      setInputError("Password fields do not match.");
      return;
    }

    axios
      .post("/auth/register/", formInputs)
      .then((result) => {
        userEmailContext.setEmail(result.data.email);
        navigate("/calendars");
      })
      .catch((err) => {
        if (err.response.data.email == "Enter a valid email address.") {
          setInputError("Please enter a valid email.");
        } else if (
          err.response.data.email == "user with this email already exists."
        ) {
          setInputError("You already have an account!");
        }
        console.log(err);
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
      <div style={{ width: "100%" }} className="px-4 pb-4">
        <input
          required
          type="password"
          name="verifyPassword"
          placeholder="confirm password"
          value={formInputs.verifyPassword || ""}
          onChange={handleInputChange}
          style={{ width: "100%" }}
          className={inputStyle}
        />
      </div>
      {inputError == null ? null : (
        <div className="flex justify-center m-2">
          <h2 className="text-red-600">{inputError}</h2>
          {inputError == "You already have an account!" ? (
            <Link to="/login">
              <h2 className="text-violet-600 pl-1 underline font-bold">
                Log In
              </h2>
            </Link>
          ) : null}
        </div>
      )}
      <input
        type="submit"
        value="SIGN UP"
        style={{ width: "90%" }}
        className="bg-violet-700 rounded-full text-white font-bold py-3"
      />
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen relative top-0 left-0 bg-slate-900">
      <div className="p-10 border-slate-200 border-2 rounded-md">
        <h1 className="text-4xl text-slate-100 font-semibold">Sign Up!</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
