import {
    convertCamelToSnake,
    convertSnakeToCamel,
    generateAntrianPoli,
    generateNoReg,
    generateNoRM,
    getInfoAge
} from '../src/helper/utility';
import {Context} from "../src/middlewares/context.js";
import {CTX_AUTHOR} from "../src/constant/context-constant.js";

describe('Check Utility', () => {
    it('should generate random number with length 6', async () => {
        Context.set(CTX_AUTHOR, {
            roleUuid: "0191a137-a782-7b59-b13d-c06d97064cda",
            username: "alliano-dev",
            faskesUuid: "9d403ufjh43ufh3uf8430ihf",
            iat: 1724986703,
            exp: 1727578703,
            iss: "authentication-serivice"
        })
        const result = await generateNoRM();
        console.log(result);
        expect(result).toMatch(/^\d{2}-\d{2}-\d{2}$/);
    });

    it('should return age info', () => {
        const birthDate = '1999-01-01';
        const result = getInfoAge(birthDate);
        expect(result).toEqual({
            ageYear: 25,
            ageMonth: 8,
            ageDay: 3
        });
    });

    it('should convert snake case to camel case', () => {
        const obj = {
            patient_uuid: null,
            title: "Mr.",
            name: "John Doe",
            identity: "A1234567",
            no_identity: "A1234567",
            birth_place: "Jakarta",
            birth_date: "1990-01-01",
            gender: "Male",
            phone: "+621234567890",
            religion: "Islam",
            language: "Indonesian",
            maritialStatus: "Married",
            mother_name: "Jane Doe"
        };

        const result = convertSnakeToCamel(obj);
        expect(result).toEqual({
            patientUuid: null,
            title: "Mr.",
            name: "John Doe",
            identity: "A1234567",
            noIdentity: "A1234567",
            birthPlace: "Jakarta",
            birthDate: "1990-01-01",
            gender: "Male",
            phone: "+621234567890",
            religion: "Islam",
            language: "Indonesian",
            maritialStatus: "Married",
            motherName: "Jane Doe"
        });
    });

    it('should generate registration code', () => {
        const result = generateNoReg();
        expect(result).toMatch(/REG\d{10}/);
    });


    it('should convert camel case to snake case', () => {
        const obj = {
            patientUuid: null,
            title: "Mr.",
            name: "John Doe",
            identity: "A1234567",
            noIdentity: "A1234567",
            birthPlace: "Jakarta",
            birthDate: "1990-01-01",
            gender: "Male",
            phone: "+621234567890",
            religion: "Islam",
            language: "Indonesian",
            maritialStatus: "Married",
            motherName: "Jane Doe"
        }

        const result = convertCamelToSnake(obj);

        expect(result).toEqual({
            patient_uuid: null,
            title: "Mr.",
            name: "John Doe",
            identity: "A1234567",
            no_identity: "A1234567",
            birth_place: "Jakarta",
            birth_date: "1990-01-01",
            gender: "Male",
            phone: "+621234567890",
            religion: "Islam",
            language: "Indonesian",
            maritial_status: "Married",
            mother_name: "Jane Doe"
        });
    });


    it('should generate queue number poly-clinic', async () => {
        Context.set(CTX_AUTHOR, {
            roleUuid: "0191a137-a782-7b59-b13d-c06d97064cda",
            username: "alliano-dev",
            faskesUuid: "9d403ufjh43ufh3uf8430ihf",
            iat: 1724986703,
            exp: 1727578703,
            iss: "authentication-serivice"
        })
        const result = await generateAntrianPoli('0191a18a-22e4-73d6-ab3b-dc6683607aa9', '0191a18a-22e4-7410-abaa-899eb0fd35e0');
        console.log(result);
        expect(result).toMatch(/PM-DPM-\d{3}/);
    });

});