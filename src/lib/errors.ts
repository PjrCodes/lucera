export class NotFoundError extends Error {
    constructor(resource: string, message?: string) {
        super(message || `${resource} not found`);
        this.name = 'NotFound';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class InvalidDataError extends Error {
    constructor(message?: string) {
        super(message || 'Invalid data retrieved / provided / processed. Likely database issue.');
        this.name = 'InvalidData';
        Object.setPrototypeOf(this, InvalidDataError.prototype);
    }
}
