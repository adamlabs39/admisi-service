import {
    LokasiModel
} from "@adameds/model-sdk/datamaster";

export default class LokasiSeeder {
    static async seed(transaction) {
        const data = [
            {
                uuid: '0191a18a-22e4-773b-8229-a023f420d0bb',
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                code: 'FAC001',
                name: 'Faskes Example',
                description: 'Deskripsi Faskes Example',
                phone: '081234567890',
                email: 'example@faskes.com',
                url: 'https://faskesexample.com',
                statusOperasional: 'Aktif',
                satuSehatId: 'SEHAT001',
                location_type: 'Rumah Sakit',
                classCode: 'A',
                className: 'Kelas A',
                partOfName: 'Faskes Induk',
                partOf: 'INDUK001',
                status: true
            },
            {
                uuid: "0191a18a-22e4-73d6-ab3b-dc6683607aa9",
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                code: 'FAC002',
                name: 'Faskes Lainnya',
                description: 'Deskripsi Faskes Lainnya',
                phone: '081234567891',
                email: 'lainnya@faskes.com',
                url: 'https://faskeslainnya.com',
                statusOperasional: 'Aktif',
                satuSehatId: 'SEHAT002',
                location_type: 'Puskesmas',
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