import sequelizeInstace from "../configurations/sequelize-instance.js";
import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import moment from "moment";
import AddressModel from "../models/address-model.js";
import BirthDetailModel from "../models/birth-detail-model.js";
import {generateNoRM, getInfoAge} from "../helper/utility.js";


export default class PatientRepository{
    static async registPatient(data, externalTransaction = null) {
        const transaction = externalTransaction || await sequelizeInstace.transaction();

        try {
            const uuid = data.patientUuid || null;

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
                console.log("update address", address);
                await address.update(data.address, { transaction });
            } else {
                address = await AddressModel.create(data.address, { transaction });
            }

            data.addressUuid = address.uuid;

            let birthDetail = null;
            const infoAge = getInfoAge(data.birthDetail.birthDate);
            if (data.birthDetail?.birthDetailUuid) {
                birthDetail = await BirthDetailModel.findOne({
                    where: {
                        uuid: data.birthDetail.birthDetailUuid,
                        deletedAt: { [Op.is]: null }
                    }
                });
            }

            data.birthDetail.ageYear = infoAge.year;
            data.birthDetail.ageMonth = infoAge.month;
            data.birthDetail.ageDay = infoAge.day;

            if (birthDetail) {
                await birthDetail.update(data.birthDetail, { transaction });
            } else {
                birthDetail = await BirthDetailModel.create(data.birthDetail, { transaction });
            }

            data.birthDetailUuid = birthDetail.uuid;

            const [patient, created] = await PatientModel.findOrCreate({
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
                defaults: {
                    ...data,
                    noRm: generateNoRM(data.faskesCode)
                },
                transaction
            });

            if (!created) {
                await patient.update(data, { transaction });
            }

            if (!externalTransaction) {
                await transaction.commit();
            }

            return {
                ...patient.get({ plain: true }), // Convert to plain object
                address: address.get({ plain: true }), // Include address data
                birthDetail: birthDetail.get({ plain: true }) // Include birth detail data
            };

        } catch (error) {
            if (!externalTransaction) {
                await transaction.rollback();
            }
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


    static async checkExistPatient(uuid){
        try {
            return await PatientModel.findOne({
                where: {
                    [Op.and]: [
                        {uuid},
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                }
            });
        } catch (error) {
            console.log(error);
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
                include: [
                    {
                        model: AddressModel,
                        required: true,
                        as: "address",
                        attributes: ["uuid", "full_address","prov", "city", "district", "rt", "rw", "village", "postal_code", "country"]
                    },
                    {
                        model: BirthDetailModel,
                        required: true,
                        as: "birth_detail",
                        attributes: ["uuid", "birth_place", "birth_date", "age_year", "age_month", "age_day"]
                    }
                ],
                attributes: [
                    "uuid",
                    "no_rm",
                    "title",
                    "name",
                    "identity",
                    "no_identity",
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
                    attributes: ["uuid", "full_address","prov", "city", "district", "rt", "rw", "village", "country"]
                },{
                    model: BirthDetailModel,
                    required: true,
                    as: "birth_detail",
                    attributes: ["age_year", "age_month", "age_day"]
                }],
                attributes: [
                    "uuid",
                    "no_rm",
                    "name",
                    "gender",
                    "status",
                ],
            }
            return await Pagination.init(
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