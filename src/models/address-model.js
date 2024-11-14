import { DataTypes, Model } from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import identifierModel from "./common/identifier-model.js";
import fieldTime from "./common/fieldTime-model.js";
import { uuidv7 } from "uuidv7";
import moment from "moment";

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
        hooks: {
            beforeCreate: (instance, options) => {
                const unixTimestamp = moment().unix();
                instance.dataValues.uuid = uuidv7();
                instance.createdAt = unixTimestamp;
                instance.updatedAt = unixTimestamp;
            },
            beforeUpdate: (instance, options) => {
                instance.updatedAt = moment().unix();
            }
        },
    }
);