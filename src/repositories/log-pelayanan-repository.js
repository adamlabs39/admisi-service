import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {convertSnakeToCamel, getInfoInsurance} from "../helper/utility.js";
import {Op} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import {
    LogPelayananModel,
} from "@adameds/model-sdk/pelayanan";
import {
    PatientModel,
    BirthDetailModel
} from "@adameds/model-sdk/admisi";
import {
    AddressModel
} from "@adameds/model-sdk/setting";
import {
    PractitionerModel,
    PegawaiModel,
    LokasiModel
} from "@adameds/model-sdk/datamaster";


import Pagination from "../helper/pagination.js";
import moment from "moment";

export default class LogPelayananRepository {

    /**
     * Function to create or update Log Pelay
     * @param data
     * @returns {Promise<LogPelayananModel>}
     * @constructor
     */
    static async LogPelayanan(data) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            const logPelayanan = await LogPelayananModel.findOne({
                where: {
                    faskesUuid,
                    noreg: data.noreg,
                    noPelayanan: data.noPelayanan,
                    deletedAt: null
                }
            });
            if (logPelayanan) {
                return await logPelayanan.update({
                    patientUuid: data.patientUuid,
                    jenisKunjungan: data.jenisKunjungan,
                    lokasiUuid: data.lokasiUuid,
                    practitionerUuid: data.practitionerUuid,
                });
            }
            return await LogPelayananModel.create({faskesUuid, ...data});
        } catch (error) {
            throw error;
        }
    }


    static async cancelVisitLogPelayanan(data) {
        const {faskesUuid, name} = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            return await LogPelayananModel.update({
                status: false,
                cancelReason: data.cancelReason,
                cancelDate: moment().unix(),
                cancelBy: name,
            }, {
                where: {
                    faskesUuid,
                    noPelayanan: {
                        [Op.in]: data.listNoPelayanan
                    }
                }
            });
        } catch (error) {
            throw error;
        }
    }

    static async GetHistoryPemeriksaan(patient_uuid, args) {
        try {
            const { faskesUuid } = Context.get(CTX_AUTHOR);
            const filter = {
                patientUuid: patient_uuid,
                status: true,
                faskesUuid,
            }

            const options = {
                include: [
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
                                attributes: ["first_title", "last_title", ["name", "nama"]]
                            }
                        ]
                    },
                ],
                order: [
                    ['tgl_registrasi', 'DESC']
                ],
                attributes: [
                    'tgl_registrasi', 'jenis_kunjungan', 'no_pelayanan', 'payment_method'
                ]
            }

            const transform = {
                practitioner: (row) => ({
                    uuid: undefined,
                    ...row.practitioner.pegawai.get(),
                }),
            };

            return await Pagination.init(
                LogPelayananModel,
                args,
                filter,
                options,
                transform
            )

        }catch (error) {
            console.log("Error on LogPelayananRepository");
            throw error;
        }
    }


    static async getAllLogPelayanan(args) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        try {
            const filter = {
                faskesUuid,
                status: true,
                [Op.or]: [
                    {noreg: {[Op.iLike]: `%${args.q || ''}%`}}, // Find by no_rm
                    sequelizeInstance.where(
                        sequelizeInstance.fn('concat', sequelizeInstance.col('patient.title'), ' ', sequelizeInstance.col('patient.name')),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find by title and name
                    sequelizeInstance.where(
                        sequelizeInstance.col('patient.address.full_address'),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find by address
                    sequelizeInstance.where(
                        sequelizeInstance.col('patient.no_rm'),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find By Rm patient
                ],
                tglRegistrasi: {
                    [Op.between]: [args.start_date, args.end_date]
                }
            }


            if (args.practitioner_uuid) filter.practitionerUuid = args.practitioner_uuid;
            if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;


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
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: [
                                    "age_year", "age_month", "age_day", "birth_date"
                                ]
                            },
                        ],
                        attributes: [
                            "uuid", "title", "name", "identity", "no_identity", "phone", "gender", "no_rm"
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
                    {
                        model: LokasiModel,
                        as: "lokasi",
                        required: false,
                        where: {deletedAt: {[Op.is]: null}},
                        attributes: ["name"]
                    },
                ],
                attributes: [
                    "tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid"
                ]
            }

            const transform = {
                practitioner: (row) => ({
                    uuid: undefined, // delete practitioner uuid
                    ...row.practitioner.pegawai.get(),
                }),
                polyclinic: (row) => row.lokasi ? row.lokasi.get().name : '-',
                lokasi: (row) => undefined
            };
            return await Pagination.init(
                LogPelayananModel,
                args,
                filter,
                options,
                transform
            )

        } catch (error) {
            console.log("Error on LogPelayananRepository");
            throw error;
        }
    }


    static async getAllCancelVisitLogPelayanan(args) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        try {
            const filter = {
                faskesUuid,
                status: false,
                [Op.or]: [
                    {noreg: {[Op.iLike]: `%${args.q || ''}%`}}, // Find by no_rm
                    sequelizeInstance.where(
                        sequelizeInstance.fn('concat', sequelizeInstance.col('patient.title'), ' ', sequelizeInstance.col('patient.name')),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find by title and name
                    sequelizeInstance.where(
                        sequelizeInstance.col('patient.address.full_address'),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find by address
                    sequelizeInstance.where(
                        sequelizeInstance.col('patient.no_rm'),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find By Rm patient
                ],
                tglRegistrasi: {
                    [Op.between]: [args.start_date, args.end_date]
                }
            }
            if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;
            if(args.dpjp) filter.practitionerUuid = args.dpjp;
            if(args.lokasi) filter.lokasiUuid = args.lokasi;
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
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: [
                                    'age_year', 'age_month', 'age_day'
                                ]
                            },
                        ],
                        attributes: [
                            "uuid", "title", "name", "identity", "no_identity", "phone", "no_rm"
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
                    {
                        model: LokasiModel,
                        as: "lokasi",
                        required: false,
                        where: {deletedAt: {[Op.is]: null}},
                        attributes: ["name"]
                    }
                ],
                attributes: [
                    "tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid", "cancel_reason", "cancel_date", "cancel_by"
                ]
            }

            const transform = {
                practitioner: (row) => ({
                    uuid: undefined, // delete practitioner uuid
                    ...row.practitioner.pegawai.get(),
                }),
                polyclinic: (row) => row.lokasi ? row.lokasi.get().name : '-',
                lokasi: (row) => undefined
            };
            return await Pagination.init(
                LogPelayananModel,
                args,
                filter,
                options,
                transform
            )

        } catch (error) {
            console.log("Error on LogPelayananRepository");
            throw error;
        }
    }

    static async getAllLogPenjamin(args) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        try {
            const filter = {
                faskesUuid,
                status: true,
                [Op.or]: [
                    {noreg: {[Op.iLike]: `%${args.q || ''}%`}}, // Find by no_rm
                    sequelizeInstance.where(
                        sequelizeInstance.fn('concat', sequelizeInstance.col('patient.title'), ' ', sequelizeInstance.col('patient.name')),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find by title and name
                    sequelizeInstance.where(
                        sequelizeInstance.col('patient.address.full_address'),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find by address
                    sequelizeInstance.where(
                        sequelizeInstance.col('patient.no_rm'),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ), // Find By Rm patient
                ],
                tglRegistrasi: {
                    [Op.between]: [args.start_date, args.end_date]
                }
            }

            if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;
            if (args.penjamin) filter.paymentMethod = args.penjamin;
            if (args.practitioner_uuid) filter.practitionerUuid = args.practitioner_uuid;

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
                            {
                                model: BirthDetailModel,
                                as: "birth_detail",
                                required: true,
                                where: {deletedAt: {[Op.is]: null}},
                                attributes: [
                                    'age_year', 'age_month', 'age_day', 'birth_date'
                                ]
                            },
                        ],
                        attributes: [
                            "uuid", "title", "name", "identity", "no_identity", "phone", "gender", "no_rm"
                        ]
                    },
                    {
                        model: LokasiModel,
                        as: "lokasi",
                        required: false,
                        where: {deletedAt: {[Op.is]: null}},
                        attributes: ["name"]
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
                                attributes: ["first_title", "last_title", ["name", "nama"], "gender"]
                            }
                        ]
                    },
                ],
                attributes: [
                    "tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid", "payment_method"
                ]
            }

            const transform = {
                practitioner: (row) => ({
                    uuid: undefined, // delete practitioner uuid
                    ...row.practitioner.pegawai.get(),
                }),
                no_penjamin: async (row) => row.payment_method === 2 ? (await getInfoInsurance(row.jenis_kunjungan, row.noreg)).insurance : null,
            };

            return await Pagination.init(
                LogPelayananModel,
                args,
                filter,
                options,
                transform
            )

        } catch (error) {
            console.log("Error on LogPelayananRepository");
            throw error;
        }
    }

}