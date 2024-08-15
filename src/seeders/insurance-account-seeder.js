import InsuranceAccountModel from "../models/insuranceAccount-model.js";

export default class InsuranceAccountSeeder{
    static async seed(transaction) {
        const insuranceAccount = [
            {
                "uuid": "2ed6a3cb-94aa-47f6-bca1-a99ae568e1e1",
                "faskesUuid": "9d403ufjh43ufh3uf8430ihf",
                "patientUuid": "7998bae4-88ca-4224-a57f-72573746efef",
                "code": "BPJS",
                "name": "BPJS",
                "accountNumber": "1234567890",
                "classEntitle": 1,
                "membershipStatus": true,
                "status": true
            },
            {
                "uuid": "8f23db17-7337-4774-85f0-86f420086f8b",
                "faskesUuid": "9d403ufjh43ufh3uf8430ihf",
                "patientUuid": "811f744b-9c5f-4932-b20a-a2e242acea69",
                "code": "BPJS",
                "name": "BPJS",
                "accountNumber": "1234567890",
                "classEntitle": 1,
                "membershipStatus": true,
                "status": true
            }
        ];

        await InsuranceAccountModel.bulkCreate(insuranceAccount, { transaction });
    }
}