import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
import PatientModel from "./patient-model.js";
import BirthDetailModel from "./birth-detail-model.js";
import PractitionerModel from "./practitioner-model.js";

export default class InstalasiGawatDaruratModel extends Model {}
InstalasiGawatDaruratModel.init(
    {
        ...identifierModel,
        paymentMethod: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
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
        noRm: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        birthDetailUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        practitionerUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tanggalDaftar: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        tanggalDirawat: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        maternity: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        newborn: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        multipleBirth: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        withoutIdentity: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        lokasiUuid:{
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        alasanBatal: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        statusIgd: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        edukasi: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        edukasiText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        kondisiPasienPulang: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        statusPulang: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        statusPulangKeterangan:{
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        tujuanRujuk: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        tujuanRujukLainnya: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        // instruksiDate: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true,
        // },
        instruksiNoDarurat: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        transporRujuk: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        transportRujukLainnya: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isInternal: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        rujukInternal: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukInternalText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        rujukEksternal: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiTindakLanjut: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        dischargeDate: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        petugas: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        rekamMedisUuid: {
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
        noPelayanan: {
            type: DataTypes.STRING(255),
            allowNull: true,
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

InstalasiGawatDaruratModel.belongsTo(PatientModel,{
    as: "patient",
    foreignKey: "patient_uuid",
    constraints: false,
    targetKey: "uuid",
})

InstalasiGawatDaruratModel.belongsTo(BirthDetailModel,{
    as: "birth_detail",
    foreignKey: "birth_detail_uuid",
    constraints: false,
    targetKey: "uuid",
});

InstalasiGawatDaruratModel.belongsTo(PractitionerModel,{
    as: "practitioner",
    foreignKey: "practitioner_uuid",
    constraints: false,
    targetKey: "uuid",
})