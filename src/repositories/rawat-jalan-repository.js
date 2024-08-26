import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import RawatJalanModel from "../models/rawat-jalan-model.js";
import {Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import InsuranceAdmissionModel from "../models/insurance-admission-model.js";
import {convertCamelToSnake, generateNoReg, selectAttributes} from "../helper/utility.js";
import PatientRepository from "./patient-repository.js";
import BirthDetailModel from "../models/birth-detail-model.js";
import AddressModel from "../models/address-model.js";
import moment from "moment";

export default class RawatJalanRepository {
    static async getAll(args) {
        const ctx = Ctx.get(CTX_AUTHOR);
        const filter = {
            name: {
                [Op.like]: `%${args.name || ""}%`
            },
            // TODO : Add more filter By Payment method, poli, etc
        };

        const options = {
            // TODO: Set Attribute to show and map to snake case
        }

        const data = await RawatJalanModel.findAll({
            where: {
                faskesUuid: ctx.faskesUuid
            }
        });
        console.log(data);
        return await Pagination.init(
            RawatJalanModel,
            args,
            filter,
            // TODO: Add options
        );
    }

    static async getOne(uuid) {
        try {
            const result = await RawatJalanModel.findOne({
                where: { [Op.and]: [{ uuid }, { deletedAt: { [Op.is]: null } }] },
                include: [
                    {
                        model: PatientModel,
                        as: "patient",
                        required: true,
                        where: { deletedAt: { [Op.is]: null } },
                        include: [
                            {
                                model: AddressModel,
                                as: "address",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] }
                            },
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: { deletedAt: { [Op.is]: null } },
                                attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] }
                            }
                        ],
                        attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] }
                    }
                ],
                attributes: [
                    "no_reg", "payment_method", ["doctor", "dpjp"], "maternity", "newborn", "note", "polyclinic", "complaint"
                ]
            });

            if (!result) throw new Error("Data not found");

            const convert = (data, attributes) => selectAttributes(data, attributes, true);

            const patientAttributes = convert(result.patient, [
                'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                'address.uuid', 'address.status', 'address.prov', 'address.city',
                'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                'birth_detail.uuid', 'birth_detail.status', 'birth_detail.birthPlace',
                'birth_detail.birthDate', 'birth_detail.faskesUuid', 'birth_detail.ageYear',
                'birth_detail.ageMonth', 'birth_detail.ageDay'
            ]);

            const rawatJalanAttributes = convert(result, [
                'uuid', 'noReg', 'polyclinic', 'doctor', 'complaint', 'note', 'maternity'
            ]);

            if (result.paymentMethod === 2) {
                const insurance = await InsuranceAdmissionModel.findOne({
                    where: { noReg: result.noReg },
                    attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] }
                });

                return {
                    ...rawatJalanAttributes,
                    patient: patientAttributes,
                    insurance: selectAttributes(insurance, [
                        'uuid', 'status', 'noReg', 'insuranceAccountUuid', 'faskesUuid'
                    ], true),
                };
            }

            return {
                ...rawatJalanAttributes,
                patient: patientAttributes,
            }
        } catch (error) {
            throw error;
        }
    }

    static async processRJ(action, uuid, patientData, data) {
        return await sequelizeInstace.transaction(async (t) => {
            const patient = await PatientRepository.registPatient(patientData, t);
            if (!patient) throw new Error("Failed to create patient");

            const dataRJ = {
                faskesUuid: patient.faskesUuid,
                patientUuid: patient.uuid,
                name: patient.name,
                noRm: patient.noRm,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                doctor: data.dpjp,
                maternity: data.maternity,
                note: data.note,
                polyclinic: data.polyclinic,
                complaint: data.complaint,
                platform: data.platform,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                tanggalDaftar: moment().unix(),
            };

            if (action === 'create') {
                dataRJ.noReg = generateNoReg(); // Generate noReg only for creation
                const regist = await RawatJalanModel.create(dataRJ, { transaction: t });

                const patientAttributes = selectAttributes(patient, [
                    'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                    'address.uuid', 'address.status', 'address.prov', 'address.city',
                    'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                    'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                    'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                    'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                    'birthDetail.ageMonth', 'birthDetail.ageDay'
                ], true);

                const rawatJalanAttributes = selectAttributes(regist.get(), [
                    'uuid', 'noReg', 'polyclinic', 'doctor', 'complaint', 'note', 'maternity'
                ], true);

                if (data.paymentMethod === 'ASURANSI') {
                    const asuransi = await InsuranceAdmissionModel.create({
                        faskesUuid: patient.faskesUuid,
                        noReg: regist.noReg,
                        insuranceAccountUuid: data.assuranceAccountId,
                    }, { transaction: t });

                    return {
                        ...rawatJalanAttributes,
                        patient: patientAttributes,
                        insurance: selectAttributes(asuransi.get(), [
                            'uuid', 'status', 'noReg', 'insuranceAccountUuid', 'faskesUuid'
                        ], true)
                    };
                }

                return {
                    ...rawatJalanAttributes,
                    patient_data: patientAttributes
                };
            } else if (action === 'update') {
                await RawatJalanModel.update(dataRJ, { where: { uuid }, transaction: t });
                const regist = await RawatJalanModel.findOne({ where: { uuid }, transaction: t });

                const patientAttributes = selectAttributes(patient, [
                    'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                    'address.uuid', 'address.status', 'address.prov', 'address.city',
                    'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                    'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                    'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                    'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                    'birthDetail.ageMonth', 'birthDetail.ageDay'
                ], true);

                const rawatJalanAttributes = selectAttributes(regist.get(), [
                    'uuid', 'noReg', 'polyclinic', 'doctor', 'complaint', 'note', 'maternity'
                ], true);

                if (data.paymentMethod === 'ASURANSI') {
                    const asuransi = await InsuranceAdmissionModel.create({
                        faskesUuid: patient.faskesUuid,
                        noReg: regist.noReg,
                        insuranceAccountUuid: data.assuranceAccountId,
                    }, { transaction: t });

                    return {
                        ...rawatJalanAttributes,
                        patient: patientAttributes,
                        insurance: selectAttributes(asuransi.get(), [
                            'uuid', 'status', 'noReg', 'insuranceAccountUuid', 'faskesUuid'
                        ], true)
                    };
                }

                return {
                    ...rawatJalanAttributes,
                    patient_data: patientAttributes
                };
            }
        });
    }
}