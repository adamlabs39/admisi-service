import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import LogPelayananModel from "../models/log-pelayanan-model.js"
import {convertSnakeToCamel} from "../helper/utility.js";
import {Op} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import PatientModel from "../models/patient-model.js";
import AddressModel from "../models/address-model.js";
import BirthDetailModel from "../models/birth-detail-model.js";
import PractitionerModel from "../models/practitioner-model.js";
import PegawaiModel from "../models/pegawai-model.js";
import Pagination from "../helper/pagination.js";

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
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            return await LogPelayananModel.update({
                status: false,
                cancelReason: data.cancelReason
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
                                    'age_year', 'age_month', 'age_day'
                                ]
                            },
                        ],
                        attributes: [
                            "uuid", "title", "name", "identity", "no_identity", "phone"
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
                    "tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid"
                ]
            }

            const transform = {
                practitioner: (row) => ({
                    uuid: undefined, // delete practitioner uuid
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
                            "uuid", "title", "name", "identity", "no_identity", "phone"
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
                    "tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid", "cancel_reason"
                ]
            }

            const transform = {
                practitioner: (row) => ({
                    uuid: undefined, // delete practitioner uuid
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

        } catch (error) {
            console.log("Error on LogPelayananRepository");
            throw error;
        }
    }

    static async getAllLogPenunjang(args) {
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
                            "uuid", "title", "name", "identity", "no_identity", "phone"
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
                    "tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid", "payment_method"
                ]
            }

            const transform = {
                practitioner: (row) => ({
                    uuid: undefined, // delete practitioner uuid
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

        } catch (error) {
            console.log("Error on LogPelayananRepository");
            throw error;
        }
    }

}