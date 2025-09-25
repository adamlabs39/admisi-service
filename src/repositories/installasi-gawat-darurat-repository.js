'use strict';
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import PatientRepository from "./patient-repository.js";
import {convertSnakeToCamel, generateNoPelayanan, generateNoReg} from "../helper/utility.js";
import moment from "moment";
import InsuranceAdmissionRepository from "./insurance-admission-repository.js";
import PractitionerRepository from "./practitioner-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import {eventEmitter} from "../helper/event.js";
import {LOG_CANCLE_PELAYANAN_CHANNEL, LOG_PELAYANAN_CHANNEL} from "../constant/event-constant.js";
import {Op} from "sequelize";
import BadRequestException from "../exception/bad-request-exception.js";
import {
    InstalasiGawatDaruratModel,
    InsuranceAdmissionModel
} from "@adameds/model-sdk/pelayanan";
import {
    PatientModel,
    BirthDetailModel,
    NewBornModel,
    InsuranceAccountModel
} from "@adameds/model-sdk/admisi";
import {
    AddressModel
} from "@adameds/model-sdk/setting";
import {
    PractitionerModel,
    PegawaiModel
} from "@adameds/model-sdk/datamaster";
import Pagination from "../helper/pagination.js";
import newBornRepository from "./newborn-repository.js";

export default class InstallasiGawatDaruratRepository {
    static async registIGD(data) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            const create = await sequelizeInstance.transaction(async (transaction) => {
            if(data.isNewborn){
                const mom = await PatientRepository.getOnePatientBy('no_identity', data.patientData.no_identity);
                if (!mom) throw new NotfoundException("Identitas Ibu tidak ditemukan! Pastikan Ibu sudah terdaftar sebagai pasien");
                data.patientData.isNewBorn = true;
            }

            const patient = await PatientRepository.registPatient(data.patientData, transaction);
            if (!patient) throw new Error("Failed to process patient data");

            const practitioner = await PractitionerRepository.getPractitionerBy('uuid', data.practitionerUuid);
            if (!practitioner) throw new NotfoundException('Data dokter tidak ditemukan');

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
                additionalData = {newborn: true, multipleBirth: data.patientData.multiple_birth};
            }
            
            const resultIgd = await InstalasiGawatDaruratModel.create({...commonIgdData, ...additionalData}, {transaction});

            if (data.paymentMethod === 'ASURANSI') {
                await InsuranceAdmissionRepository.AsuransiPelayanan({
                    patientUuid: resultIgd.patientUuid,
                    penjaminUuid: data.insurance.penjamin_uuid,
                    accountNumber: data.insurance.account_number,
                    classEntitle: data.insurance.class_entitle,
                    noReg: resultIgd.noReg,
                    admissionType: 2
                },transaction)
            }
            
            if (data.isNewborn) {
                await newBornRepository.upsertNewBorn({
                    identifier_mom: patient.identity,
                    name_mom: patient.motherName,
                    name_baby: patient.name,
                    no_rm_baby: patient.noRm,
                    birth_detail_uuid: patient.birthDetailUuid,
                    birth_time_baby: data.patientData.birth_time,
                    gender_baby: patient.gender,
                    multiple_birth: resultIgd.multipleBirth,
                    address_uuid: patient.address.uuid,
                    tanggal_daftar: moment().format('YYYY-MM-DD'),
                    status: true,
                }, transaction);
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                tgl_registrasi: moment().unix(),
                noreg: resultIgd.noReg,
                no_pelayanan: resultIgd.noPelayanan,
                practitioner_uuid: resultIgd.practitionerUuid,
                jenis_kunjungan: "IGD",
                patient_uuid: resultIgd.patientUuid,
                lokasi_uuid: null,
                payment_method: resultIgd.paymentMethod
            })

                return resultIgd.uuid;
            });

            return await this.getDetail(create);
            
        } catch (e) {
            console.log("Error regist IGD", e);
            throw e;
        }
    }


    static async updateIgd(uuid, data) {
        data = convertSnakeToCamel(data);
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        try {
            const update = await sequelizeInstance.transaction(async (transaction) => {
                const igd = await InstalasiGawatDaruratModel.findOne({ where: { uuid }, transaction });
                if (!igd) throw new NotfoundException("IGD not found");

                const practitioner = await PractitionerRepository.getPractitionerBy('uuid', data.practitionerUuid);
                if (!practitioner) throw new NotfoundException('Practitioner not found');

                let patient = null;
                if (igd.withoutIdentity !== data.withoutIdentity && igd.patientUuid !== data.patientData.patient_uuid) {
                    const uuidPatient = data.patientData.patient_uuid || igd.patientUuid;
                    data.patientData.patientUuid = uuidPatient;
                    const checkPatient = await PatientModel.findOne({
                        where: {
                            uuid: uuidPatient,
                            faskesUuid,
                            deletedAt: null
                        },
                        transaction
                    });
                    if (!checkPatient) throw new NotfoundException("Patient not found");
                    console.log("Data pasien:", data.patientData);
                    if (data.isNewborn) {
                        const mom = await PatientRepository.getOnePatientBy('no_identity', data.patientData.no_identity);
                        if (!mom) throw new NotfoundException("Identity Mom not found! please register the mother first");
                        data.patientData.isNewBorn = true;
                    }
                    
                    patient = await PatientRepository.registPatient(data.patientData, transaction);
                    if (!patient) throw new Error("Failed to process patient data");

                    data.patientUuid = patient.uuid;
                } else {

                    if (data.isNewborn) {
                        const mom = await PatientRepository.getOnePatientBy('no_identity', data.patientData.no_identity);
                        if (!mom) throw new NotfoundException("Identity Mom not found! please register the mother first");
                        data.patientData.isNewBorn = true;
                    }
                    
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
                    newborn: !!data.isNewborn,
                    multipleBirth: data.isNewborn ? data.patientData.multiple_birth : false
                };

                const resultIgd = await igd.update({ ...commonData, ...additionalData }, { transaction });

                if (data.paymentMethod === 'ASURANSI') {
                    await InsuranceAdmissionRepository.AsuransiPelayanan({
                        patientUuid: resultIgd.patientUuid,
                        penjaminUuid: data.insurance.penjamin_uuid,
                        accountNumber: data.insurance.account_number,
                        classEntitle: data.insurance.class_entitle,
                        noReg: resultIgd.noReg,
                        admissionType: 2
                    }, transaction);
                }

                if (data.isNewborn) {
                    await newBornRepository.upsertNewBorn({
                        identifier_mom: patient.identity,
                        name_mom: patient.motherName,
                        name_baby: patient.name,
                        no_rm_baby: patient.noRm,
                        birth_detail_uuid: patient.birthDetailUuid,
                        birth_time_baby: data.patientData.birth_time,
                        gender_baby: patient.gender,
                        multiple_birth: resultIgd.multipleBirth,
                        address_uuid: patient.address.uuid,
                        tanggal_daftar: moment().format('YYYY-MM-DD'),
                        status: true,
                    }, transaction);
                }

                eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                    tgl_registrasi: resultIgd.tanggalDaftar,
                    noreg: resultIgd.noReg,
                    no_pelayanan: resultIgd.noPelayanan,
                    practitioner_uuid: resultIgd.practitionerUuid,
                    jenis_kunjungan: "IGD",
                    patient_uuid: patient.uuid,
                    lokasi_uuid: null,
                    payment_method: resultIgd.paymentMethod
                });

                return resultIgd.uuid;
            });

            return await this.getDetail(update);

        } catch (e) {
            console.error("Error updating IGD", e);
            throw e;
        }
    }

    static async getDetail(uuid) {
        try{
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            const igd = await InstalasiGawatDaruratModel.findOne({
                where: { uuid, faskesUuid },
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
                                attributes: ["birth_place", "birth_date", "age_year", "age_month", "age_day"]
                            }
                        ],
                        attributes: ["uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language", "mother_name", "maritial_status", "status", 'is_new_born'],
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
                                attributes: ["first_title", "last_title", ["name","nama"]]
                            }
                        ]
                    }
                ],
                attributes: [
                    "uuid", "no_reg", "no_rm", "tanggal_daftar", "tanggal_daftar", "tanggal_dirawat", "complaint", "note", "maternity", "payment_method", "status_igd", "newborn", "without_identity", "practitioner_uuid", "no_pelayanan"
                ]
            });
            if (!igd) throw new NotfoundException("IGD not found");
            if(igd.newborn){
                igd.patient.dataValues.new_born = await NewBornModel.findOne({
                    where: {
                        faskesUuid,
                        no_rm_baby: igd.dataValues.no_rm,
                        status: true
                    },
                    attributes: ["identifier_mom", "name_mom", "name_baby", "no_rm_baby",
                        "birth_detail_uuid", "birth_time_baby", "gender_baby",
                        "multiple_birth", "address_uuid", "tanggal_daftar"]
                });
            }

            if (igd.dataValues.payment_method === 2) {
                const insuranceData = await InsuranceAdmissionModel.findOne({
                    where: { noReg: igd.dataValues.no_reg },
                    include: [
                        {
                            model: InsuranceAccountModel,
                            as: "insurance",
                            required: true,
                            where: {
                                deletedAt: { [Op.is]: null }
                            },
                            attributes: [
                                "account_number",
                                "code",
                                "name",
                                "class_entitle"
                            ]
                        }
                    ],
                    attributes: ["insurance_account_uuid"]
                });

                if (insuranceData) {
                    igd.dataValues.insurance = insuranceData.dataValues.insurance;
                }

                return {
                    ...igd.get(),
                    patient: igd.patient.get()
                };
            }
            return {
                ...igd.get(),
                patient: igd.patient.get()
            };
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
            },
            dischargeDate: {[Op.is]: null}
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
                            attributes: ["first_title", "last_title", ["name","nama"], "gender"]
                        }
                    ]
                },
            ],
            attributes: [
                "uuid", "no_reg", "no_rm", "tanggal_daftar", "tanggal_daftar", "tanggal_dirawat", "without_identity",  "payment_method", "status_igd", "kondisi_pasien_pulang", "rekam_medis_uuid", "no_pelayanan"
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
        const user = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            return sequelizeInstance.transaction(async (t) => {
                const igd = await InstalasiGawatDaruratModel.findAll({
                    where: {
                        uuid: data.listUuid,
                        faskesUuid: user.faskesUuid,
                        statusIgd: {[Op.not]: 0}
                    },
                    transaction: t
                });
                
                const isDischarged = igd.filter(igd => igd.statusIgd >= 2);
                if (isDischarged.length > 0) {
                    throw new BadRequestException("IGD Tidak bisa di cancel karena sudah di pulangkan");
                }

                if (igd.length !== data.listUuid.length) {
                    throw new BadRequestException("IGD tidak ditemukan");
                }

                await InstalasiGawatDaruratModel.update({statusIgd: 0, alasanBatal: data.cancelReason, petugas: user.username, deletedAt: moment().unix()}, {
                    where: {
                        uuid: data.listUuid,
                        faskesUuid: user.faskesUuid,
                        statusIgd: {[Op.not]: 0}
                    },
                    transaction: t
                });

                eventEmitter.emit(LOG_CANCLE_PELAYANAN_CHANNEL,{
                    list_no_pelayanan: igd.map(item => item.noPelayanan),
                    cancel_reason: data.cancelReason,
                    cancel_by: user.username
                });
                return igd;
            });
        } catch (e) {
            console.log("Error cancel IGD", e);
            throw e;
        }
    }
}