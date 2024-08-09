import HomeRepository from "../repositories/home-repository.js";

export default class HomeService {
  static async home() {
    return HomeRepository.getHome();
  }
}
