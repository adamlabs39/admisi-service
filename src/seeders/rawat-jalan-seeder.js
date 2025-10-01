import { 
    RawatJalanModel 
} from '@adameds/model-sdk/pelayanan';
import moment from 'moment';
import PatientSeeder from './patient-seeder.js';
import { PatientModel } from '@adameds/model-sdk/admisi';

export default class RawatJalanSeeder {
    static async seed(transaction) {

        const nowUnix = moment().unix();

        const pasien = await PatientModel.findOne({
        where: { noRm: "1-00-00-01" }, 
        transaction,
        });


        const rawatJalan = [
            {
                noReg: "RJ001",
                faskesUuid: pasien.faskesUuid,
                patientUuid: pasien.uuid,
                name: pasien.name,
                noRm: pasien.noRm,
                birthDetailUuid: pasien.birthDetailUuid,
                gender: pasien.gender,
                practitionerUuid: "0199386b-e867-7863-b35f-5dc298a49614",
                statusRj: 5,
                dischargeDate: nowUnix,
                createdAt: nowUnix,
                updatedAt: nowUnix,
            },
            {
                noReg: "RJ002",
                faskesUuid: pasien.faskesUuid,
                patientUuid: pasien.uuid,
                name: pasien.name,
                noRm: pasien.noRm,
                birthDetailUuid: pasien.birthDetailUuid,
                gender: pasien.gender,
                practitionerUuid: "0199386b-e867-7863-b35f-5dc298a49614",
                statusRj: 0,
                deletedAt: nowUnix,
                createdAt: nowUnix,
                updatedAt: nowUnix,
            }
        ];

        await RawatJalanModel.bulkCreate(rawatJalan, { transaction });
    }
}