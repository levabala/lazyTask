export class LazyTask {
  public func: () => void;
  public onePerTick: boolean;
  public prority: number;
  public condition: (() => boolean) | null;

  constructor(
    func: () => void,
    priority = 0,
    condition: (() => boolean) | null = null,
    onePerTick = false
  ) {
    this.func = func;
    this.onePerTick = onePerTick;
    this.prority = priority;
    this.condition = condition;
  }

  public readyToBeExecuted() {
    return this.condition === null || this.condition();
  }
}
