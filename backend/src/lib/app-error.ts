export class AppError extends Error {
  statusCode: number;
  userMessage: string; // what user sees
  devMessage: string; // what goes in logs
  code: string; // machine readable: "AUTH_INVALID", "ZONE_NOT_FOUND" etc.
  isOperational: boolean;

  constructor(
    statusCode: number,
    userMessage: string,
    code: string,
    devMessage?: string,
    isOperational = true
  ) {
    super(userMessage);
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.code = code;
    this.devMessage = devMessage || userMessage;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const Errors = {
  // Auth
  invalidCredentials: () =>
    new AppError(
      401,
      'Incorrect email or password. Please try again.',
      'AUTH_INVALID_CREDENTIALS'
    ),

  tokenExpired: () =>
    new AppError(
      401,
      'Your session has expired. Please log in again.',
      'AUTH_TOKEN_EXPIRED'
    ),

  unauthorized: () =>
    new AppError(
      403,
      "You don't have permission to do this.",
      'AUTH_UNAUTHORIZED'
    ),

  // Not found
  userNotFound: () =>
    new AppError(
      404,
      "We couldn't find your account. Please register first.",
      'USER_NOT_FOUND'
    ),

  zoneNotFound: () =>
    new AppError(
      404,
      "This zone doesn't exist. Please contact your admin.",
      'ZONE_NOT_FOUND'
    ),

  scheduleNotFound: () =>
    new AppError(
      404,
      'No pickup schedule found for this area.',
      'SCHEDULE_NOT_FOUND'
    ),

  complaintNotFound: () =>
    new AppError(
      404,
      'This complaint report was not found.',
      'COMPLAINT_NOT_FOUND'
    ),

  routeNotFound: () =>
    new AppError(
      404,
      'No route plan found for today. Ask admin to generate one.',
      'ROUTE_NOT_FOUND'
    ),

  // Validation
  validationFailed: (details?: any) =>
    new AppError(
      400,
      'Some information is missing or incorrect. Please check and try again.',
      'VALIDATION_FAILED'
    ),

  // Conflict
  alreadyExists: (what: string) =>
    new AppError(
      409,
      `${what} already exists. Please use a different one.`,
      'ALREADY_EXISTS'
    ),

  alreadyLoggedToday: () =>
    new AppError(
      409,
      "You've already logged your waste today. Your log has been updated.",
      'ALREADY_LOGGED_TODAY'
    ),

  // Upload
  imageTooLarge: () =>
    new AppError(
      400,
      'Photo is too large. Please choose a photo under 5MB.',
      'IMAGE_TOO_LARGE'
    ),

  invalidImageType: () =>
    new AppError(
      400,
      'Only JPG and PNG photos are supported.',
      'INVALID_IMAGE_TYPE'
    ),

  // Server
  internalError: () =>
    new AppError(
      500,
      'Something went wrong on our end. Please try again in a moment.',
      'INTERNAL_ERROR'
    ),

  serviceUnavailable: () =>
    new AppError(
      503,
      'Service is temporarily unavailable. Please try again shortly.',
      'SERVICE_UNAVAILABLE'
    ),
  // Empty States
  noRouteData: () =>
    new AppError(
      404,
      'All clear! No pending pickups found in this zone for today.',
      'ROUTE_NO_DATA'
    ),
};
