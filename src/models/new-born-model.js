import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class NewBornModel extends Model {}
NewBornModel.init(
    {
        ...identifierModel,
        identifierMom: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        nameMom: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        nameBaby: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noRmBaby: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        birthPlaceBaby: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        birthDateBaby: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        birthTimeBaby: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        genderBaby: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        multipleBirth: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        addressUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tanggalDaftar: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "newBorn",
        tableName: "new_borns",
        timestamps: false,
        hooks: hookModel,
        underscored: true,
    }
)