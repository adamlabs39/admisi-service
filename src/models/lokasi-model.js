import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
export default class LokasiModel extends Model {}
LokasiModel.init(
    {
        ...identifierModel,
        code: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        statusOperasional: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        satuSehatId: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        locationType: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        classCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        className: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        partOfName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        partOf: {
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
        modelName: "Lokasi",
        tableName: "lokasi",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)