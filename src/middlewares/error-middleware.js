import NotfoundException from "../exception/notfound-exception.js";
import UnauthorizedException from "../exception/unauthorized-exception.js";
import errorResponse from "../responses/error-response.js";

const errorMiddleware = (error, request, response, nextFunction) => {
  if (error instanceof NotfoundException) {
    return response.status(error.code).json(errorResponse(error.message));
  }else if(error instanceof UnauthorizedException){
    console.log(errorResponse(error.message));
    return response.status(error.code).json(errorResponse(error.message));
  }
};

export default errorMiddleware;