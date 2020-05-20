class ApplicationError {

    statusCode: number;
    message: string;
    reason: string;
    timestamp: Date;

    constructor(statusCode: number, rsn?: string) {
        this.statusCode = statusCode;
        this.message = 'Unexpected Error';
        this.timestamp = new Date();
        rsn ? (this.reason) = rsn : this.reason = 'Unspecified Reason';
    }

    setMessage(message: string) {
        this.message = message;
    }
}

class BadRequestError extends ApplicationError {
    constructor(reason?: string){
        super(400, reason);
        super.setMessage('Invalid Parameters.')
    }
}

class AuthenticationError extends ApplicationError {
    constructor(reason?: string){
        super(401, reason);
        super.setMessage('Authentication Error.')
    }
}

class AuthorizationError extends ApplicationError {
    constructor(reason?: string){
        super(403, reason);
        super.setMessage('You do not have perission to access the requested information.')
    }
}

class ResourceNotFoundError extends ApplicationError {
    constructor(reason?: string){
        super(404, reason);
        super.setMessage('No resource was found.')
    }
}

class ResourcePersistenceError extends ApplicationError {
    constructor(reason?: string){
        super(409, reason);
        super.setMessage('Resource was not persisted.')
    }
}

class InternalServerError extends ApplicationError {
    constructor(reason?: string){
        super(500, reason);
        super.setMessage('Internal Server Error.')
    }
}

class MethodImplementedError extends ApplicationError {
    constructor(reason?: string){
        super(501, reason);
        super.setMessage('Method Not Implemented')
    }
}

class BadGatewayError extends ApplicationError {
    constructor(reason?: string){
        super(502, reason);
        super.setMessage('Bad Gateway.')
    }
}

class ServiceError extends ApplicationError {
    constructor(reason?: string){
        super(503, reason);
        super.setMessage('Service Unavailable')
    }
}

export {
    BadRequestError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    ResourcePersistenceError,
    InternalServerError,
    MethodImplementedError,
    BadGatewayError,
    ServiceError
}