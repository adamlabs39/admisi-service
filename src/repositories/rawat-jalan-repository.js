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
    generateBookingCode,
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
                                attributes: {exclude: ["deletedAt", "createdAt", "updatedAt"]}
                            },
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: {exclude: ["deletedAt", "createdAt", "updatedAt"]}
                            }
                        ],
                        attributes: {exclude: ["deletedAt", "createdAt", "updatedAt"]}
                    }
                ],
                attributes: [
                    "no_reg", "payment_method", ["doctor", "dpjp"], "maternity", "note", "polyclinic", "complaint"
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
                    where: {noReg: result.noReg},
                    attributes: {exclude: ["deletedAt", "createdAt", "updatedAt"]}
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

    /**
     * Process rawat jalan
     * @param action
     * @param uuid
     * @param data
     * @returns {Promise<unknown>}
     */
    static async processRJ(action, uuid, data) {
        return await sequelizeInstace.transaction(async (t) => {
            const {faskesUuid} = Ctx.get(CTX_AUTHOR);
            const patient = await PatientRepository.registPatient(data.patient_data, t);
            if (!patient) throw new Error("Failed to create patient");

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
            if (action === 'create') {
                dataRJ.tanggalDaftar = moment().unix();
                dataRJ.statusRj = 2;
                dataRJ.noAntrianPoli = antrianPoli.code_antrian_poli;
                dataRJ.jadwalPeriksa = antrianPoli.estimate_time;
                dataRJ.jadwalDokterUuid = jadwalDokter.uuid;
                dataRJ.kodeBooking = generateBookingCode();
                dataRJ.noReg = generateNoReg();
                const regist = await RawatJalanModel.create(dataRJ, {transaction: t});

                const patientAttributes = selectAttributes(patient, [
                    'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                    'address.uuid', 'address.status', 'address.prov', 'address.city',
                    'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                    'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                    'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                    'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                    'birthDetail.ageMonth', 'birthDetail.ageDay'
                ], true);
                console.log('regis attr', regist.get());
                const rawatJalanAttributes = selectAttributes(regist.get(), [
                    'uuid', 'noReg', 'lokasiUuid as polyclinicUuid', 'practitionerUuid as dpjpUuid', 'complaint', 'note', 'maternity', 'jadwalDokterUuid', 'noReferensi'
                ], true);

                if (data.paymentMethod === 'ASURANSI') {
                    const asuransi = await InsuranceAdmissionModel.create({
                        faskesUuid: patient.faskesUuid,
                        noReg: regist.noReg,
                        insuranceAccountUuid: data.assuranceAccountId,
                    }, {transaction: t});

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
                const existingRegist = await RawatJalanModel.findOne({where: {uuid}, transaction: t});
                if (!existingRegist) throw new NotfoundException("Data not found");

                const {
                    statusRj,
                    lokasiUuid,
                    practitionerUuid,
                    noAntrianPoli,
                    jadwalPeriksa,
                    jadwalDokterUuid
                } = existingRegist;

                // Validate status: canceled or already processed
                if (statusRj === 0) throw new BadRequestException("Data sudah dibatalkan");
                if (statusRj >= 3) throw new BadRequestException("Data telah diproses");

                // Prevent modification of poli or practitioner if already set
                if (lokasiUuid && practitionerUuid && (lokasiUuid !== dataRJ.lokasiUuid || practitionerUuid !== dataRJ.practitionerUuid)) {
                    throw new BadRequestException("Tidak bisa mengubah poli atau dokter");
                }

                // Generate queue number if missing
                if (!noAntrianPoli) dataRJ.noAntrianPoli = antrianPoli.code_antrian_poli;
                if (!jadwalPeriksa) dataRJ.jadwalPeriksa = antrianPoli.estimate_time;
                if (!jadwalDokterUuid) dataRJ.jadwalDokterUuid = jadwalDokter.uuid;

                // Update status if necessary
                if (statusRj === 1) dataRJ.statusRj = 2;

                const updatedRegist = await existingRegist.update(dataRJ, {transaction: t});


                const patientAttributes = selectAttributes(patient, [
                    'uuid', 'title', 'name', 'noRm', 'identity', 'noIdentity',
                    'address.uuid', 'address.status', 'address.prov', 'address.city',
                    'address.district', 'address.rt', 'address.rw', 'address.fullAddress',
                    'address.country', 'address.village', 'address.postalCode', 'address.faskesUuid',
                    'birthDetail.uuid', 'birthDetail.status', 'birthDetail.birthPlace',
                    'birthDetail.birthDate', 'birthDetail.faskesUuid', 'birthDetail.ageYear',
                    'birthDetail.ageMonth', 'birthDetail.ageDay'
                ], true);

                const rawatJalanAttributes = selectAttributes(updatedRegist.get(), [
                    'uuid', 'noReg', 'lokasiUuid as polyclinicUuid', 'practitionerUuid as dpjpUuid', 'complaint', 'note', 'maternity'
                ], true);

                if (data.paymentMethod === 'ASURANSI') {
                    const asuransi = await InsuranceAdmissionModel.create({
                        faskesUuid: patient.faskesUuid,
                        noReg: updatedRegist.noReg,
                        insuranceAccountUuid: data.assuranceAccountId,
                    }, {transaction: t});

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

    /**
     * Cancel visit
     * @param data
     * @returns {Promise<[affectedCount: number, affectedRows: RawatJalanModel[]]>}
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

                if (rawatJalan.length !== data.listUuid.length) {
                    throw new NotfoundException("Data tidak ditemukan");
                }
                await RawatJalanModel.update(
                    {statusRj: 0, cancelReason: data.cancelReason},
                    {where: {uuid: data.listUuid, faskesUuid: user.faskesUuid}, transaction: t}
                );

                return rawatJalan;
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

}