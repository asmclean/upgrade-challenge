class ReservationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class InvalidReservationException extends ReservationError {
  constructor(message: string) {
    super(message);
  }
}

class ConflictingReservationException extends ReservationError {
  constructor(message: string) {
    super(message);
  }
}

class ReservationNotFoundException extends ReservationError {
  constructor(message: string) {
    super(message);
  }
}

export {
  ReservationError,
  InvalidReservationException,
  ConflictingReservationException,
  ReservationNotFoundException,
};
