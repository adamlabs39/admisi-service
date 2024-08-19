import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class InsuranceAdmissionModel extends Model {}
InsuranceAdmissionModel.init(
    {
        ...identifierModel,
        noReg: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        insuranceAccountUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime,
    },
    {
        sequelize: sequelizeInstance,
        modelName: "InsuranceAdmission",
        tableName: "insurance_admissions",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)