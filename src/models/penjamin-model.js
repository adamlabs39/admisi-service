// Penjamin		UNIQUE	REQUIRED
// id	int (AI)	✅	✅
// uuid	varchar(255)(PK)	✅	✅
// faskes_uuid	varchar(255)(FK)		✅
// code	varchar(255)	✅	✅
// name	varchar(255)		✅
// phone	varchar(255)
// address	varchar(255)
// status	bool		✅
// createdAt	Integer
// updatedAt	Integer
// deletedAt	Integer

import {
    DataTypes,
    Model,
} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import fieldTime from "./common/fieldTime-model.js";
import identifierModel from "./common/identifier-model.js";
import {hookModel} from "./common/hook-model.js";

export default class PenjaminModel extends Model{}

PenjaminModel.init(
    {
        ...identifierModel,
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        ...fieldTime
    },
    {
        sequelize: sequelizeInstance,
        modelName: "Penjamin",
        tableName: "penjamin",
        underscored: true,
        timestamps: false,
        hooks: hookModel,
    }
)