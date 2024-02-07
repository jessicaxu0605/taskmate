import { jwtDecode } from "jwt-decode";
import axios from "../config/axiosConfig";

function accessTokenExpired() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return true;

  const decodedToken = jwtDecode(accessToken);
  if (!decodedToken || !decodedToken.exp) return true;

  if (decodedToken.exp < Math.floor(Date.now() / 1000)) return true;
  return false;
}

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const refreshToken = localStorage.getItem("refreshToken");
    axios
      .post("/auth/token-refresh/", { refreshToken: refreshToken })
      .then((response) => {
        const accessToken = response.data.accessToken;
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          resolve(accessToken);
        } else {
          reject("no access token returned");
        }
      })
      .catch((err) => {
        //redirect to login page--refresh token is expired, or other error that requires reauthentication
        reject(err);
      });
  });
}

export async function validateAccessToken() {
  if (accessTokenExpired()) {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return false;
      return true; // Access token retrieved successfully
    } catch (error) {
      console.error("Error while getting access token:", error);
      return false; // Error occurred while getting access token, redirect to login page
    }
  } else {
    return true;
  }
}
