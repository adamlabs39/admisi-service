import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";


export default class RiwayatRuanganModel extends Model{}
RiwayatRuanganModel.init(
    {
        ...identifierModel,
        admissionUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        monitoringRuanganUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "RiwayatRuangan",
        tableName: "riwayat_ruangan",
        underscored: true,
        hooks: hookModel,
    },
)