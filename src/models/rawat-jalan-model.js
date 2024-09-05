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
export default class RawatJalanModel extends Model{}

RawatJalanModel.init(
    {
        ...identifierModel,
        paymentMethod: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
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
        noAntrianAdmisi: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        noAntrianPoli: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
        tanggalDaftar: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        tanggalPeriksa: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        practitionerUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        maternity: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        complaint: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        lokasiUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        tanggalCheckin:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        platform: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kodeBooking: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        alasanBatal: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        statusRj:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        edukasi: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        edukasiText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        prognosis: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kondisiPasienPulang: {
            type: DataTypes.STRING,
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
        // instruksiDate:{
        //     type: DataTypes.INTEGER,
        //     allowNull: true,
        // },
        instruksiNoDarurat: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        transportRujuk: {
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
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dischargeDate: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        petugas: {
            type: DataTypes.STRING(255),
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
        jadwalPeriksa:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        jadwalDokterUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "RawatJalan",
        tableName: "rawat_jalans",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)


RawatJalanModel.belongsTo(PatientModel, {
    foreignKey: "patient_uuid",
    as: "patient",
    constraints: false
})

RawatJalanModel.belongsTo(BirthDetailModel, {
    foreignKey: "birth_detail_uuid",
    as: "birth_detail",
    constraints: false,
});