import {
    KategoriRuanganModel,
    RuanganModel
} from "@adameds/model-sdk/datamaster";

import {
    RoomMonitoringModel
} from "@adameds/model-sdk/admisi";

export default class RoomsSeeder{
    static async seed(transaction){
        const faskes_uuid = "019328c1-1931-793e-83d0-488bbe962dd4";

        const kategori = [
            {
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                uuid: "0191690f-1cb3-7884-afeb-6ad62f0e0a1a",
                code: "VIP",
                name: "VIP",
                status: true,
            },
            {
                faskes_uuid: "019328c1-1931-793e-83d0-488bbe962dd4",
                uuid: "0191690f-1cb3-73d5-89a4-92e2ac2c5fce",
                code: "VVIP",
                name: "VVIP",
                status: true,
            }
        ];


        const ruangan = [
            {
                "uuid": "0191690f-1cb3-7a48-8bad-b21700bd19f4",
                "faskes_uuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "code": "VIP-1",
                "name": "VIP 1",
                "no_room": "101",
                "kategori_ruangan_uuid": "0191690f-1cb3-7884-afeb-6ad62f0e0a1a",
                "kelas_ruangan": 1,
                "status": true,
            },
            {
                "uuid": "0191690f-1cb3-7a48-8bad-b21700bd19f5",
                "faskes_uuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "code": "VIP-2",
                "name": "VIP 2",
                "no_room": "102",
                "kategori_ruangan_uuid": "0191690f-1cb3-7884-afeb-6ad62f0e0a1a",
                "kelas_ruangan": 2,
                "status": true,
            },
        ]

        const monitoring = [
            {
                "uuid": "0191696e-5a95-7928-b2aa-4a1cf58aee69",
                "faskesUuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f4",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "101",
                "bedName": "Kasur 1",
                "noBed": "1",
                "status": true,
            },
            {
                "uuid": "0191696e-5a95-7fbc-ae6f-c1730ef77b79",
                "faskesUuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f4",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "101",
                "bedName": "Kasur 2",
                "noBed": "2",
                "status": true,
            },
            {
                "uuid": "0191696e-5a95-7965-8381-acf76b03879b",
                "faskesUuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f5",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "102",
                "bedName": "Kasur 1",
                "noBed": "1",
                "status": true,
            },
            {
                "uuid": "0191696e-5a95-7965-8381-acf76b03876b",
                "faskesUuid": "019328c1-1931-793e-83d0-488bbe962dd4",
                "roomUuid": "0191690f-1cb3-7a48-8bad-b21700bd19f5",
                "roomCategory": "VIP",
                "roomClass": "1",
                "room": "102",
                "bedName": "Kasur 2",
                "noBed": "2",
                "status": true,
            }
        ]

        await KategoriRuanganModel.bulkCreate(kategori, { transaction });
        await RuanganModel.bulkCreate(ruangan, { transaction});
        await RoomMonitoringModel.bulkCreate(monitoring, {transaction});
    }
}