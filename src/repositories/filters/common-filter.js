import {Op} from "sequelize";
import sequelizeInstance from "../../configurations/sequelize-instance.js";

export function commonFilterPelayanan({faskesUuid, args = {}, options = {}}) {
    const filter = {
        faskesUuid,
        [Op.or]: [
            //* Filter No Rm Layanan
            { no_rm: { [Op.iLike]: `%${args.q || ""}%` } },
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
        ...options
    }

    return filter;
}

export function commonFilterReport({faskesUuid, args = {}, options = {}}) {
    const filter = {
        faskesUuid,
        [Op.or]: [
                //* Filter No Rm Layanan
            { noreg: { [Op.iLike]: `%${args.q || ""}%` } },
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
        ...options
    }

    return filter;
}