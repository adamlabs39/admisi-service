import {
    FaskesModel
} from "@adameds/model-sdk/datamaster";

export default class FaskesSeeder {
    static async seed(transaction) {
        const faskes = [
            {
                "uuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "name": "RSUD Dr. Soetomo",
                "code": "ABC",
                "status": true
            },
            {
                "uuid": "01932dca-e4c6-7cf0-9594-42147fc70d93",
                "name": "RSUD Dr. Soetomo",
                "code": "RSU",
                "status": true
            }
        ];

        await FaskesModel.bulkCreate(faskes, { transaction });
    }
}