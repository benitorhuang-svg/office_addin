/**
 * Atom: AppError
 * Custom error class for consistent API error responses.
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public detail?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
