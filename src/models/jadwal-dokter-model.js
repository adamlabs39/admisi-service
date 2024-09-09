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
        lokasiUuid: {
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
        kuota:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        kuotaNonJkn:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        kuotaJkn:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        durasiPelayanan: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        codeAntrianPoli: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        codeAntrianDokter: {
            type: DataTypes.STRING(15),
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