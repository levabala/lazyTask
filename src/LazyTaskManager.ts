import { LazyTask } from './LazyTask';

class LazyTaskManager {
  public lastTickDuration: number = 0;
  public taskStacks: LazyTask[][] = [[]];
  public tasksSuspended: LazyTask[] = [];
  public lastTimeStamp?: number = undefined;
  public lastStartTimeStamp?: number = undefined;
  public tickLimit: number;
  public tasksPerformedLastTick: number = 0;

  public launch(tickLimit = 30) {
    this.tickLimit = tickLimit;

    requestAnimationFrame(this.tick);
  }

  public addTask(task: LazyTask) {
    if (!(task.prority in this.taskStacks)) this.taskStacks[task.prority] = [];

    this.taskStacks[task.prority].push(task);

    return this;
  }

  private executeTask(task: LazyTask) {
    task.func();
  }

  private getHighestStack() {
    for (let i = this.taskStacks.length - 1; i >= 0; i--) {
      const stack = this.taskStacks[i];
      if (stack.length && stack.some(task => task.readyToBeExecuted()))
        return stack;
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

    const newSuspended = [];

    let counter = 0;
    let currentStack = this.getHighestStack();
    let lastTask;
    while (
      Date.now() - this.lastTimeStamp < this.tickLimit &&
      (this.tasksSuspended.length || currentStack.length) &&
      (!lastTask || !lastTask.onePerTick)
    ) {
      lastTask =
        this.tasksSuspended.pop() || (currentStack.shift() as LazyTask);

      if (!lastTask.readyToBeExecuted()) {
        newSuspended.push(lastTask);
        continue;
      }

      this.executeTask(lastTask);

      if (!currentStack.length) currentStack = this.getHighestStack();
      counter++;
    }

    this.tasksSuspended = this.tasksSuspended.reverse().concat(newSuspended);

    this.tasksPerformedLastTick = counter;

    this.lastStartTimeStamp = startTickTime;
    this.lastTimeStamp = Date.now();
  };
}

const lazyTaskManager = new LazyTaskManager();
export default lazyTaskManager;
