import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class BpjsModel extends Model {}
BpjsModel.init(
    {
        ...identifierModel,
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        accountNumber: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noIdentity: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noRM: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        class: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        typeParticipation: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noReference: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        originFaskes: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        originReference: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        codePPK: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        support: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        serviceAssessment: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        KLL: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        KLLProv: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        KLLCity: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        KLLDistrict: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        insuranceLL: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        dateOfIncident: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        noLP: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        incidentDescription: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        suplesi: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        noSuplesi: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        noSEP: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "Bpjs",
        tableName: "bpjs",
        underscored: true,
        hooks: hookModel,
    }
)