import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class InstalasiGawatDaruratModel extends Model {}
InstalasiGawatDaruratModel.init(
    {
        ...identifierModel,
        noReg: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noMR: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ageYear: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ageMonth: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ageDay: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        tanggalDaftar: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggalPeriksa: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        maternity: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        newborn: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        multipleBirth: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        withoutIdentity: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        transportation: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        pengantarRujukan: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kondisiTiba: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        complaint: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rekamMedisUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        pemeriksaanGigiUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        labUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        farmasiUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        edukasiCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        edukasiDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        edukasiText: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        kriteriaRencanaPulangCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        kriteriaRencanaPulangDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaPulangCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rencanaPulangDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaPulangText: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rencanaTindaklanjutCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rencanaTindaklanjutDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaTindaklanjutText: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        instruksiTindaklanjutCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        instruksiTindaklanjutDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiLokasiCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        instruksiLokasiDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiLokasiLainnya: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        instruksiDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        instruksiNoDarurat: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rujukInternalCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rujukInternalDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukInternalText: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rujukEksternalCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rujukEksternalDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukEksternalText: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        transportRujukCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        transportRujukDisplay: {
            type: DataTypes.STRING(225),
            allowNull: true,
        },
        transportRujukLainnya: {
            type: DataTypes.STRING(225),
            allowNull: false,
        },
        kondisiKeluarCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        kondisiKeluarDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kondisiKeluarLainnya: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        caraKeluarCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        caraKeluarDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        caraKeluarLainnya: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        dischargeDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        dischargeTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        doctorName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        doctorCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        doctorSign: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        penanggungjawabName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        penanggungjawabSign: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        informConsent: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        unggahBerkas: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        riwayatKunjungan: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        petugas: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "InstalasiGawatDarurat",
        tableName: "instalasi_gawat_darurats",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)