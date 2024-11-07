import PenjaminModel from "../models/penjamin-model.js";

export default class PenjaminSeeder {
    static async seed(transaction) {
        const penjaminSeeder = [
            {
                "uuid": "019304bc-39d4-7e9f-86ab-0c55c786af1f",
                "faskesUuid": "9d403ufjh43ufh3uf8430ihf",
                "code": "BPJS",
                "name": "BPJS Kesehatan",
                "phone": "1234567890",
                "address": "Jl. Raya Darmo",
                "status": true
            },
            {
                "uuid": "019304bc-39d4-7ebc-9a12-30ab50d1408f",
                "faskesUuid": "9d403ufjh43ufh3uf8430ihf",
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