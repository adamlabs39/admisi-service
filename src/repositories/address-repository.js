import AddressModel from "../models/address-model.js";
import SequelizeInstance from "../configurations/sequelize-instance.js";
import {Op} from "sequelize";

export default class AddressRepository {
    static async create(data) {
        try {
            return await SequelizeInstance.transaction(async (t) => {
                return await AddressModel.create(data, {transaction: t});
            });
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async update(uuid, data) {
        return await SequelizeInstance.transaction(async (t) => {
            const [affectedCount, updatedAddresses] = await AddressModel.update(data, {
                where: {
                    [Op.and]: [
                        { uuid },
                        {
                            deletedAt: {
                                [Op.is]: null,
                            },
                        },
                    ],
                },
                returning: true,
                plain: false,
                transaction: t,
            });

            return affectedCount > 0 ? updatedAddresses[0] : null;
        });
    }


    static async upsertAddress(data) {
        return await SequelizeInstance.transaction(async (t) => {
            const address = await AddressModel.findOne({
                where: {
                    [Op.and]: [
                        {uuid: data.uuid},
                        {
                            deletedAt: {
                                [Op.is]: null,
                            }
                        }
                    ]
                }
            });
            if(address){
                return await address.update(data, {transaction: t});
            }
            return await AddressModel.create(data, {transaction: t});
        });
    }

    static async getOne(uuid) {
        return await AddressModel.findOne({
            where: {
                [Op.and]: [
                    {uuid},
                    {
                        deletedAt: {
                            [Op.is]: null,
                        }
                    }
                ]
            }
        });
    }

    static async getAll(args) {
        return await AddressModel.findAll({
            where: {
                [Op.and]: [
                    {
                        deletedAt: {
                            [Op.is]: null,
                        }
                    }
                ]
            }
        });
    }
}