import JwtHelper from "../helper/jwt-helper.js";
import { Context as Ctx } from "./context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { JwtUtils } from "@adameds/authorization-sdk/jwt-utils"
const authorizationMiddleware = async (request, response, nextFunction) => {
    try {
        const BEARER_TOKEN = request.get("Authorization");
        if (!BEARER_TOKEN) return response.status(401).json({message: `silakan login terlebih dahulu!`});
        const token = BEARER_TOKEN.split(" ")[1]; 
        const isValid = JwtUtils.veryfy(token);
        if (!isValid) return response.status(401).json({message: `token tidak valid!`});
        response.locals.jwtData = isValid;
        console.log("isValid", isValid);
        Ctx.set(CTX_AUTHOR, isValid);
        nextFunction();
    }catch (error) {
        return response.status(401).json({message: `token tidak valid!`});
    }
}

export default authorizationMiddleware;