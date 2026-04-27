import axios from "axios";

// NOTE: Uses 10.0.2.2 which is the Android emulator alias to localhost.
// If testing on a physical iOS/Android device over Wi-Fi, change this to your computer's local IP!
const API = axios.create({
  baseURL: "https://efficience-hotel.vercel.app",
});

export default API;
