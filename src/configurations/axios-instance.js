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

//! Buat No antrian admisi
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

//! Buat data Antrian Call
const createAntrianCall = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/admisi-antrian`,
  timeout: 10000,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Ctx.get(CTX_TOKEN)}`,
  },
});

createAntrianCall.interceptors.request.use(authInterceptor);

//! Get data Antrian Call
const getAllAntrianCall = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/admisi-antrian`,
  timeout: 10000,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Ctx.get(CTX_TOKEN)}`,
  }
});

getAllAntrianCall.interceptors.request.use(authInterceptor);

//! Update status Antrian Call
const updateAntrianCall = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/admisi-antrian`,
  timeout: 10000,
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Ctx.get(CTX_TOKEN)}`,
  }
});

updateAntrianCall.interceptors.request.use(authInterceptor);

//! Jadwal Dokter
const jadwalDokter = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/jadwal-dokter`,
  timeout: 10000,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Ctx.get(CTX_TOKEN)}`,
  },
});

jadwalDokter.interceptors.request.use(authInterceptor);

//! Jadwal Dokter Mobile
const jadwalDokterMobile = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/mobile/jadwal-dokter`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "KalGen6eMdJmzLBgl1cgp6D68Q4XHRLIm8sry6ylJYZlH1x1cv",
  },
});

export { 
  generateNoAntrian, 
  jadwalDokter, 
  jadwalDokterMobile, 
  createAntrianCall,
  getAllAntrianCall,
  updateAntrianCall,
};