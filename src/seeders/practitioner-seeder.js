import PractitionerModel from "../models/practitioner-model.js";

export default class PractitionerSeeder {
    static async seed(transaction){
        const data = [
            {
                uuid: "0191a18a-22e4-79f7-9da5-a10a6e1a60f9",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                pegawaiUuid: '0191c610-f8eb-7649-8838-2b82619f8b31',
                sip: 'SIP001',
                str: 'STR001',
                code_bpjs: 'BPJS001',
                satu_sehat_id: 'SEHAT001',
                status: true,
            },
            {
                uuid: "0191a18a-22e4-7410-abaa-899eb0fd35e0",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                pegawaiUuid: '0191c610-f8eb-7f61-9f66-9fd450b3753e',
                sip: 'SIP002',
                str: 'STR002',
                code_bpjs: 'BPJS002',
                satu_sehat_id: null,
                status: false,
            },
            {
                uuid: "0191a18a-22e4-7348-ae21-9a1bbfdcb915",
                faskesUuid: "9d403ufjh43ufh3uf8430ihf",
                pegawaiUuid: '0191c610-f8eb-74da-bccb-34bde3345481',
                sip: 'SIP003',
                str: 'STR003',
                code_bpjs: 'BPJS003',
                satu_sehat_id: 'SEHAT002',
                status: true,
            },
        ];

        await PractitionerModel.bulkCreate(data, {transaction});
    }
}