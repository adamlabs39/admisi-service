import { Op } from "sequelize";
import commonFilter from "./common-filter.js";
import sequelizeInstance from "../../configurations/sequelize-instance.js";

export default function rawatInapFilter({faskesUuid, args = {}, options = {}}) {
    const filter = commonFilter({
        faskesUuid,
        args,
        options: {
            ...options,
            status_ri: { [Op.not]: 0 },
            tanggalDaftar: {
                [Op.between]: [args.start_date, args.end_date],
            },
            dischargeDate: { [Op.is]: null },
            deletedAt: { [Op.is]: null },
        },
    });

    if (args.payment_method) filter.paymentMethod = args.payment_method;
    if (args.dpjp) filter.practitionerUuid = args.dpjp;
    if (args.room) {
        const roomArray = args.room.split(',').map(item => item.trim());
        filter[Op.and] = {
            [Op.or]: roomArray.map(room =>
                sequelizeInstance.where(
                    sequelizeInstance.col('monitoring_room.room.name'),
                    { [Op.iLike]: `%${room}%` }
                )
            )
        };
    }

    return filter;
}