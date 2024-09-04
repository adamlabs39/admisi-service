import AntrianPoliModel from "../models/antrian-poli-model.js";

export default class AntrianPoliSeeder {
    static async seed(transaction) {
        const data = [
            {
                uuid: '0191b78b-f85f-78b0-81d9-1f6ebe72035e',
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                practitionerUuid: '0191a18a-22e4-79f7-9da5-a10a6e1a60f9',
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PJ',
                codeAntrianDokter: 'DPJ',
            },
            {
                uuid: "0191b78b-f85f-704e-9c11-32dec6026585",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                lokasiUuid: '0191a18a-22e4-73d6-ab3b-dc6683607aa9',
                practitionerUuid: '0191a18a-22e4-7410-abaa-899eb0fd35e0',
                kuotaJkn: 10,
                kuotaNonJkn: 10,
                timePelayanan: 10,
                durasiPelayanan: 10,
                codeAntrianPoli: 'PM',
                codeAntrianDokter: 'DPM',
            }
        ]

        await AntrianPoliModel.bulkCreate(data, { transaction });
    }
}