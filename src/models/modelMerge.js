import BpjsModel from "./bpjs-model.js";
import GeneralConsentModel from "./general-consent-model.js";
import InsuranceAccountModel from "./insurance-account-model.js";
import NewBornModel from "./new-born-model.js";
import PatientModel from "./patient-model.js";
import PatientFamilyModel from "./patient-family-model.js";
import RoomMonitoringModel from "./room-monitoring-model.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import AddressModel from "./address-model.js";
import FaskesModel from "./faskes-model.js";
import InstalasiGawatDaruratModel from "./instalasi-gawat-darurat-model.js";
import PaymentMethodModel from "./payment-method-model.js";
import RawatInapModel from "./rawat-inap-model.js";
import RawatJalanModel from "./rawat-jalan-model.js";
import InsuranceAdmissionModel from "./insurance-admission-model.js";
import KategoriRuanganModel from "./kategori-ruangan-model.js";
import RuanganModel from "./ruangan-model.js";
import LokasiModel from "./lokasi-model.js";
import PractionerModel from "./practioner-model.js";
import AntrianPoliModel from "./antrian-poli-model.js";

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
    InsuranceAdmissionModel,
    KategoriRuanganModel,
    RuanganModel,
    LokasiModel,
    PractionerModel,
    AntrianPoliModel,
    sequelizeInstance
]

export default MODELMERGE;