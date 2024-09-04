import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class PractionerModel extends Model {}
PractionerModel.init(
    {
        ...identifierModel,
        sip: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        str: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        code_bpjs: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
        },
        satu_sehat_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "practioner",
        tableName: "practioner",
        timestamps: false,
        hooks: hookModel,
    }
);
