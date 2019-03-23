import { LazyTask } from './LazyTask';
import LazyTaskManager from './LazyTaskManager';

LazyTaskManager.launch();

// task test
const mediumFunc = () => {
  const arr = [];
  for (let i = 0; i < 100000; i++) arr.push(i);

  return arr.reduce((acc, val) => acc + val, 0);
};

const hardFunc = () => {
  const arr = [];
  for (let i = 0; i < 100000; i++) arr.push(i);

  return arr.reduce((acc, val) => acc + val, 0);
};

for (let i = 0; i < 3000; i++)
  LazyTaskManager.addTask(new LazyTask(mediumFunc));

// fps meter
const textBoxFps = document.getElementById("textBoxFps") as HTMLInputElement;
const durationHistory: number[] = [];
let absMax = 0;
setInterval(() => {
  durationHistory.push(LazyTaskManager.lastTickDuration);
  if (durationHistory.length > 15) durationHistory.shift();

  const average =
    durationHistory.reduce((acc, val) => acc + val, 0) / durationHistory.length;

  const max = Math.max(...durationHistory);
  const median = durationHistory.map(a => a).sort()[
    Math.floor(durationHistory.length / 2)
  ];

  absMax = Math.max(absMax, max);

  const processor = (val: number) =>
    Math.floor(val)
      .toString()
      .padEnd(4);
  const s = [average, median, max, absMax].map(processor);

  textBoxFps.value = `last/median/max/maxG : ${s.join(" ")}`;
}, 100);

// random stress load
function runStress() {
  mediumFunc();

  setTimeout(() => runStress(), 10 + Math.random() * 100);
}

function runHardStress() {
  hardFunc();

  setTimeout(() => runHardStress(), 100 + Math.random() * 500);
}

runStress();
runHardStress();
