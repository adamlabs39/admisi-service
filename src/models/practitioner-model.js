import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
import PegawaiModel from "./pegawai-model.js";

export default class PractitionerModel extends Model {}
PractitionerModel.init(
    {
        ...identifierModel,
        pegawaiUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        sip: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        str: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        codeBpjs: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: true,
        },
        satuSehatId: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        fileSign: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "practitioner",
        tableName: "practitioner",
        timestamps: false,
        hooks: hookModel,
    }
);

PractitionerModel.belongsTo(PegawaiModel, {
    foreignKey: "pegawai_uuid",
    as: "pegawai",
    constraints: false,
});
