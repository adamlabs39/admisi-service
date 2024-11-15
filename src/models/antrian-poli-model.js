import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class AntrianPoliModel extends Model {}
AntrianPoliModel.init(
    {
        ...identifierModel,
        lokasiUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        practitionerUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        kuotaJkn: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        kotaNonJkn: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        timePelayanan: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        durasiPelayanan: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        codeAntrianPoli: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        codeAntrianDokter: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        ...fieldTime,
    },
    {
        sequelize: sequelizeInstance,
        tableName: "antrian_poli",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)


