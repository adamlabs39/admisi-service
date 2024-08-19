import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class BirthDetailModel extends Model {}
BirthDetailModel.init(
    {
        ...identifierModel,
        birthPlace: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ageYear: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ageMonth: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ageDay: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        tableName: "birth_details",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)
