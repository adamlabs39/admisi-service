import BpjsModel from "./bpjs-model.js";
import GeneralConsentModel from "./generalConsent-model.js";
import InsuranceAccountModel from "./insuranceAccount-model.js";
import NewBornModel from "./newBorn-model.js";
import PatientModel from "./patient-model.js";
import PatientFamilyModel from "./patientFamily-model.js";
import RoomMonitoringModel from "./roomMonitoring-model.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import AddressModel from "./address-model.js";
import FaskesModel from "./faskes-model.js";
import InstalasiGawatDaruratModel from "./instalasi-gawat-darurat-model.js";
import PaymentMethodModel from "./payment-method-model.js";
import RawatInapModel from "./rawat-inap-model.js";
import RawatJalanModel from "./rawat-jalan-model.js";

const MODELMERGE = [
    BpjsModel,
    GeneralConsentModel,
    InsuranceAccountModel,
    NewBornModel,
    PatientModel,
    PatientFamilyModel,
    RoomMonitoringModel,
    AddressModel,
    FaskesModel,
    InstalasiGawatDaruratModel,
    PaymentMethodModel,
    RawatInapModel,
    RawatJalanModel,
    sequelizeInstance
]

export default MODELMERGE;