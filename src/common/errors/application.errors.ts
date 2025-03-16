export class ApplicationError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public error: string = 'Bad Request',
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundError extends ApplicationError {
  constructor(entity: string, error?: string) {
    super(`${entity} not found`, 404, error);
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor(error?: string) {
    super('Invalid credentials', 401, error);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(error?: string) {
    super('Unauthorized access', 401, error);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(error?: string) {
    super('Forbidden access', 403, error);
  }
}
