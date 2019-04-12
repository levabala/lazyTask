export class LazyTask {
  public func: () => any;
  public onePerTick: boolean;
  public prority: number;
  public condition: (() => boolean) | null;

  public callbacks: Array<(result: any) => any> = [];

  constructor(
    func: () => any,
    priority = 0,
    condition: (() => boolean) | null = null,
    onePerTick = false
  ) {
    this.func = func;
    this.onePerTick = onePerTick;
    this.prority = priority;
    this.condition = condition;
  }

  public then(callback: (result: any) => void) {
    this.callbacks.push(callback);
  }

  public async execute() {
    const res = await this.func();

    this.callbacks.forEach(callback => callback(res));

    return res;
  }

  public readyToBeExecuted() {
    return this.condition === null || this.condition();
  }
}
