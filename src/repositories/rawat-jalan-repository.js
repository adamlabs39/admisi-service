import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import RawatJalanModel from "../models/rawat-jalan-model.js";
import {Context, Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import InsuranceAdmissionModel from "../models/insurance-admission-model.js";
import {
    convertSnakeToCamel,
    generateAntrianPoli,
    generateBookingCode, generateNoPelayanan,
    generateNoReg,
    selectAttributes
} from "../helper/utility.js";
import PatientRepository from "./patient-repository.js";
import BirthDetailModel from "../models/birth-detail-model.js";
import AddressModel from "../models/address-model.js";
import moment from "moment";
import NotfoundException from "../exception/notfound-exception.js";
import BadRequestException from "../exception/bad-request-exception.js";
import JadwalDokterRepository from "./jadwal-dokter-repository.js";
import PractitionerModel from "../models/practitioner-model.js";
import PegawaiModel from "../models/pegawai-model.js";
import InsuranceAdmissionRepository from "./insurance-admission-repository.js";
import {eventEmitter} from "../helper/event.js";
import {LOG_CANCLE_PELAYANAN_CHANNEL, LOG_PELAYANAN_CHANNEL} from "../constant/event-constant.js";

export default class RawatJalanRepository {
    /**
     * Get all rawat jalan
     * @param args
     * @returns {Promise<{pagination: {next_page: null, total_page: number, total_data: *, page: number, prev_page: null, page_size: number}, data: *}>}
     */
    static async getAll(args) {
        const ctx = Ctx.get(CTX_AUTHOR);
        const filter = {
            faskesUuid: ctx.faskesUuid,
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
            statusRj: {[Op.not]: 0},
            tanggalDaftar: {
                [Op.between]: [args.start_date, args.end_date]
            }
        };

        if (args.poly) filter.lokasiUuid = args.poly;

        if (args.platform) filter.platform = args.platform;

        if (args.payment_method) filter.paymentMethod = args.payment_method;

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
                        "uuid", "title", "name", "identity", "no_identity", "phone"
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
                }
            ],
            attributes: [
                "uuid", "no_reg", "no_rm", "no_antrian_admisi", "no_antrian_poli", "platform", "tanggal_daftar", "jadwal_periksa", "tanggal_checkin", "payment_method"
            ],
        };

        const transform = {
            practitioner: (row) => ({
                uuid: undefined, // delete practitioner uuid
                ...row.practitioner.pegawai.get(),
            }),
        };

        return await Pagination.init(
            RawatJalanModel,
            args,
            filter,
            options,
            transform
        );
    }

    /**
     * Get one rawat jalan
     * @param uuid
     * @returns {Promise<(*&{insurance, patient})|(*&{patient})>}
     */
    static async getOne(uuid) {
        try {
            const result = await RawatJalanModel.findOne({
                where: {[Op.and]: [{uuid}, {deletedAt: {[Op.is]: null}}]},
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
                                attributes:["uuid", "full_address", "prov", "city", "district", "rt", "rw", "village", "country"]
                            },
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: ["birth_place", "birth_date"]
                            }
                        ],
                        attributes: ["uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language", "mother_name", "maritial_status", "status"],

                    }
                ],
                attributes: [
                    "no_reg", "payment_method", "maternity", "note", "complaint", "practitioner_uuid", "jadwal_dokter_uuid", "lokasi_uuid","no_pelayanan"
                ]
            });

            if (!result) throw new Error("Data not found");
            if (result.dataValues.payment_method === 2) {
                result.dataValues.insurance = (await InsuranceAdmissionModel.findOne({
                    where: {noReg: result.dataValues.no_reg},
                    attributes: ["insurance_account_uuid"]
                })).dataValues.insurance_account_uuid;

                return {
                    ...result.get(),
                    patient: result.patient.get()
                }
            }

            return {
                ...result.get(),
                patient: result.patient.get()
            }
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        return await sequelizeInstace.transaction(async (t) => {
            const {faskesUuid} = Ctx.get(CTX_AUTHOR);
            const patient = await PatientRepository.registPatient(data.patient_data, t);
            if (!patient) throw new Error("Failed to create patient");
            console.log("data patient", patient);
            data = convertSnakeToCamel(data);

            const jadwalDokter = (await JadwalDokterRepository.getJadwalBy('uuid', data.jadwalDokterUuid)).dataValues;
            if (!jadwalDokter) throw new NotfoundException("Jadwal Dokter not found");

            const dataRJ = {
                faskesUuid,
                patientUuid: patient.uuid,
                name: patient.name,
                noRm: patient.noRm,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                practitionerUuid: jadwalDokter.practitionerUuid,
                maternity: data.maternity,
                note: data.note,
                lokasiUuid: jadwalDokter.lokasiUuid,
                complaint: data.complaint,
                platform: data.platform,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                tanggalDaftar: moment().unix(),
            };

            const antrianPoli = await generateAntrianPoli(data.jadwalDokterUuid);
            dataRJ.tanggalDaftar = moment().unix();
            dataRJ.statusRj = 2;
            dataRJ.noAntrianPoli = antrianPoli.code_antrian_poli;
            dataRJ.jadwalPeriksa = antrianPoli.estimate_time;
            dataRJ.jadwalDokterUuid = jadwalDokter.uuid;
            dataRJ.kodeBooking = generateBookingCode();
            dataRJ.noReg = await generateNoReg();
            dataRJ.noPelayanan = await generateNoPelayanan('RJ');
            const regist = await RawatJalanModel.create(dataRJ, {transaction: t});

            const patientAttributes = selectAttributes(patient, [
                'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                'address.uuid', 'address.status', 'address.prov', 'address.city',
                'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                'birthDetail.birthDate', 'birthDetail.faskesUuid', 'ageYear', 'ageMonth', 'ageDay'
            ], true);

            const rawatJalanAttributes = selectAttributes(regist.get(), [
                'uuid', 'noReg', 'lokasiUuid as polyclinicUuid', 'practitionerUuid as dpjpUuid', 'complaint', 'note', 'maternity', 'jadwalDokterUuid', 'noReferensi'
            ], true);

            if (data.paymentMethod === 'ASURANSI') {
                const asuransi = await InsuranceAdmissionRepository.upsertInsuranceAdmission({
                    admissionType: 1,
                    noReg: regist.noReg,
                    insuranceAccountUuid: data.assuranceAccountId,
                }, t);

                eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                    tgl_registrasi: regist.tanggalDaftar,
                    noreg: regist.noReg,
                    no_pelayanan: regist.noPelayanan,
                    jenis_kunjungan: 'RJ',
                    practitioner_uuid: regist.practitionerUuid,
                    patient_uuid: patient.uuid,
                    lokasi_uuid: regist.lokasiUuid,
                    payment_method: 2
                });
                return {
                    ...rawatJalanAttributes,
                    patient: patientAttributes,
                    insurance: selectAttributes(asuransi, [
                        'uuid', 'status', 'noReg', 'insuranceAccountUuid', 'faskesUuid'
                    ], true)
                };
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                tgl_registrasi: regist.tanggalDaftar,
                noreg: regist.noReg,
                no_pelayanan: regist.noPelayanan,
                jenis_kunjungan: 'RJ',
                practitioner_uuid: regist.practitionerUuid,
                patient_uuid: patient.uuid,
                lokasi_uuid: regist.lokasiUuid,
                payment_method: 1
            });

            return {
                ...rawatJalanAttributes,
                patient_data: patientAttributes
            };
        });
    }


    static async update(uuid, data) {
        return await sequelizeInstace.transaction(async (t) => {
            const {faskesUuid} = Ctx.get(CTX_AUTHOR);
            data = convertSnakeToCamel(data);

            const existingRegist = await RawatJalanModel.findOne({
                where: {
                    uuid: uuid,
                    faskesUuid: faskesUuid,
                    deletedAt: null
                },
                transaction: t
            });
            if (!existingRegist) throw new NotfoundException("Data not found");
            
            const jadwalDokter = (await JadwalDokterRepository.getJadwalBy('uuid', data.jadwalDokterUuid)).dataValues;
            if (!jadwalDokter) throw new NotfoundException("Jadwal Dokter not found");
            
            data.patientData.patient_uuid = existingRegist.dataValues.patientUuid;
            const patient = await PatientRepository.registPatient(data.patientData, t);
            if (!patient) throw new Error("Failed to create patient");

            const dataRJ = {
                patientUuid: patient.uuid,
                name: patient.name,
                noRm: patient.noRm,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                practitionerUuid: jadwalDokter.practitionerUuid,
                maternity: data.maternity,
                note: data.note,
                lokasiUuid: jadwalDokter.lokasiUuid,
                complaint: data.complaint,
                platform: data.platform,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                tanggalDaftar: moment().unix(),
            };

            const {
                statusRj,
                lokasiUuid,
                practitionerUuid,
                noAntrianPoli,
                jadwalPeriksa,
                jadwalDokterUuid
            } = existingRegist;

            if (statusRj === 0) throw new BadRequestException("Data sudah dibatalkan");
            if (statusRj >= 3) throw new BadRequestException("Data telah diproses");

            if (lokasiUuid && practitionerUuid && (lokasiUuid !== dataRJ.lokasiUuid || practitionerUuid !== dataRJ.practitionerUuid)) {
                throw new BadRequestException("Tidak bisa mengubah poli atau dokter");
            }

            const antrianPoli = await generateAntrianPoli(data.jadwalDokterUuid);
            if (!noAntrianPoli) dataRJ.noAntrianPoli = antrianPoli.code_antrian_poli;
            if (!jadwalPeriksa) dataRJ.jadwalPeriksa = antrianPoli.estimate_time;
            if (!jadwalDokterUuid) dataRJ.jadwalDokterUuid = jadwalDokter.uuid;

            if (statusRj === 1) dataRJ.statusRj = 2;

            const updatedRegist = await existingRegist.update(dataRJ, {transaction: t});

            const patientAttributes = selectAttributes(patient, [
                'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                'address.uuid', 'address.status', 'address.prov', 'address.city',
                'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                'birthDetail.birthDate', 'birthDetail.faskesUuid', 'ageYear', 'ageMonth', 'ageDay'
            ], true);

            const rawatJalanAttributes = selectAttributes(updatedRegist.get(), [
                'uuid', 'noReg', 'lokasiUuid as polyclinicUuid', 'practitionerUuid as dpjpUuid', 'complaint', 'note', 'maternity'
            ], true);

            if (data.paymentMethod === 'ASURANSI') {
                const asuransi = await InsuranceAdmissionRepository.upsertInsuranceAdmission({
                    admissionType: 1,
                    noReg: updatedRegist.noReg,
                    insuranceAccountUuid: data.assuranceAccountId,
                }, t);

                eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                    tgl_registrasi: updatedRegist.tanggalDaftar,
                    noreg: updatedRegist.noReg,
                    no_pelayanan: updatedRegist.noPelayanan,
                    jenis_kunjungan: 'RJ',
                    patient_uuid: patient.uuid,
                    practitioner_uuid: updatedRegist.practitionerUuid,
                    lokasi_uuid: updatedRegist.lokasiUuid,
                    payment_method: 2
                });

                return {
                    ...rawatJalanAttributes,
                    patient: patientAttributes,
                    insurance: selectAttributes(asuransi.get(), [
                        'uuid', 'status', 'noReg', 'insuranceAccountUuid', 'faskesUuid'
                    ], true)
                };
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL,{
                tgl_registrasi: updatedRegist.tanggalDaftar,
                noreg: updatedRegist.noReg,
                no_pelayanan: updatedRegist.noPelayanan,
                practitioner_uuid: updatedRegist.practitionerUuid,
                jenis_kunjungan: 'RJ',
                patient_uuid: patient.uuid,
                lokasi_uuid: updatedRegist.lokasiUuid,
                payment_method: 1
            });

            return {
                ...rawatJalanAttributes,
                patient_data: patientAttributes
            };
        });
    }


    /**
     * Cancel visit
     * @param data
     * @returns {Promise<RawatJalanModel[]>}
     */
    static async cancelVisit(data) {
        try {
            const user = Context.get(CTX_AUTHOR);
            data = convertSnakeToCamel(data);

            return await sequelizeInstace.transaction(async (t) => {
                const rawatJalan = await RawatJalanModel.findAll({
                    where: {
                        uuid: data.listUuid,
                        faskesUuid: user.faskesUuid,
                        statusRj: {[Op.not]: 0}
                    },
                    transaction: t
                });

                const isProcessed = rawatJalan.filter(rj => rj.statusRj >= 3);
                if (isProcessed.length > 0) {
                    throw new BadRequestException("Data telah diproses");
                }

                if (rawatJalan.length !== data.listUuid.length) {
                    throw new NotfoundException("Data tidak ditemukan");
                }
                await RawatJalanModel.update(
                    {statusRj: 0, cancelReason: data.cancelReason},
                    {where: {uuid: data.listUuid, faskesUuid: user.faskesUuid}, transaction: t}
                );

                eventEmitter.emit(LOG_CANCLE_PELAYANAN_CHANNEL, {
                    list_no_pelayanan: rawatJalan.map(rj => rj.noPelayanan),
                    cancel_reason: data.cancelReason
                });

                return rawatJalan;
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

}