export class LazyTask {
  public func: () => any;
  public onePerTick: boolean;
  public prority: number;
  public condition: (() => boolean) | null;
  public destructer: (() => boolean) | null;
  public id: number = 0;
  public name: string;

  public callbacks: Array<(result: any) => any> = [];

  constructor({
    func,
    taskName,
    priority,
    condition,
    destructer,
    onePerTick
  }: {
    func: () => any;
    taskName?: string;
    priority?: number;
    condition?: (() => boolean) | null;
    destructer?: (() => boolean) | null;
    onePerTick?: boolean;
  }) {
    this.func = func;
    this.name = taskName || "unnamed";
    this.onePerTick = onePerTick || false;
    this.prority = priority || 0;
    this.condition = condition || null;
    this.destructer = destructer || null;
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
