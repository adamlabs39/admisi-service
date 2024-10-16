import {
    DataTypes,
    Model
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";
import AddressModel from "./address-model.js";
import BirthDetailModel from "./birth-detail-model.js";

export default class NewBornModel extends Model {}
NewBornModel.init(
    {
        ...identifierModel,
        identifierMom: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        nameMom: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        nameBaby: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        noRmBaby: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        birthDetailUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        birthTimeBaby: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        genderBaby: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        multipleBirth: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        addressUuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tanggalDaftar: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "newBorn",
        tableName: "new_borns",
        timestamps: false,
        hooks: hookModel,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["no_rm_baby", "faskes_uuid"]
            }
        ]
    }
)

NewBornModel.belongsTo(AddressModel, {
    foreignKey: "address_uuid",
    as: "address",
    constraints: false,
    targetKey: "uuid"
})

NewBornModel.belongsTo(BirthDetailModel, {
    foreignKey: "birth_detail_uuid",
    as: "birth_detail",
    constraints: false,
    targetKey: "uuid"
})