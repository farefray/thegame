/**
 * @description Error which should be displayed on frontend
 * @export
 * @class AppError
 */
export default function AppError(type, message) {
  this.type = type;
  this.message = message;
  return this;
}
