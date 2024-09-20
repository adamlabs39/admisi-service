import {
    DataTypes,
    Model,
    Op
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import AddressModel from "./address-model.js";
import BirthDetailModel from "./birth-detail-model.js";
import {hookModel} from "./common/hook-model.js";
export default class PatientModel extends Model {}
PatientModel.init(
    {
        ...identifierModel,
        satuSehatUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },
        noRm: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        identity: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noIdentity: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        birthDetailUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        religion: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        addressUuid: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        language: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: "ID",
        },
        motherName: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        maritialStatus: {
            type: DataTypes.STRING(150),
            allowNull: false,
            defaultValue: false,
        },
        isNewBorn: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        unggahBerkas: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        tableName: "patients",
        modelName: "PatientModel",
        underscored: true,
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['no_rm', 'faskes_uuid']
            }
        ],
        defaultScope: {
            where:{
                deletedAt: {
                    [Op.is]: null
                }
            }
        },
        hooks: hookModel,
    }
)


PatientModel.belongsTo(AddressModel, {
    foreignKey: "address_uuid",
    as: "address",
    constraints: false,
});

PatientModel.belongsTo(BirthDetailModel, {
    foreignKey: "birth_detail_uuid",
    as: "birth_detail",
    constraints: false,
});