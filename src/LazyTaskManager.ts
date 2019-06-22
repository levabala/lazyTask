import { LazyTask } from "./LazyTask";

const requestTickCallback =
  // (window as any).requestIdleCallback || window.requestAnimationFrame;
  window.requestAnimationFrame;

// console.log(requestTickCallback);

class LazyTaskManager {
  public durationHistoryMaxLength = 15;
  public durationHistory: number[] = [];
  public lastTickDuration: number = 0;
  public taskStacks: LazyTask[][] = [[]];
  public tasksSuspended: LazyTask[] = [];
  public lastTimeStamp?: number = undefined;
  public lastStartTimeStamp?: number = undefined;
  public tickLimit: number;
  public destructCheckBlockSize: number;
  public tasksPerformedLastTick: number = 0;
  public tasksDestructed: number = 0;
  public tasksCounter = 0;

  public tasksExecuted: { [taskName: string]: number } = {};

  public launch(
    tickLimit = 30,
    destructCheckInterval = 1000,
    destructCheckBlockSize = 100
  ) {
    this.tickLimit = tickLimit;
    this.destructCheckBlockSize = destructCheckBlockSize;

    requestTickCallback(this.tick);

    const tryToDestructPeriodically = async () => {
      await this.tryToDestructTasks();
      setTimeout(() => tryToDestructPeriodically(), destructCheckInterval);
    };

    tryToDestructPeriodically();
  }

  public async tryToDestructTasks() {
    (() => {
      let lastCheckedIndex = 0;
      const taskIdsToDestruct: number[] = [];
      const blocksCount = Math.floor(
        this.tasksSuspended.length / this.destructCheckBlockSize
      );

      const blockTasks = new Array(blocksCount).fill(null).map(
        () =>
          new LazyTask({
            func: () => {
              let left = this.destructCheckBlockSize;
              while (
                lastCheckedIndex < this.tasksSuspended.length - 1 &&
                --left > 0
              ) {
                const nowCheckIndex = ++lastCheckedIndex;
                const task = this.tasksSuspended[nowCheckIndex];
                if (task.shouldBeDestructed()) taskIdsToDestruct.push(task.id);
              }
            }

            // console.log("assume ids to destruct");
          })
      );

      const finalTask = new LazyTask({
        func: () => {
          const newSuspended = this.tasksSuspended.filter(
            task => !taskIdsToDestruct.includes(task.id)
          );
          this.tasksSuspended = newSuspended;
          this.tasksDestructed += taskIdsToDestruct.length;

          // console.log("do destruction");
        }
      });

      const allTasksToDo = [finalTask, ...blockTasks];
      allTasksToDo.forEach(task => this.addTask(task));
    })();
  }

  public printStats() {
    const maxLeft = Object.keys(this.tasksExecuted).reduce((acc, val) =>
      acc.length > val.length ? acc : val
    );

    console.log(
      Object.entries(this.tasksExecuted)
        .map(
          ([taskName, executes]) =>
            `${taskName.padEnd(maxLeft.length)}: ${executes}`
        )
        .join("\n")
    );
  }

  public async addFunc(func: () => any, firstInStack = false): Promise<any> {
    const task = new LazyTask({ func });
    await this.addTask(task, firstInStack);
  }

  public async addTask(task: LazyTask, firstInStack = false): Promise<any> {
    if (!(task.prority in this.taskStacks)) this.taskStacks[task.prority] = [];

    if (!(task.name in this.tasksExecuted)) this.tasksExecuted[task.name] = 1;
    else this.tasksExecuted[task.name]++;

    task.setId(this.tasksCounter++);
    if (firstInStack) this.taskStacks[task.prority].unshift(task);
    else this.taskStacks[task.prority].push(task);

    return new Promise(resolve => {
      task.then(result => resolve(result));
    });
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
    // performance.mark("lazytick-start");

    const startTickTime = Date.now();
    requestTickCallback(this.tick);

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

    // performance.mark("lazytick-while-start");
    while (Date.now() - this.lastTimeStamp < this.tickLimit) {
      if (currentStack.length) {
        lastTask = currentStack.pop() as LazyTask;

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
        let wasSmthExecuted = false;
        // for (let i = this.tasksSuspended.length - 1; i >= 0; i--)
        for (let i = 0; i < this.tasksSuspended.length; i++)
          if (this.tasksSuspended[i].readyToBeExecuted()) {
            const task = this.tasksSuspended.splice(i, 1)[0];
            this.executeTask(task);
            counter++;

            wasSmthExecuted = true;

            break;
          }

        if (wasSmthExecuted) continue;
      }

      // if both stacks are empty
      break;
    }
    // performance.mark("lazytick-while-end");

    this.tasksSuspended = this.tasksSuspended.concat(newSuspended);

    this.tasksPerformedLastTick = counter;

    this.lastStartTimeStamp = startTickTime;
    this.lastTimeStamp = Date.now();

    // performance.mark("lazytick-end");
    // performance.measure("lazytick", "lazytick-start", "lazytick-end");
    // performance.measure(
    //   "lazytick-while",
    //   "lazytick-while-start",
    //   "lazytick-while-end"
    // );
  };
}

const lazyTaskManager = new LazyTaskManager();
export default lazyTaskManager;
