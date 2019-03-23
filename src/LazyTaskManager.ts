import { LazyTask } from './LazyTask';

class LazyTaskManager {
  public lastTickDuration: number = 0;
  private taskStack: LazyTask[] = [];
  private lastTimeStamp?: number = undefined;
  private lastStartTimeStamp?: number = undefined;
  private tickLimit: number = 20;

  public launch() {
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
    this.lastTimeStamp = this.lastTimeStamp || startTickTime;
    this.lastStartTimeStamp = this.lastStartTimeStamp || startTickTime;

    const delta = startTickTime - this.lastStartTimeStamp;
    this.lastTickDuration = delta;

    let counter = 0;
    while (
      Date.now() - this.lastTimeStamp < this.tickLimit &&
      this.taskStack.length
    ) {
      this.executeTask(this.taskStack.pop() as LazyTask);
      counter++;
    }
    console.log(`${counter} tasks per tick`);

    this.lastStartTimeStamp = startTickTime;
    this.lastTimeStamp = Date.now();

    requestAnimationFrame(this.tick);
  };
}

const lazyTaskManager = new LazyTaskManager();
export default lazyTaskManager;
