import {convertCamelToSnake, convertSnakeToCamel, generateNoReg, generateNoRM, getInfoAge} from '../src/helper/utility';

describe('Check Utility', () => {
    it('should generate random number with length 6', () => {
        const code = 'ASW';
        const result = generateNoRM(code);
        expect(result).toMatch(/ASW\d{3}/);
    });

    it('should return age info', () => {
        const birthDate = '1999-01-01';
        const result = getInfoAge(birthDate);
        expect(result).toEqual({
            year: 25,
            month: 7,
            day: 14
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
});