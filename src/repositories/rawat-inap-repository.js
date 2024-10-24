import sequelizeInstance from "../configurations/sequelize-instance.js";
import RawatInapModel from "../models/rawat-inap-model.js";
import PatientRepository from "./patient-repository.js";
import MonitoringRoomRepository from "./monitoring-room-repository.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {
    convertSnakeToCamel,
    generateNoPelayanan,
    generateNoReg,
    selectAttributes
} from "../helper/utility.js";
import moment from "moment";
import {eventEmitter} from "../helper/event.js";
import {
    HISTORY_BED_CHANNEL,
    LOG_CANCLE_PELAYANAN_CHANNEL,
    LOG_PELAYANAN_CHANNEL,
    NEW_BORN_CHANNEL
} from "../constant/event-constant.js";
import NotfoundException from "../exception/notfound-exception.js";
import PractitionerRepository from "./practitioner-repository.js";
import InsuranceAdmissionRepository from "./insurance-admission-repository.js";
import DuplicateException from "../exception/duplicate-exception.js";
import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import AddressModel from "../models/address-model.js";
import BirthDetailModel from "../models/birth-detail-model.js";
import NewBornModel from "../models/new-born-model.js";
import PractitionerModel from "../models/practitioner-model.js";
import PegawaiModel from "../models/pegawai-model.js";
import Pagination from "../helper/pagination.js";
import RoomMonitoringModel from "../models/room-monitoring-model.js";

export default class RawatInapRepository {
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
            status_ri: {[Op.not]: 0},
            tanggalDaftar: {
                [Op.between]: [args.start_date, args.end_date]
            }
        }

        if (args.payment_method) filter.paymentMethod = args.payment_method;
        if (args.dpjp) filter.practitionerUuid = args.dpjp;
        if (args.room) {
            filter[Op.and] = sequelizeInstance.where(
                sequelizeInstance.col('monitoring_room.room'),
                {[Op.iLike]: `%${args.room}%`}
            );
        }
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
                {
                    model: RoomMonitoringModel,
                    as: "monitoring_room",
                    required: true,
                    where: {deletedAt: {[Op.is]: null}},
                    attributes: ["uuid", "room_uuid", "room_category", "room_class", "room", "bed_name", "no_bed"]
                }
            ],
            attributes: [
                "uuid", "no_reg", "no_rm", "tanggal_daftar", "tanggal_daftar", "tanggal_dirawat", "payment_method"
            ]
        }

        const transform = {
            practitioner: (row) => ({
                uuid: undefined, // delete practitioner uuid
                ...row.practitioner.pegawai.get(),
            }),
        };

        return await Pagination.init(
            RawatInapModel,
            args,
            filter,
            options,
            transform
        )
    }

    static async registBaby(data) {
        const transaction = await sequelizeInstance.transaction();
        try {
            const user = Context.get(CTX_AUTHOR);
            data = convertSnakeToCamel(data);

            // find mom baby by identity
            const mom = await PatientRepository.getOnePatientBy('no_identity', data.patientData.no_identity);
            if (!mom) throw new NotfoundException("Identity Mom not found! please regist the mother first");

            const practitioner = await PractitionerRepository.getPractitionerBy('uuid', data.practitionerUuid);
            if (!practitioner) throw new NotfoundException("Practitioner not found");


            // Regist Patient
            const patient = await PatientRepository.registPatient({...data.patientData, isNewBorn: true}, transaction);
            if (!patient) throw new Error("Failed to create patient");

            // Get Bed Details
            const bedData = await MonitoringRoomRepository.getDetailBed(data.monitoringRoomUuid);
            const monitoring = await MonitoringRoomRepository.registPatientToBed(bedData.dataValues.uuid, patient.uuid, transaction);
            // Insert into RawatInap
            const registRI = await RawatInapModel.create({
                faskesUuid: user.faskesUuid,
                patientUuid: patient.uuid,
                noReg: await generateNoReg(),
                noPelayanan: await generateNoPelayanan('RI'),
                noRm: patient.noRm,
                name: patient.name,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                tanggalDaftar: moment().unix(),
                tanggalMasuk: moment().unix(),
                joinBill: true,
                familyBill: data.familyBill,
                boxBaby: true,
                note: data.note,
                complaint: data.complaint,
                multipleBirth: data.multipleBirth,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                monitoringRoomUuid: bedData.dataValues.uuid,
                statusRi: 3,
                encounter: "RI", // For Baby Encounter Just Use RI
                practitionerUuid: practitioner.uuid,
            }, {
                transaction: transaction,
                returning: true
            });

            let insurance = null
            if (data.paymentMethod === 'ASURANSI') {
                insurance = await InsuranceAdmissionRepository.upsertInsuranceAdmission({
                    admissionType: 3,
                    noReg: registRI.noReg,
                    insuranceAccountUuid: data.assuranceAccountId,
                }, transaction);
            }

            // Commit Transaction
            await transaction.commit();

            // Send History Bed Event
            eventEmitter.emit(HISTORY_BED_CHANNEL, {
                faskesUuid: user.faskesUuid,
                admissionUuid: registRI.uuid,
                monitoringRuanganUuid: monitoring.uuid,
            });


            // Send New Born Event
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

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: registRI.tanggalDaftar,
                noreg: registRI.noReg,
                practitioner_uuid: practitioner.uuid,
                no_pelayanan: registRI.noPelayanan,
                jenis_kunjungan: "RI",
                patient_uuid: patient.uuid,
                payment_method: data.paymentMethod === 'TUNAI' ? 1 : 2,
            })

            const patientAttributes = selectAttributes(patient, [
                'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                'address.uuid', 'address.status', 'address.prov', 'address.city',
                'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                'birthDetail.ageMonth', 'birthDetail.ageDay'
            ], true);

            const rawatInapAttributes = selectAttributes(registRI, [
                'uuid', 'noReg', 'practitionerUuid', 'complaint', 'note', 'maternity', 'noSpri', 'entrustedPatient', 'upgradeClass', 'previousBill', 'spareBed', 'joinBill', 'familyBill', 'boxBaby', 'multipleBirth', 'monitoringRoomUuid'
            ], true);
            const result = {
                ...rawatInapAttributes,
                patient: patientAttributes,
            };
            if (data.paymentMethod === 'ASURANSI') {
                result.insurance = selectAttributes(insurance, [
                    'uuid', 'status', 'noReg', 'insuranceAccountUuid', 'faskesUuid'
                ], true)
            }

            return result;
        } catch (error) {
            console.error("Error during Rawat Inap registration:", error);
            await transaction.rollback();
            throw error;
        }
    }

    static async updateRawatInap(uuid, data) {
        const transaction = await sequelizeInstance.transaction();
        try {
            const {faskesUuid} = Context.get(CTX_AUTHOR);
            data = convertSnakeToCamel(data);

            // Get Rawat Inap Data
            const rawatInap = await RawatInapModel.findOne({
                where: {
                    uuid: uuid,
                    faskesUuid: faskesUuid,
                    deletedAt: null
                },
                transaction
            });
            if (!rawatInap) throw new NotfoundException("Rawat Inap not found");
            // Get Patient
            const patient = await PatientRepository.getOnePatientBy('uuid', rawatInap.patientUuid);
            if (!patient) throw new NotfoundException("Patient not found");

            // Get Practitioner
            const practitioner = await PractitionerRepository.getPractitionerBy('uuid', data.practitionerUuid);
            if (!practitioner) throw new NotfoundException("Practitioner not found");
            // Update Patient Data
            data.patientData.patient_uuid = rawatInap.dataValues.patientUuid;
            const updatedPatient = await PatientRepository.registPatient(data.patientData, transaction);
            if (!updatedPatient) throw new Error("Failed to update patient");
            // Update Bed and Monitoring Room (if statusRi is 1)
            if (data.monitoringRoomUuid && rawatInap.statusRi === 1) {
                const bedData = await MonitoringRoomRepository.getDetailBed(data.monitoringRoomUuid);
                await MonitoringRoomRepository.registPatientToBed(bedData.dataValues.uuid, updatedPatient.uuid, transaction);
                // Emit Event for History Bed
                eventEmitter.emit(HISTORY_BED_CHANNEL, {
                    faskesUuid: faskesUuid,
                    admissionUuid: rawatInap.uuid,
                    monitoringRuanganUuid: rawatInap.monitoringRoomUuid,
                });
            } else if (data.monitoringRoomUuid !== rawatInap.monitoringRoomUuid && rawatInap.statusRi !== 1) {
                throw new DuplicateException("Cannot update bed, Rawat Inap status is being processed");
            }

            // Update Rawat Inap Data
            const updatedRawatInap = await RawatInapModel.update({
                noRm: updatedPatient.noRm,
                name: updatedPatient.name,
                birthDetailUuid: updatedPatient.birthDetailUuid,
                gender: updatedPatient.gender,
                familyBill: data.familyBill,
                note: data.note,
                complaint: data.complaint,
                multipleBirth: data.multipleBirth,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                monitoringRoomUuid: data.monitoringRoomUuid || rawatInap.monitoringRoomUuid,
                practitionerUuid: practitioner.uuid,
            }, {
                where: {uuid: rawatInap.uuid},
                transaction
            });

            let insurance = null;
            if (data.paymentMethod === 'ASURANSI') {
                insurance = await InsuranceAdmissionRepository.upsertInsuranceAdmission({
                    admissionType: 3,
                    noReg: rawatInap.noReg,
                    insuranceAccountUuid: data.assuranceAccountId,
                }, transaction);
            }

            // Commit transaction
            await transaction.commit();

            // Prepare response
            const patientAttributes = selectAttributes(updatedPatient, [
                'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                'address.uuid', 'address.status', 'address.prov', 'address.city',
                'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                'birthDetail.ageMonth', 'birthDetail.ageDay'
            ], true);

            const rawatInapAttributes = selectAttributes(updatedRawatInap, [
                'uuid', 'noReg', 'practitionerUuid', 'complaint', 'note', 'maternity', 'maternity', 'noSpri', 'entrustedPatient', 'upgradeClass', 'previousBill', 'spareBed', 'joinBill', 'familyBill', 'boxBaby', 'multipleBirth', 'monitoringRoomUuid'
            ], true);

            const result = {
                ...patientAttributes,
                ...rawatInapAttributes
            };

            if (insurance) {
                result.insurance = selectAttributes(insurance, [
                    'uuid', 'status', 'noReg', 'insuranceAccountUuid',
                ], true);
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: rawatInap.tanggalDaftar,
                noreg: rawatInap.noReg,
                no_pelayanan: rawatInap.noPelayanan,
                practitioner_uuid: practitioner.uuid,
                jenis_kunjungan: "RI",
                patient_uuid: updatedPatient.uuid,
                payment_method: data.paymentMethod === 'TUNAI' ? 1 : 2,
            });

            return result;

        } catch (error) {
            console.error("Error updating Rawat Inap:", error);
            await transaction.rollback();
            throw error;
        }
    }

    static async getDetail(uuuid) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        try {
            const rawatInap = await RawatInapModel.findOne({
                where: {
                    uuid: uuuid,
                    faskesUuid,
                    deletedAt: null
                },
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
                    "no_reg", "payment_method", "maternity", "note", "complaint", "practitioner_uuid", 'status_ri', 'multiple_birth', 'entrusted_patient', 'upgrade_class', 'join_bill', 'previous_bill', 'family_bill', 'spare_bed', 'box_baby', 'monitoring_room_uuid', 'no_spri', 'no_pelayanan'
                ]
            });

            if (!rawatInap) throw new NotfoundException("Rawat Inap not found");

            if (rawatInap.patient.dataValues.is_new_born) {
                const newBorn = await NewBornModel.findOne({
                    where: {faskesUuid, no_rm_baby: rawatInap.patient.dataValues.no_rm},
                    attributes: [
                        "identifier_mom", "name_mom", "name_baby", "no_rm_baby",
                        "birth_detail_uuid", "birth_time_baby", "gender_baby",
                        "multiple_birth", "address_uuid", "tanggal_daftar"
                    ]
                });
                if (newBorn) rawatInap.patient.dataValues.new_born = newBorn.dataValues;
            }
            return rawatInap;
        } catch (error) {
            console.error("Error get detail Rawat Inap:", error);
            throw error;
        }
    }


    static async cancelVisit(data) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            return sequelizeInstance.transaction(async (t) => {
                const rawatInap = await RawatInapModel.findAll({
                    where: {
                        uuid: data.listUuid,
                        faskesUuid,
                        statusRi: {[Op.not]: 0}
                    },
                    transaction: t
                })

                const isProcessed = rawatInap.filter((ri) => ri.statusRi !== 1);
                if (isProcessed.length > 0) throw new Error("Cannot cancel processed Rawat Inap");

                if (rawatInap.length === 0) throw new NotfoundException("Rawat Inap not found");

                await RawatInapModel.update({
                    statusRi: 0
                }, {
                    where: {
                        uuid: data.listUuid,
                        faskesUuid
                    },
                    transaction: t
                });

                eventEmitter.emit(LOG_CANCLE_PELAYANAN_CHANNEL, {
                    list_no_pelayanan: rawatInap.map((ri) => ri.noPelayanan),
                    cancel_reason: data.cancelReason
                });

                return rawatInap;
            })
        } catch (error) {
            console.error("Error cancel visit Rawat Inap:", error);
            throw error;
        }
    }


    static async getReport(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        try {
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
                status_ri: { [Op.not]: 0 },
                tanggalDaftar: {
                    [Op.between]: [args.start_date, args.end_date]
                }
            };



            const options = {
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
                                where: {
                                    deletedAt: {[Op.is]: null}
                                },
                                attributes: [],
                            },
                        ],
                        attributes: [],
                    },
                    {
                        model: RoomMonitoringModel,
                        as: "monitoring_room",
                        required: true,
                        where: { deletedAt: { [Op.is]: null } },
                        attributes: ["uuid", "room_uuid", "room_category", "room_class", "room", "bed_name", "no_bed"]
                    },
                ],
                attributes: [
                    "no_rm", "tanggal_daftar", "tanggal_dirawat", "discharge_date",
                ]
            };

            return await Pagination.init(
                RawatInapModel,
                args,
                filter,
                options
            );

        } catch (error) {
            console.error("Error get report Rawat Inap:", error);
            throw error;
        }
    }

}