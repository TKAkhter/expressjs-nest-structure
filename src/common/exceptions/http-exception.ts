export class BadRequestException extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestException";
    this.status = 400;
  }
}

export class NotFoundException extends Error {
  public status: number;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundException";
    this.status = 404;
  }
}

export class InternalServerErrorException extends Error {
  public status: number;

  constructor(message: string) {
    super(message);
    this.name = "InternalServerErrorException";
    this.status = 500;
  }
}