import {
    PractitionerModel
} from "@adameds/model-sdk/datamaster";

export default class PractitionerSeeder {
    static async seed(transaction){
        const data = [
            {
                uuid: "0191a18a-22e4-79f7-9da5-a10a6e1a60f9",
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                pegawai_uuid: '0191c610-f8eb-7649-8838-2b82619f8b31',
                sip: 'SIP001',
                str: 'STR001',
                code_bpjs: 'BPJS001',
                satu_sehat_id: 'SEHAT001',
                status: true,
            },
            {
                uuid: "0191a18a-22e4-7410-abaa-899eb0fd35e0",
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                pegawai_uuid: '0191c610-f8eb-7f61-9f66-9fd450b3753e',
                sip: 'SIP002',
                str: 'STR002',
                code_bpjs: 'BPJS002',
                satu_sehat_id: null,
                status: false,
            },
            {
                uuid: "0191a18a-22e4-7348-ae21-9a1bbfdcb915",
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                pegawai_uuid: '0191c610-f8eb-74da-bccb-34bde3345481',
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