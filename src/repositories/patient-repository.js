import sequelizeInstace from "../configurations/sequelize-instance.js";
import {
    PatientModel,
    BirthDetailModel
} from "@adameds/model-sdk/admisi";
import {
    AddressModel
} from "@adameds/model-sdk/setting";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import moment from "moment";
import {convertSnakeToCamel, generateNoRM, getInfoAge} from "../helper/utility.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import DuplicateException from "../exception/duplicate-exception.js";
import PatientService from "../services/patient-service.js";

export default class PatientRepository{
    static async registPatient(data, externalTransaction = null) {
        const transaction = externalTransaction || await sequelizeInstace.transaction();
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        data.address = convertSnakeToCamel(data.address);
        data.birthDetail = convertSnakeToCamel(data.birthDetail);

        PatientService.patientIdentityFormat(data.identity, data.noIdentity);
        
        try {
            const uuid = data.patientUuid || null;
            const patient = uuid ? await PatientModel.findOne({
                where: { uuid, deletedAt: { [Op.is]: null } },
                include: [
                    { model: AddressModel, as: 'address' },
                    { model: BirthDetailModel, as: 'birth_detail' }
                ],
                transaction
            }) : null;

            // Set isNewBorn to false if not provided during update
            if (data.isNewBorn === undefined || !data.isNewBorn) {
                data.isNewBorn = false;
            }

            // Handle address
            let address = patient ? patient.address : null;
            if (address) {
                await address.update(data.address || {}, { transaction });
            } else if (data.address) {
                data.address.faskesUuid = faskesUuid;
                address = await AddressModel.create(data.address, { transaction });
            }
            data.addressUuid = address?.uuid || null;

            // Handle birth detail
            let birthDetail = patient ? patient.birth_detail : null;
            if (birthDetail) {
                const infoAge = getInfoAge(data.birthDetail.birthDate);
                Object.assign(data.birthDetail, infoAge);
                await birthDetail.update(data.birthDetail || {}, { transaction });
            } else if (data.birthDetail) {
                data.birthDetail.faskesUuid = faskesUuid;
                const infoAge = getInfoAge(data.birthDetail.birthDate);
                Object.assign(data.birthDetail, infoAge);
                birthDetail = await BirthDetailModel.create(data.birthDetail, { transaction });
            }
            data.birthDetailUuid = birthDetail?.uuid || null;

            if (uuid && !data.isNewBorn) {
                const existingPatient = await PatientModel.findOne({
                    where: {
                        [Op.and]: [
                            { noIdentity: data.noIdentity, deletedAt: { [Op.is]: null } },
                            { faskesUuid: faskesUuid }
                        ]
                    },
                    transaction
                });
                if (existingPatient && existingPatient.uuid !== uuid) {
                    throw new DuplicateException("No identity already exists for this faskes.");
                }
            } else if (!uuid && !data.isNewBorn) {
                // Check uniqueness for new patients
                const existingPatient = await PatientModel.findOne({
                    where: {
                        noIdentity: data.noIdentity,
                        deletedAt: { [Op.is]: null }
                    },
                    transaction
                });
                if (existingPatient) throw new DuplicateException("No identity already exists");
            }

            // Create or update patient
            data.faskesUuid = faskesUuid;
            const patientModel = patient
                ? await patient.update(data, { transaction })
                : await PatientModel.create({
                    ...data,
                    noRm: await generateNoRM(),
                }, { transaction });

            if (!externalTransaction) await transaction.commit();

            return {
                ...patientModel.get({ plain: true }),
                address: address ? address.get({ plain: true }) : null,
                birthDetail: birthDetail ? birthDetail.get({ plain: true }) : null
            };

        } catch (error) {
            if (!externalTransaction) await transaction.rollback();
            console.error(error);
            throw error;
        }
    }
    
    
    static async importData(data){
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        try{
            return await sequelizeInstace.transaction(async (t) => {
                let currentInsert = 1;
                for (let item of data){
                    item = convertSnakeToCamel(item);
                    console.log("Item :", item);
                    const address = await AddressModel.create({
                        faskesUuid: faskesUuid,
                        fullAddress: item.address.full_address,
                        postalCode: item.address.postal_code,
                        ...item.address,
                    }, {transaction: t});
                    const infoAge = getInfoAge(item.birthDetail.birth_date);
                    const birthDetail = await BirthDetailModel.create({
                        birthPlace: item.birthDetail.birth_place,
                        birthDate: item.birthDetail.birth_date,
                        ...infoAge,
                        faskesUuid: faskesUuid
                    }, {transaction: t});

                    //* CHECK NO IDENTITAS PASIEN
                    const checkPatient =
                        await PatientModel.findOne({
                            where: {
                                [Op.or]: [
                                    { no_identity: item.noIdentity },
                                ]
                            }
                        });
                        
                    if(checkPatient) throw new DuplicateException("Data No Identitas pada baris ke " + (currentInsert) + " sudah ada");
                    await PatientModel.create({
                        ...item,
                        noRm: await generateNoRM(),
                        addressUuid: address.uuid,
                        birthDetailUuid: birthDetail.uuid,
                        faskesUuid: faskesUuid,
                    }, {transaction: t});
                    currentInsert++;
                }
                return {message: `Berhasil import : ${data.length} data pasien`};
            });
        }catch (error){
            console.log(error);
            throw error;
        }
    }


    static async checkExistPatient(data){
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        try {
            return await PatientModel.findOne({
              where: {
                faskesUuid,
                [Op.or]: [{ noIdentity: data.no_identity }],
                [Op.and]: [{ deletedAt: { [Op.is]: null } }],
              },
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

    static async getAllPatient(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        try {
            const filter = {
                faskesUuid,
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${args.q || ""}%`
                        }
                    },
                    {
                        noRm: {
                            [Op.like]: `%${args.q || ""}%`
                        }
                    },
                    {
                        noIdentity: {
                            [Op.like]: `%${args.q || ""}%`
                        }
                    }
                ]
            };

            const option = {
                include: [{
                    model: AddressModel,
                    required: true,
                    as: "address",
                    attributes: ["uuid", "full_address", "prov", "city", "district", "rt", "rw", "village", "country"]
                }, {
                    model: BirthDetailModel,
                    required: true,
                    as: "birth_detail",
                    attributes: ["age_year", "age_month", "age_day"]
                }],
                attributes: [
                    "uuid",
                    "no_identity",
                    "no_rm",
                    "name",
                    "gender",
                    "status",
                    "phone"
                ],
            };

            return await Pagination.init(
                PatientModel,
                args,
                filter,
                option
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



    static async getOnePatientBy(col, val){
        try {
            return await
                PatientModel.findOne({
                    where: {
                        [col]: val,
                        deletedAt: null
                    }
                });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}