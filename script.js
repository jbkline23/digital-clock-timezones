const STORAGE_KEY = 'world-clock-timezones';
const defaultZones = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney'
];

const timezoneSelect = document.getElementById('timezoneSelect');
const addTimezoneBtn = document.getElementById('addTimezoneBtn');
const clockGrid = document.getElementById('clockGrid');

const allTimeZones = [
  'UTC',
  'Africa/Abidjan',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'America/Chicago',
  'America/Los_Angeles',
  'America/New_York',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'Pacific/Auckland',
  'Pacific/Honolulu'
];

function getSavedZones() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [...defaultZones];

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse saved timezones:', error);
  }

  return [...defaultZones];
}

function saveZones(zones) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

function formatTimeZoneLabel(zone) {
  const parts = zone.split('/');
  if (parts.length === 2) {
    return parts[1].replace(/_/g, ' ');
  }

  return zone.replace(/_/g, ' ');
}

function getZoneInfo(timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  const parts = formatter.formatToParts(new Date());
  const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));

  const time = `${map.hour}:${map.minute}:${map.second}`;
  const date = `${map.month} ${map.day}, ${map.year}`;
  const tzName = map.timeZoneName || 'UTC';

  return {
    time,
    date,
    tzName
  };
}

function renderSelectOptions() {
  timezoneSelect.innerHTML = '';

  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Select a timezone';
  timezoneSelect.appendChild(placeholderOption);

  allTimeZones.forEach((zone) => {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = zone;
    timezoneSelect.appendChild(option);
  });
}

function renderClocks() {
  const zones = getSavedZones();
  clockGrid.innerHTML = '';

  zones.forEach((zone) => {
    const card = document.createElement('article');
    card.className = 'clock-card';

    const info = getZoneInfo(zone);
    const displayName = formatTimeZoneLabel(zone);

    const header = document.createElement('div');
    header.className = 'clock-header';

    const labelGroup = document.createElement('div');
    labelGroup.className = 'label-group';

    const city = document.createElement('p');
    city.className = 'city-name';
    city.textContent = displayName;

    const timezone = document.createElement('span');
    timezone.className = 'timezone-name';
    timezone.textContent = zone;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.setAttribute('aria-label', `Remove ${zone}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      const currentZones = getSavedZones();
      const nextZones = currentZones.filter((item) => item !== zone);

      if (nextZones.length === 0) {
        saveZones([...defaultZones]);
      } else {
        saveZones(nextZones);
      }

      renderClocks();
    });

    labelGroup.append(city, timezone);
    header.append(labelGroup, removeBtn);

    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = info.time;

    const date = document.createElement('p');
    date.className = 'date';
    date.textContent = info.date;

    const gmt = document.createElement('span');
    gmt.className = 'gmt';
    gmt.textContent = info.tzName;

    card.append(header, time, date, gmt);
    clockGrid.appendChild(card);
  });
}

function updateTime() {
  const zones = getSavedZones();
  const cards = Array.from(document.querySelectorAll('.clock-card'));

  cards.forEach((card, index) => {
    const zone = zones[index];
    if (!zone) return;

    const info = getZoneInfo(zone);
    const timeNode = card.querySelector('.time');
    const dateNode = card.querySelector('.date');
    const gmtNode = card.querySelector('.gmt');

    if (timeNode) timeNode.textContent = info.time;
    if (dateNode) dateNode.textContent = info.date;
    if (gmtNode) gmtNode.textContent = info.tzName;
  });
}

function addSelectedTimezone() {
  const selectedZone = timezoneSelect.value;
  if (!selectedZone) return;

  const currentZones = getSavedZones();
  if (!currentZones.includes(selectedZone)) {
    const nextZones = [...currentZones, selectedZone];
    saveZones(nextZones);
    timezoneSelect.value = '';
    renderClocks();
  }
}

renderSelectOptions();
renderClocks();
setInterval(updateTime, 1000);
addTimezoneBtn.addEventListener('click', addSelectedTimezone);
