import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
import PatientModel from "./patient-model.js";
import PractitionerModel from "./practitioner-model.js";
import LokasiModel from "./lokasi-model.js";

export default class LogPelayananModel extends Model {}
LogPelayananModel.init(
    {
        ...identifierModel,
        faskesUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tglRegistrasi: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        noreg: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noPelayanan: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        jenisKunjungan: {
            type: DataTypes.ENUM("IGD", "RI", "RJ"),
            allowNull: false,
        },
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        practitionerUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        lokasiUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        cancelReason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        paymentMethod: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        tableName: "log_pelayanan",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)


LogPelayananModel.belongsTo(PatientModel,{
    as: "patient",
    foreignKey: "patient_uuid",
    constraints: false,
    targetKey: "uuid",
})

LogPelayananModel.belongsTo(PractitionerModel,{
    as: "practitioner",
    foreignKey: "practitioner_uuid",
    constraints: false,
    targetKey: "uuid",
});

LogPelayananModel.belongsTo(LokasiModel,{
    as: "lokasi",
    foreignKey: "lokasi_uuid",
    constraints: false,
    targetKey: "uuid",
})