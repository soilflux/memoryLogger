const config = {
  storageKey: 'memoryLog',
  fileNameKey: 'memoryLogFile',
  fileIsDeletable: false,
  donePrompt: 'done!',
  phasesOfDay: ['night', 'evening', 'morning', 'afternoon'],
  seasons: ['spring', 'summer', 'autumn', 'winter'],
  seasonEndMonths: ['february', 'may', 'august', 'november'],
  springMonths: ['march', 'april', 'may'],
  summerMonths: ['june', 'july', 'august'],
  autumnMonths: ['september', 'october', 'november'],
  winterMonths: ['december', 'january', 'february'],
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
  storableToDoList: [],
  entry: '',
  entryType: '',
};

if (localStorage.getItem(config.storageKey)) {
  document.getElementById("useSavedTextButton").style.display = "inline-block";
  config.fileIsDeletable = true;
}

const skipFileButton = document.getElementById('skipFileButton');
skipFileButton.addEventListener('mousedown', function () {
  const userConfirmed = config.fileIsDeletable ? confirm("Are you sure? This will wipe your stored file.") : true;
  if (userConfirmed) {
    localStorage.setItem(config.storageKey, '');
    fileLoaded();
  }
});

const now = new Date();
const hour = now.getHours();
const day = now.getDate();
const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
const week = getWeekOfYear(now);
const monthName = (now.toLocaleString('default', { month: 'long' })).toLowerCase();
const year = now.getFullYear();
const weekOfYear = countSaturdays();

function countSaturdays() {
  let count = 0;
  let startDate = new Date(year, 0, 1);

  while (startDate <= now) {
    if (startDate.getDay() === 6) { // 6 is Saturday
      count++;
    }
    startDate.setDate(startDate.getDate() + 1);
  }
  return count;
}

function getWeekOfYear(date = new Date()) {
  const timestamp1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const timestamp2 = Date.UTC(date.getFullYear(), 0, 0);
  const differenceInMilliseconds = timestamp1 - timestamp2;
  return differenceInMilliseconds / 1000 / 60 / 60 / 24 / 7;
}

function updateToDoList() {
  const toDoList = [];
  if (hour < 6) toDoList.push('night');
  else if (hour < 12) toDoList.push('morning');
  else if (hour < 18) toDoList.push('afternoon');
  else if (hour < 24) toDoList.push('evening');
  if (hour > 13.5) {
    toDoList.push('day');
  }
  if ((dayName === 'sunday' || dayName === 'saturday')) {
    toDoList.push('week');
  }
  if (day > Math.floor(config.monthLengths[monthName] * .9)) {
    toDoList.push('month');
  }
  if (day > 20) {
    if (monthName === 'february') toDoList.push('winter');
    if (monthName === 'may') toDoList.push('spring');
    if (monthName === 'august') toDoList.push('summer');
    if (monthName === 'november') toDoList.push('autumn');
  }
  if (week > 50) {
    toDoList.push(String(year));
  }


  const storableToDoList = getStorableToDoList(toDoList);
  const rawFileContent = localStorage.getItem(config.storageKey);

  state.storableToDoList = storableToDoList.filter((task, index) => {
    return (!rawFileContent.includes(task + ':::') || config.phasesOfDay.includes(toDoList[index]));
  });
  console.log(state.storableToDoList);

  state.toDoList = [];
  storableToDoList.forEach((task, index) => {
    if (!rawFileContent.includes(task + ':::') || config.phasesOfDay.includes(toDoList[index])) state.toDoList.push(toDoList[index]);
  });
}

function getStorableToDoList(toDoList) {
  return toDoList.map(task => {
    if (config.phasesOfDay.includes(task)) return year + '-' + monthName + day + task;
    else if (task === 'day') return year + 'week' + weekOfYear + '-' + monthName + ' ' + day;
    else if (task === 'week') return getSeason(monthName) + year + '-week' + weekOfYear;
    else if (task === 'month') return getSeason(monthName) + year + '--' + monthName;
    else if (config.seasons.includes(task)) return year + '--' + task;
    else return task;
  });
}

function getSeason(monthName) {
  if (config.springMonths.includes(monthName)) return 'spring';
  else if (config.summerMonths.includes(monthName)) return 'summer';
  else if (config.autumnMonths.includes(monthName)) return 'autumn';
  else if (config.winterMonths.includes(monthName)) return 'winter';
}

function fileLoaded() {
  updateUI('file loaded');
  setTimeout(getNextTask, 100);
}

function getNextTask() {
  updateToDoList();
  updateUI('requesting new task', state.toDoList[0]);
  let prompt = '';
  if (state.toDoList.length > 1) prompt = state.toDoList[1];
  else {
    prompt = config.donePrompt;
  }
  updateUI('requesting new task', prompt);
}

['shortTermEntry', 'longTermEntry'].forEach(id => {
  const field = document.getElementById(id);
  field.addEventListener('input', (event) => {
    state.entry = event.target.value;
    state.entryType = event.target.id;
  });
});

function log() {
  let rawFileContent = localStorage.getItem(config.storageKey);
  const index = state.entryType === 'shortTermEntry' ? 0 : 1;
  rawFileContent += state.storableToDoList[index] + ':::' + state.entry + '\n';
  localStorage.setItem(config.storageKey, rawFileContent);
  getNextTask();
}

function getTaskType() {
  if (config.phasesOfDay.includes(state.toDoList[0])) return 'phaseOfDay';
  else if (config.seasonEndMonths.includes(state.toDoList[0])) return 'season';
  else return state.toDoList[0];
}

function getTaskContext(prompt) {
  const rawFileContent = localStorage.getItem(config.storageKey);
  let searchTerm = '';
  if (prompt === config.donePrompt) return '';
  else if (prompt === 'day') searchTerm = year + '-' + monthName + day;
  else if (prompt === 'week') searchTerm = year + 'week' + weekOfYear;
  else if (prompt === 'month') searchTerm = '-' + monthName + ' ';
  else if (config.seasons.includes(prompt)) searchTerm = getSeason(monthName) + year;
  else searchTerm = year + '--';
  return rawFileContent
    .split(/\r?\n/)
    .filter(line => line.includes(searchTerm))
    .map(line => line.replace(/^.*:::/, '').trim())
    .join('\n');
}

function updateUI(state, prompt) {
  if (state === 'file loaded') {
    document.getElementById('fileInputButton').style.display = "none";
    document.getElementById('skipFileButton').style.display = "none";
    document.getElementById('useSavedTextButton').style.display = "none";
    document.getElementById('getNextTask').style.display = "inline-block";
  }
  else if (state === 'requesting new task') {
    const entryId = config.phasesOfDay.includes(prompt) ? 'shortTermEntry' : 'longTermEntry';

    if (prompt === config.donePrompt) document.getElementById(entryId).value = prompt;
    else document.getElementById(entryId).value = 'the ' + prompt + ' ';

    if (entryId === 'longTermEntry') document.getElementById('taskContext').innerText = getTaskContext(prompt);
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