import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";

export default class PaymentMethodModel extends Model {}
PaymentMethodModel.init(
    {
        ...identifierModel,
        noReg: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        code: {
            type: DataTypes.STRING(25),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        insurance: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        accountNumber: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "PaymentMethod",
        tableName: "PaymentMethods",
        underscored: true,
        timestamps: false,
    }
);