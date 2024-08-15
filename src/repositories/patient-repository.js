import sequelizeInstace from "../configurations/sequelize-instance.js";
import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import moment from "moment";
import AddressModel from "../models/address-model.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import * as sequlizeInstance from "sequelize";

export default class PatientRepository{
    static async registPatient(data) {
        try {
            const uuid = data.patientUuid || null;
            return await sequelizeInstace.transaction(async (t) => {
                console.log(data);

                let address = null;
                if (data.address?.addressUuid) {
                    address = await AddressModel.findOne({
                        where: {
                            uuid: data.address.addressUuid,
                            deletedAt: { [Op.is]: null }
                        }
                    });
                }

                if (address) {
                    await address.update(data.address, { transaction: t });
                } else {
                    address = await AddressModel.create(data.address, { transaction: t });
                }

                data.addressUuid = address.uuid;

                const patient = await PatientModel.findOne({
                    where: {
                        [Op.and]: [
                            { uuid },
                            {
                                deletedAt: {
                                    [Op.is]: null
                                }
                            }
                        ]
                    }
                }) || await PatientModel.create(data, { transaction: t, returning: true });

                if (patient) {
                    return await patient.update(data, { transaction: t, returning: true });
                }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


    static async cretePatient(data){
        try{
            return await PatientModel.create(data);
        }catch (error){
            throw error;
        }
    }

    static async updatePatient(uuid, data){
        try{
            return await sequelizeInstace.transaction(async (t) => {
                const [affectedCount, updatedPatients] = await PatientModel.update(data, {
                    where: {
                        [Op.and]: [
                            { uuid },
                            {
                                deletedAt: {
                                    [Op.is]: null,
                                }
                            }
                        ]
                    },
                    returning: true,
                    plain: false,
                    transaction: t,
                });

                return affectedCount > 0 ? updatedPatients[0] : null;
            });
        }catch (error){
            throw error;
        }
    }

    static async getPatientByUuid(uuid){
        try{
            return await PatientModel.findOne({
                where: {
                    [Op.and]: [
                        { uuid },
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                },
                include: [{
                    model: AddressModel,
                    required: true,
                    as: "address",
                    attributes: ["uuid", "full_address","prov", "city", "district", "rt", "rw", "village", "postal_code", "country"]
                }],
                attributes: [
                    "uuid",
                    "no_rm",
                    "title",
                    "name",
                    "identity",
                    "no_identity",
                    "birth_place",
                    "birth_date",
                    "gender",
                    "phone",
                    "religion",
                    "language",
                    "mother_name",
                    "maritial_status",
                    "status",
                ],
            });
        }catch (error){
            console.log(error);
            throw error;
        }
    }

    static async deletePatient(uuid){
        try{
            return await sequelizeInstace.transaction(async (t) => {
                return await PatientModel.update(
                    { deletedAt: moment().unix() },
                    {
                        where: {
                            [Op.and]: [
                                { uuid },
                                {
                                    deletedAt: {
                                        [Op.is]: null
                                    }
                                }
                            ]
                        },
                        transaction: t
                    }
                );
            });
        }catch (error){
            throw error;
        }
    }

    static async getAllPatient(args){
        try{
            const filter = {
                name: {
                    [Op.like]: `%${args.search || ""}%`
                },
                noRm: {
                    [Op.like]: `%${args.search || ""}%`
                }
            };

            const option = {
                include: [{
                    model: AddressModel,
                    required: true,
                    as: "address",
                    attributes: ["uuid", "full_address","prov", "city", "district", "rt", "rw", "village", "postal_code", "country"]
                }],
                attributes: [
                    "uuid",
                    "no_rm",
                    "age_year",
                    "age_month",
                    "age_day",
                    "name",
                    "gender",
                    "status",
                ],
            }
            return await Pagination.do(
                PatientModel,
                args,
                filter,
                option
            );
        }catch (error){
            console.log(error);
            throw error;
        }
    }
}