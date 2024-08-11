import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";


export default class PatientFamilyModel extends Model {}
PatientFamilyModel.init(
    {
        ...identifierModel,
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING(25),
            allowNull: false,
        },
        relationship: {
            type: DataTypes.STRING(25),
            allowNull: false,
        },
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "PatientFamily",
        tableName: "PatientFamilies",
        underscored: true,
    }
)