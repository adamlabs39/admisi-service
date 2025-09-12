import { createAntrianCall, createAntrianCallMobile, getAllAntrianCall, updateAntrianCall } from "../configurations/axios-instance.js";

export default class AntrianCallRepository {
    static async createAntrianCall(data, patient, rawatJalan){
        const jenisPasien = data.paymentMethod === "ASURANSI" ? "JKN" : "NON-JKN";
        const pasienBaru = data.patientData.patient_uuid == null;
        const pelayanan = pasienBaru == false || rawatJalan.dataValues.platform == "ADMISI" ? "poli" : "admisi"

        try {
            await createAntrianCall.post("/", {
                patient_uuid: patient.uuid,
                rawat_jalan_uuid: rawatJalan.dataValues.uuid,
                pelayanan: pelayanan,
                jenis_pasien: jenisPasien,
                pasien_baru: pasienBaru
            });
        } catch (error) {
            console.error("Error membuat no antrian:", error);
            throw error;
        }
    }

    static async createAntrianCallMobile(data, patient, rawatJalan, faskesUuid){
        const jenisPasien = data.paymentMethod === "ASURANSI" ? "JKN" : "NON-JKN";
        const pasienBaru = data.patientData.patient_uuid == null;
        const pelayanan = pasienBaru == false ? "poli" : "admisi";
        
        try {
            await createAntrianCallMobile.post("", {
                patient_uuid: patient.uuid,
                rawat_jalan_uuid: rawatJalan.dataValues.uuid,
                pelayanan: pelayanan,
                jenis_pasien: jenisPasien,
                pasien_baru: pasienBaru
            }, {
                headers: {
                    "faskes-uuid": faskesUuid
                }
            });
        } catch (error) {
            console.error("Error membuat no antrian:", error);
            throw error;
        }
    }

    static async getAllAntrianCall(args){
        try {
            const result = await getAllAntrianCall.get("/all", { params: args });
            
            console.log("result antrian:", result.data.payload);
            // const antrian = result.data.payload.filter((item) => item.created_at == moment().startOf("day").unix());

            return result.data.payload;

        } catch (error) {
            console.error("Error fetching all antrian:", error);
            throw error;
        }
    }

    static async updateAntrianCall(uuid, data){
        try{
            
            const statusMessages = {
                1: "Antrian berhasil dipanggil",
                2: "Antrian berhasil dilewati",
                3: "Antrian berhasil diproses",
                4: "Antrian berhasil diselesaikan",
            };

            const result = await updateAntrianCall.put(`/${uuid}`, {
                status_panggilan: data.status_panggilan
            });

            const antrian = result.data.payload;

            if (antrian.status_panggilan === 4){
                try {
                    await createAntrianCall.post("/", {
                        patient_uuid: antrian.patient_data.patient_uuid,
                        rawat_jalan_uuid: antrian.rawat_jalan_uuid,
                        pelayanan: "poli",
                        jenis_pasien: antrian.jenis_pasien,
                        pasien_baru: antrian.pasien_baru,
                    });
                } catch (error) {
                    console.error("Error membuat no antrian:", error);
                    throw error;
                }
            }

            return { message: statusMessages[antrian.status_panggilan] };

        }catch(error){
            console.error("Error updating antrian:", error);
            throw error;
        }
    }

}