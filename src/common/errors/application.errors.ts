export class ApplicationError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public error?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundError extends ApplicationError {
  constructor(entity: string) {
    super(`${entity} not found`, 404);
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Invalid credentials', 401);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor() {
    super('Unauthorized access', 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor() {
    super('Forbidden access', 403);
  }
}
