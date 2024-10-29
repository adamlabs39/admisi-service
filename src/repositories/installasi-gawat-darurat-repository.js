'use strict';
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import PatientRepository from "./patient-repository.js";
import {convertSnakeToCamel, generateNoPelayanan, generateNoReg, selectAttributes} from "../helper/utility.js";
import moment from "moment";
import InsuranceAdmissionRepository from "./insurance-admission-repository.js";
import PractitionerRepository from "./practitioner-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import {eventEmitter} from "../helper/event.js";
import {LOG_PELAYANAN_CHANNEL, NEW_BORN_CHANNEL} from "../constant/event-constant.js";
import InstalasiGawatDaruratModel from "../models/instalasi-gawat-darurat-model.js";
import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import AddressModel from "../models/address-model.js";
import BirthDetailModel from "../models/birth-detail-model.js";
import PractitionerModel from "../models/practitioner-model.js";
import PegawaiModel from "../models/pegawai-model.js";
import Pagination from "../helper/pagination.js";
import BadRequestException from "../exception/bad-request-exception.js";
import {boolean} from "zod";

export default class InstallasiGawatDaruratRepository {
    static async registIGD(data) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        const transaction = await sequelizeInstance.transaction();
        try {
            if(data.isNewborn){
                const mom = await PatientRepository.getOnePatientBy('no_identity', data.patientData.no_identity);
                if (!mom) throw new NotfoundException("Identity Mom not found! please regist the mother first");
                data.patientData.isNewBorn = true;
            }

            const patient = await PatientRepository.registPatient(data.patientData, transaction);
            if (!patient) throw new Error("Failed to process patient data");

            const practitioner = await PractitionerRepository.getPractitionerBy('uuid', data.practitionerUuid);
            if (!practitioner) throw new NotfoundException('Practitioner not found');

            const commonIgdData = {
                faskesUuid,
                patientUuid: patient.uuid,
                noReg: await generateNoReg(),
                noPelayanan: await generateNoPelayanan('IGD'),
                noRm: patient.noRm,
                name: patient.name,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                statusIgd: 1,
                practitionerUuid: data.practitionerUuid,
                tanggalDirawat: moment().unix(),
                tanggalDaftar: moment().unix(),
                complaint: data.complaint,
                note: data.note,
                maternity: data.maternity,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
            };

            let additionalData = {};
            if (data.withoutIdentity) {
                additionalData = {withoutIdentity: true};
            } else if (data.isNewborn) {
                additionalData = {newborn: true};
            }

            const resultIgd = await InstalasiGawatDaruratModel.create({...commonIgdData, ...additionalData}, {transaction});

            let insurance = null;
            if (data.paymentMethod === 'ASURANSI') {
                insurance = await InsuranceAdmissionRepository.upsertInsuranceAdmission({
                    admissionType: 2,
                    noReg: resultIgd.noReg,
                    insuranceAccountUuid: data.insuranceAccountUuid,
                }, transaction);
            }

            await transaction.commit();

            if (data.isNewborn) {
                eventEmitter.emit(NEW_BORN_CHANNEL, {
                    identifier_mom: patient.identity,
                    name_mom: patient.motherName,
                    name_baby: patient.name,
                    no_rm_baby: patient.noRm,
                    birth_detail_uuid: patient.birthDetailUuid,
                    birth_time_baby: moment(data.birthtime).format('HH:mm:ss'),
                    gender_baby: patient.gender,
                    multiple_birth: data.multipleBirth,
                    address_uuid: patient.address.uuid,
                    tanggal_daftar: moment().unix(),
                    status: true,
                });
            }
            const patientAttributes = selectAttributes(patient, [
                'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                'address.uuid', 'address.status', 'address.prov', 'address.city',
                'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                'birthDetail.ageMonth', 'birthDetail.ageDay'
            ], true);

            const igdAttributes = selectAttributes(resultIgd, [
                'uuid', 'noReg', 'practitionerUuid', 'complaint', 'note', 'maternity', 'newborn', 'withoutIdentity', 'noPelayanan'
            ], true);
            const result = {
                ...igdAttributes,
                patient: patientAttributes,
            };
            if (insurance) {
                result.insurance = selectAttributes(insurance, [
                    'uuid', 'noReg', 'insuranceAccountUuid', 'admissionType', 'status'
                ], true);
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                tgl_registrasi: moment().unix(),
                noreg: resultIgd.noReg,
                no_pelayanan: resultIgd.noPelayanan,
                practitioner_uuid: resultIgd.practitionerUuid,
                jenis_kunjungan: "IGD",
                patient_uuid: result.patient.uuid,
                lokasi_uuid: null,
                payment_method: resultIgd.paymentMethod
            })

            return result;
        } catch (e) {
            console.log("Error regist IGD", e);
            await transaction.rollback();
            throw e;
        }
    }


    static async updateIgd(uuid, data) {
        const transaction = await sequelizeInstance.transaction();
        data = convertSnakeToCamel(data);
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        try {
            const igd = await InstalasiGawatDaruratModel.findOne({where: {uuid}, transaction});
            if (!igd) throw new NotfoundException("IGD not found");
            const practitioner = await PractitionerRepository.getPractitionerBy('uuid', data.practitionerUuid);
            if (!practitioner) throw new NotfoundException('Practitioner not found');

            let patient = null;
            if (igd.withoutIdentity !== data.withoutIdentity && igd.patientUuid !== data.patientData.patient_uuid) {
                const checkPatient = await PatientModel.findOne({
                    where:
                        {
                            uuid: data.patientData.patient_uuid,
                            faskesUuid,
                            deletedAt: null
                        }
                });
                if (!checkPatient) throw new NotfoundException("Patient not found");
                if(data.isNewborn){
                    const mom = await PatientRepository.getOnePatientBy('no_identity', data.patientData.no_identity);
                    if (!mom) throw new NotfoundException("Identity Mom not found! please regist the mother first");
                    data.patientData.isNewBorn = true;
                }
                patient = await PatientRepository.registPatient(data.patientData, transaction);
                if (!patient) throw new Error("Failed to process patient data");

                data.patientUuid = patient.uuid;
            } else {
                patient = await PatientRepository.registPatient({
                    patientUuid: igd.patientUuid,
                    ...data.patientData,
                }, transaction);
                if (!patient) throw new NotfoundException('Patient not found');
            }
            const commonData = {
                faskesUuid,
                patientUuid: patient.uuid,
                noRm: patient.noRm,
                name: patient.name,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                practitionerUuid: data.practitionerUuid,
                complaint: data.complaint,
                note: data.note,
                maternity: data.maternity,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
            };


            const additionalData = {
                withoutIdentity: !!data.withoutIdentity,
                newborn: !!data.isNewborn
            };

            const resultIgd = await igd.update({...commonData, ...additionalData}, {transaction});

            let insurance = null;
            if (data.paymentMethod === 'ASURANSI') {
                insurance = await InsuranceAdmissionRepository.upsertInsuranceAdmission({
                    admissionType: 2,
                    noReg: resultIgd.noReg,
                    insuranceAccountUuid: data.insuranceAccountUuid,
                }, transaction);
            }

            await transaction.commit();
            if (data.isNewborn) {
                eventEmitter.emit(NEW_BORN_CHANNEL, {
                    identifier_mom: patient.identity,
                    name_mom: patient.motherName,
                    name_baby: patient.name,
                    no_rm_baby: patient.noRm,
                    birth_detail_uuid: patient.birthDetailUuid,
                    birth_time_baby: moment(data.birthtime).format('HH:mm:ss'),
                    gender_baby: patient.gender,
                    multiple_birth: data.multipleBirth,
                    address_uuid: patient.address.uuid,
                    tanggal_daftar: moment().unix(),
                    status: true,
                });
            }
            const patientAttributes = selectAttributes(patient, [
                'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                'address.uuid', 'address.status', 'address.prov', 'address.city',
                'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                'birthDetail.ageMonth', 'birthDetail.ageDay'
            ], true);

            const igdAttributes = selectAttributes(resultIgd, [
                'uuid', 'noReg', 'practitionerUuid', 'complaint', 'note', 'maternity', 'newborn', 'withoutIdentity', 'noPelayanan'
            ], true);

            const result = {
                ...igdAttributes,
                patient_data: patientAttributes,
            };

            if (insurance) {
                result.insurance = selectAttributes(insurance, [
                    'uuid', 'noReg', 'insuranceAccountUuid', 'admissionType', 'status'
                ], true);
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                tgl_registrasi: resultIgd.tanggalDaftar,
                noreg: resultIgd.noReg,
                no_pelayanan: resultIgd.noPelayanan,
                practitioner_uuid: resultIgd.practitionerUuid,
                jenis_kunjungan: "IGD",
                patient_uuid: result.patient.uuid,
                lokasi_uuid: null,
                payment_method: resultIgd.paymentMethod
            })

            return result;

        } catch (e) {
            console.log("Error update IGD", e);
            await transaction.rollback();
            throw e;
        }
    }

    static async getDetail(uuid) {
        try{
            const {faskesUuid} = Context.get(CTX_AUTHOR);
            const igd = await InstalasiGawatDaruratModel.findOne({
                where: {uuid, faskesUuid},
                include: [
                    {
                        model: PatientModel,
                        as: "patient",
                        required: true,
                        where: {deletedAt: {[Op.is]: null}},
                        include: [
                            {
                                model: AddressModel,
                                as: "address",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: ["uuid", "full_address", "prov", "city", "district", "rt", "rw", "village", "country", "postal_code"]
                            },
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: ["birth_place", "birth_date"]
                            }
                        ],
                        attributes: ["uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language", "mother_name", "maritial_status", "status", 'is_new_born'],
                    }
                ],
                attributes: [
                    "uuid", "no_reg", "no_rm", "tanggal_daftar", "tanggal_daftar", "tanggal_dirawat", "complaint", "note", "maternity", "payment_method", "status_igd", "newborn", "without_identity", "practitioner_uuid", "no_pelayanan"
                ]
            });

            if (!igd) throw new NotfoundException("IGD not found");
            return igd;
        }catch (e) {
            console.log("Error get detail IGD", e);
            throw e;
        }
    }

    static async getAll(args) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        const filter = {
            faskesUuid,
            [Op.or]: [
                {no_rm: {[Op.iLike]: `%${args.q || ''}%`}}, // Find by no_rm
                sequelizeInstance.where(
                    sequelizeInstance.fn('concat', sequelizeInstance.col('patient.title'), ' ', sequelizeInstance.col('patient.name')),
                    {[Op.iLike]: `%${args.q || ''}%`}
                ), // Find by title and name
                sequelizeInstance.where(
                    sequelizeInstance.col('patient.address.full_address'),
                    {[Op.iLike]: `%${args.q || ''}%`}
                ) // Find by address
            ],
            statusIgd: {[Op.not]: 0},
            tanggalDaftar: {
                [Op.between]: [args.start_date, args.end_date]
            }
        }

        if (args.payment_method) filter.paymentMethod = args.payment_method;
        if (args.dpjp) filter.practitionerUuid = args.dpjp;
        if (args.without_identity) filter.withoutIdentity = args.without_identity;

        const options = {
            include: [
                {
                    model: PatientModel,
                    as: "patient",
                    required: true,
                    where: {
                        deletedAt: {[Op.is]: null}
                    },
                    include: [
                        {
                            model: AddressModel,
                            as: "address",
                            required: true,
                            where: {
                                deletedAt: {[Op.is]: null}
                            },
                            attributes: [
                                "prov", "city", "district", "rt", "rw", "full_address", "country", "village"
                            ],
                        },
                    ],
                    attributes: [
                        "uuid", "title", "name", "identity", "no_identity", "phone", "gender", "is_new_born"
                    ]
                },
                {
                    model: BirthDetailModel,
                    as: "birth_detail",
                    required: true,
                    where: {deletedAt: {[Op.is]: null}},
                    attributes: [
                        'age_year', 'age_month', 'age_day'
                    ]
                },
                {
                    model: PractitionerModel,
                    as: "practitioner",
                    required: true,
                    where: {deletedAt: {[Op.is]: null}},
                    attributes: ["uuid"],
                    include: [
                        {
                            model: PegawaiModel,
                            as: "pegawai",
                            required: true,
                            where: {deletedAt: {[Op.is]: null}},
                            attributes: ["title", "nama", "gender"]
                        }
                    ]
                },
            ],
            attributes: [
                "uuid", "no_reg", "no_rm", "tanggal_daftar", "tanggal_daftar", "tanggal_dirawat", "without_identity",  "payment_method"
            ]
        }

        const transform = {
            practitioner: (row) => ({
                uuid: undefined, // delete practitioner uuid
                ...row.practitioner.pegawai.get(),
            }),
        };

        return await Pagination.init(
            InstalasiGawatDaruratModel,
            args,
            filter,
            options,
            transform
        )
    }

    static async cancelVisitIGD(data) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            return sequelizeInstance.transaction(async (t) => {
                const igd = await InstalasiGawatDaruratModel.findAll({
                    where: {
                        uuid: data.listUuid,
                        faskesUuid,
                        statusIgd: {[Op.not]: 0}
                    }
                })
                const isDischarged = igd.filter(item => item.statusIgd !== 2);
                if (isDischarged.length > 0) throw new BadRequestException("IGD Has been discharged can't cancel visit");
                if (rawatInap.length === 0) throw new NotfoundException("IGD not found");
                await InstalasiGawatDaruratModel.update({statusIgd: 0}, {
                    where: {
                        uuid: data.listUuid,
                        faskesUuid,
                        statusIgd: {[Op.not]: 0}
                    },
                    transaction: t
                });

                eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                    list_no_pelayanan: igd.map(item => item.noPelayanan),
                    cancel_reason: data.cancelReason
                })
                return rawatInap;
            });
        } catch (e) {
            console.log("Error cancel IGD", e);
            throw e;
        }
    }
}