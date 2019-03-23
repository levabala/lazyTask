export class LazyTask {
  public func: () => void;

  constructor(func: () => void) {
    this.func = func;
  }
}
