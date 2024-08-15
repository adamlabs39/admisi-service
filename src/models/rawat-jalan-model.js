import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
export default class RawatJalanModel extends Model{}

RawatJalanModel.init(
    {
        ...identifierModel,
        noReg: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        paymentMethod: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noAntrian: {
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
        doctor: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        maternity: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        newborn: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        multipleBirth: {
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
        rekamMedisUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
            allowNull: true,
        },
        edukasiDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        edukasiText: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        prognosisCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        prognosisDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaTindaklanutCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaTindaklanutDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaTindaklanutText: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiTindaklanutCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiTindaklanutDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiLokasiCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiLokasiDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiLokasiLainnya: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        instruksiNoDarurat: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukInternalCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukInternalDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukInternalText: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukEksternalCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukEksternalDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rujukEksternalText: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        transportRujukCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        transportRujukDisplay: {
            type: DataTypes.STRING(225),
            allowNull: true,
        },
        transportRujukLainnya: {
            type: DataTypes.STRING(225),
            allowNull: true,
        },
        kondisiKeluarCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kondisiKeluarDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kondisiKeluarLainnya: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        caraKeluarCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        caraKeluarDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        caraKeluarLainnya: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        dischargeDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        dischargeTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        doctorName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        doctorCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        doctorSign: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
            allowNull: true,
        },
        unggahBerkas: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        riwayatKunjungan: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        bookingCode: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        queueNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        petugas: {
            type: DataTypes.STRING(50),
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
    }
)