import JadwalDokterModel from "../models/jadwal-dokter-model.js";

export default class JadwalDokterSeeder {
    static async seed(transaction){
        const jadwalDokter = [
            {
                uuid: "0191c056-f9f7-73e1-9d9c-f54a3e4dd794",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                practitionerUuid: '0191a18a-22e4-79f7-9da5-a10a6e1a60f9',
                kuota: 20,
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PJ',
                codeAntrianDokter: 'DPJ',
                day: "Senin",
                start_time: "08:00:00",
                end_time: "16:00:00",
                status: true
            },
            {
                uuid: "0191c056-f9f7-755c-8aeb-0d04b3497c82",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                practitionerUuid: '0191a18a-22e4-79f7-9da5-a10a6e1a60f9',
                kuota: 20,
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PJ',
                codeAntrianDokter: 'DPJ',
                day: "Selasa",
                start_time: "08:00:00",
                end_time: "16:00:00",
                status: true
            },
            {
                uuid: "0191c056-f9f7-799b-868b-97cc0abdbbee",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                practitionerUuid: '0191a18a-22e4-79f7-9da5-a10a6e1a60f9',
                kuota: 20,
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PJ',
                codeAntrianDokter: 'DPJ',
                day: "Rabu",
                start_time: "08:00:00",
                end_time: "16:00:00",
                status: true
            },
            {
                uuid: "0191c056-f9f7-7421-9f73-d6f93fe4dab2",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                practitionerUuid: '0191a18a-22e4-79f7-9da5-a10a6e1a60f9',
                kuota: 20,
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PJ',
                codeAntrianDokter: 'DPJ',
                day: "Kamis",
                start_time: "08:00:00",
                end_time: "16:00:00",
                status: true
            },
            {
                uuid: "0191c056-f9f7-7b95-adf0-e2ae6967c9b2",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                practitionerUuid: '0191a18a-22e4-79f7-9da5-a10a6e1a60f9',
                kuota: 20,
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PJ',
                codeAntrianDokter: 'DPJ',
                day: "Jumat",
                start_time: "08:00:00",
                end_time: "16:00:00",
                status: true
            },
            {
                uuid: "0191c056-f9f7-7beb-a116-ca60bf4a5422",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                practitionerUuid: '0191a18a-22e4-79f7-9da5-a10a6e1a60f9',
                kuota: 20,
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PJ',
                codeAntrianDokter: 'DPJ',
                day: "Sabtu",
                start_time: "08:00:00",
                end_time: "16:00:00",
                status: true
            }
        ]

        await JadwalDokterModel.bulkCreate(jadwalDokter, {transaction});
    }
}