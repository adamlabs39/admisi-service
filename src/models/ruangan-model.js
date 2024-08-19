import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
import RoomMonitoringModel from "./room-monitoring-model.js";
import KategoriRuanganModel from "./kategori-ruangan-model.js";

export default class RuanganModel extends Model{}
RuanganModel.init(
    {
        ...identifierModel,
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noRoom:{
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        kategoriRuanganUuid:{
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        kelasRuangan:{
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
        ...fieldTime,
    },
    {
        sequelize: sequelizeInstance,
        modelName: "Ruangan",
        tableName: "ruangan",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)


RuanganModel.hasMany(RoomMonitoringModel,{
    foreignKey: "room_uuid",
    as: "room_monitorings",
    sourceKey: "uuid",
    constraints: false,
})

RuanganModel.belongsTo(KategoriRuanganModel,{
    foreignKey: "kategori_ruangan_uuid",
    as: "kategori_ruangan",
    targetKey: "uuid",
    constraints: false,
})