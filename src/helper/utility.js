import dotenv from 'dotenv';
import moment from "moment";

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

const generateNoRM = (code) => {
    const randomText = '1234567890';
    if (!code) throw new Error('Code is required');
    const length = process.env.RM_NO_LENGTH;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomText.charAt(Math.floor(Math.random() * randomText.length));
    }
    return `${code}${result}`;
}

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




export {
    paginationHelper,
    generateNoRM,
    getInfoAge,
    convertSnakeToCamel,
    generateNoReg,
    convertCamelToSnake,
    selectAttributes
};
