import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";

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
        generalConsent: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        patientFamiliesUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "GeneralConsent",
        tableName: "GeneralConsents",
        underscored: true,
    }
)