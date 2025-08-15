import express from "express";
import AuthorizationMiddleware from "../middlewares/authorization-middleware.js";
import RawatJalanController from "../controllers/rawat-jalan-controller.js";
import PatientController from "../controllers/patient-controller.js";
import MonitoringRoomController from "../controllers/monitoring-room-controller.js";
import GeneralConsentController from "../controllers/general-consent-controller.js";
import RawatInapController from "../controllers/rawat-inap-controller.js";
import InstalasiGawatDaruratController from "../controllers/instalasi-gawat-darurat-controller.js";
import ReportController from "../controllers/report-controller.js";
import apiKeyCheckPatient from "../middlewares/apiKey-middleware.js";
import authorizationSdk from "@adameds/authorization-sdk";
import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";

import upload from "../configurations/multer-config.js";

const routes = express.Router();


//* Api Key
routes.post("/patient/check-patient", apiKeyCheckPatient, PatientController.checkPatientExist);


//TODO DIGANTI SAAT MERGE (Untuk Local)
routes.use(AuthorizationMiddleware);
// routes.use(async (req, res, next) => {
//     Context.set(CTX_AUTHOR, req.author);
// });

// Rawat Jalan
routes.get("/rawat-jalan", RawatJalanController.getAll);
routes.post("/rawat-jalan", RawatJalanController.registRawatJalan);
routes.post("/rawat-jalan/apm", RawatJalanController.registRawatJalanApm);
routes.get(
  "/rawat-jalan/jadwal-dokter",
  RawatJalanController.getAllJadwalDokter
);
routes.get("/rawat-jalan/:uuid", RawatJalanController.getDetail);
routes.put("/rawat-jalan/:uuid", RawatJalanController.updateRawatJalan);
routes.delete(
  "/rawat-jalan/cancel",
  RawatJalanController.cancelVisitRawatJalan
);

// Instalasi Gawat Darurat
routes.post("/igd", InstalasiGawatDaruratController.registIgd);
routes.put("/igd/:uuid", InstalasiGawatDaruratController.updateIgd);
routes.get("/igd", InstalasiGawatDaruratController.getAll);
routes.get("/igd/:uuid", InstalasiGawatDaruratController.getDetail);
routes.delete("/igd/cancel", InstalasiGawatDaruratController.cancelVisitIgd);

// Rawat Inap
routes.post("/rawat-inap", RawatInapController.regist);
routes.put("/rawat-inap/:uuid", RawatInapController.update);
routes.get("/rawat-inap/:uuid", RawatInapController.getDetail);
routes.get("/rawat-inap", RawatInapController.getAll);
routes.delete("/rawat-inap/cancel", RawatInapController.cancelVisitRawatInap);

// Master Pasien
routes.get("/patient", PatientController.findAll);
routes.get("/patient/:uuid", PatientController.findByUuid);
routes.post("/patient", PatientController.create);
routes.post("/patient/import", PatientController.import);
routes.put("/patient/:uuid", PatientController.update);
routes.delete("/patient/:uuid", PatientController.delete);
routes.get("/patient/history/:uuid", PatientController.getHistoryPatient);
routes.get("/patient/file/:uuid", PatientController.getPatientFile);
routes.put("/patient/file/:uuid",  PatientController.createPatientFile);
routes.delete("/patient/file/:uuid", PatientController.deletePatientFile);
routes.post("/patient/check-patient/apm", PatientController.checkPatientExist);

// Monitoring Room
routes.get("/monitoring-rooms", MonitoringRoomController.getAllRoom);
routes.get("/monitoring-rooms/:uuid", MonitoringRoomController.getDetailRoom);
routes.patch("/monitoring-rooms/:uuid", MonitoringRoomController.updateBed);

// General Consent
routes.post("/general-consent/:uuid", GeneralConsentController.create);
routes.get("/general-consent/:uuid", GeneralConsentController.getAll);
routes.get("/general-consent/detail/:uuid", GeneralConsentController.getDetail);
routes.delete("/general-consent/:uuid", GeneralConsentController.delete);

// Report
routes.get("/report/kunjungan", ReportController.getReport);
routes.get("/report/penjamin", ReportController.getReportPenjamin);
routes.get("/report/cancel-visit", ReportController.getCancelVisitReport);
routes.get("/report/room", ReportController.getReportRoom);
routes.get("/report/rawat-inap", ReportController.getReportRawatInap);
routes.get("/report/new-born", ReportController.getReportNewBorn);
export default routes;
