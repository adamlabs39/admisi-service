import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class RawatInapModel extends Model {}
RawatInapModel.init(
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
        // categoryRoom: {
        //     type: DataTypes.STRING(255),
        //     allowNull: false,
        // },
        // classRoom: {
        //     type: DataTypes.STRING(255),
        //     allowNull: false,
        // },
        // room: {
        //     type: DataTypes.STRING(255),
        //     allowNull: false,
        // },
        // bedRoom: {
        //     type: DataTypes.STRING(255),
        //     allowNull: false,
        // },
        maternity: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        multipleBirth: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        entrustedPatient: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        upgradeClass: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        joinBill: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        previousBill: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        familyBill: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        spareBed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        boxBaby: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        complaint: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        monitoringRoomUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        lokasiUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        alasanBatal: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        statusRi: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 1,
        },
        encounter: {
            type: DataTypes.ENUM("IGD","RJ", "RI"),
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
        ...fieldTime,
    },
    {
        sequelize: sequelizeInstance,
        modelName: "RawatInap",
        tableName: "rawat_inaps",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)