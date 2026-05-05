const config = {
  storageKey: 'memoryLog',
  fileNameKey: 'memoryLogFile',
  donePrompt: 'done!',
  phasesOfDay: ['night', 'evening', 'morning', 'afternoon'],
  seasonEndMonths: ['february', 'may', 'august', 'november'],
  monthLengths: {
    january: 31,
    february: 28,
    march: 31,
    april: 30,
    may: 31,
    june: 30,
    july: 31,
    august: 31,
    september: 30,
    october: 31,
    november: 30,
    december: 31
  },
};

const state = {
  fileName: localStorage.getItem(config.fileNameKey) || 'memoryLog.txt',
  toDoList: [],
};

if (localStorage.getItem(config.storageKey)) {
  document.getElementById("useSavedTextButton").style.display = "inline-block";
}

const now = new Date();
const hour = now.getHours();
const day = now.getDate();
const week = getWeekOfYear(now);
const monthName = (now.toLocaleString('default', { month: 'long' })).toLowerCase();
const year = now.getFullYear();

function getWeekOfYear(date = new Date()) {
  const timestamp1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const timestamp2 = Date.UTC(date.getFullYear(), 0, 0);
  const differenceInMilliseconds = timestamp1 - timestamp2;
  return differenceInMilliseconds / 1000 / 60 / 60 / 24 / 7;
}

function getToDoList() {
  let toDoList = [];
  if (week > 50) {
    toDoList.push(String(year));
  }
  if (day > 20) {
    if (monthName === 'february') toDoList.push('winter');
    if (monthName === 'may') toDoList.push('spring');
    if (monthName === 'august') toDoList.push('summer');
    if (monthName === 'november') toDoList.push('autumn');
  }
  if (day > Math.floor(config.monthLengths[monthName] * .9)) {
    toDoList.push(monthName);
  }
  if ((week - Math.floor(week)) > 0.8) {
    toDoList.push('week');
  }
  if (hour > 14) {
    toDoList.push('day');
  }
  if (hour < 6) toDoList.push('night');
  else if (hour < 12) toDoList.push('morning');
  else if (hour < 18) toDoList.push('afternoon');
  else if (hour < 24) toDoList.push('evening');

  const rawFileContent = localStorage.getItem(config.storageKey);
  toDoList = toDoList.filter(task => {
    return !rawFileContent.includes(task + ':::');
  });
  return toDoList;
}

function skipFile() {
  localStorage.setItem(config.storageKey, '');
  fileLoaded();
}

function fileLoaded() {
  updateUI('file loaded');
  setTimeout(getNextTask, 100);
}

function getNextTask() {
  state.toDoList = getToDoList();
  let prompt = '';
  if (state.toDoList.length > 0) prompt = state.toDoList[0];
  else {
    prompt = config.donePrompt;
  }
  updateUI('requesting new task', prompt);
}

function log() {
  let rawFileContent = localStorage.getItem(config.storageKey);
  rawFileContent += state.toDoList[0] + ':::' + document.getElementById('entry').value + '\n';
  localStorage.setItem(config.storageKey, rawFileContent);
  getNextTask();
}

function getTaskType() {
  if (config.phasesOfDay.includes(state.toDoList[0])) return 'phaseOfDay';
  else if (config.seasonEndMonths.includes(state.toDoList[0])) return 'season';
  else return state.toDoList[0];
}

function updateUI(state, prompt) {
  if (state === 'file loaded') {
    document.getElementById('fileInputButton').style.display = "none";
    document.getElementById('skipFileButton').style.display = "none";
    document.getElementById('useSavedTextButton').style.display = "none";
  }
  else if (state === 'requesting new task') {
    if (prompt === config.donePrompt) {
      document.getElementById('getNextTask').style.display = 'none';
      document.getElementById('entry').value = prompt;
    }
    else {
      document.getElementById('getNextTask').style.display = "inline-block";
      document.getElementById('entry').value = 'the ' + prompt + ' ';
    }
  }
}




function renderTask(messages) {
  const listContainer = document.getElementById("currentTask");
  listContainer.innerHTML = "";

  const fragment = document.createDocumentFragment();
  messages.forEach((item) => {
    let li = document.createElement("li");
    li.innerText = item;
    fragment.prepend(li);
  });
  listContainer.appendChild(fragment);
}