import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "./config/axiosConfig";
import { UserEmailContext } from "./App";

export default function LandingPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen relative top-0 left-0 bg-slate-900">
      <h1 className="text-4xl font-semibold text-slate-100">
        Welcome to TaskMate!
      </h1>
      <div className="w-80">
        <Link to="/register">
          <button
            style={{ width: "40%" }}
            className="bg-violet-700 rounded-full text-white font-bold py-3 mt-5 mx-2"
          >
            SIGN UP
          </button>
        </Link>
        <Link to="/login">
          <button
            style={{ width: "40%" }}
            className="bg-slate-900 border-slate-100 border-2 rounded-full text-white font-bold py-3 mt-5 mx-2"
          >
            LOG IN
          </button>
        </Link>
      </div>
    </div>
  );
}
