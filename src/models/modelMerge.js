import BpjsModel from "./bpjs-model.js";
import GeneralConsentModel from "./generalConsent-model.js";
import InsuranceAccountModel from "./insuranceAccount-model.js";
import NewBornModel from "./newBorn-model.js";
import PatientModel from "./patient-model.js";
import PatientFamilyModel from "./patientFamily-model.js";
import RoomMonitoringModel from "./roomMonitoring-model.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";

const MODELMERGE = [
    BpjsModel,
    GeneralConsentModel,
    InsuranceAccountModel,
    NewBornModel,
    PatientModel,
    PatientFamilyModel,
    RoomMonitoringModel,
    sequelizeInstance
]

export default MODELMERGE;