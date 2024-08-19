import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import RawatJalanModel from "../models/rawat-jalan-model.js";
import {Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import InsuranceAdmissionModel from "../models/insurance-admission-model.js";
import {convertCamelToSnake, generateNoReg} from "../helper/utility.js";
import newBornRepository from "./newborn-repository.js";
import moment from "moment";
import PatientRepository from "./patient-repository.js";

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
            })
        } catch (error) {
            throw error;
        }
    }


    // static async registSinglePatient(patientData, paymentMethod, assuranceAccountId = null) {
    //     return await sequelizeInstace.transaction(async (t) => {
    //         const patient = await PatientRepository.registPatient(patientData, t);
    //         if (!patient) throw new Error("Failed to create patient");
    //
    //         // Pastikan bahwa 'doctor' mendapatkan nilai dari 'dpjp'
    //         const dataRJ = {
    //             faskesUuid: patient.faskesUuid,
    //             noReg: generateNoReg(),
    //             patientUuid: patient.uuid,
    //             name: patient.name,
    //             noRm: patient.noRm,
    //             birthDetailUuid: patient.birthDetailUuid,
    //             gender: patient.gender,
    //             doctor: patient.dpjp,  // Pastikan ini mendapatkan nilai
    //             maternity: patient.maternity,
    //             newBorn: patient.is_newborn,
    //             note: patient.note,
    //             polyclinic: patient.polyclinic,
    //             complaint: patient.complaint,
    //             platform: patient.platform,
    //             paymentMethod: paymentMethod === 'TUNAI' ? 1 : 2
    //         };
    //
    //         console.log("dataRJ", dataRJ);
    //         const regist = await RawatJalanModel.create(dataRJ, { transaction: t });
    //         if (paymentMethod === 'ASURANSI') {
    //             const asuransi = await InsuranceAdmissionModel.create({
    //                 faskesUuid: patient.faskesUuid,
    //                 noReg: regist.noReg,
    //                 insuranceAccountUuid: assuranceAccountId,
    //             }, { transaction: t });
    //
    //             return convertCamelToSnake({
    //                 ...regist.get(),
    //                 insurance: convertCamelToSnake(asuransi.get())
    //             });
    //         }
    //
    //         return regist.get();
    //     });
    // }

    static async registSinglePatient(patientData, data) {
        return await sequelizeInstace.transaction(async (t) => {
            const patient = await PatientRepository.registPatient(patientData, t);
            if (!patient) throw new Error("Failed to create patient");

            // Pastikan bahwa 'doctor' mendapatkan nilai dari 'dpjp'
            const dataRJ = {
                faskesUuid: patient.faskesUuid,
                noReg: generateNoReg(),
                patientUuid: patient.uuid,
                name: patient.name,
                noRm: patient.noRm,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                doctor: data.dpjp,  // Pastikan ini mendapatkan nilai
                maternity: data.maternity,
                newBorn: data.is_newborn,
                note: data.note,
                polyclinic: data.polyclinic,
                complaint: data.complaint,
                platform: data.platform,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2
            };

            console.log("dataRJ", dataRJ);
            const regist = await RawatJalanModel.create(dataRJ, { transaction: t });
            if (data.paymentMethod === 'ASURANSI') {
                const asuransi = await InsuranceAdmissionModel.create({
                    faskesUuid: patient.faskesUuid,
                    noReg: regist.noReg,
                    insuranceAccountUuid: data.assuranceAccountId,
                }, { transaction: t });

                return convertCamelToSnake({
                    ...regist.get(),
                    insurance: convertCamelToSnake(asuransi.get())
                });
            }

            return regist.get();
        });
    }

    static async registNewBorn(newbornData, data) {
        return await sequelizeInstace.transaction(async (t) => {
            const newbornResults = [];

            for (const patientData of newbornData) {
                const patient = await PatientRepository.registPatient(patientData, t);
                if (!patient) throw new Error("Failed to create patient for newborn");

                const dataRJ = {
                    faskesUuid: patient.faskesUuid,
                    noReg: generateNoReg(),
                    patientUuid: patient.uuid,
                    name: patient.name,
                    noRm: patient.noRm,
                    birthDetailUuid: patient.birthDetailUuid,
                    gender: patient.gender,
                    doctor: data.dpjp,
                    maternity: data.maternity,
                    newBorn: data.is_newborn,
                    note: data.note,
                    polyclinic: data.polyclinic,
                    complaint: data.complaint,
                    platform: data.platform,
                    paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2
                };
                const regist = await RawatJalanModel.create(dataRJ, { transaction: t });

                if (data.paymentMethod === 'ASURANSI') {
                    const asuransi = await InsuranceAdmissionModel.create({
                        faskesUuid: patient.faskesUuid,
                        noReg: regist.noReg,
                        insuranceAccountUuid: data.assuranceAccountId,
                    }, { transaction: t });

                    newbornResults.push(convertCamelToSnake({
                        ...regist.get(),
                        insurance: convertCamelToSnake(asuransi.get())
                    }));
                } else {
                    newbornResults.push(regist.get());
                }

                const newBorn = {
                    faskesUuid: patient.faskesUuid,
                    identifierMom: patient.identity,
                    nameMom: patient.motherName,
                    nameBaby: patient.name,
                    noRmBaby: patient.noRm,
                    birthPlaceBaby: patient.birthDetail.birthPlace,
                    birthDateBaby: patient.birthDetail.birthDate,
                    birthTimeBaby: moment(patient.birthDetail.birthDate).format('HH:mm'),
                    genderBaby: patient.gender,
                    multipleBirth: newbornData.length,
                    addressUuid: patient.address.uuid,
                    tanggalDaftar: moment().format('YYYY-MM-DD HH:mm:ss'),
                    status: true,
                };

                await newBornRepository.registNewBorn(newBorn, { transaction: t });
            }

            return newbornResults;
        });
    }
}