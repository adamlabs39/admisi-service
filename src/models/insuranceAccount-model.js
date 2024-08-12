import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";


export default class InsuranceAccountModel extends Model {}
InsuranceAccountModel.init(
    {
        ...identifierModel,
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        accountNumber: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        classEntitle: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        membershipStatus: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "InsuranceAccount",
        tableName: "InsuranceAccounts",
        underscored: true,
    }
)