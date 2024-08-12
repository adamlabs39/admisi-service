const errorResponse = (message,errors) => {
    let response = {
        success: false,
        message
    };
    if(errors)response.errors = errors;
    return response;
}

export default errorResponse;