import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";


export default class PegawaiModel extends Model {}
PegawaiModel.init(
    {
        ...identifierModel,
        nama: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        nik: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tipe: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tanggalLahir: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ...fieldTime
    },{
        sequelize: sequelizeInstance,
        modelName: "pegawai",
        tableName: "pegawai",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)