import {
    PenjaminModel
} from "@adameds/model-sdk/datamaster";

export default class PenjaminSeeder {
    static async seed(transaction) {
        const penjaminSeeder = [
            {
                "uuid": "019304bc-39d4-7e9f-86ab-0c55c786af1f",
                "faskes_uuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "code": "BPJS",
                "name": "BPJS Kesehatan",
                "phone": "1234567890",
                "address": "Jl. Raya Darmo",
                "status": true
            },
            {
                "uuid": "019304bc-39d4-7ebc-9a12-30ab50d1408f",
                "faskes_uuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "code": "BOBYKERTANEGARA",
                "name": "Jaminan Kesehatan Kucing",
                "phone": "1234567891",
                "address": "Jl. Raya Darmo",
                "status": true
            }
        ]

        return PenjaminModel.bulkCreate(penjaminSeeder, {transaction});
    }
}