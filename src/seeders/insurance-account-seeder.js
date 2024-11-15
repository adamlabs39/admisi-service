import {
    InsuranceAccountModel
} from "@adameds/model-sdk/admisi";

export default class InsuranceAccountSeeder{
    static async seed(transaction) {
        const insuranceAccount = [
            {
                "uuid": "2ed6a3cb-94aa-47f6-bca1-a99ae568e1e1",
                "faskesUuid": "019328c1-1931-793e-83d0-488bbe962dd4",
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
                "faskesUuid": "019328c1-1931-793e-83d0-488bbe962dd4",
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