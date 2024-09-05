import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
export default class JadwalDokterModel extends Model{}
JadwalDokterModel.init(
    {
        ...identifierModel,
        practitionerUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        day: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        ...fieldTime,
    },
    {
        sequelize: sequelizeInstance,
        modelName: "JadwalDokter",
        tableName: "jadwal_dokter",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)