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
import ExportReportController from "../controllers/export-report-controller.js";
import RekapKunjunganController from "../controllers/rekap-kunjungan-controller.js";
import AntrianCallController from "../controllers/antrian-call-controller.js";

const routes = express.Router();


// Routes Mobile
routes.post("/patient/check-patient", apiKeyCheckPatient, PatientController.checkPatientExist);
routes.get("/rawat-jalan/mobile", apiKeyCheckPatient, RawatJalanController.getAll);
routes.get("/rawat-jalan/mobile/today", apiKeyCheckPatient, RawatJalanController.getRawatJalanToday);
routes.post("/rawat-jalan/mobile", apiKeyCheckPatient, RawatJalanController.registRawatJalanMobile);
routes.put("/rawat-jalan/mobile/:uuid", apiKeyCheckPatient, RawatJalanController.updateRawatJalanMobile);
routes.delete("/rawat-jalan/mobile/cancel", apiKeyCheckPatient, RawatJalanController.cancelVisitMobile);

//TODO DIGANTI SAAT MERGE (Untuk Local)
routes.use(AuthorizationMiddleware);

// routes.use(async (req, res, next) => {
//     Context.set(CTX_AUTHOR, req.author);
// });

// Rawat jalan
routes.get("/rawat-jalan", RawatJalanController.getAll);
routes.get("/rawat-jalan/today", RawatJalanController.getRawatJalanToday);
routes.post("/rawat-jalan", RawatJalanController.registRawatJalan);
routes.post("/rawat-jalan/apm", RawatJalanController.registRawatJalanApm);
routes.get("/rawat-jalan/jadwal-dokter", RawatJalanController.getAllJadwalDokter);
routes.get("/rawat-jalan/:uuid", RawatJalanController.getDetail);
routes.put("/rawat-jalan/:uuid", RawatJalanController.updateRawatJalan);
routes.put("/rawat-jalan/farmasi/:uuid", RawatJalanController.updateFarmasi);
routes.post("/rawat-jalan/check-booking", RawatJalanController.checkBookingRajal);
routes.post("/rawat-jalan/print-booking", RawatJalanController.getRajalBooking);
routes.delete("/rawat-jalan/cancel", RawatJalanController.cancelVisitRawatJalan);


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
routes.put("/patient/:uuid", PatientController.update);
routes.delete("/patient/cancel", PatientController.delete);
routes.get("/patient/history/:uuid", PatientController.getHistoryPatient);
routes.post("/patient/check-patient/apm", PatientController.checkPatientExist);
routes.post("/patient/import", PatientController.import);
routes.get("/download", PatientController.downloadImportFile);

// Unggah Berkas pasien
routes.get("/file/:uuid", PatientController.getPatientFile);
routes.put("/file/:uuid", PatientController.createPatientFile);
routes.delete("/file/:uuid", PatientController.deletePatientFile);

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
routes.get("/report/cancel-visit", ReportController.getCancelVisitReport);
routes.get("/report/room", ReportController.getReportRoom);
routes.get("/report/rawat-inap", ReportController.getReportRawatInap);
routes.get("/report/new-born", ReportController.getReportNewBorn);

// Report Excel
routes.get("/export/kunjungan", ExportReportController.getExportKunjungan);
routes.get("/export/batal-kunjungan", ExportReportController.getExportBatalKunjungan);
routes.get("/export/status-kamar", ExportReportController.getExportStatusKamar);
routes.get("/export/keperawatan-inap", ExportReportController.getExportKeperawatanInap);
routes.get("/export/new-born", ExportReportController.getExportNewBorn);

// Rekap Kunjungan
routes.get("/rekap/jenis-kunjungan", RekapKunjunganController.getRekapKunjungan);
routes.get("/rekap/dokter", RekapKunjunganController.getRekapDokter);
routes.get("/rekap/penjamin", RekapKunjunganController.getRekapPenjamin);

// Antrian call
routes.get("/antrian-call", AntrianCallController.getAllAntrianCall);
routes.put("/antrian-call/:uuid", AntrianCallController.updateAntrianCall);

export default routes;
