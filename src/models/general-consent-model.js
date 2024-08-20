import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
import PatientFamilyModel from "./patient-family-model.js";

export default class GeneralConsentModel extends Model {}
GeneralConsentModel.init(
    {
        ...identifierModel,
        faskesUuid: {
            type: DataTypes.STRING(255),
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
        generalConsent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        patientFamiliesUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "GeneralConsent",
        tableName: "general_consents",
        underscored: true,
        hooks: hookModel,
    }
)

GeneralConsentModel.belongsTo(PatientFamilyModel,{
    foreignKey: "patient_families_uuid",
    as: "patient_family",
    constraints: false,
})