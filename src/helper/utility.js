import dotenv from 'dotenv';
import moment from "moment";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import PatientModel from "../models/patient-model.js";
import PractionerModel from "../models/practioner-model.js";
import RawatJalanModel from "../models/rawat-jalan-model.js";
import LokasiModel from "../models/lokasi-model.js";
import AntrianPoliModel from "../models/antrian-poli-model.js";

dotenv.config();

const paginationHelper = (page, limit, total) => {
    const total_page = Math.ceil(total / limit);
    const next = page < total_page ? page + 1 : null;
    const prev = page > 1 ? page - 1 : null;
    return {
        page: parseInt(page),
        page_size: parseInt(limit),
        total_page,
        total_data: total,
        next_page: next,
        prev_page: prev
    };
}

const generateNoRM = async () => {
    const { faskesUuid } = Context.get(CTX_AUTHOR);
    const countPatient = await PatientModel.count({ where: { faskesUuid } });
    return `${faskesUuid}-${countPatient.toString().padStart(6, '0')}`;
};

const generateAntrianAdmisi = async () => {
    const today = moment().startOf('day').unix();
    const { faskesUuid } = Context.get(CTX_AUTHOR);
    const countPatient = await PatientModel.count({
        where: {
            faskesUuid,
            tanggalDaftar: { [Op.between]: [today, today + 86400] }
        }
    });
    return countPatient.toString().padStart(3, '0');
};

const generateAntrianPoli = async (poliUuid, dokterUuid) => {
    const today = moment().startOf('day').unix();
    const { faskesUuid } = Context.get(CTX_AUTHOR);

    const [code, countRJ] = await Promise.all([
        AntrianPoliModel.findOne({
            where: {
                faskesUuid,
                practitionerUuid: dokterUuid,
                lokasiUuid: poliUuid
            },
            attributes: ['code_antrian_poli', 'code_antrian_dokter']
        }),
        RawatJalanModel.count({
            where: {
                faskesUuid,
                tanggalPeriksa: { [Op.between]: [today, today + 86400] },
                practionerUuid: dokterUuid,
                lokasiUuid: poliUuid
            }
        })
    ]);

    if (!code) throw new Error('Kode antrian poli tidak ditemukan');

    return `${poli.code}-${dokter.code}-${countRJ.toString().padStart(3, '0')}`;
};


const generateNoReg = () => {
    const CODE = 'REG';
    const randomText = '1234567890';
    const date = moment().format('YYMMDD');
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += randomText.charAt(Math.floor(Math.random() * randomText.length));
    }
    return `${CODE}${date}${result}`;
}

const generateBookingCode = (length = 6) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '1234567890';
    const randomText = letters + numbers;
    if (length < 2) throw new Error("Length must be at least 2 to ensure a mix of letters and numbers.");
    let result = '';
    result += letters.charAt(Math.floor(Math.random() * letters.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 2; i < length; i++) result += randomText.charAt(Math.floor(Math.random() * randomText.length));
    result = result.split('').sort(() => 0.5 - Math.random()).join('');
    return result;
};


const getInfoAge = (birthDate) => {
    const today = moment();
    const birth = moment(birthDate);
    const ageYear = today.diff(birth, 'years');
    birth.add(ageYear, 'years');
    const ageMonth = today.diff(birth, 'months');
    birth.add(ageMonth, 'months');
    const ageDay = today.diff(birth, 'days');

    return {
        year: ageYear,
        month: ageMonth,
        day: ageDay
    };
}

const convertSnakeToCamel = (obj, deep = false) => {
    const newObj = {};
    for (const key in obj) {
        const newKey = key.replace(/(\_\w)/g, (m) => m[1].toUpperCase());
        const value = obj[key];
        newObj[newKey] = (deep && typeof value === 'object' && value !== null)
            ? convertSnakeToCamel(value, true)
            : value;
    }
    return newObj;
}

const convertCamelToSnake = (obj, deep = false) => {
    const newObj = {};
    for (const key in obj) {
        const newKey = key.replace(/([A-Z])/g, (m) => '_' + m.toLowerCase());
        const value = obj[key];
        newObj[newKey] = (deep && typeof value === 'object' && value !== null)
            ? convertCamelToSnake(value, true)
            : value;
    }
    return newObj;
}

const selectAttributes = (record, attributesWithAliases, withConvertToSnake = false) => {
    const convertToSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    const setNestedValue = (obj, path, value) => {
        const keys = path.split('.');
        keys.reduce((acc, key, index) => {
            if (index === keys.length - 1) {
                acc[key] = value;
            } else {
                if (!acc[key]) acc[key] = {};
                return acc[key];
            }
        }, obj);
    };

    return attributesWithAliases.reduce((acc, attr) => {
        const [key, alias] = attr.includes(' as ') ? attr.split(' as ') : [attr, attr];
        const value = key.split('.').reduce((o, i) => (o ? o[i] : undefined), record);

        const finalAlias = withConvertToSnake ? convertToSnakeCase(alias) : alias;
        setNestedValue(acc, finalAlias, value);
        return acc;
    }, {});
};

const bannerChannel = (channel, data) => {
    console.log('Event Received');
    console.log(`Channel : ${channel}`);
    console.log('Data : ', data);
    console.log('========================================');
}

const checkExistData = async (model, value, column = 'uuid') => {
    const user = Context.get(CTX_AUTHOR);
    const result = await model.findOne({
        where: {
            [column]: value,
            faskesUuid: user.faskesUuid
        },
        attributes: [column]
    });

    return !!result;
};





export {
    paginationHelper,
    generateNoRM,
    getInfoAge,
    convertSnakeToCamel,
    generateNoReg,
    convertCamelToSnake,
    selectAttributes,
    generateBookingCode,
    bannerChannel,
    checkExistData
};
