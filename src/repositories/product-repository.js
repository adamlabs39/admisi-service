import NotfoundException from "../exception/notfound-exception.js";

export default class PorductRepository {
  static async findByUuid(uuid) {
    if (uuid == "B001")
      return {
        id: 1,
        name: "Apel",
        price: "50.0000.00",
      };
    else
      throw new NotfoundException(
        `produk dengan kode ${uuid} tidak ditemukan!`
      );
  }
}
