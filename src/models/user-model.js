import { DataTypes, Model } from "sequelize";
import sequelizeInstace from "../configurations/sequelize-instance.js";

export default class UserModel extends Model {}
UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    underscored: true,
    tableName: "users",
    sequelize: sequelizeInstace,
    timestamps: false,
    indexes: [
      {
        fields: ["name"],
      },
    ],
  }
);
