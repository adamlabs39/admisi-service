import { 
    PatientModel, BirthDetailModel
} from '@adameds/model-sdk/admisi';
import { AddressModel } from '@adameds/model-sdk/setting';
import moment from 'moment';
import { uuidv7 } from "uuidv7";

export default class PatientSeeder {
    static async seed(transaction) {

        const nowUnix = moment().unix();

        const birthDetailUuid = uuidv7();
        const addressUuid = uuidv7();
        const patientUuid = uuidv7();

        const pasien = [
            {
                uuid: patientUuid,
                faskesUuid: "01981726-d5cf-7bc4-97ca-9804168283f7",
                noRm: "1-00-00-01",
                name: "Seeder Pasien Joko", 
                identity: "KTP", 
                noIdentity: "3512345678901234", 
                birthDetailUuid: birthDetailUuid, 
                gender: "Female", 
                maritialStatus: "Belum Menikah", 
                isNewBorn: false, 
                addressUuid: addressUuid, 
                createdAt: nowUnix, 
                updatedAt: nowUnix
            }
        ];

        await BirthDetailModel.bulkCreate([
            {
                uuid: birthDetailUuid,
                faskesUuid: "01981726-d5cf-7bc4-97ca-9804168283f7",
                birthDate: moment().subtract(30, 'years').unix(), 
                birthPlace: "City Hospital",
                ageYear: 30,
                ageMonth: 0,
                ageDay: 0,
                createdAt:  nowUnix, 
                updatedAt:  nowUnix,
            }
        ], { transaction });

        await AddressModel.bulkCreate([
            {
                uuid: addressUuid,
                faskesUuid: "01981726-d5cf-7bc4-97ca-9804168283f7",
                fullAddress: "123 Main St", 
                prov: "Metropolis", 
                city: "State", 
                district: "12345",
                rt: "001",
                rw: "002",
                village: "Central",
                postalCode: "12345",
                country: "ID", 
                createdAt:  nowUnix, 
                updatedAt:  nowUnix,
            }
        ], { transaction });
        await PatientModel.bulkCreate(pasien, { transaction });
    }
}