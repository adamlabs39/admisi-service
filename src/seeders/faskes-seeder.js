import FaskesModel from "../models/faskes-model.js";

export default class FaskesSeeder {
    static async seed(transaction) {
        const faskes = [
            {
                "uuid": "9d403ufjh43ufh3uf8430ihf",
                "name": "RSUD Dr. Soetomo",
                "code": "ABC",
                "status": true
            },
            {
                "uuid": "9d403ufjh43ufh3uf8430ihg",
                "name": "RSUD Dr. Soetomo",
                "code": "RSU",
                "status": true
            }
        ];

        await FaskesModel.bulkCreate(faskes, { transaction });
    }
}