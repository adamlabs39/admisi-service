import { DataTypes, Model } from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import identifierModel from "./common/identifier-model.js";
import fieldTime from "./common/fieldTime-model.js";

export default class AddressModel extends Model {}
AddressModel.init(
    {
        ...identifierModel,
        fullAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        prov: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        district: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        rt: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        rw: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        village: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        postalCode: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        ...fieldTime,

    },
    {
        sequelize: sequelizeInstance,
        tableName: "addresses",
        underscored: true,
        timestamps: false,
    }
);