import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class RoomMonitoringModel extends Model {}
RoomMonitoringModel.init(
    {
        ...identifierModel,
        faskesUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        roomUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        roomCategory: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        roomClass: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        room: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        bed: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        availableStatus: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "RoomMonitoring",
        tableName: "room_monitorings",
        underscored: true,
        hooks: hookModel,

    }
)