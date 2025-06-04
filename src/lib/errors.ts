export class NotFoundError extends Error {
    constructor(resource: string, message?: string) {
        super(message || `${resource} not found`);
        this.name = 'NotFound';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}