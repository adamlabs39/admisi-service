import { z } from "zod";

export default class MonitoringRoomValidation {
  static INSERT_BED = z.array(
    z.object({
      type: z.string().max(255),
      no_bed: z.string().max(255),
      lokasi_uuid: z.string().max(255),
    })
  );
  static UPDATE_ROOM = z.object({
    beds: z.array(
      z.object({
        uuid: z.string().max(255).nullable(),
        type: z.string().max(255),
        no_bed: z.string().max(255),
        lokasi_uuid: z.string().max(255),
      })
    ),
  });
}
