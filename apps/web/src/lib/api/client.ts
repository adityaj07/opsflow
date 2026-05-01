import { env } from "@opsflow/env/web";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: `${env.VITE_SERVER_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
