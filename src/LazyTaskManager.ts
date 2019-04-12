import { LazyTask } from './LazyTask';

class LazyTaskManager {
  public durationHistoryMaxLength = 15;
  public durationHistory: number[] = [];
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

  public async addTask(task: LazyTask): Promise<LazyTask> {
    if (!(task.prority in this.taskStacks)) this.taskStacks[task.prority] = [];

    this.taskStacks[task.prority].push(task);

    return await task;
  }

  private async executeTask(task: LazyTask) {
    return await task.execute();
  }

  private getHighestStack() {
    for (let i = this.taskStacks.length - 1; i >= 0; i--) {
      const stack = this.taskStacks[i];
      if (stack && stack.length) return stack;
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
    this.durationHistory.push(delta);

    if (this.durationHistory.length > this.durationHistoryMaxLength)
      this.durationHistory.shift();

    const newSuspended = [];

    let counter = 0;
    let currentStack = this.getHighestStack();
    let lastTask;
    while (Date.now() - this.lastTimeStamp < this.tickLimit) {
      if (currentStack.length) {
        lastTask = currentStack.shift() as LazyTask;

        if (!lastTask.readyToBeExecuted()) {
          newSuspended.push(lastTask);
          continue;
        }

        this.executeTask(lastTask);
        counter++;

        if (!currentStack.length) currentStack = this.getHighestStack();

        continue;
      }

      if (this.tasksSuspended.length) {
        for (let i = this.tasksSuspended.length - 1; i >= 0; i--)
          if (this.tasksSuspended[i].readyToBeExecuted()) {
            const task = this.tasksSuspended.splice(i, 1)[0];
            this.executeTask(task);
            counter++;

            break;
          }

        continue;
      }

      // if both stacks are empty
      break;
    }

    this.tasksSuspended = this.tasksSuspended.concat(newSuspended);

    this.tasksPerformedLastTick = counter;

    this.lastStartTimeStamp = startTickTime;
    this.lastTimeStamp = Date.now();
  };
}

const lazyTaskManager = new LazyTaskManager();
export default lazyTaskManager;
