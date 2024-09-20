import PegawaiModel from "../models/pegawai-model.js";

export default class PegawaiSeeder {
    static async seed(transaction) {
        const data = [
            {
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                uuid: '0191c610-f8eb-7649-8838-2b82619f8b31',
                nama: 'Rudi tabuti',
                status: true,
                nik: '1234567890',
                tipe: 1,
                title: 'Ir',
                tanggalLahir: '1990-01-01',
                gender: 'L',
            },
            {
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                uuid: '0191c610-f8eb-7f61-9f66-9fd450b3753e',
                nama: 'Joko Susilo',
                status: true,
                nik: '1234567891',
                tipe: 1,
                title: 'Ir',
                tanggalLahir: '1990-01-01',
                gender: 'L'
            },
            {
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                uuid: '0191c610-f8eb-74da-bccb-34bde3345481',
                nama: 'Budi Santoso',
                status: true,
                nik: '1234567892',
                tipe: 1,
                title: 'Ir',
                tanggalLahir: '1990-01-01',
                gender: 'L'
            },
        ]


        return PegawaiModel.bulkCreate(data, {transaction});
    }
}