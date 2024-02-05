import axios from "axios";

const configured = axios.create({
  baseURL: "http://18.116.35.152:8000/", //'http://localhost:8000/api',
});

export default configured;
