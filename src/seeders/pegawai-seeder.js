import {
    PegawaiModel
} from "@adameds/model-sdk/datamaster";

export default class PegawaiSeeder {
    static async seed(transaction) {
        const data = [
            {
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                uuid: '0191c610-f8eb-7649-8838-2b82619f8b31',
                name: 'Rudi tabuti',
                status: true,
                nik: '1234567890',
                tipe: 1,
                title: 'Ir',
                tanggal_lahir: '1990-01-01',
                gender: 'L',
            },
            {
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                uuid: '0191c610-f8eb-7f61-9f66-9fd450b3753e',
                name: 'Joko Susilo',
                status: true,
                nik: '1234567891',
                tipe: 1,
                title: 'Ir',
                tanggal_lahir: '1990-01-01',
                gender: 'L'
            },
            {
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                uuid: '0191c610-f8eb-74da-bccb-34bde3345481',
                name: 'Budi Santoso',
                status: true,
                nik: '1234567892',
                tipe: 1,
                title: 'Ir',
                tanggal_lahir: '1990-01-01',
                gender: 'L'
            },
        ]


        return PegawaiModel.bulkCreate(data, {transaction});
    }
}