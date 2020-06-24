/**
 * @description Error which should be displayed on frontend
 * @export
 * @class AppError
 */
export default class AppError {
  type: string;
  message: string;

  constructor(type, message) {
    this.type = type;
    this.message = message;
  }
}
