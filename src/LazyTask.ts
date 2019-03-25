export class LazyTask {
  public func: () => void;
  public onePerTick: boolean;

  constructor(func: () => void, onePerTick = false) {
    this.func = func;
    this.onePerTick = onePerTick;
  }
}
