import NotfoundException from "../exception/notfound-exception.js";

const errorMiddleware = (error, request, response, nextFunction) => {
  if (error instanceof NotfoundException) {
    response.status(error.code).json({ message: error.message });
  }
};

export default errorMiddleware;