import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import {Context, Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {
    convertSnakeToCamel,
    generateAntrianPoli,
    generateBookingCode,
    generateNoPelayanan,
    generateNoReg,
} from "../helper/utility.js";
import PatientRepository from "./patient-repository.js";
import moment from "moment";
import NotfoundException from "../exception/notfound-exception.js";
import BadRequestException from "../exception/bad-request-exception.js";
import JadwalDokterRepository from "./jadwal-dokter-repository.js";
import {LokasiModel, PegawaiModel, PractitionerModel} from "@adameds/model-sdk/datamaster";
import {BirthDetailModel, InsuranceAccountModel, PatientModel} from "@adameds/model-sdk/admisi";
import {AddressModel} from "@adameds/model-sdk/setting";
import {JadwalDokterModel} from "@adameds/model-sdk/antrian";
import {InsuranceAdmissionModel, RawatJalanModel} from "@adameds/model-sdk/pelayanan";

import InsuranceAdmissionRepository from "./insurance-admission-repository.js";
import {eventEmitter} from "../helper/event.js";
import {LOG_CANCLE_PELAYANAN_CHANNEL, LOG_PELAYANAN_CHANNEL} from "../constant/event-constant.js";
import { generateNoAntrian, jadwalDokterAntrian } from "../configurations/axios-instance.js";

export default class RawatJalanRepository {
    /**
     * Get all rawat jalan
     * @param args
     * @returns {Promise<{pagination: {next_page: null, total_page: number, total_data: *, page: number, prev_page: null, page_size: number}, data: *}>}
     */
    static async getAll(args, faskesUuidMobile) {
        let faskesUuid = faskesUuidMobile || Context.get(CTX_AUTHOR).faskesUuid;
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
            statusRj: {[Op.not]: 0},
            tanggalDaftar: {
                [Op.between]: [args.start_date, args.end_date]
            },
            dischargeDate: {
                [Op.is]: null
            }
        };

        if (args.poly) {
            const polyArray = args.poly.split(',').map(item => item.trim());
            filter.lokasiUuid = {[Op.in]: polyArray};
        }

        if (args.platform) {
            const platformArray = args.platform.split(',').map(item => item.trim());
            filter.platform = {[Op.in]: platformArray};
        }

        if (args.payment_method) {
            const paymentMethodArray = args.payment_method.split(',').map(item => item.trim());
            filter.paymentMethod = {[Op.in]: paymentMethodArray};
        }

        if(args.status){
            if(parseInt(args.status) === 1){
                filter.statusRj = {[Op.in]: [1, 2, 3, 4]};
            }else{
                filter.statusRj = {[Op.in]: [5]};
            }
        }

        if (args.status_antrian) {
            const statusAntrianArray = args.status_antrian.split(',').map(item => item.trim());
            let statusAntrian = [];
            
            statusAntrianArray.forEach(status => {
                if (status === "antri") {
                    statusAntrian.push(1, 2, 3);
                } else if (status === "proses") {
                    statusAntrian.push(4);
                } else if (status === "selesai") {
                    statusAntrian.push(5);
                }
            });

            if (statusAntrian.length > 0) {
                filter.statusRj = { [Op.in]: statusAntrian };
            }
        }

        if (args.dpjp) filter.practitionerUuid = args.dpjp;

        const options = {
            include: [
                {
                    model: PatientModel,
                    as: "patient",
                    required: false,
                    where: {
                        deletedAt: {[Op.is]: null}
                    },
                    include: [
                        {
                            model: AddressModel,
                            as: "address",
                            required: false,
                            where: {
                                deletedAt: {[Op.is]: null}
                            },
                            attributes: [
                                "prov", "city", "district", "rt", "rw", "full_address", "country", "village"
                            ],
                        },
                    ],
                    attributes: [
                        "uuid", "title", "name", "identity", "no_identity", "phone", "gender",
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
                            attributes: ["first_title", "last_title", ["name", "nama"], "nik"]
                        }
                    ]
                },
                {
                    model: LokasiModel,
                    as: "lokasi",
                    required: true,
                    where: {deletedAt: {[Op.is]: null}},
                    attributes: [
                        "uuid", "name", "code"
                    ]
                },
                {
                    model: JadwalDokterModel,
                    as: "jadwal_dokter",
                    required: true,
                    where: {deletedAt: {[Op.is]: null}},
                    attributes: ["uuid","start_time", "end_time",],
                }
            ],
            attributes: [
                "uuid", "no_reg", "no_rm", "no_antrian_admisi", "no_antrian_poli", "no_antrian_farmasi", "kode_booking", "platform", "tanggal_daftar", "jadwal_periksa", "tanggal_checkin", "payment_method", "status_rj", "rekam_medis_uuid", "no_pelayanan"
            ],
        };

        

        const transform = {
            practitioner: (row) => ({
                uuid: undefined, // delete practitioner uuid
                ...row.practitioner.pegawai.get(),
            }),
            polyclinic: (row) => ({
                ...row.lokasi.get(),
            }),
            lokasi: (row) => undefined,
            schedule: (row) => ({
                ...row.jadwal_dokter.get(),
            }),
            jadwal_dokter: (row) => undefined,
        };

        return await Pagination.init(
            RawatJalanModel,
            args,
            filter,
            options,
            transform
        );
    }

    static async getRawatJalanToday(faskesUuidMobile) {
        let faskesUuid = faskesUuidMobile || Context.get(CTX_AUTHOR).faskesUuid;

        const count = await RawatJalanModel.count({
            where: {
                faskesUuid,
                tanggalDaftar: { [Op.gte]: moment().startOf('day').unix() },
                deletedAt: { [Op.is]: null }
            }
        });

        return { jumlah: count };
    }

    /**
     * Get one rawat jalan
     * @param uuid
     * @returns {Promise<(*&{insurance, patient})|(*&{patient})>}
     */
    static async getOne(uuid) {
        try {
        const result = await RawatJalanModel.findOne({
            where: { [Op.and]: [{ uuid }, { deletedAt: { [Op.is]: null } }] },
            include: [
            {
                model: PatientModel,
                as: "patient",
                required: false,
                where: { deletedAt: { [Op.is]: null } },
                include: [
                {
                    model: AddressModel,
                    as: "address",
                    required: false,
                    where: { deletedAt: { [Op.is]: null } },
                    attributes: ["uuid", "full_address", "prov", "city", "district", "rt", "rw", "village", "country", "postal_code"],
                },
                {
                    model: BirthDetailModel,
                    as: "birth_detail",
                    required: false,
                    where: { deletedAt: { [Op.is]: null } },
                    attributes: ["birth_place", "birth_date", "age_year", "age_day", "age_month"],
                },
                ],
                attributes: ["uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language", "mother_name", "maritial_status", "status"],
            },
            {
                model: JadwalDokterModel,
                as: "jadwal_dokter",
                required: true,
                // where: { deletedAt: { [Op.is]: null } },
                attributes: ["start_time", "end_time"],
            },
            ],
            attributes: ["uuid", "faskes_uuid", "no_reg", "payment_method", "maternity", "note", "complaint", "practitioner_uuid", "jadwal_dokter_uuid", "lokasi_uuid", "no_pelayanan", "no_antrian_admisi", "no_antrian_poli", "kode_booking", "no_antrian_farmasi", "status_rj", "tanggal_daftar"],
            });
            if (!result) throw new NotfoundException("Data tidak ditemukan");
            if (result.dataValues.payment_method === 2) {
                const insuranceData = await InsuranceAdmissionModel.findOne({
                    where: { noReg: result.dataValues.no_reg },
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
                    result.dataValues.insurance = insuranceData.dataValues.insurance;
                }

                return {
                    ...result.get(),
                    patient: result.patient.get()
                };
            }


            return {
                ...result.get(),
                patient: result.patient.get()
            }
        } catch (error) {
            throw error;
        }
    }

    static async getOneApm(uuid) {
        try {
        const result = await RawatJalanModel.findOne({
            where: { [Op.and]: [{ uuid }, { deletedAt: { [Op.is]: null } }] },
            include: [
            {
                model: PatientModel,
                as: "patient",
                required: false,
                where: { deletedAt: { [Op.is]: null } },
                include: [
                {
                    model: BirthDetailModel,
                    as: "birth_detail",
                    required: false,
                    where: { deletedAt: { [Op.is]: null } },
                    attributes: ["birth_place", "birth_date", "age_year", "age_day", "age_month"],
                },
                ],
                attributes: ["uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language", "mother_name", "maritial_status", "status"],
            },
            {
                model: JadwalDokterModel,
                as: "jadwal_dokter",
                required: true,
                where: { deletedAt: { [Op.is]: null } },
                attributes: ["uuid", "start_time", "end_time"],
            },
            ],
            attributes: ["uuid", "faskes_uuid",  "no_reg", "payment_method", "maternity", "note", "complaint", "practitioner_uuid", "jadwal_dokter_uuid", "lokasi_uuid", "no_pelayanan", "no_antrian_admisi", "no_antrian_poli", "kode_booking", "no_antrian_farmasi", "status_rj", "tanggal_checkin"],
            });
            if (!result) throw new NotfoundException("Data tidak ditemukan");

            return {
                ...result.get(),
                patient: result.patient.get()
            }
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        const create = await sequelizeInstace.transaction(async (t) => {
            const {faskesUuid} = Ctx.get(CTX_AUTHOR);
            const patient = await PatientRepository.registPatient(data.patient_data, t);
            if (!patient) throw new Error("Failed to create patient");
            console.log("data patient", patient);
            data = convertSnakeToCamel(data);

            //* GET JADWAL DOKTER DARI ANTRIAN
            const jadwalDokter = await this.findJadwalDokterByUuid(data.jadwalDokterUuid);

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

            // const antrianPoli = await generateAntrianPoli(data.jadwalDokterUuid);
            dataRJ.tanggalDaftar = moment().unix();
            dataRJ.statusRj = 3;
            // dataRJ.jadwalPeriksa = antrianPoli.estimate_time;
            dataRJ.jadwalDokterUuid = jadwalDokter.jadwal_dokter_uuid;
            dataRJ.noReg = await generateNoReg();
            dataRJ.noPelayanan = await generateNoPelayanan('RJ');
            const regist = await RawatJalanModel.create(dataRJ, {transaction: t});


            if (data.paymentMethod === 'ASURANSI') {
                await InsuranceAdmissionRepository.AsuransiPelayanan({
                    patientUuid: patient.uuid,
                    penjaminUuid: data.insurance.penjamin_uuid,
                    accountNumber: data.insurance.account_number,
                    classEntitle: data.insurance.class_entitle,
                    noReg: regist.noReg,
                    admissionType: 1,
                }, t)
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: regist.tanggalDaftar,
                noreg: regist.noReg,
                no_pelayanan: regist.noPelayanan,
                jenis_kunjungan: 'RJ',
                practitioner_uuid: regist.practitionerUuid,
                patient_uuid: patient.uuid,
                lokasi_uuid: regist.lokasiUuid,
                payment_method: data.paymentMethod === 'TUNAI' ? 1 : 2
            });
            return regist.dataValues.uuid;
        });

          //* GENERATE NO ANTRIAN
        try{
            await generateNoAntrian.post("/", {
            rawat_jalan_uuid: create,
            jadwal_dokter_uuid: data.jadwal_dokter_uuid,
            platform: "ADMISI"
        });

        } catch (error) {
            console.error("Error generating no antrian:", error);
        }

        return await this.getOne(create);
    }

    static async createApm(data) {
        const create = await sequelizeInstace.transaction(async (t) => {
            const {faskesUuid} = Ctx.get(CTX_AUTHOR);
            const patient = await PatientRepository.registPatientApm(data.patient_data, t);
            if (!patient) throw new Error("Failed to create patient");
            console.log("data patient", patient);
            data = convertSnakeToCamel(data);

            //* GET JADWAL DOKTER DARI ANTRIAN
            const jadwalDokter = await this.findJadwalDokterByUuid(data.jadwalDokterUuid);

            const dataRJ = {
                faskesUuid,
                patientUuid: patient.uuid,
                name: patient.name,
                noRm: patient.noRm,
                gender: patient.gender,
                practitionerUuid: jadwalDokter.practitionerUuid,
                birthDetailUuid: patient.birthDetailUuid,
                lokasiUuid: jadwalDokter.lokasiUuid,
                platform: data.platform,
                noAntrianAdmisi: data.noAntrianAdmisi,
                noAntrianPoli: data.noAntrianPoli,
                noAntrianFarmasi: data.noAntrianFarmasi,
                kodeBooking: data.kodeBooking,
                tanggalCheckin: moment().unix(),
                tanggalDaftar: moment().unix(),
            };

            dataRJ.tanggalDaftar = moment().unix();
            dataRJ.tanggalCheckin = moment().unix();
            dataRJ.statusRj = 2;
            dataRJ.jadwalDokterUuid = jadwalDokter.jadwal_dokter_uuid;
            dataRJ.noReg = await generateNoReg();
            dataRJ.noPelayanan = await generateNoPelayanan('RJ');
            const regist = await RawatJalanModel.create(dataRJ, {transaction: t});

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: regist.tanggalDaftar,
                noreg: regist.noReg,
                no_pelayanan: regist.noPelayanan,
                jenis_kunjungan: "RJ",
                practitioner_uuid: regist.practitionerUuid,
                patient_uuid: patient.uuid,
                lokasi_uuid: regist.lokasiUuid,
                payment_method: data.paymentMethod === "TUNAI" ? 1 : 2,
            });
            return regist.dataValues.uuid;
        });

        return await this.getOneApm(create);
    }

    static async createMobile(data, faskesUuid) {
        const create = await sequelizeInstace.transaction(async (t) => {
            const patient = await PatientRepository.registPatientMobile(data.patient_data, faskesUuid, t);
            if (!patient) throw new Error("Failed to create patient");
            console.log("data patient", patient);
            data = convertSnakeToCamel(data);

            //* GET JADWAL DOKTER DARI ANTRIAN
            const jadwalDokter = await this.findJadwalDokterByUuid(data.jadwalDokterUuid);

            const dataRJ = {
                faskesUuid,
                patientUuid: patient.uuid,
                name: patient.name,
                noRm: patient.noRm,
                gender: patient.gender,
                practitionerUuid: jadwalDokter.practitionerUuid,
                birthDetailUuid: patient.birthDetailUuid,
                lokasiUuid: jadwalDokter.lokasiUuid,
                platform: data.platform,
                noAntrianAdmisi: data.noAntrianAdmisi,
                noAntrianPoli: data.noAntrianPoli,
                noAntrianFarmasi: data.noAntrianFarmasi,
                kodeBooking: data.kodeBooking,
                tanggalDaftar: moment().unix(),
            };

            dataRJ.tanggalDaftar = moment().unix();
            dataRJ.statusRj = 1;
            dataRJ.jadwalDokterUuid = jadwalDokter.jadwal_dokter_uuid;
            dataRJ.noReg = await generateNoReg();
            dataRJ.noPelayanan = await generateNoPelayanan('RJ');
            const regist = await RawatJalanModel.create(dataRJ, {transaction: t});

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: regist.tanggalDaftar,
                noreg: regist.noReg,
                no_pelayanan: regist.noPelayanan,
                jenis_kunjungan: "RJ",
                practitioner_uuid: regist.practitionerUuid,
                patient_uuid: patient.uuid,
                lokasi_uuid: regist.lokasiUuid,
                payment_method: data.paymentMethod === "TUNAI" ? 1 : 2,
            });
            return regist.dataValues.uuid;
        });

        return this.getOne(create);
    }

    static async update(uuid, data) {
        const update = await sequelizeInstace.transaction(async (t) => {
            const { faskesUuid } = Ctx.get(CTX_AUTHOR);
            data = convertSnakeToCamel(data);

            const existingRegist = await RawatJalanModel.findOne({
                where: {
                uuid: uuid,
                faskesUuid: faskesUuid,
                deletedAt: null,
                },
                transaction: t,
            });
            if (!existingRegist) throw new NotfoundException("ID tidak ditemukan");

            //* GET JADWAL DOKTER DARI ANTRIAN
            const jadwalDokter = await this.findJadwalDokterByUuid(data.jadwalDokterUuid);

            data.patientData.patient_uuid = existingRegist.dataValues.patientUuid;
            const patient = await PatientRepository.registPatient(data.patientData, t);
            if (!patient) throw new Error("Gagal membuat pasien");

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
                noAntrianAdmisi: data.noAntrianAdmisi,
                noAntrianPoli: data.noAntrianPoli,
                noAntrianFarmasi: data.noAntrianFarmasi,
                kodeBooking: data.kodeBooking,
                paymentMethod: data.paymentMethod === "TUNAI" ? 1 : 2,
            };

            const { statusRj, lokasiUuid, practitionerUuid, jadwalDokterUuid } = existingRegist;

            if (statusRj === 0) throw new BadRequestException("Data sudah dibatalkan");
            if (statusRj >= 4) throw new BadRequestException("Data telah diproses");

            if (lokasiUuid && practitionerUuid && (lokasiUuid !== dataRJ.lokasiUuid || practitionerUuid !== dataRJ.practitionerUuid)) {
                throw new BadRequestException("Tidak bisa mengubah poli atau dokter");
            }

            // const antrianPoli = await generateAntrianPoli(data.jadwalDokterUuid);
            if (!data.noAntrianPoli) dataRJ.noAntrianPoli = data.no_antrian_poli;
            // if (!jadwalPeriksa) dataRJ.jadwalPeriksa = antrianPoli.estimate_time;
            if (!jadwalDokterUuid) dataRJ.jadwalDokterUuid = jadwalDokter.jadwal_dokter_uuid;

            if (statusRj === 1 || statusRj === 2) dataRJ.statusRj = 3;

            if (data.platform === "MOBILE"){
                dataRJ.tanggalCheckin = moment().unix();
            }
            
            const updatedRegist = await existingRegist.update(dataRJ, { transaction: t });

            if (data.paymentMethod === "ASURANSI") {
                await InsuranceAdmissionRepository.AsuransiPelayanan(
                {
                    patientUuid: patient.uuid,
                    penjaminUuid: data.insurance.penjamin_uuid,
                    accountNumber: data.insurance.account_number,
                    classEntitle: data.insurance.class_entitle,
                    noReg: updatedRegist.noReg,
                    admissionType: 1,
                },
                t
                );
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: updatedRegist.tanggalDaftar,
                noreg: updatedRegist.noReg,
                no_pelayanan: updatedRegist.noPelayanan,
                practitioner_uuid: updatedRegist.practitionerUuid,
                jenis_kunjungan: "RJ",
                patient_uuid: patient.uuid,
                lokasi_uuid: updatedRegist.lokasiUuid,
                payment_method: data.paymentMethod === "TUNAI" ? 1 : 2,
            });

            return updatedRegist.dataValues.uuid;
        });

        return await this.getOne(update);
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
            console.log("user: ", user);

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
                    cancel_reason: data.cancelReason,
                    cancel_by: user.username
                });

                return rawatJalan;
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    static async getAllJadwalDokter() {
        try {
            const { data } = await jadwalDokterAntrian.get("/");
            const jadwalList = data.payload;

            return jadwalList
        } catch (err) {
            console.error("Error getAllJadwalDokter:", err.message);
            throw err;
        }
    }

    static async findJadwalDokterByUuid(uuid) {
        try{
            const jadwalList = await this.getAllJadwalDokter();
            let jadwalDokter = null;

            for (const item of jadwalList) {
            const foundJadwal = item.jadwal_dokter.find((jadwal) => jadwal.jadwal_dokter_uuid === uuid);
                
                if (foundJadwal) {
                    jadwalDokter = {
                    ...foundJadwal,
                    practitionerUuid: item.doctor.uuid,
                    lokasiUuid: item.poli.uuid,
                    practitionerName: item.doctor.name,
                    lokasiName: item.poli.name,
                    practitionerCode: item.doctor.kode_antrian,
                    lokasiCode: item.poli.kode_antrian,
                    };
                    break;
                }
            }
            if (!jadwalDokter) throw new NotfoundException("Jadwal Dokter tidak ditemukan");

            return jadwalDokter;

        } catch (err) {
            console.error("Error findJadwalDokterByUuid:", err.message);
            throw err;
        }
    }
}