export class LazyTask {
  public func: () => void;
  public onePerTick: boolean;
  public prority: number;

  constructor(func: () => void, priority = 0, onePerTick = false) {
    this.func = func;
    this.onePerTick = onePerTick;
    this.prority = priority;
  }
}
