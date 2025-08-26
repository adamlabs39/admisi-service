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
import {convertSnakeToCamel, generateNoRM, generateNoRmMobile, getInfoAge} from "../helper/utility.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import DuplicateException from "../exception/duplicate-exception.js";
import PatientService from "../services/patient-service.js";
import { ca, fa } from "zod/v4/locales";
import NotfoundException from "../exception/notfound-exception.js";
import BadRequestException from "../exception/bad-request-exception.js";

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
                            { noIdentity: data.noIdentity || data.dataValues.no_identity, deletedAt: { [Op.is]: null } },
                            { faskesUuid: faskesUuid }
                        ]
                    },
                    transaction
                });
                if (existingPatient && existingPatient.uuid !== uuid) {
                    throw new DuplicateException("No Identitas Pasien sudah terdaftar.");
                }
            } else if (!uuid && !data.isNewBorn) {
                // Check uniqueness for new patients
                const existingPatient = await PatientModel.findOne({
                    where: {
                        faskesUuid,
                        noIdentity: data.noIdentity,
                        deletedAt: { [Op.is]: null }
                    },
                    transaction
                });
                if (existingPatient) throw new DuplicateException("No Identitas Pasien sudah terdaftar.");
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

    static async registPatientApm(data, externalTransaction = null) {
        const transaction = externalTransaction || await sequelizeInstace.transaction();
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);

        PatientService.patientIdentityFormat(data.identity, data.noIdentity);

        try {
            if (data.isNewBorn === undefined || !data.isNewBorn) {
                data.isNewBorn = false;
            }

            const uuid = data.patientUuid || null;
            const patient = uuid ? await PatientModel.findOne({
                where: { uuid, deletedAt: { [Op.is]: null } },
                include: [
                    { model: AddressModel, as: 'address' },
                    { model: BirthDetailModel, as: 'birth_detail' }
                ],
                transaction
            }) : null;

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
                    throw new DuplicateException("No Identitas Pasien sudah terdaftar.");
                }
            } else if (!uuid && !data.isNewBorn) {
                // Check uniqueness for new patients
                const existingPatient = await PatientModel.findOne({
                    where: {
                        faskesUuid,
                        noIdentity: data.noIdentity,
                        deletedAt: { [Op.is]: null }
                    },
                    transaction
                });
                if (existingPatient) throw new DuplicateException("No Identitas Pasien sudah terdaftar.");
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
            
            if (!data.birthDetailUuid) {
                const birthDetail = await BirthDetailModel.create({
                    faskesUuid: faskesUuid,
                    birthPlace: 'Surabaya',
                    birthDate: new Date('2000-01-01'),
                    ageYear: 0,
                    ageMonth: 0,
                    ageDay: 0
                }, { transaction });
                
                data.birthDetailUuid = birthDetail.uuid;
            }

            data.faskesUuid = faskesUuid;
            const patientModel = patient
                ? await patient.update(data, { transaction })
                : await PatientModel.create({
                    ...data,
                    noRm: await generateNoRM(),
                    name: "Nama Pasien",
                    gender: "Male"
                }, { transaction });

            if (!externalTransaction) await transaction.commit();

            return {
                ...patientModel.get({ plain: true }),
            };

        }catch (error) {
            if (!externalTransaction) await transaction.rollback();
            console.error(error);
            throw error;
        }
    }

    static async registPatientMobile(data, faskesUuid, externalTransaction = null) {
        const transaction = externalTransaction || await sequelizeInstace.transaction();
        data = convertSnakeToCamel(data);

        PatientService.patientIdentityFormat(data.identity, data.noIdentity);

        try {
            if (data.isNewBorn === undefined || !data.isNewBorn) {
                data.isNewBorn = false;
            }

            const uuid = data.patientUuid || null;
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
                    throw new DuplicateException("No Identitas Pasien sudah terdaftar.");
                }
            } else if (!uuid && !data.isNewBorn) {
                // Check uniqueness for new patients
                const existingPatient = await PatientModel.findOne({
                    where: {
                        faskesUuid,
                        noIdentity: data.noIdentity,
                        deletedAt: { [Op.is]: null }
                    },
                    transaction
                });
                if (existingPatient) throw new DuplicateException("No Identitas Pasien sudah terdaftar.");
            }

            if (!data.birthDetailUuid) {
                const birthDetail = await BirthDetailModel.create({
                    faskesUuid: faskesUuid,
                    birthPlace: 'Surabaya',
                    birthDate: new Date('2000-01-01'),
                    ageYear: 0,
                    ageMonth: 0,
                    ageDay: 0
                }, { transaction });
                
                data.birthDetailUuid = birthDetail.uuid;
            }

            // Handle address
            let address = null;
            if (data.address) {
                data.address.faskesUuid = faskesUuid;
                address = await AddressModel.create(data.address, { transaction });
                data.addressUuid = address.uuid;
            }

            if (!data.noRm) {
                data.noRm = await generateNoRmMobile(faskesUuid);
            }

            data.faskesUuid = faskesUuid;

            const patientModel = await PatientModel.create({
                ...data,
                noRm: data.noRm,
            }, { transaction });

            if (!externalTransaction) await transaction.commit();

            return {
                ...patientModel.get({ plain: true }),
                address: address ? address.get({ plain: true }) : null,
                birthDetail: {
                    uuid: data.birthDetailUuid,
                    birthPlace: 'Surabaya',
                    birthDate: new Date('2000-01-01'),
                    ageYear: 0,
                    ageMonth: 0,
                    ageDay: 0
                }
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
                let i = 0;

                let patientCount = await PatientModel.unscoped().count({
                where: { faskesUuid },
                transaction: t,
                });

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

                    //* Generate NoRM Khusus untuk Import
                    const currentCount = patientCount + i + 1;
                    const paddedNumber = currentCount.toString().padStart(6, "0");
                    const noRm = `${paddedNumber.slice(0, 2)}-${paddedNumber.slice(2, 4)}-${paddedNumber.slice(4, 6)}`;

                    await PatientModel.create({
                        ...item,
                        noRm: noRm,
                        addressUuid: address.uuid,
                        birthDetailUuid: birthDetail.uuid,
                        faskesUuid: faskesUuid,
                    }, {transaction: t});
                    currentInsert++;
                    i++;
                }

                if (data.length === 0) {
                    throw new BadRequestException("File kosong, tidak ada data pasien untuk diimpor");
                }

                return {message: `Berhasil import : ${data.length} data pasien`};
            });
        }catch (error){
            console.log(error);
            throw error;
        }
    }

    static async checkExistPatient(data){
        try {
            return await PatientModel.findOne({
            where: {
                [Op.or]: [{ noIdentity: data.no_identity, faskesUuid: data.faskes_uuid }],
                [Op.and]: [{ deletedAt: { [Op.is]: null } }],
            },
            include: [
                    {
                        model: AddressModel,
                        required: false,
                        as: "address",
                        attributes: ["uuid", "full_address","prov", "city", "district", "rt", "rw", "village", "postal_code", "country"]
                    },
                    {
                        model: BirthDetailModel,
                        required: false,
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
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async getPatientByUuid(uuid){
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        try{
            return await PatientModel.findOne({
                where: {
                    [Op.and]: [
                        { uuid },
                        { faskesUuid },
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
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        try {
            return await
                PatientModel.findOne({
                    where: {
                        faskesUuid,
                        [col]: val,
                        deletedAt: null
                    }
                });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async createPatientFile(uuid, data){
    const { faskesUuid } = Context.get(CTX_AUTHOR);
        try {
            return await sequelizeInstace.transaction(async (t) => {
                data = convertSnakeToCamel(data);
                const patient = await PatientModel.findOne({
                    where: {
                        uuid,
                        faskesUuid,
                        deletedAt: { [Op.is]: null }
                    },
                    transaction: t
                });

                if (!patient) {
                    throw new NotfoundException("Patient not found");
                }

                if (!data.unggahBerkas) {
                    throw new BadRequestException("File is required");
                }
                
                await patient.update({
                    unggahBerkas: data.unggahBerkas.data,
                    berkasInfo: {
                        name: data.unggahBerkas.name,
                        tanggalUnggah: moment().unix()
                    }
                }, { transaction: t });

                return {
                    uuid: patient.uuid,
                    message: "File berhasil diunggah",
                    name: data.unggahBerkas.name,
                    tanggalUnggah: moment().unix()
                };
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async deletePatientFile(uuid){
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        try{
            const result = await sequelizeInstace.transaction(async (t) => {
                const patient = await PatientModel.findOne({
                    where: {
                        [Op.and]: [
                            { uuid },
                            { faskesUuid },
                            {
                                deletedAt: {
                                    [Op.is]: null
                                }
                            }
                        ]
                    },
                    attributes: ["uuid", "unggahBerkas", "berkasInfo"],
                    transaction: t
                });

                if (!patient) {
                    throw new NotfoundException("Patient tidak ditemukan");
                }
                if (!patient.unggahBerkas) {
                    throw new BadRequestException("Tidak ada file yang diunggah");
                }

                return await PatientModel.update(
                    {
                        updatedAt: moment().unix(),
                        unggahBerkas: null,
                        berkasInfo: null
                    },
                    {
                        where: {
                            [Op.and]: [
                                { uuid },
                                { faskesUuid },
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
            
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getPatientFile(uuid) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        const patient = await sequelizeInstace.transaction(async (t) => {
            return await PatientModel.findOne({
                where: {
                    uuid,
                    faskesUuid,
                    deletedAt: { [Op.is]: null }
                },
                attributes: [
                    "uuid", "unggahBerkas", "berkasInfo"
                ],
                transaction: t
            });
        });

        if (!patient) {
            throw new NotfoundException("Patient not found");
        }

        if (patient && patient.unggahBerkas) {
            return {
                uuid: patient.uuid,
                berkasInfo: patient.berkasInfo,
                tipe: "pdf",
                data: patient.unggahBerkas.toString("base64"),
            };
        }

        return {
            message: "Tidak ada file yang diunggah",
        };
    }

}