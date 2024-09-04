import sequelizeInstance from "../configurations/sequelize-instance.js";
import RawatInapModel from "../models/rawat-inap-model.js";
import PatientRepository from "./patient-repository.js";
import MonitoringRoomRepository from "./monitoring-room-repository.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {generateNoReg} from "../helper/utility.js";
import moment from "moment";
import {eventEmitter} from "../helper/event.js";
import {HISTORY_BED_CHANNEL, NEW_BORN_CHANNEL} from "../constant/event-constant.js";

export default class RawatInapRepository {
    static async registBaby(data) {
        const transaction = await sequelizeInstance.transaction();
        try {
            const user = Context.get(CTX_AUTHOR);

            // Regist Patient
            const patient = await PatientRepository.registPatient(data.patientData, transaction);
            if (!patient) throw new Error("Failed to create patient");

            // Get Bed Details
            const bedData = await MonitoringRoomRepository.getDetailBed(data.monitoringRoomUuid);
            const monitoring = await MonitoringRoomRepository.registPatientToBed(bedData.dataValues.uuid, patient.uuid, transaction);

            // Insert into RawatInap
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
                // categoryRoom: bedData.dataValues.roomCategory,
                // classRoom: bedData.dataValues.roomClass,
                // room: bedData.dataValues.room,
                // bedRoom: bedData.dataValues.bedName,
                joinBill: true,
                familyBill: data.familyBill,
                boxBaby: true,
                note: data.note,
                complaint: data.complaint,
                multipleBirth: data.multipleBirth,
                paymentMethod: data.paymentMethod === 'TUNAI' ? 1 : 2,
                monitoringRoomUuid: bedData.dataValues.uuid,
                statusRi: 3,
                encounter: "RI"
            }, {
                transaction: transaction,
                returning: true
            });

            // Commit Transaction
            await transaction.commit();
            eventEmitter.emit(HISTORY_BED_CHANNEL,{
                faskesUuid: user.faskesUuid,
                admissionUuid: registRI.uuid,
                monitoringRuanganUuid: monitoring.uuid,
            });

            eventEmitter.emit(NEW_BORN_CHANNEL,{
                identifierMom: patient.identity,
                nameMom: patient.motherName,
                nameBaby: patient.name,
                noRmBaby: patient.noRm,
                birthPlaceBaby: patient.birthDetail.birthPlace,
                birthDateBaby: patient.birthDetail.birthDate,
                birthTimeBaby: moment(data.birthtime).format('HH:mm'),
                genderBaby: patient.gender,
                multipleBirth: data.multipleBirth,
                addressUuid: patient.address.uuid,
                tanggalDaftar: moment().format('YYYY-MM-DD HH:mm:ss'),
                status: true,
            });

            return {
                ...registRI.get(),
                monitoring: monitoring.get(),
            };
        } catch (error) {
            console.error("Error during Rawat Inap registration:", error);
            await transaction.rollback();
            throw error;
        }
    }


    static async update(data){
        const transaction = await sequelizeInstance.transaction();
        const user = Context.get(CTX_AUTHOR);
        try{
            // Get data Rawat Inap
            const rawatInap = await RawatInapModel.findOne({
                where: {
                    uuid: data.uuid,
                    faskesUuid: user.faskesUuid,
                    deletedAt: null
                },
                transaction
            });

            if(!rawatInap) throw new Error("Rawat Inap not found");

            // check jika ingin mengupdate bed maka pastikan bahwa status rawat inap adalah 1

            // sselain itu hanya bisa mengupdate data pasien


        }catch (error){

        }
    }
}