import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class KategoriRuanganModel extends Model {}
KategoriRuanganModel.init(
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
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "KategoriRuangan",
        tableName: "kategori_ruangan",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)