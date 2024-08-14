import JwtHelper from "../helper/jwt-helper.js";
const authorizationMiddleware = async (request, response, nextFunction) => {
    try {
        const BEARER_TOKEN = request.get("Authorization");
        if (!BEARER_TOKEN) return response.status(401).json({message: `silakan login terlebih dahulu!`});
        const token = BEARER_TOKEN.split(" ")[1]; 
        const isValid = await JwtHelper.verify(token);
        if (!isValid) return response.status(401).json({message: `token tidak valid!`});
        response.locals.jwtData = isValid;
        nextFunction();
    }catch (error) {
        return response.status(401).json({message: `token tidak valid!`});
    }
}

export default authorizationMiddleware;