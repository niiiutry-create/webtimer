// ==================== タブ切り替え ====================
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));

  document.querySelector(`.tab[onclick="switchTab('${name}')"]`).classList.add('active');
  document.getElementById(name).classList.remove('hidden');
}

// ==================== ストップウォッチ ====================
let swRunning = false;
let swStartTime = 0;
let swElapsed = 0;
let swTimer = null;
let swLapCount = 0;
let swLastLapTime = 0;

function swFormat(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centisecs = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centisecs).padStart(2, '0')}`;
}

function swUpdate() {
  const now = Date.now();
  swElapsed = swStartTime ? (now - swStartTime) : swElapsed;
  document.getElementById('sw-display').textContent = swFormat(
    swStartTime ? (now - swStartTime + (swElapsed - (now - swStartTime))) : swElapsed
  );
  // 正確な経過時間
  const total = swStartTime ? (now - swStartTime) : 0;
  document.getElementById('sw-display').textContent = swFormat(swElapsed + total - (swStartTime ? (now - swStartTime) : 0));
}

// シンプルな実装に整理
let swBaseElapsed = 0;

function swTick() {
  const current = swBaseElapsed + (Date.now() - swStartTime);
  document.getElementById('sw-display').textContent = swFormat(current);
}

function swStartStop() {
  const btn = document.getElementById('sw-start-btn');
  if (!swRunning) {
    swStartTime = Date.now();
    swTimer = setInterval(swTick, 10);
    swRunning = true;
    btn.textContent = 'ストップ';
    btn.classList.add('running');
  } else {
    clearInterval(swTimer);
    swBaseElapsed += Date.now() - swStartTime;
    swRunning = false;
    btn.textContent = 'スタート';
    btn.classList.remove('running');
  }
}

function swReset() {
  clearInterval(swTimer);
  swRunning = false;
  swBaseElapsed = 0;
  swStartTime = 0;
  swLapCount = 0;
  swLastLapTime = 0;
  document.getElementById('sw-display').textContent = '00:00.00';
  document.getElementById('sw-laps').innerHTML = '';
  const btn = document.getElementById('sw-start-btn');
  btn.textContent = 'スタート';
  btn.classList.remove('running');
}

function swLap() {
  if (!swRunning) return;
  const current = swBaseElapsed + (Date.now() - swStartTime);
  const lapTime = current - swLastLapTime;
  swLastLapTime = current;
  swLapCount++;

  const lapsEl = document.getElementById('sw-laps');
  const item = document.createElement('div');
  item.className = 'lap-item';
  item.innerHTML = `<span>Lap ${swLapCount}</span><span>${swFormat(lapTime)}</span><span>${swFormat(current)}</span>`;
  lapsEl.insertBefore(item, lapsEl.firstChild);
}

// ==================== カウントダウン ====================
let cdRunning = false;
let cdStartTime = 0;
let cdTotalMs = 0;
let cdRemainingMs = 0;
let cdTimer = null;

function cdGetInputMs() {
  const h = parseInt(document.getElementById('cd-hours').value) || 0;
  const m = parseInt(document.getElementById('cd-minutes').value) || 0;
  const s = parseInt(document.getElementById('cd-seconds').value) || 0;
  return (h * 3600 + m * 60 + s) * 1000;
}

function cdFormat(ms) {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function cdTick() {
  const elapsed = Date.now() - cdStartTime;
  const remaining = Math.max(0, cdRemainingMs - elapsed);
  document.getElementById('cd-display').textContent = cdFormat(remaining);

  const pct = cdTotalMs > 0 ? (remaining / cdTotalMs) * 100 : 0;
  document.getElementById('cd-progress-bar').style.width = pct + '%';

  if (remaining <= 0) {
    cdFinish();
  }
}

function cdFinish() {
  clearInterval(cdTimer);
  cdRunning = false;
  const btn = document.getElementById('cd-start-btn');
  btn.textContent = 'スタート';
  btn.classList.remove('running');

  const display = document.getElementById('cd-display');
  display.classList.add('finished');
  setTimeout(() => display.classList.remove('finished'), 3500);

  // 通知
  if (Notification.permission === 'granted') {
    new Notification('タイマー終了', { body: '設定した時間が経過しました！' });
  }
}

function cdStartStop() {
  const btn = document.getElementById('cd-start-btn');

  if (!cdRunning) {
    if (cdRemainingMs === 0) {
      // 初回スタート
      cdTotalMs = cdGetInputMs();
      if (cdTotalMs <= 0) return;
      cdRemainingMs = cdTotalMs;

      // 入力欄を非表示にして表示に切り替え
      document.getElementById('cd-input-area').classList.add('hidden');
      document.getElementById('cd-display').classList.remove('hidden');
      document.getElementById('cd-progress-wrapper').classList.remove('hidden');
      document.getElementById('cd-display').textContent = cdFormat(cdRemainingMs);
      document.getElementById('cd-progress-bar').style.width = '100%';

      // 通知許可リクエスト
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    cdStartTime = Date.now();
    cdTimer = setInterval(cdTick, 100);
    cdRunning = true;
    btn.textContent = 'ストップ';
    btn.classList.add('running');
  } else {
    // 一時停止
    clearInterval(cdTimer);
    cdRemainingMs = Math.max(0, cdRemainingMs - (Date.now() - cdStartTime));
    cdRunning = false;
    btn.textContent = 'スタート';
    btn.classList.remove('running');
  }
}

function cdReset() {
  clearInterval(cdTimer);
  cdRunning = false;
  cdRemainingMs = 0;
  cdTotalMs = 0;

  document.getElementById('cd-input-area').classList.remove('hidden');
  document.getElementById('cd-display').classList.add('hidden');
  document.getElementById('cd-progress-wrapper').classList.add('hidden');
  document.getElementById('cd-display').classList.remove('finished');

  const btn = document.getElementById('cd-start-btn');
  btn.textContent = 'スタート';
  btn.classList.remove('running');
}
