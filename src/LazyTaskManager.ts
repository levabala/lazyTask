import { LazyTask } from './LazyTask';

class LazyTaskManager {
  public lastTickDuration: number = 0;
  public taskStack: LazyTask[] = [];
  public lastTimeStamp?: number = undefined;
  public lastStartTimeStamp?: number = undefined;
  public tickLimit: number;
  public tasksPerformedLastTick: number = 0;

  public launch(tickLimit = 30) {
    this.tickLimit = tickLimit;

    requestAnimationFrame(this.tick);
  }

  public addTask(task: LazyTask) {
    this.taskStack.push(task);

    return this;
  }

  private executeTask(task: LazyTask) {
    task.func();
  }

  private tick = () => {
    const startTickTime = Date.now();
    requestAnimationFrame(this.tick);

    this.lastTimeStamp = this.lastTimeStamp || startTickTime;
    this.lastStartTimeStamp = this.lastStartTimeStamp || startTickTime;

    const delta = startTickTime - this.lastStartTimeStamp;
    this.lastTickDuration = delta;

    let counter = 0;
    let lastTask;
    while (
      Date.now() - this.lastTimeStamp < this.tickLimit &&
      this.taskStack.length &&
      (!lastTask || !lastTask.onePerTick)
    ) {
      lastTask = this.taskStack.shift() as LazyTask;
      this.executeTask(lastTask);
      counter++;
    }

    this.tasksPerformedLastTick = counter;

    this.lastStartTimeStamp = startTickTime;
    this.lastTimeStamp = Date.now();
  };
}

const lazyTaskManager = new LazyTaskManager();
export default lazyTaskManager;
