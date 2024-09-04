import express from "express";
import AuthorizationMiddleware from "../middlewares/authorization-middleware.js";
import RawatJalanController from "../controllers/rawat-jalan-controller.js";
import PatientController from "../controllers/patient-controller.js";
import MonitoringRoomController from "../controllers/monitoring-room-controller.js";
import GeneralConsentController from "../controllers/general-consent-controller.js";
import RawatInapController from "../controllers/rawat-inap-controller.js";
const routes = express.Router();

routes.use(AuthorizationMiddleware);
routes.get("/rawat-jalan", RawatJalanController.getAll);
routes.post("/rawat-jalan", RawatJalanController.registRawatJalan);
routes.get("/rawat-jalan/:uuid", RawatJalanController.getDetail);
routes.put("/rawat-jalan/:uuid", RawatJalanController.updateRawatJalan);
routes.post("/rawat-jalan/cancel", RawatJalanController.cancelVisitRawatJalan);


routes.post("/rawat-inap", RawatInapController.regist);


routes.get("/patient", PatientController.findAll);
routes.get("/patient/:uuid", PatientController.findByUuid);
routes.post("/patient", PatientController.create);
routes.put("/patient/:uuid", PatientController.update);
routes.delete("/patient/:uuid", PatientController.delete);

routes.get("/monitoring-rooms", MonitoringRoomController.getAllRoom);
routes.get("/monitoring-rooms/:uuid", MonitoringRoomController.getDetailRoom);
routes.patch("/monitoring-rooms/:uuid", MonitoringRoomController.updateBed);


routes.post("/general-consent/:uuid", GeneralConsentController.create);
routes.get("/general-consent/:uuid", GeneralConsentController.getAll);
routes.get("/general-consent/detail/:uuid", GeneralConsentController.getDetail);

export default routes;