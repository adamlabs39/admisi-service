import axios from "axios";
import { Context as Ctx } from "../middlewares/context.js";
import { CTX_TOKEN } from "../constant/context-constant.js";

const BASE_URL_ANTRIAN = "http://192.168.1.77:7001/api/v3/antrian";

const authInterceptor = (config) => {
  const token = Ctx.get(CTX_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

//* Modul Antrian
const generateNoAntrian = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/data-antrian/admisi-registration`,
  timeout: 10000,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Ctx.get(CTX_TOKEN)}`,
  },
});

generateNoAntrian.interceptors.request.use(authInterceptor);

const jadwalDokterAntrian = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/jadwal-dokter`,
  timeout: 10000,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Ctx.get(CTX_TOKEN)}`,
  },
});

jadwalDokterAntrian.interceptors.request.use(authInterceptor);

export { generateNoAntrian, jadwalDokterAntrian };
