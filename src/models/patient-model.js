import {
    DataTypes,
    Model,
    Op
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import AddressModel from "./address-model.js";
export default class PatientModel extends Model {}
PatientModel.init(
    {
        ...identifierModel,
        satuSehatUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
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
        identity: {
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
            allowNull: true,
        },
        doctor: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        categoryRoom: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        classRoom: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        room: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        bedRoom: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MonitoringRuanganUuid: {
            type: DataTypes.STRING(255),
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
        InsuranceAccountUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        namaPenjamin: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        unggahBerkas: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        tanggalChecking: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: false,
        },
        tanggalDaftar: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        tableName: "patients",
        modelName: "PatientModel",
        underscored: true,
        timestamps: false,
        defaultScope: {
            where:{
                deletedAt: {
                    [Op.is]: null
                }
            }
        }
    }
)


PatientModel.belongsTo(AddressModel, {
    foreignKey: "address_uuid",
    as: "address",
    constraints: false,
});