import {
    BPJSModel,
    GeneralConsentModel,
    InsuranceAccountModel,
    NewBornModel,
    PatientModel,
    PatientFamilyModel,
    RoomMonitoringModel,
} from "@adameds/model-sdk/admisi";

import {
    AddressModel,
} from "@adameds/model-sdk/setting";
import {
    InstalasiGawatDaruratModel,
    RawatInapModel,
    RawatJalanModel,
    InsuranceAdmissionModel,
    LogPelayananModel
} from "@adameds/model-sdk/pelayanan";

import {
    FaskesModel,
    KategoriRuanganModel,
    RuanganModel,
    LokasiModel,
    PractitionerModel,
    PegawaiModel,
    PenjaminModel
} from "@adameds/model-sdk/datamaster";

import {
    JadwalDokterModel
} from "@adameds/model-sdk/antrian";
import sequelizeInstance from "@adameds/model-sdk/instance";

const MODELMERGE = [
    // PegawaiModel,
    // BPJSModel,
    // GeneralConsentModel,
    // InsuranceAccountModel,
    // NewBornModel,
    // PatientModel,
    // PatientFamilyModel,
    // RoomMonitoringModel,
    // AddressModel,
    // FaskesModel,
    // InstalasiGawatDaruratModel,
    // RawatInapModel,
    // RawatJalanModel,
    // InsuranceAdmissionModel,
    // KategoriRuanganModel,
    // RuanganModel,
    // LokasiModel,
    // PractitionerModel,
    // JadwalDokterModel,
    // LogPelayananModel,
    // PenjaminModel,
    // RuanganModel,
]

export default MODELMERGE;