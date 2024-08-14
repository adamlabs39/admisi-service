export default class DuplicateException extends Error{
  constructor(message, code) {
    super(message);
    this.message = message;
    this.code = code;
  }
}
