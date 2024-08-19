import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
import PatientModel from "./patient-model.js";

export default class RoomMonitoringModel extends Model {}
RoomMonitoringModel.init(
    {
        ...identifierModel,
        patientUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
        bedName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noBed: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "RoomMonitoring",
        tableName: "room_monitorings",
        underscored: true,
        hooks: hookModel,
        timestamps: false,
    }
)

RoomMonitoringModel.belongsTo(PatientModel, {
    foreignKey: "patient_uuid",
    as: "patient",
    constraints: false,
});