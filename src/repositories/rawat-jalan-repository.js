import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import {Context, Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {
    convertSnakeToCamel,
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
import {InsuranceAdmissionModel, LogPelayananModel, RawatJalanModel} from "@adameds/model-sdk/pelayanan";
import InsuranceAdmissionRepository from "./insurance-admission-repository.js";
import {eventEmitter} from "../helper/event.js";
import {LOG_CANCLE_PELAYANAN_CHANNEL, LOG_PELAYANAN_CHANNEL} from "../constant/event-constant.js";
import { cancelBookingMobile, generateNoAntrian, getAppointmentMobile, updateAppointmentMobile } from "../configurations/axios-instance.js";
import DuplicateException from "../exception/duplicate-exception.js";
import AntrianCallRepository from "./antrian-call-repository.js";
import rawatJalanFilter from "./filters/rawat-jalan-filter.js";
import { rawatJalanInclude } from "./include/rawat-jalan-include.js";
import dayjs from "dayjs";

export default class RawatJalanRepository {
    /**
     * Get all rawat jalan
     * @param args
     * @returns {Promise<{pagination: {next_page: null, total_page: number, total_data: *, page: number, prev_page: null, page_size: number}, data: *}>}
     */
    static async getAll(args, faskesUuidMobile) {
        let faskesUuid = faskesUuidMobile || Context.get(CTX_AUTHOR).faskesUuid;

        const filter = rawatJalanFilter({
            faskesUuid, 
            args, 
            options: {}
        });

        const options = {
            include: rawatJalanInclude,
            attributes: [
                "uuid", "no_reg", "no_rm", "no_antrian_admisi", "no_antrian_poli", "no_antrian_farmasi", "kode_booking", "platform", "tanggal_daftar", "jadwal_periksa", "tanggal_checkin", "payment_method", "status_rj", "rekam_medis_uuid", "no_pelayanan"
            ],
        };

        const transform = {
            practitioner: (row) => ({
                uuid: undefined, // delete practitioner uuids
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

        if (args.all) {
            const allData = await RawatJalanModel.findAll({
                where: filter,
                ...options
            });

            const dataTransform = await Pagination.transform(allData, transform);

            return {
                data: dataTransform
            };
        }

        return await Pagination.init(RawatJalanModel, args, filter, options, transform);
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
            where: { 
                [Op.and]: [
                    { uuid }, 
                    { deletedAt: { [Op.is]: null } }
                ]
            },
            include: rawatJalanInclude,
            attributes: ["uuid", "faskes_uuid", "no_reg", "payment_method", "maternity", "note", "complaint", "practitioner_uuid", "jadwal_dokter_uuid", "lokasi_uuid", "no_pelayanan", "no_antrian_admisi", "no_antrian_poli", "kode_booking", "no_antrian_farmasi", "status_rj", "tanggal_daftar", "tanggal_checkin", "platform"],
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

    static async create(data) {

        const create = await sequelizeInstance.transaction(async (t) => {
            const { faskesUuid } = Ctx.get(CTX_AUTHOR);
            const patient = await PatientRepository.registPatient(data.patient_data, t);
            if (!patient) throw new Error("Failed to create patient");
            data = convertSnakeToCamel(data);
            
            //* GET JADWAL DOKTER
            const jadwalDokter = await JadwalDokterRepository.findJadwalDokterByUuid(data.jadwalDokterUuid);

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
                platform: "ADMISI",
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                tanggalDaftar: moment().unix(),
                tanggalCheckin: moment().unix(),
                statusRj: 3,
                jadwalDokterUuid: jadwalDokter.jadwal_dokter_uuid,
                noReg: await generateNoReg(),
                noPelayanan: await generateNoPelayanan('RJ'),
            };

            //* GENERATE NO ANTRIAN
            try {
                const response = await generateNoAntrian.post("/", {
                    jadwal_dokter_uuid: dataRJ.jadwalDokterUuid,
                });

                dataRJ.noAntrianPoli = response.data.payload.no_antrian_poli;
                dataRJ.kodeBooking = response.data.payload.kode_booking;
                
            } catch (error) {
                console.error("Error membuat no antrian:", error);
                if (error.response) {
                    throw new DuplicateException(error.response.data.errors?.[0].message || "Kuota jadwal dokter sudah penuh");
                }
            }

            const regist = await RawatJalanModel.create(dataRJ, { transaction: t });

            //* Buat data Pemanggilan antrian
            await AntrianCallRepository.createAntrianCall(data, patient, regist);

            if (data.paymentMethod === 'ASURANSI') {
                await InsuranceAdmissionRepository.AsuransiPelayanan({
                    patientUuid: patient.uuid,
                    penjaminUuid: data.insurance.penjamin_uuid,
                    accountNumber: data.insurance.account_number,
                    classEntitle: data.insurance.class_entitle,
                    noReg: regist.noReg,
                    admissionType: 1,
                }, t);
            }

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: regist.tanggalDaftar,
                noreg: regist.noReg,
                no_pelayanan: regist.noPelayanan,
                jenis_kunjungan: 'RJ',
                practitioner_uuid: regist.practitionerUuid,
                patient_uuid: patient.uuid,
                lokasi_uuid: regist.lokasiUuid,
                payment_method: data.paymentMethod === 'TUNAI' ? 1 : 2,
            });

            return regist.dataValues.uuid;
        });

        return await this.getOne(create);
    }


    static async createApm(data) {
        const create = await sequelizeInstance.transaction(async (t) => {
            const {faskesUuid} = Ctx.get(CTX_AUTHOR);
            const patient = await PatientRepository.registPatientApm(data.patient_data, t);
            if (!patient) throw new Error("Failed to create patient");
            data = convertSnakeToCamel(data);

            //* GET JADWAL DOKTER DARI ANTRIAN
            const jadwalDokter = await JadwalDokterRepository.findJadwalDokterByUuid(data.jadwalDokterUuid);

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
                platform: "APM",
                paymentMethod: 1,
                tanggalDaftar: moment().unix(),
                tanggalCheckin: moment().unix(),
                statusRj: 2,
                jadwalDokterUuid: jadwalDokter.jadwal_dokter_uuid,
                noReg: await generateNoReg(),
                noPelayanan: await generateNoPelayanan('RJ'),
                noAntrianAdmisi: data.noAntrianAdmisi,
                noAntrianPoli: data.noAntrianPoli,
                kodeBooking: data.kodeBooking,
                jadwalPeriksa: data.jadwalPeriksa,
            };

            const regist = await RawatJalanModel.create(dataRJ, {transaction: t});

            //* Buat Pemanggilan antrian
            await AntrianCallRepository.createAntrianCall(data, patient, regist);

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: regist.tanggalDaftar,
                noreg: regist.noReg,
                no_pelayanan: regist.noPelayanan,
                jenis_kunjungan: "RJ",
                practitioner_uuid: regist.practitionerUuid,
                patient_uuid: patient.uuid,
                lokasi_uuid: regist.lokasiUuid,
                payment_method: 1,
            });
            return regist.dataValues.uuid;
        });

        return await this.getOne(create);
    }

    static async createMobile(data, faskesUuid) {
        const create = await sequelizeInstance.transaction(async (t) => {
            const patient = await PatientRepository.registPatientMobile(data.patient_data, faskesUuid, t);
            if (!patient) throw new Error("Failed to create patient");
            data = convertSnakeToCamel(data);

            const bookingExist = await RawatJalanModel.findOne({
                where: {
                    faskesUuid,
                    patientUuid: patient.uuid,
                    deletedAt: null,
                    jadwalPeriksa: data.jadwalPeriksa,
                },
                attributes: ["uuid", "jadwal_periksa"],
            });

            if (bookingExist && bookingExist.dataValues.jadwal_periksa == data.jadwalPeriksa) {
                throw new DuplicateException("Jadwal periksa sudah terdaftar");
            }

            //* GET JADWAL DOKTER DARI ANTRIAN
            const jadwalDokter = await JadwalDokterRepository.findJadwalDokterUuidMobile(faskesUuid, data.jadwalDokterUuid);

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
                platform: "MOBILE",
                paymentMethod: 1,
                tanggalDaftar: moment().unix(),
                statusRj: 1,
                jadwalDokterUuid: jadwalDokter.jadwal_dokter_uuid,
                noReg: await generateNoReg(faskesUuid),
                noPelayanan: await generateNoPelayanan('RJ', faskesUuid),
                noAntrianAdmisi: data.noAntrianAdmisi,
                noAntrianPoli: data.noAntrianPoli,
                kodeBooking: data.kodeBooking,
                jadwalPeriksa: data.jadwalPeriksa,
            };

            const regist = await RawatJalanModel.create(dataRJ, {transaction: t});

            //* Buat Pemanggilan antrian
            await AntrianCallRepository.createAntrianCallMobile(data, patient, regist, faskesUuid);

            eventEmitter.emit(LOG_PELAYANAN_CHANNEL, {
                tgl_registrasi: regist.tanggalDaftar,
                noreg: regist.noReg,
                no_pelayanan: regist.noPelayanan,
                jenis_kunjungan: "RJ",
                practitioner_uuid: regist.practitionerUuid,
                patient_uuid: patient.uuid,
                lokasi_uuid: regist.lokasiUuid,
                payment_method: 1,
            });
            return regist.dataValues.uuid;
        });

        return this.getOne(create);
    }

    static async checkBookingRajal(data){
        const { faskesUuid } = Ctx.get(CTX_AUTHOR);
        const rawatJalan = await RawatJalanModel.findOne({
            where: {
                faskesUuid,
                kodeBooking: data.kode_booking,
                deletedAt: null,
                statusRj: { [Op.ne]: 0 },
                dischargeDate: null
            },
        });

        if (!rawatJalan) throw new NotfoundException("Kode booking tidak ditemukan");

        const patient = await PatientModel.findOne({
            where: {
                uuid: rawatJalan.dataValues.patientUuid,
                deletedAt: null
            },
            include: [
                    {
                        model: AddressModel,
                        required: false,
                        as: "address",
                        attributes: ["uuid", "full_address","prov", "city", "district", "rt", "rw", "village", "postal_code", "country"]
                    },
                    {
                        model: BirthDetailModel,
                        required: false,
                        as: "birth_detail",
                        attributes: ["uuid", "birth_place", "birth_date", "age_year", "age_month", "age_day"]
                    },
            ],
            attributes: [
                    "uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language",
                    "mother_name", "maritial_status", "status",
                ],
        });

        return this.update(rawatJalan.dataValues.uuid, { patient_data: patient, ...rawatJalan.dataValues });
    }

    static async getBookingRajal(data){
        const { faskesUuid } = Ctx.get(CTX_AUTHOR);
        const rawatJalan = await RawatJalanModel.findOne({
            where: {
                faskesUuid,
                kodeBooking: data.kode_booking,
                deletedAt: null,    
                statusRj: { [Op.ne]: 0 },
                dischargeDate: null
            },
            include: [
                {
                    model: PatientModel,
                    as: "patient",
                    required: false,
                    attributes: [ "uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language", "mother_name", "maritial_status", "status",],
                    include: [
                    {
                        model: AddressModel,
                        required: false,
                        as: "address",
                        attributes: ["uuid", "full_address","prov", "city", "district", "rt", "rw", "village", "postal_code", "country"]
                    },
                    {
                        model: BirthDetailModel,
                        required: false,
                        as: "birth_detail",
                        attributes: ["uuid", "birth_place", "birth_date", "age_year", "age_month", "age_day"]
                    }, 
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
            attributes: ["uuid", "no_reg", "no_rm", "no_antrian_admisi", "no_antrian_poli", "no_antrian_farmasi", "kode_booking", "platform", "tanggal_daftar", "jadwal_periksa", "tanggal_checkin", "payment_method", "status_rj", "rekam_medis_uuid", "no_pelayanan"]
        });

        return rawatJalan;
    }

    static async update(uuid, data) {
        const update = await sequelizeInstance.transaction(async (t) => {
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
            const jadwalDokter = await JadwalDokterRepository.findJadwalDokterByUuid(data.jadwalDokterUuid);

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

            if (!data.noAntrianPoli) dataRJ.noAntrianPoli = data.no_antrian_poli;
            if (!jadwalDokterUuid) dataRJ.jadwalDokterUuid = jadwalDokter.jadwal_dokter_uuid;

            if (statusRj === 1 || statusRj === 2) dataRJ.statusRj = 3;

            if (existingRegist.platform === "MOBILE") {
                dataRJ.tanggalCheckin = moment().unix();
            }

            //* Update Status Appointment Mobile
            try {
                const appointment = await getAppointmentMobile.get('/');
                const data = appointment.data.payload;

                const result = data.find(item => item.no_rm === patient.noRm && item.faskes_uuid === faskesUuid && item.kode_booking === existingRegist.kodeBooking);

                await updateAppointmentMobile.put(`/${result.uuid}`, {
                    status: 2
                });
            }catch(error){
                console.error("Error membuat appointment:", error);
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

    static async updateMobile(uuid, data, faskesUuid) {
        const update = await sequelizeInstance.transaction(async (t) => {
            data = convertSnakeToCamel(data);

            const appointment = await getAppointmentMobile.get("/");
            const appointmentData = appointment.data.payload.find((item) => item.uuid === uuid && item.faskes_uuid === faskesUuid);

            console.log("Appointment Data:", appointmentData);

            const existingRegist = await RawatJalanModel.findOne({
                where: {
                    noRm: appointmentData.no_rm,
                    faskesUuid: appointmentData.faskes_uuid,
                    kodeBooking: appointmentData.kode_booking,
                    deletedAt: null,
                },
                transaction: t,
            });

            if (!existingRegist) throw new NotfoundException("Rawat Jalan tidak ditemukan");

            const jadwalDokter = await JadwalDokterRepository.findJadwalDokterUuidMobile(faskesUuid, data.jadwalDokterUuid);
            
            console.log("Regist ada:", existingRegist);
            data.patientData.noRm = existingRegist.dataValues.noRm;
            const patient = await PatientRepository.registPatientMobile(data.patientData, faskesUuid, t);
            if (!patient) throw new Error("Gagal mengupdate pasien");

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
                platform: "MOBILE",
                paymentMethod: data.paymentMethod === "TUNAI" ? 1 : 2,
                jadwalDokterUuid: jadwalDokter.jadwal_dokter_uuid,
                jadwalPeriksa: data.jadwalPeriksa,
                noAntrianAdmisi: data.noAntrianAdmisi,
                noAntrianPoli: data.noAntrianPoli,
                kodeBooking: data.kodeBooking,
            };

            const { statusRj } = existingRegist;

            if (statusRj === 0) throw new BadRequestException("Data sudah dibatalkan");
            if (statusRj >= 4) throw new BadRequestException("Data telah diproses");

            const updatedRegist = await existingRegist.update(dataRJ, { transaction: t });

            //* Buat Pemanggilan antrian
            await AntrianCallRepository.createAntrianCallMobile(data, patient, updatedRegist, faskesUuid);

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

        return this.getOne(update);
    }


    static async updateFarmasi(uuid, data) {
        const user = Context.get(CTX_AUTHOR);
        console.log("Updating farmasi:", data);

        return await RawatJalanModel.update({
            noAntrianFarmasi: data.no_antrian_farmasi
        }, 
        {
            where: {
                uuid,
                faskesUuid: user.faskesUuid
            }
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

            return await sequelizeInstance.transaction(async (t) => {
                const rawatJalan = await RawatJalanModel.findAll({
                    where: {
                        uuid: data.listUuid,
                        faskesUuid: user.faskesUuid,
                        statusRj: {[Op.not]: 0}
                    },
                    include: {
                        model: PatientModel,
                        as: 'patient',
                        attributes: ['uuid', 'no_rm', 'name']
                    },
                    transaction: t
                });

                const isProcessed = rawatJalan.filter(rj => rj.statusRj >= 4);
                if (isProcessed.length > 0) {
                    throw new BadRequestException("Pembatalan tidak diizinkan, pasien sudah diperiksa");
                }

                if (rawatJalan.length !== data.listUuid.length) {
                    throw new NotfoundException("Data tidak ditemukan");
                }
                
                await RawatJalanModel.update(
                    {statusRj: 0, cancelReason: data.cancelReason},
                    {where: {uuid: data.listUuid, faskesUuid: user.faskesUuid}, transaction: t}
                );

                //* Update Status Appointment Mobile
                try {
                    const appointment = await getAppointmentMobile.get('/');
                    const data = appointment.data.payload;

                    for (const rj of rawatJalan) {
                        let patient = rj.patient.dataValues;

                        const result = data.find(item => item.no_rm === patient.no_rm && item.faskes_uuid === user.faskesUuid
                            && item.kode_booking === rj.kodeBooking);

                        await updateAppointmentMobile.put(`/${result.uuid}`, {
                            status: 0
                        });
                    }

                    
                }catch(error){
                    console.error("Error membuat appointment:", error);
                }

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

    static async cancelVisitMobile(data, faskesUuid) {
        try {
            data = convertSnakeToCamel(data);

            return await sequelizeInstance.transaction(async (t) => {

                await RawatJalanModel.update(
                    { statusRj: 0, cancelReason: "Pembatalan melalui Mobile" },
                    {
                    where: {
                        kodeBooking: data.kodeBooking,
                        faskesUuid
                    },
                    transaction: t
                    }
                );

                const foundRawatJalan = await RawatJalanModel.findAll({
                    where: {
                        kodeBooking: data.kodeBooking,
                        faskesUuid,
                    }
                });

                eventEmitter.emit(LOG_CANCLE_PELAYANAN_CHANNEL, {
                    list_no_pelayanan: foundRawatJalan.map((rj) => rj.noPelayanan),
                    cancel_reason: "Pembatalan melalui Mobile",
                    cancel_by: "Mobile",
                });

            return foundRawatJalan;

            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}