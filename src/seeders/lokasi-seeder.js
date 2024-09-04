import LokasiModel from "../models/lokasi-model.js";

export default class LokasiSeeder {
    static async seed(transaction) {
        const data = [
            {
                uuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                code: 'FAC001',
                name: 'Faskes Example',
                description: 'Deskripsi Faskes Example',
                phone: '081234567890',
                email: 'example@faskes.com',
                url: 'https://faskesexample.com',
                statusOperasional: 'Aktif',
                satuSehatId: 'SEHAT001',
                locationType: 'Rumah Sakit',
                classCode: 'A',
                className: 'Kelas A',
                partOfName: 'Faskes Induk',
                partOf: 'INDUK001',
                status: true
            },
            {
                uuid: "0191a18a-22e4-73d6-ab3b-dc6683607aa9",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                code: 'FAC002',
                name: 'Faskes Lainnya',
                description: 'Deskripsi Faskes Lainnya',
                phone: '081234567891',
                email: 'lainnya@faskes.com',
                url: 'https://faskeslainnya.com',
                statusOperasional: 'Aktif',
                satuSehatId: 'SEHAT002',
                locationType: 'Puskesmas',
                classCode: 'B',
                className: 'Kelas B',
                partOfName: 'Faskes Induk Lain',
                partOf: 'INDUK002',
                status: true
            },
        ]

        await LokasiModel.bulkCreate(data, { transaction });
    }
}