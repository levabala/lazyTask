import { LazyTask } from './LazyTask';

class LazyTaskManager {
  public lastTickDuration: number = 0;
  public taskStacks: LazyTask[][] = [[]];
  public lastTimeStamp?: number = undefined;
  public lastStartTimeStamp?: number = undefined;
  public tickLimit: number;
  public tasksPerformedLastTick: number = 0;

  public launch(tickLimit = 30) {
    this.tickLimit = tickLimit;

    requestAnimationFrame(this.tick);
  }

  public addTask(task: LazyTask) {
    this.taskStacks[task.prority].push(task);

    return this;
  }

  private executeTask(task: LazyTask) {
    task.func();
  }

  private getHighestStack() {
    for (let i = this.taskStacks.length - 1; i >= 0; i--) {
      const stack = this.taskStacks[i];
      if (stack.length) return stack;
    }

    return this.taskStacks[0];
  }

  private tick = () => {
    const startTickTime = Date.now();
    requestAnimationFrame(this.tick);

    this.lastTimeStamp = this.lastTimeStamp || startTickTime;
    this.lastStartTimeStamp = this.lastStartTimeStamp || startTickTime;

    const delta = startTickTime - this.lastStartTimeStamp;
    this.lastTickDuration = delta;

    let counter = 0;
    let currentStack = this.getHighestStack();
    let lastTask;
    while (
      Date.now() - this.lastTimeStamp < this.tickLimit &&
      currentStack.length &&
      (!lastTask || !lastTask.onePerTick)
    ) {
      lastTask = currentStack.shift() as LazyTask;
      this.executeTask(lastTask);

      if (!currentStack.length) currentStack = this.getHighestStack();
      counter++;
    }

    this.tasksPerformedLastTick = counter;

    this.lastStartTimeStamp = startTickTime;
    this.lastTimeStamp = Date.now();
  };
}

const lazyTaskManager = new LazyTaskManager();
export default lazyTaskManager;
