export class ContainerItemNotFoundError extends Error {
  constructor(
    public readonly containerItemId: string,
    message?: string,
  ) {
    super(message);
    // see: www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = ContainerItemNotFoundError.name; // stack traces display correctly now
  }
}
