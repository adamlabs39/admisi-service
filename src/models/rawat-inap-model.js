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
        noReg: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        paymentMethod: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        doctor: {
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
        categoryRoom: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        classRoom: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        room: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        bedRoom: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        maternity: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        multipleBirth: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        entrustedPatient: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        upgradeClass: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        joinBill: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        previousBill: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        familyBill: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        spareBed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        boxBaby: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
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
            type: DataTypes.TEXT,
            allowNull: true,
        },
        kriteriaRencanaPulangCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kriteriaRencanaPulangDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaPulangCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaPulangDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaPulangText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        rencanaTindaklanjutCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaTindaklanjutDisplay: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rencanaTindaklanjutText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        instruksiTindaklanjutCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        instruksiTindaklanjutDisplay: {
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
            type: DataTypes.TEXT,
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
            type: DataTypes.STRING(255),
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
            type: DataTypes.TEXT,
            allowNull: true,
        },
        unggahBerkas: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        riwayatKunjungan: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        petugas: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        monitoringRoomUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        lokasiUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        alasanBatal: {
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