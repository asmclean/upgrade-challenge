class AvailabilityError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class InvalidAvailabilityException extends AvailabilityError {
  constructor(message: string) {
    super(message);
  }
}

export { AvailabilityError, InvalidAvailabilityException };
