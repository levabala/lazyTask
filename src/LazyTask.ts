export class LazyTask {
  public func: () => any;
  public onePerTick: boolean;
  public prority: number;
  public condition: (() => boolean) | null;
  public destructer: (() => boolean) | null;
  public id: number = 0;

  public callbacks: Array<(result: any) => any> = [];

  constructor(
    func: () => any,
    priority = 0,
    condition: (() => boolean) | null = null,
    destructer: (() => boolean) | null = null,
    onePerTick = false
  ) {
    this.func = func;
    this.onePerTick = onePerTick;
    this.prority = priority;
    this.condition = condition;
    this.destructer = destructer;
  }

  public setId(id: number) {
    this.id = id;
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

  public shouldBeDestructed() {
    return this.destructer === null || this.destructer();
  }
}
