import moment from 'moment';
import {uuidv7} from "uuidv7";

export const hookModel = {
    beforeCreate: (instance, options) => {
        console.log('beforeCreate hookModel');
        const unixTimestamp = moment().unix();
        instance.setDataValue('uuid', uuidv7());
        instance.createdAt = unixTimestamp;
        instance.updatedAt = unixTimestamp;
    },
    beforeUpdate: (instance, options) => {
        instance.updatedAt = moment().unix();
    }
};