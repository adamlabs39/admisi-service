import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
export default class PatientModel extends Model {}
PatientModel.init(
    {
        ...identifierModel,
        satuSehatUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: false,
        },
        noRm: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noIdentity: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        birthPlace: {
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
        phone: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        religion: {
            type: DataTypes.STRING(25),
            allowNull: false,
        },
        addressUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        language: {
            type: DataTypes.STRING(150),
            allowNull: false,
            defaultValue: "ID",
        },
        motherName: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        maritialStatus: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        polyclinic: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        doctor: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        complaint: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        unggahBerkas: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        tanggalDaftar: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        tableName: "patients",
        modelName: "PatientModel",
        underscored: true,
        timestamps: false,
    }
)