import axios from "axios";
import { Context as Ctx } from "../middlewares/context.js";
import { CTX_TOKEN } from "../constant/context-constant.js";

const BASE_URL_ANTRIAN = "http://192.168.1.77:7001/api/v3/antrian";
const BASE_URL_MOBILE = "http://192.168.1.77:9001";

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

//! Buat data Antrian Call (Mobile)
const createAntrianCallMobile = axios.create({
  baseURL: `${BASE_URL_ANTRIAN}/mobile/admisi-antrian`,
  timeout: 10000,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "KalGen6eMdJmzLBgl1cgp6D68Q4XHRLIm8sry6ylJYZlH1x1cv",
  },
});

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

//! Get Appointment Mobile
const getAppointmentMobile = axios.create({
  baseURL: `${BASE_URL_MOBILE}/antrian/v3/appointments`,
  timeout: 10000,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "5a9e5c58da2a1e09e36e3a0e2c51a45db341be238b04018a81bdc202dd91a5a35b93b812431f712ad42f20a321346298def6a1b6c6aa9ea5e54961584eaf79f2",
  },
});

//! Update Apointment Mobile
const updateAppointmentMobile = axios.create({
  baseURL: `${BASE_URL_MOBILE}/antrian/v3/appointments`,
  timeout: 10000,
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "5a9e5c58da2a1e09e36e3a0e2c51a45db341be238b04018a81bdc202dd91a5a35b93b812431f712ad42f20a321346298def6a1b6c6aa9ea5e54961584eaf79f2",
  },
});

export { 
  generateNoAntrian, 
  jadwalDokter, 
  jadwalDokterMobile, 
  createAntrianCall,
  createAntrianCallMobile,
  getAllAntrianCall,
  updateAntrianCall,
  getAppointmentMobile,
  updateAppointmentMobile
};