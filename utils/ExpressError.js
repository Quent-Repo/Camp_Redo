class ExpressError extends Error{
    constructor(message, statuseCode){
    super();
    this.message = message;
    this.statusCode = statusCode;
    }
}

module,exports = ExpressError;