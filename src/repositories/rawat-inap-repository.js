import sequelizeInstance from "../configurations/sequelize-instance.js";
import RawatInapModel from "../models/rawat-inap-model.js";
import PatientRepository from "./patient-repository.js";
import MonitoringRoomRepository from "./monitoring-room-repository.js";
import RiwayatRuanganRepository from "./riwayat-ruangan-repository.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {generateNoReg} from "../helper/utility.js";
import moment from "moment";

export default class RawatInapRepository {
    static async registRawatInap(data) {
        const transaction = await sequelizeInstance.transaction();
        try {
            const user = Context.get(CTX_AUTHOR);

            // Regist Patient
            const patient = await PatientRepository.registPatient(data.patientData, transaction);
            if (!patient) throw new Error("Failed to create patient");

            // Regist Rawat Inap
            const bedData = await MonitoringRoomRepository.getDetailBed(data.monitoringRoomUuid);
            const monitoring = await MonitoringRoomRepository.registPatientToBed(bedData.dataValues.uuid, patient.uuid, transaction);
            console.log("Data Monitoring", monitoring);
            console.log("Data Bed", bedData);

            const registRI = await RawatInapModel.create({
                faskesUuid: user.faskesUuid,
                patientUuid: patient.uuid,
                noReg: generateNoReg(),
                noRm: patient.noRm,
                name: patient.name,
                birthDetailUuid: patient.birthDetailUuid,
                gender: patient.gender,
                doctor: data.dpjp,
                tanggalDaftar: moment().unix(),
                tanggalMasuk: moment().unix(),
                categoryRoom: bedData.dataValues.roomCategory,
                classRoom: bedData.dataValues.roomClass,
                room: bedData.dataValues.room,
                bedRoom: bedData.dataValues.bedName,
                maternity: data.maternity,
                entrustedPatient: data.entrustedPatient,
                upgradeClass: data.upgradeClass,
                joinBill: data.joinBill,
                previousBill: data.previousBill,
                familyBill: data.familyBill,
                spareBed: data.spareBed,
                boxBaby: data.boxBaby,
                note: data.note,
                complaint: data.complaint,
                multipleBirth: false, // TODO: Need Adjust
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                monitoringRoomUuid: bedData.dataValues.uuid
            }, {
                transaction: transaction,
                returning: true
            });

            // Insert History
            const history = await RiwayatRuanganRepository.addHistory({
                faskesUuid: user.faskesUuid,
                admissionUuid: registRI.uuid,
                monitoringRuanganUuid: monitoring.uuid,
            }, transaction);

            // Transaction Commit
            await transaction.commit();

            return {
                ...registRI.get(),
                monitoring: monitoring.get(),
                history: history.get(),
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}