import NotfoundException from "../exception/notfound-exception.js";
import { jadwalDokter, jadwalDokterMobile } from "../configurations/axios-instance.js";
import dayjs from "dayjs";

export default class JadwalDokterRepository{
    static async getAllJadwalDokter() {
        try {
            
            const hari = {
                0: "Minggu",
                1: "Senin",
                2: "Selasa",
                3: "Rabu",
                4: "Kamis",
                5: "Jumat",
                6: "Sabtu",
            }

            const { data } = await jadwalDokter.get("/");

            const jadwalList = data.payload.map((item) => ({
                doctor: item.doctor,
                poli: item.poli,
                jadwal_dokter: item.jadwal_dokter.filter((jadwal) => jadwal.day === hari[dayjs().day()]),
            })).filter((item) => item.jadwal_dokter.length > 0);

            return jadwalList;

        } catch (err) {
            console.error("Error getAllJadwalDokter:", err.message);
            throw err;
        }
    }

    static async findJadwalDokterUuidMobile(faskesUuid, jadwalUuid) {
        try {
        const { data } = await jadwalDokterMobile.get("", {
            headers: { "faskes-uuid": faskesUuid },
        });

        const jadwalList = data.payload.flatMap((item) =>
            item.jadwal_dokter.map((jadwal) => ({
            ...jadwal,
            practitionerUuid: item.doctor.uuid,
            practitionerName: item.doctor.name,
            practitionerCode: item.doctor.kode_antrian,
            lokasiUuid: item.poli.uuid,
            lokasiName: item.poli.name,
            lokasiCode: item.poli.kode_antrian,
            }))
        );

        // cari jadwal spesifik
        const jadwalDokter = jadwalList.find(
            (j) => j.jadwal_dokter_uuid === jadwalUuid
        );

        if (!jadwalDokter) {
            throw new NotfoundException("Jadwal Dokter tidak ditemukan");
        }

        return jadwalDokter;
        } catch (err) {
        console.error("Error getAllJadwalDokterMobile:", err.message);
        throw err;
        }
    }

    static async findJadwalDokterByUuid(uuid) {
        try{
            const jadwalList = await this.getAllJadwalDokter();
            for (const item of jadwalList) {
            const foundJadwal = item.jadwal_dokter.find((jadwal) => jadwal.jadwal_dokter_uuid === uuid);

                if (foundJadwal) {
                    return {
                    ...foundJadwal,
                    practitionerUuid: item.doctor.uuid,
                    lokasiUuid: item.poli.uuid,
                    practitionerName: item.doctor.name,
                    lokasiName: item.poli.name,
                    practitionerCode: item.doctor.kode_antrian,
                    lokasiCode: item.poli.kode_antrian,
                    };
                }
            }
            throw new NotfoundException("Jadwal Dokter tidak ditemukan");

        } catch (err) {
            console.error("Error findJadwalDokterByUuid:", err.message);
            throw err;
        }
    }
}