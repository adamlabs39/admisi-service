import dotenv from 'dotenv';
dotenv.config();
import moment from "moment";
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

const convertSnakeToCamel = (obj) => {
    const newObj = {};
    for (const key in obj) {
        newObj[key.replace(/(\_\w)/g, function(m){return m[1].toUpperCase();})] = obj[key];
    }
    return newObj;
}

const convertCamelToSnake = (obj) => {
    const newObj = {};
    for (const key in obj) {
        newObj[key.replace(/([A-Z])/g, function(m){return '_'+m.toLowerCase();})] = obj[key];
    }
    return newObj;
}

export { paginationHelper, generateNoRM, getInfoAge, convertSnakeToCamel, generateNoReg , convertCamelToSnake};
