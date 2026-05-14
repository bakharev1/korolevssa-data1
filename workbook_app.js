var LISTEN_DATA = window.WB_LD || {};

const C=['#2EC4B6','#FF9F1C','#FF6B9D','#44BBA4','#9B5DE5','#118AB2','#E63946','#FF9F1C'];
const CHARS=['officer','recep','waiter','barista','shop','taxi','doctor','guide','interviewer','officer','airbnb','police','banker','recep','waiter','barista','shop','taxi','doctor','guide','interviewer','officer','airbnb','police','banker','recep','waiter','barista'];

var T = window.WB_T || [];

let cur = 1;
const QS = {};
const TS = {};

const LSKEY = 'korolevssa_wb3';

function lsSave() {
  try {
    const data = { v: 1, quiz: {}, tips: Object.assign({}, seenTips) };
    Object.keys(QS).forEach(n => {
      const s = QS[n];
      if (!s) return;
      data.quiz[n] = { known: [...s.known], learning: [...s.learning], cur: s.cur };
    });
    localStorage.setItem(LSKEY, JSON.stringify(data));
  } catch(e) {}
  updateDashboard();
}

function lsLoad() {
  try {
    const raw = localStorage.getItem(LSKEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return;
    if (data.quiz) {
      Object.keys(data.quiz).forEach(n => {
        const ni = parseInt(n), d = data.quiz[n], topic = T[ni - 1];
        if (!topic) return;
        QS[ni] = {
          cards: topic.vocab.slice(),
          cur: Math.min(d.cur || 0, topic.vocab.length - 1),
          flipped: false,
          known: new Set(d.known || []),
          learning: new Set(d.learning || [])
        };
      });
    }
    if (data.tips) Object.assign(seenTips, data.tips);
  } catch(e) {}
}

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  window.scrollTo(0, 0);
  if (id === 'hub')     ttShow('hub');
  if (id === 'cover')   ttShow('cover');
  if (id === 'answers') ttShow('answers_key');
}

function showSub(name) {
  document.querySelectorAll('.sub').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
  const subEl = document.getElementById('sub-' + name);
  const tabEl = document.getElementById('tab-' + name);
  if (subEl) subEl.classList.add('on');
  if (tabEl) tabEl.classList.add('on');
  ttShow(name);
  if (name === 'quiz')   { ttShow('quiz');  const s = QS[cur]; if (s && s.known.size > 0 && !seenTips['test_unlock']) setTimeout(() => ttShow('test_unlock'), 2500); }
  if (name === 'vocab')  { setTimeout(()=>ttShow('vocab'), 600); setTimeout(()=>ttShow('first_word'), 4000); }
  if (name === 'card')   { ttShow('card'); }
  if (name === 'tasks')  { ttShow('tasks'); }
  if (name === 'test')   { ttShow('test'); }
  if (name === 'listen') { ttShow('listen'); }
}

function openTopic(n) {
  cur = n;
  const t = T[n - 1];
  document.getElementById('tpage-title').textContent = t.ru;
  document.getElementById('nav-prog').textContent = 'Тема ' + n + ' / ' + T.length;
  buildVocab(t);
  buildCard(t);
  buildTasks(t);
  buildListen(t);
  buildQuiz(t);
  buildTest(t);
  updateBadge(n);
  showSub('vocab');
  go('tpage');
}

function nextTopic() {
  openTopic(cur < T.length ? cur + 1 : 1);
}

function safeAttr(s){ return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function buildVocab(t) {
  const el = document.getElementById('sub-vocab');
  el.innerHTML =
    '<div class="vocab-hd"><h2>📚 ' + t.ru + '</h2>' +
    '<div class="vocab-en-tag">' + t.en + '</div></div>' +
    '<div class="intro-box">' + t.intro + '</div>' +
    '<div style="display:flex;align-items:center;gap:8px;background:var(--bl);border:2px solid var(--b);border-radius:10px;padding:9px 14px;margin-bottom:12px;font-family:Montserrat,sans-serif;font-size:14px;font-weight:600;color:var(--b)">' +
      '<span>🔊</span><span>Нажми на любую карточку — услышишь произношение и увидишь транскрипцию</span>' +
    '</div>' +
    '<div class="vocab-grid">' +
    t.vocab.map(v =>
      '<div class="vi" data-en="' + safeAttr(v[0]) + '" data-ru="' + safeAttr(v[1]) + '" onclick="openWordModal(this)" title="Нажми — транскрипция и произношение">' +
      '<span class="vi-listen-icon">🔊</span>' +
      '<div class="vi-en">' + v[0] + '</div>' +
      '<div class="vi-ru">' + v[1] + '</div></div>'
    ).join('') +
    '</div>';
}

function buildCard(t) {
  const ci = (t.n - 1) % 8;
  const ACCS = ['#2EC4B6','#FF9F1C','#FF6B9D','#44BBA4','#9B5DE5','#118AB2','#E63946','#FF9F1C'];
  const LITS = ['var(--tl)','var(--ol)','var(--pl)','var(--gl)','var(--pul)','var(--bl)','var(--rl)','var(--tl)'];
  const acc = ACCS[ci], lit = LITS[ci];
  const el = document.getElementById('sub-card');

  let exHtml = '';
  t.qs.forEach((q, i) => {
    const sid = 'fa' + t.n + '_' + i;
    const ans = t.ans[i] || '';
    exHtml +=
      '<div class="flow-arrow-down">↓</div>' +
      '<div class="flow-exchange">' +
        '<div class="flow-q-card">' +
          '<div class="flow-q-num">Вопрос ' + (i+1) + '</div>' +
          '<div class="flow-q-en">' + q[0] + '</div>' +
          '<div class="flow-q-ru">🇷🇺 ' + q[1] + '</div>' +
        '</div>' +
        '<div class="flow-mid-arrow">→</div>' +
        '<div class="flow-ans-card" style="text-align:left">' +
          '<div class="flow-ans-icon" style="text-align:center">💬</div>' +
          '<div class="flow-practice-label" style="font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">✏️ Напиши свой ответ:</div>' +
          '<textarea class="flow-practice-textarea" placeholder="Твой ответ на английском…"></textarea>' +
          (ans ? '<button class="flow-reveal-btn" style="margin-top:8px" onclick="faToggle(\'' + sid + '\',this)">👁 Показать пример</button>' +
                 '<div class="flow-ans-sample" id="' + sid + '"><b>🇺🇸 Пример:</b>' + ans + '</div>' : '') +
        '</div>' +
      '</div>';
  });

  el.innerHTML =
    '<div class="flow-wrap">' +
      '<div class="flow-page-title"><h2>🗺️ Жизненная ситуация</h2></div>' +
      '<div class="flow-scene-box"><div class="flow-scene-label">📍 Место действия</div>' + t.scene + '</div>' +
      '<div class="flow-arrow-down">↓</div>' +
      '<div class="flow-char-box" style="background:' + lit + ';border-color:' + acc + ';box-shadow:5px 5px 0 ' + acc + '">' +
        '<div class="flow-char-name" style="color:' + acc + '">👤 ' + t.charRu + '</div>' +
        '<div class="flow-char-sub">' + t.charEn + '</div>' +
      '</div>' +
      '<div class="flow-section-divider"><div class="flow-sdiv-line"></div>' +
      '<div class="flow-sdiv-label">🔄 Разговор</div><div class="flow-sdiv-line"></div></div>' +
      exHtml +
      '<div class="flow-arrow-down">↓</div>' +
      '<div class="flow-tip-box"><div class="flow-tip-header">🇺🇸 Совет Алана · Калифорния</div>' + t.alan + '</div>' +
    '</div>';
}

function faToggle(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  const open = el.classList.toggle('open');
  btn.textContent = open ? '🙈 Скрыть' : '👁 Показать пример';
}

function buildQuiz(t) {
  const n = t.n;
  if (!QS[n]) {
    QS[n] = { cards: t.vocab.slice(), cur: 0, flipped: false, known: new Set(), learning: new Set() };
  } else {
    QS[n].flipped = false;
  }
  renderQuiz(n);
}

function renderQuiz(n) {
  const el = document.getElementById('sub-quiz');
  if (!el) return;
  const s = QS[n];
  if (!s) { el.innerHTML = ''; return; }
  const total = s.cards.length;
  const idx = s.cur;
  const card = s.cards[idx];
  const prog = Math.round(((idx + 1) / total) * 100);
  const isK = s.known.has(idx), isL = s.learning.has(idx);
  const badge = isK ? '✅' : isL ? '🔄' : '';

  el.innerHTML =
    '<div class="quiz-wrap">' +
      '<div class="quiz-hd"><h2>🃏 Карточки</h2>' +
      '<div class="quiz-counter">Карточка ' + (idx+1) + ' / ' + total + '</div>' +
      '<div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:' + prog + '%"></div></div>' +
      '<div class="quiz-legend-mini">' +
        '<span class="ql-k">✅ ' + s.known.size + '</span>' +
        '<span class="ql-l">🔄 ' + s.learning.size + '</span>' +
        '<span class="ql-u">⬜ ' + (total - s.known.size - s.learning.size) + '</span>' +
      '</div></div>' +

      '<div class="qcard-scene">' +
        '<div class="qcard" onclick="qFlip(' + n + ')">' +
          '<div class="qcard-inner' + (s.flipped ? ' flipped' : '') + '" id="qci' + n + '">' +
            '<div class="qcard-front">' +
              (badge ? '<div class="qcard-status-badge">' + badge + '</div>' : '') +
              '<div class="qcard-en-word">' + card[0] + '</div>' +
              '<div class="qcard-tap-hint">👆 Нажми — увидишь перевод</div>' +
            '</div>' +
            '<div class="qcard-back">' +
              (badge ? '<div class="qcard-status-badge">' + badge + '</div>' : '') +
              '<div class="qcard-ru-word">' + card[1].split(' · ')[0] + '</div>' + (card[1].includes(' · ') ? '<div style="font-size:14px;color:#888;font-family:Montserrat,sans-serif;margin-top:6px;font-style:italic">' + card[1].split(' · ').slice(1).join(' · ') + '</div>' : '') +
              '<div class="qcard-en-small">' + card[0] + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="quiz-action-row">' +
        '<button class="btn btn-learn" onclick="qMark(' + n + ',0)">🔄 Учу ещё</button>' +
        '<button class="btn btn-know" onclick="qMark(' + n + ',1)">✅ Знаю!</button>' +
      '</div>' +
      '<div class="quiz-nav-row">' +
        '<button class="btn btn-sm" style="background:#fff" onclick="qNav(' + n + ',-1)">← Назад</button>' +
        '<button class="btn btn-sm btn-ink" onclick="qFlip(' + n + ')">🔀 Flip</button>' +
        '<button class="btn btn-sm btn-o" onclick="qNav(' + n + ',1)">Вперёд →</button>' +
      '</div>' +
      '<div class="quiz-shuffle-row">' +
        '<button class="btn btn-sm" style="background:var(--pul);border-color:var(--pu);color:var(--pu)" onclick="qShuffle(' + n + ')">🔀 Перемешать</button> ' +
        '<button class="btn btn-sm" style="background:var(--rl);border-color:var(--r);color:var(--r)" onclick="qReset(' + n + ')">↺ Сброс</button>' +
      '</div>' +
    '</div>';
}

function qFlip(n) {
  if (!QS[n]) return;
  QS[n].flipped = !QS[n].flipped;
  const el = document.getElementById('qci' + n);
  if (el) el.classList.toggle('flipped', QS[n].flipped);
}

function qNav(n, dir) {
  const s = QS[n]; if (!s) return;
  s.flipped = false;
  s.cur = (s.cur + dir + s.cards.length) % s.cards.length;
  renderQuiz(n);
}

function qMark(n, know) {
  const s = QS[n]; if (!s) return;
  if (know) { s.known.add(s.cur); s.learning.delete(s.cur); }
  else       { s.learning.add(s.cur); s.known.delete(s.cur); }
  s.flipped = false;
  s.cur = (s.cur + 1) % s.cards.length;
  lsSave();
  updateBadge(n);
  renderQuiz(n);
  if (know && s.known.size === 1) setTimeout(() => ttShow('test_unlock'), 1500);
}

function qShuffle(n) {
  const s = QS[n]; if (!s) return;
  const a = s.cards;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  s.cur = 0; s.flipped = false; s.known = new Set(); s.learning = new Set();
  lsSave(); updateBadge(n); renderQuiz(n);
}

function qReset(n) {
  const s = QS[n]; if (!s) return;
  s.cur = 0; s.flipped = false; s.known = new Set(); s.learning = new Set();
  lsSave(); updateBadge(n); renderQuiz(n);
}

function updateBadge(n) {
  const el = document.getElementById('tbadge'); if (!el) return;
  const s = QS[n], k = s ? s.known.size : 0;
  el.style.display = k > 0 ? 'inline' : 'none';
  el.textContent = k;
}

function buildTest(t) {
  const n = typeof t === 'number' ? t : t.n;
  updateBadge(n);
  renderTest(n);
}

function renderTest(n) {
  const el = document.getElementById('sub-test'); if (!el) return;
  const s = QS[n];
  const known = s ? [...s.known] : [];
  const inner = '<div class="test-wrap" id="ti"></div>';
  el.innerHTML = inner;
  const ti = document.getElementById('ti');

  if (known.length === 0) {
    ti.innerHTML =
      '<div class="test-empty">' +
        '<div class="te-icon">🧪</div>' +
        '<h3>Тест пока недоступен</h3>' +
        '<p>Перейди на <b>🃏 Карточки</b> и отметь хотя бы одно слово как <b>✅ Знаю</b>.</p>' +
        '<button class="btn btn-t" style="margin-top:20px" onclick="showSub(\'quiz\')">→ Карточки</button>' +
      '</div>';
    return;
  }

  const ts = TS[n];
  if (!ts || !ts.started) {
    ti.innerHTML =
      '<div class="test-start-screen">' +
        '<div style="font-size:52px;margin-bottom:12px">🧪</div>' +
        '<h3>Проверь себя!</h3>' +
        '<p>Тест из слов, отмеченных <b>✅ Знаю</b>.</p>' +
        '<div class="test-start-stats">' +
          '<div class="tss-item" style="background:var(--gl)"><div class="tss-num">' + known.length + '</div><div class="tss-label">слов</div></div>' +
          '<div class="tss-item" style="background:var(--bl)"><div class="tss-num">' + Math.min(known.length,10) + '</div><div class="tss-label">вопросов</div></div>' +
        '</div>' +
        '<button class="btn btn-o" onclick="startTest(' + n + ')">Начать тест →</button>' +
      '</div>';
    return;
  }

  if (ts.done) { renderTestResult(n); return; }
  renderTestQ(n);
}

function startTest(n) {
  const s = QS[n]; if (!s) return;
  const topic = T[n - 1];
  const knownArr = [...s.known].sort(() => Math.random() - .5).slice(0, 10);
  const allV = topic.vocab;
  const qs = knownArr.map(idx => {
    const correct = s.cards[idx];
    const others = allV.filter(v => v[0] !== correct[0]).sort(() => Math.random() - .5).slice(0, 3);
    const choices = [...others, correct].sort(() => Math.random() - .5);
    return { correct, choices, ci: choices.findIndex(c => c[0] === correct[0]) };
  });
  TS[n] = { started: true, done: false, qs, cur: 0, score: 0, wrong: [], answered: false };
  renderTestQ(n);
}

function renderTestQ(n) {
  const ti = document.getElementById('ti'); if (!ti) return;
  const ts = TS[n]; if (!ts) return;
  const q = ts.qs[ts.cur];
  const total = ts.qs.length;
  const prog = Math.round((ts.cur / total) * 100);

  let choicesHtml = '';
  q.choices.forEach((c, i) => {
    choicesHtml += '<button class="test-choice" id="tc' + i + '" onclick="ansTest(' + n + ',' + i + ')"' +
      (ts.answered ? ' disabled' : '') + '>' + c[0] + '</button>';
  });

  ti.innerHTML =
    '<div class="test-header">' +
      '<span class="test-qnum">Вопрос ' + (ts.cur+1) + '/' + total + '</span>' +
      '<div class="test-prog-bar"><div class="test-prog-fill" style="width:' + prog + '%"></div></div>' +
      '<span class="test-score-live">✅ ' + ts.score + '</span>' +
    '</div>' +
    '<div class="test-prompt-box">' +
      '<div class="test-prompt-label">Выбери перевод:</div>' +
      '<div class="test-prompt-word">' + q.correct[1].split(' · ')[0] + '</div>' +
      '<div class="test-prompt-sub">🇷🇺 → 🇺🇸</div>' +
    '</div>' +
    '<div class="test-choices">' + choicesHtml + '</div>' +
    '<div class="test-feedback" id="tfb"></div>' +
    (ts.answered ?
      '<div style="text-align:center">' +
        '<button class="btn btn-o" onclick="nextTestQ(' + n + ')">' +
          (ts.cur + 1 < total ? 'Далее →' : '🏁 Результаты') +
        '</button>' +
      '</div>' : '');
}

function ansTest(n, idx) {
  const ts = TS[n]; if (!ts || ts.answered) return;
  ts.answered = true;
  const q = ts.qs[ts.cur];
  const ok = idx === q.ci;
  if (ok) ts.score++;
  else ts.wrong.push({ word: q.correct, chosen: q.choices[idx] });
  document.querySelectorAll('.test-choice').forEach((b, i) => {
    b.disabled = true;
    if (i === q.ci) b.classList.add('correct');
    else if (i === idx && !ok) b.classList.add('wrong');
  });
  const fb = document.getElementById('tfb');
  if (fb) {
    fb.className = 'test-feedback ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = ok ? '✅ Верно! <b>' + q.correct[0] + '</b>' : '❌ Нет. Правильно: <b>' + q.correct[0] + '</b>';
  }

  setTimeout(() => renderTestQ(n), 80);
}

function nextTestQ(n) {
  const ts = TS[n]; if (!ts) return;
  ts.cur++; ts.answered = false;
  if (ts.cur >= ts.qs.length) { ts.done = true; renderTestResult(n); }
  else renderTestQ(n);
}

function renderTestResult(n) {
  const ti = document.getElementById('ti'); if (!ti) return;
  const ts = TS[n]; if (!ts) return;
  const total = ts.qs.length;
  const pct = Math.round((ts.score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
  const grade = pct === 100 ? 'Идеально!' : pct >= 80 ? 'Отлично!' : pct >= 60 ? 'Хорошо!' : 'Учи ещё!';


  if (ts.wrong.length > 0 && QS[n]) {
    ts.wrong.forEach(w => {
      const idx = QS[n].cards.findIndex(c => c[0] === w.word[0]);
      if (idx !== -1) { QS[n].learning.add(idx); QS[n].known.delete(idx); }
    });
    lsSave(); updateBadge(n);
  }

  let wrongHtml = ts.wrong.length > 0
    ? '<div class="test-wrong-list"><h4>🔄 Вернулись в «Учу»:</h4>' +
        ts.wrong.map(w => '<div class="test-wrong-item"><b>' + w.chosen[0] + '</b> → правильно: <b>' + w.word[0] + '</b></div>').join('') +
      '</div>'
    : '<div style="background:var(--gl);border:2px solid var(--g);border-radius:12px;padding:12px 16px;margin-top:12px;font-size:17px;color:#155724">🎊 Все слова знаешь!</div>';

  ti.innerHTML =
    '<div class="test-result-screen">' +
      '<div style="font-size:52px;margin-bottom:8px">' + emoji + '</div>' +
      '<h3>' + grade + '</h3>' +
      '<div class="test-result-sub">Тест завершён</div>' +
      '<div class="test-result-score" style="color:' + (pct >= 60 ? 'var(--g)' : 'var(--r)') + '">' + ts.score + '/' + total + '</div>' +
      '<div class="test-result-label">' + pct + '% правильных</div>' +
      '<div class="test-result-stats">' +
        '<div class="trs-box" style="background:var(--gl)"><div class="trs-num">' + ts.score + '</div><div class="trs-label">Верно ✅</div></div>' +
        '<div class="trs-box" style="background:var(--rl)"><div class="trs-num">' + ts.wrong.length + '</div><div class="trs-label">Ошибок ❌</div></div>' +
      '</div>' +
      wrongHtml +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px">' +
        '<button class="btn btn-ink" onclick="TS[' + n + ']=null;renderTest(' + n + ')">↺ Снова</button>' +
        '<button class="btn btn-o" onclick="showSub(\'quiz\')">→ Карточки</button>' +
      '</div>' +
    '</div>';
}

let seenTips = {};
const TIPS = {
  cover:        { icon:'👋', title:'Добро пожаловать!',       body:'Здесь <b>28 тем</b> разговорного английского. Каждая — 30 слов, реальная ситуация и упражнения. Начни с любой темы!' },
  hub:          { icon:'📚', title:'Как выбрать тему?',        body:'Начни с темы, которая нужна прямо сейчас: путешествие, работа, ресторан. Можно изучать в любом порядке.' },
  vocab:        { icon:'🔊', title:'Карточки слов',            body:'<b>Нажми на любое слово</b> — откроется транскрипция и кнопка произношения. Затем переходи на 🃏 <b>Карточки</b>!' },
  quiz:         { icon:'🃏', title:'Как учить слова',          body:'<b>Шаг 1:</b> Нажми карточку — увидишь перевод.<br><b>Шаг 2:</b> Нажми ✅ Знаю или 🔄 Учу ещё.<br><b>Шаг 3:</b> Слова из «Знаю» попадут в тест!' },
  card:         { icon:'🗺️', title:'Живая ситуация',           body:'Читай вопрос, <b>напиши свой ответ</b> в поле, затем нажми 👁 Показать пример — сравни с образцом.' },
  tasks:        { icon:'✏️', title:'Задания',                  body:'<b>Fill in the gaps:</b> впечатай слово в поле. <b>Выбери слово:</b> нажми кнопку из банка, потом «Проверить». Перевод: пиши сам, потом сверяй.' },
  test_unlock:  { icon:'🧪', title:'Тест разблокирован! 🎉',   body:'Ты отметил слова ✅ Знаю — вкладка <b>🧪 Тест</b> стала активной. Проверь, насколько хорошо запомнил!' },
  test:         { icon:'🧠', title:'Как работает тест',        body:'Тебе показывают <b>русский перевод</b> — выбери правильное английское слово. Ошибки вернутся в карточки на повторение.' },
  listen:       { icon:'🎧', title:'Аудирование',              body:'Нажми ▶ Слушать — услышишь диалог. Нажми 📄 Текст, чтобы увидеть транскрипт. Ответь на вопросы ниже.' },
  session:      { icon:'💾', title:'Прогресс сохраняется',     body:'Все результаты хранятся в браузере. При следующем открытии продолжишь с того же места. Дашборд покажет общий прогресс.' },
  first_word:   { icon:'👆', title:'Нажми на слово!',          body:'Нажми на любую карточку слова — откроется окно с транскрипцией и кнопкой произношения женским голосом.' },
  first_quiz:   { icon:'🔄', title:'Отметь слова',            body:'Нажимай ✅ Знаю только когда <em>реально</em> уверен. Сомневаешься? Жми 🔄 Учу ещё — слово вернётся позже.' },
  answers_key:  { icon:'🔑', title:'Ключ ответов',            body:'Здесь образцы ответов для раздела «Сцена». Открывай <b>только после</b> того, как попробовал ответить сам!' },
};

let ttQueue = [];

function ttShow(id) {
  if (!TIPS[id] || seenTips[id]) return;
  ttQueue.push(id);
  if (ttQueue.length === 1) ttNext();
}

function ttNext() {
  if (ttQueue.length === 0) return;
  const id = ttQueue.shift();
  if (seenTips[id]) { ttNext(); return; }
  seenTips[id] = 1;
  lsSave();
  const def = TIPS[id];
  const ov = document.getElementById('tt-overlay');
  if (!ov) return;
  ov.style.display = 'block';
  ov.innerHTML =
    '<div class="tt-bubble" id="ttb">' +
      '<div class="tt-hdr"><span class="tt-icon">' + def.icon + '</span><span class="tt-title">' + def.title + '</span></div>' +
      '<div class="tt-body">' + def.body + '</div>' +
      '<div class="tt-footer">' +
        '<button class="tt-ok" onclick="ttClose()">Понятно 👍</button>' +
        (ttQueue.length > 0 ? '<span class="tt-cnt">+' + ttQueue.length + ' ещё</span>' : '') +
        '<button class="tt-skip" onclick="ttSkipAll()">Скрыть все</button>' +
      '</div>' +
    '</div>';
  clearTimeout(window._ttT);
  window._ttT = setTimeout(ttClose, 12000);
}

function ttClose() {
  clearTimeout(window._ttT);
  const b = document.getElementById('ttb');
  if (b) { b.style.animation = 'ttOut .2s ease forwards'; setTimeout(ttNext, 220); }
  else { const ov = document.getElementById('tt-overlay'); if(ov) ov.style.display='none'; ttNext(); }
}

function ttSkipAll() {
  clearTimeout(window._ttT);
  ttQueue = [];
  Object.keys(TIPS).forEach(k => seenTips[k] = 1);
  lsSave();
  const ov = document.getElementById('tt-overlay');
  if (ov) { ov.style.display = 'none'; ov.innerHTML = ''; }
}

const TASK_POOL    = {};
const POOL_DUO_ST  = {};
const POOL_COLORS  = ['var(--t)','var(--p)','var(--pu)','var(--b)','var(--g)','var(--o)'];

function getTaskPool(t) {
  if (TASK_POOL[t.n]) return TASK_POOL[t.n];
  const vocab  = t.vocab;
  const items  = [];
  const usedW  = new Set();
  const usedS  = new Set();

  function tryPush(sent) {
    const key = sent.trim().toLowerCase().slice(0, 60);
    if (usedS.has(key)) return;
    const hit = vocab.find(v => {
      const w = v[0].toLowerCase();
      return w.length > 3 && sent.toLowerCase().includes(w) && !usedW.has(w);
    });
    if (!hit) return;
    usedW.add(hit[0].toLowerCase());
    usedS.add(key);
    items.push({ sentence: sent, word: hit[0], ruHint: hit[1].split(' · ')[0] });
  }


  t.ans.forEach(s  => tryPush(s));
  t.qs.forEach(q   => tryPush(q[0]));


  TASK_POOL[t.n] = items.map((it, i) => {
    it.type = (i % 2 === 0) ? 'gap' : 'duo';
    if (it.type === 'duo') {
      const dist = vocab
        .filter(v => v[0] !== it.word)
        .sort(() => Math.random() - .5)
        .slice(0, 3)
        .map(v => v[0]);
      it.options = [...dist, it.word].sort(() => Math.random() - .5);
    }
    return it;
  });
  return TASK_POOL[t.n];
}

function renderPoolDuo(n, pi, item) {
  const stKey = n + '_' + pi;
  if (!POOL_DUO_ST[stKey]) POOL_DUO_ST[stKey] = { selected: null, checked: false };
  const st  = POOL_DUO_ST[stKey];
  const col = POOL_COLORS[pi % POOL_COLORS.length];
  const sel = st.selected, chk = st.checked, ans = item.word;
  const esc = item.word.replace(/[-[\\/\\^$*+?.()|{}]/g, '\\$&');
  const blanked = item.sentence.replace(new RegExp(esc, 'i'), '___');
  const parts   = blanked.split('___');

  const blankTxt = sel
    ? '<span style="color:' + (chk ? (sel === ans ? 'var(--g)' : 'var(--r)') : 'var(--t)') + ';font-weight:800">' + sel + '</span>'
    : '<span style="color:#bbb">?</span>';
  const blankCls = 'duo-blank-inline' + (chk ? (sel === ans ? ' correct' : ' wrong') : (sel ? ' filled' : ''));

  const opts = (item.options || []).map(opt => {
    let cls = 'duo-word-btn';
    if (chk)        cls += opt === ans ? ' correct' : (sel === opt ? ' wrong' : '');
    else if (sel === opt) cls += ' selected';
    return '<button class="' + cls + '"' + (chk ? ' disabled' : '') +
      ' onclick="poolDuoSelect(' + n + ',' + pi + ',this)">' + opt + '</button>';
  }).join('');

  const fb = chk
    ? '<div class="duo-feedback show ' + (sel === ans ? 'ok' : 'bad') + '">' +
        (sel === ans ? '✅ Верно! <b>' + ans + '</b>' : '❌ Правильно: <b>' + ans + '</b>') +
      '</div>'
    : '<div class="duo-feedback"></div>';

  return '<div class="duo-task-card" id="pduo-' + n + '-' + pi + '">' +
    '<div class="duo-badge" style="background:' + col + '">🎯 Выбери слово</div>' +
    '<div class="duo-ru-hint">💡 ' + item.ruHint + '</div>' +
    '<div class="duo-sentence-box">' +
      (parts[0] || '') +
      '<span class="' + blankCls + '">' + blankTxt + '</span>' +
      (parts[1] || '') +
    '</div>' +
    '<div class="duo-word-bank">' + opts + '</div>' +
    '<button class="duo-check-btn"' + (!sel || chk ? ' disabled' : '') +
      ' onclick="poolDuoCheck(' + n + ',' + pi + ')">Проверить ✓</button>' +
    fb + '</div>';
}

function poolDuoSelect(n, pi, btn) {
  const stKey = n + '_' + pi;
  if (!POOL_DUO_ST[stKey] || POOL_DUO_ST[stKey].checked) return;
  const word = btn.textContent;
  POOL_DUO_ST[stKey].selected = POOL_DUO_ST[stKey].selected === word ? null : word;
  const pool = TASK_POOL[n]; if (!pool || !pool[pi]) return;
  const card = document.getElementById('pduo-' + n + '-' + pi);
  if (card) card.outerHTML = renderPoolDuo(n, pi, pool[pi]);
}

function poolDuoCheck(n, pi) {
  const stKey = n + '_' + pi;
  if (!POOL_DUO_ST[stKey] || !POOL_DUO_ST[stKey].selected) return;
  POOL_DUO_ST[stKey].checked = true;
  const pool = TASK_POOL[n]; if (!pool || !pool[pi]) return;
  const card = document.getElementById('pduo-' + n + '-' + pi);
  if (card) card.outerHTML = renderPoolDuo(n, pi, pool[pi]);
}

function buildTasks(t) {
  const el = document.getElementById('sub-tasks');
  if (!el) return;
  const n    = t.n;
  const pool = getTaskPool(t);
  let   ci   = 0;

  let html = '<div class="tasks-wrap">' +
    '<div class="tasks-hd"><h2>✏️ Задания</h2>' +
    '<div style="font-size:14px;color:#888;font-style:italic;font-family:Montserrat,sans-serif">Используй слова из словаря!</div></div>';


  t.tasks.forEach((task, i) => {
    if (i === 0) return;
    const color = POOL_COLORS[ci++ % POOL_COLORS.length];
    let body = '';
    if (task.sentence) {
      const parts = task.sentence.split('___');
      let gapHtml = '';
      parts.forEach((p, pi2) => {
        gapHtml += p;
        if (pi2 < parts.length - 1)
          gapHtml += '<input class="ginput" data-ans="' + task.gaps[pi2] + '" oninput="chkGap(this)">';
      });
      body = '<div class="gap-s">' + gapHtml + '</div>' +
        '<button class="btn btn-sm btn-g" style="margin-top:8px" onclick="showAllGaps(this)">Показать ответы</button>';
    } else if (task.items) {
      body = task.items.map((item, ii) =>
        '<div style="margin-bottom:10px">' +
          '<div style="font-size:19px;margin-bottom:4px">' + (ii + 1) + '. ' + item + '</div>' +
          '<input class="aline" placeholder="Напиши по-английски…">' +
          '<div class="sample"><strong>✓ Ответ:</strong>' + (task.itemAns[ii] || '') + '</div>' +
        '</div>'
      ).join('') +
        '<button class="btn btn-sm btn-g" onclick="toggleAll(this)">Показать ответы</button>';
    }
    html += '<div class="task-card" style="--tc:' + color + '">' +
      '<div class="task-badge" style="background:' + color + '">' + task.t + '</div>' +
      '<div class="task-h" style="margin-top:14px">' + task.t.replace(/^\S+\s/, '') + '</div>' +
      body + '</div>';
  });


  pool.forEach((item, pi) => {
    const color = POOL_COLORS[ci++ % POOL_COLORS.length];
    const esc     = item.word.replace(/[-[\\/\\^$*+?.()|{}]/g, '\\$&');
    const blanked = item.sentence.replace(new RegExp(esc, 'i'), '___');
    const parts   = blanked.split('___');

    if (item.type === 'gap') {
      html += '<div class="task-card" style="--tc:' + color + '">' +
        '<div class="task-badge" style="background:' + color + '">📝 Заполни пропуск</div>' +
        '<div class="task-h" style="margin-top:14px">Вставь правильное слово</div>' +
        '<div style="font-size:13px;color:#888;font-family:Montserrat,sans-serif;margin-bottom:8px">💡 ' + item.ruHint + '</div>' +
        '<div class="gap-s">' + (parts[0]||'') +
          '<input class="ginput" data-ans="' + item.word + '" oninput="chkGap(this)">' +
          (parts[1] || '') + '</div>' +
        '<button class="btn btn-sm btn-g" style="margin-top:8px" onclick="showAllGaps(this)">Показать ответ</button>' +
        '</div>';
    } else {
      html += renderPoolDuo(n, pi, item);
    }
  });

  html += '<div style="text-align:center;margin-top:28px">' +
    '<button class="btn btn-ink" onclick="go(\'answers\')">🔑 Ключ ответов</button>' +
    '</div></div>';
  el.innerHTML = html;
}

function toggleSample(btn) {
  const s = btn.nextElementSibling;
  if (!s) return;
  const show = s.style.display !== 'block';
  s.style.display = show ? 'block' : 'none';
  btn.textContent = show ? 'Скрыть 🙈' : 'Показать образец 👀';
}
function toggleAll(btn) {
  const block = btn.closest('.task-card');
  const samples = block.querySelectorAll('.sample');
  const show = samples[0] && samples[0].style.display !== 'block';
  samples.forEach(s => s.style.display = show ? 'block' : 'none');
  btn.textContent = show ? 'Скрыть ответы 🙈' : 'Показать ответы';
}
function showAllGaps(btn) {
  const block = btn.closest('.task-card');
  block.querySelectorAll('.ginput').forEach(inp => {
    inp.value = inp.dataset.ans;
    inp.className = 'ginput ok';
  });
}
function chkGap(input) {
  const v = input.value.trim().toLowerCase();
  const a = input.dataset.ans.toLowerCase();
  if (!v) { input.className = 'ginput'; return; }
  if (v === a) input.className = 'ginput ok';
  else if (a.startsWith(v)) input.className = 'ginput';
  else input.className = 'ginput no';
}

const _listenState = {};
let _listenQueue = null;

function getEnVoices() {
  var all = window.speechSynthesis.getVoices();
  var en = all.filter(function(v){ return v.lang.startsWith('en'); });

  en.sort(function(a,b){
    var qa = voiceQuality(a), qb = voiceQuality(b);
    return qb - qa;
  });
  return en;
}
function voiceQuality(v) {
  var n = v.name.toLowerCase();
  if (n.includes('neural') || n.includes('studio')) return 5;
  if (n.includes('google') && n.includes('us')) return 4;
  if (n.includes('google')) return 3;
  if (n.includes('microsoft') && n.includes('us')) return 3;
  if (n.includes('microsoft')) return 2;
  if (v.localService) return 1;
  return 0;
}
function pickVoices() {
  var voices = getEnVoices();
  if (!voices.length) return [null, null];

  var female = voices.filter(function(v){
    var n = v.name.toLowerCase();
    return n.includes('female') || n.includes('woman') || n.includes('girl') ||
           n.includes('samantha') || n.includes('karen') || n.includes('moira') ||
           n.includes('victoria') || n.includes('zoe') || n.includes('fiona') ||
           n.includes('ava') || n.includes('susan') || n.includes('jenny') ||
           n.includes('aria') || n.includes('emily') || n.includes('natasha') ||
           n.includes('allison') || n.includes('claire');
  });
  var male = voices.filter(function(v){
    var n = v.name.toLowerCase();
    return n.includes('male') || n.includes('man') || n.includes('guy') ||
           n.includes('daniel') || n.includes('alex') || n.includes('fred') ||
           n.includes('james') || n.includes('ryan') || n.includes('guy') ||
           n.includes('david') || n.includes('mark') || n.includes('tom') ||
           n.includes('eric') || n.includes('guy');
  });
  var vA = female.length ? female[0] : voices[0];
  var vB = male.length ? male[0] : (voices.length > 1 ? voices[1] : voices[0]);

  return [vA, vB];
}

function parseDialogueTurns(text) {
  var turns = [];

  var regex = /(?:^|(?<=[.!?])\s+)([A-Z][a-z]+(?:\s[A-Z][a-z]+)?):\s*/g;
  var lastEnd = 0, lastSpeaker = '', firstMatch = true, match;

  try {
    while ((match = regex.exec(text)) !== null) {
      if (!firstMatch) {
        var chunk = text.slice(lastEnd, match.index).replace(/\s+$/, '');
        if (chunk) turns.push({speaker: lastSpeaker, text: chunk});
      }
      lastSpeaker = match[1];
      lastEnd = match.index + match[0].length;
      firstMatch = false;
    }
    if (lastSpeaker && lastEnd < text.length) {
      turns.push({speaker: lastSpeaker, text: text.slice(lastEnd).trim()});
    }
  } catch(e) {

    var parts = text.split(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?):\s*/);
    for (var i = 1; i < parts.length; i += 2) {
      if (parts[i] && parts[i+1]) turns.push({speaker: parts[i], text: parts[i+1].trim()});
    }
  }
  return turns;
}

var ROLE_COLORS = ['var(--t)','var(--o)','var(--p)','var(--g)','var(--pu)'];
function buildTranscriptHtml(turns) {
  var speakerMap = {}, colorIdx = 0;
  var html = '';
  turns.forEach(function(t, i) {
    if (!(t.speaker in speakerMap)) {
      speakerMap[t.speaker] = ROLE_COLORS[colorIdx++ % ROLE_COLORS.length];
    }
    var color = speakerMap[t.speaker];
    html += '<div class="dlg-line" id="dlg-line-' + i + '">' +
      '<span class="dlg-role" style="color:' + color + '">' + t.speaker + '</span>' +
      '<span class="dlg-text">' + t.text + '</span>' +
      '</div>';
  });
  return html;
}

function buildListen(t) {
  var el = document.getElementById('sub-listen');
  if (!el) return;
  var data = LISTEN_DATA[String(t.n)];
  if (!data || !data.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px;font-size:22px;color:#aaa">🎧 Аудирование скоро будет добавлено для этой темы</div>';
    return;
  }
  var colors = ['var(--t)','var(--o)','var(--p)'];
  var html = '<div class="listen-wrap"><div class="listen-hd"><h2>🎧 Аудирование</h2><p>Слушай диалог · Отвечай на вопросы</p></div>';
  data.forEach(function(sc, si) {
    var ci = colors[si % 3];
    var turns = parseDialogueTurns(sc.text);
    var transcriptHtml = buildTranscriptHtml(turns);
    var qsHtml = sc.qs.map(function(q, qi) {
      var optsHtml = q.opts.map(function(o, oi) {
        return '<div class="listen-opt" onclick="listenCheckOpt(this,' + si + ',' + qi + ',' + oi + ',' + q.ans + ')">' + o + '</div>';
      }).join('');
      return '<div class="listen-q"><div class="listen-q-text">' + (qi+1) + '. ' + q.q + '</div><div class="listen-opts">' + optsHtml + '</div></div>';
    }).join('');
    html +=
      '<div class="listen-card" id="lcard-' + si + '">' +
        '<div class="listen-card-num" style="background:' + ci + '">Диалог ' + (si+1) + '</div>' +
        '<div class="listen-title">' + sc.title + '</div>' +
        '<div class="listen-controls">' +
          '<button class="listen-btn play" id="lplay-' + si + '" onclick="listenPlay(' + si + ',this)">▶ Слушать</button>' +
          '<button class="listen-btn" onclick="listenToggleText(' + si + ')">📄 Текст</button>' +
          '<div class="listen-speed"><label>Скорость:</label><select id="lspeed-' + si + '"><option value="0.75">Медленно</option><option value="0.9" selected>Нормально</option><option value="1.05">Быстро</option><option value="1.2">Очень быстро</option></select></div>' +
        '</div>' +
        '<div class="listen-progress" id="lprog-' + si + '"><div class="listen-progress-fill" id="lprogf-' + si + '"></div></div>' +
        '<div class="dlg-transcript" id="ltxt-' + si + '">' + transcriptHtml + '</div>' +
        '<div class="listen-qs-hd">❓ Ответь на вопросы:</div>' +
        '<div id="lqs-' + si + '">' + qsHtml + '</div>' +
        '<div class="listen-score" id="lscore-' + si + '"></div>' +
      '</div>';
  });
  html += '</div>';
  el.innerHTML = html;
  if (!_listenState[t.n]) _listenState[t.n] = {};
}

function listenPlay(si, btn) {
  if (!('speechSynthesis' in window)) {
    alert('Ваш браузер не поддерживает озвучку. Пожалуйста, используйте Google Chrome.');
    return;
  }
  window.speechSynthesis.cancel();
  if (_listenQueue) { _listenQueue.active = false; _listenQueue = null; }


  var card = document.getElementById('lcard-' + si);

  var dlgLines = card.querySelectorAll('.dlg-line');
  var turns = [];
  dlgLines.forEach(function(line) {
    var roleEl = line.querySelector('.dlg-role');
    var textEl = line.querySelector('.dlg-text');
    if (roleEl && textEl) turns.push({speaker: roleEl.textContent.trim(), text: textEl.textContent.trim(), lineId: line.id});
  });

  if (!turns.length) return;

  var speedEl = document.getElementById('lspeed-' + si);
  var speed = speedEl ? parseFloat(speedEl.value) : 0.9;
  var progFill = document.getElementById('lprogf-' + si);
  var voices = pickVoices();
  var voiceA = voices[0], voiceB = voices[1];


  var speakerVoiceMap = {};
  var speakerKeys = [];
  turns.forEach(function(t) {
    if (speakerKeys.indexOf(t.speaker) === -1) speakerKeys.push(t.speaker);
  });
  speakerKeys.forEach(function(sp, i) {
    speakerVoiceMap[sp] = i === 0 ? voiceA : voiceB;
  });


  btn.textContent = '⏹ Стоп';
  btn.className = 'listen-btn stop';
  var queue = {active: true, turnIdx: 0, turns: turns, si: si, btn: btn, speed: speed,
               speakerVoiceMap: speakerVoiceMap, progFill: progFill,
               totalTurns: turns.length};
  _listenQueue = queue;
  btn.onclick = function() { listenStop(queue); };

  playNextTurn(queue);
}

function playNextTurn(queue) {
  if (!queue.active || queue.turnIdx >= queue.turns.length) {
    if (queue.active) listenFinish(queue);
    return;
  }
  var turn = queue.turns[queue.turnIdx];
  var utt = new SpeechSynthesisUtterance(turn.text);
  utt.lang = 'en-US';
  utt.rate = queue.speed;


  var voice = queue.speakerVoiceMap[turn.speaker];
  if (voice) utt.voice = voice;

  var speakerKeys = Object.keys(queue.speakerVoiceMap);
  var spIdx = speakerKeys.indexOf(turn.speaker);
  if (speakerKeys.length > 1 && queue.speakerVoiceMap[speakerKeys[0]] === queue.speakerVoiceMap[speakerKeys[1]]) {
    utt.pitch = spIdx === 0 ? 1.3 : 0.75;
  } else {
    utt.pitch = 1.0;
  }


  if (queue.progFill) {
    var pct = Math.round((queue.turnIdx / queue.turns.length) * 100);
    queue.progFill.style.width = pct + '%';
  }


  var card = document.getElementById('lcard-' + queue.si);
  if (card) {
    card.querySelectorAll('.dlg-line').forEach(function(l){ l.classList.remove('dlg-active'); });
    var curLine = document.getElementById(turn.lineId);
    if (curLine) {
      curLine.classList.add('dlg-active');
      curLine.scrollIntoView({block:'nearest',behavior:'smooth'});
    }
  }

  utt.onend = function() {
    if (!queue.active) return;
    queue.turnIdx++;

    setTimeout(function() { if (queue.active) playNextTurn(queue); }, 180);
  };
  utt.onerror = function() {
    if (!queue.active) return;
    queue.turnIdx++;
    setTimeout(function() { if (queue.active) playNextTurn(queue); }, 100);
  };
  window.speechSynthesis.speak(utt);
}

function listenStop(queue) {
  queue.active = false;
  window.speechSynthesis.cancel();
  listenStopped(queue.si, queue.btn);
  var card = document.getElementById('lcard-' + queue.si);
  if (card) card.querySelectorAll('.dlg-line').forEach(function(l){ l.classList.remove('dlg-active'); });
  if (queue.progFill) queue.progFill.style.width = '0';
}

function listenFinish(queue) {
  queue.active = false;
  if (queue.progFill) {
    queue.progFill.style.width = '100%';
    setTimeout(function(){ queue.progFill.style.width = '0'; }, 1400);
  }
  var card = document.getElementById('lcard-' + queue.si);
  if (card) card.querySelectorAll('.dlg-line').forEach(function(l){ l.classList.remove('dlg-active'); });
  listenStopped(queue.si, queue.btn);
}

function listenStopped(idx, btn) {
  btn.textContent = '▶ Слушать';
  btn.className = 'listen-btn play';
  btn.onclick = function() { listenPlay(idx, this); };
}

function listenToggleText(idx) {
  var box = document.getElementById('ltxt-' + idx);
  if (box) box.classList.toggle('show');
}

function listenCheckOpt(el, si, qi, oi, correct) {
  var qEl = el.closest('.listen-opts');
  if (qEl.dataset.done) return;
  qEl.dataset.done = '1';
  qEl.querySelectorAll('.listen-opt').forEach(function(o, i) {
    o.style.cursor = 'default';
    if (i === correct) o.className = 'listen-opt correct';
    else if (o === el) o.className = 'listen-opt wrong';
  });
  var topicN = cur;
  if (!_listenState[topicN]) _listenState[topicN] = {};
  if (!_listenState[topicN][si]) _listenState[topicN][si] = {correct:0, total:0};
  _listenState[topicN][si].total++;
  if (oi === correct) _listenState[topicN][si].correct++;
  var card = document.getElementById('lcard-' + si);
  var allOpts = card.querySelectorAll('.listen-opts');
  var allDone = true;
  allOpts.forEach(function(o){ if (!o.dataset.done) allDone = false; });
  if (allDone) {
    var sc = _listenState[topicN][si];
    var scoreEl = document.getElementById('lscore-' + si);
    var emoji = sc.correct === sc.total ? '🏆' : sc.correct >= sc.total/2 ? '👍' : '💪';
    scoreEl.innerHTML = emoji + ' ' + sc.correct + ' из ' + sc.total + ' правильно!';
    scoreEl.className = 'listen-score show';
  }
}

function buildHub() {
  const grid = document.getElementById('hub-grid');
  T.forEach(t => {
    const ci = (t.n - 1) % 8;
    const d = document.createElement('div');
    d.className = 'hub-card';
    d.innerHTML =
      '<div class="hub-num cc' + ci + '" style="width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;line-height:1">' + t.n + '</div>' +
      '<div class="hub-name">' + t.ru + '</div><div class="hub-en">' + t.en + '</div>';
    d.onclick = () => openTopic(t.n);
    grid.appendChild(d);
  });
}

function buildCoverChips() {
  const el = document.getElementById('cover-chips');
  if (!el) return;
  T.forEach(t => {
    const d = document.createElement('div');
    d.className = 'dash-topic-chip';
    d.textContent = t.ru;
    d.onclick = () => openTopic(t.n);
    el.appendChild(d);
  });
}

function buildAnswers() {
  const wrap = document.getElementById('ans-wrap');
  ANS_GROUPS.forEach(group => {
    const gDiv = document.createElement('div');
    gDiv.style.marginBottom='28px';
    const header = document.createElement('div');
    header.className = 'ans-group-hd';
    header.style.background = group.color;
    header.style.borderColor = group.acc;
    header.style.boxShadow = '3px 3px 0 ' + group.acc;
    header.textContent = group.label;
    gDiv.appendChild(header);
    group.topics.forEach(n => {
      const t = T.find(tp => tp.n === n); if (!t) return;
      const ci = (t.n-1)%8;
      const div = document.createElement('div');
      div.className = 'ans-block';
      div.innerHTML =
        '<div class="ans-block-h"><span class="ans-num cc'+ci+'" style="font-family:Montserrat,sans-serif;font-size:15px;min-width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex-shrink:0">'+t.n+'</span>'+t.ru+'</div>'+
        t.ans.map((a,i)=>
          '<div class="ans-item"><div class="ans-q">🗣️ '+(t.qs[i]?t.qs[i][0]:'Q'+(i+1))+'</div><div class="ans-a">'+a+'</div></div>'
        ).join('');
      gDiv.appendChild(div);
    });
    wrap.appendChild(gDiv);
  });
}

if ('speechSynthesis' in window) { window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); }; }

document.addEventListener('DOMContentLoaded', function() {
  lsLoad();
  updateDashboard();

  if (window.WB_T && window.WB_LD) {
    T = window.WB_T;
    LISTEN_DATA = window.WB_LD;
    buildCoverChips();
    buildHub();
    document.getElementById('app-loading').style.display = 'none';
  } else {

    var _initRetries = 0;
    var _initTimer = setInterval(function() {
      _initRetries++;
      if (window.WB_T && window.WB_LD) {
        clearInterval(_initTimer);
        T = window.WB_T;
        LISTEN_DATA = window.WB_LD;
        buildCoverChips();
        buildHub();
        document.getElementById('app-loading').style.display = 'none';
      } else if (_initRetries > 200) {
        clearInterval(_initTimer);
        document.getElementById('load-err').style.display = 'block';
        document.getElementById('load-err').textContent = 'Ошибка: данные не загрузились. Проверьте URL файлов JS в коде.';
      }
    }, 50);
  }
  buildAnswers();
  updateDashboard();
  setTimeout(function() { ttShow('cover'); }, 1200);
  setTimeout(function() { ttShow('session'); }, 5000);
});

function updateDashboard() {
  let totalKnown=0, topicsStarted=0, topicsDone=0;
  const totalWords = (window.WB_T||[]).reduce((s,t)=>s+t.vocab.length,0);
  Object.keys(QS).forEach(n=>{
    const s=QS[n]; if(!s) return;
    topicsStarted++;
    totalKnown+=s.known.size;
    if(s.known.size>=Math.ceil(s.cards.length*0.6)) topicsDone++;
  });
  const pct=totalWords>0?Math.min(100,Math.round((totalKnown/totalWords)*100)):0;
  const el=id=>document.getElementById(id);
  if(el('dash-known')) el('dash-known').textContent=totalKnown;
  if(el('dash-topics')) el('dash-topics').textContent=topicsStarted;
  if(el('dash-done')) el('dash-done').textContent=topicsDone;
  if(el('dash-pct')) el('dash-pct').textContent=pct+'%';
  if(el('dash-prog-fill')) el('dash-prog-fill').style.width=pct+'%';
  if(el('dash-prog-label')) el('dash-prog-label').textContent=totalKnown+' из '+totalWords+' слов';
}

let _mWord='', _mRu='', _mSentLoaded=false;

function openWordModal(elOrNull, enWord, ruText) {

  if (elOrNull && elOrNull.dataset) {
    _mWord = elOrNull.dataset.en || '';
    _mRu   = elOrNull.dataset.ru || '';
  } else {
    _mWord = enWord || '';
    _mRu   = ruText || '';
  }
  _mSentLoaded = false;
  const ov = document.getElementById('wm-overlay');
  if (!ov) return;
  document.getElementById('wm-en').textContent = _mWord;
  document.getElementById('wm-ru').textContent = _mRu.split(' · ')[0];
  const phEl = document.getElementById('wm-ph');
  if (phEl) phEl.textContent = '🔄 загружаем транскрипцию…';
  const sb = document.getElementById('wm-sent-box');
  if (sb) sb.classList.remove('open');
  const sl = document.getElementById('wm-sent-list');
  if (sl) sl.innerHTML = '';
  ov.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const lookup = _mWord.split(' ')[0].toLowerCase().replace(/[^a-z]/g,'');
  if (lookup.length > 1) {
    fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + lookup)
      .then(r=>r.ok?r.json():null)
      .then(data=>{
        if (!data||!data[0]){if(phEl)phEl.textContent='';return;}
        const ph=(data[0].phonetics||[]).find(p=>p.text);
        if(phEl) phEl.textContent = ph ? ph.text : '';
      })
      .catch(()=>{if(phEl)phEl.textContent='';});
  } else { if(phEl) phEl.textContent=''; }
}

function closeWordModal(evt, force) {
  const ov = document.getElementById('wm-overlay');
  if (!ov) return;
  if (evt && evt.target !== ov && !force) return;
  ov.style.display='none';
  document.body.style.overflow='';
  window.speechSynthesis && window.speechSynthesis.cancel();
  const btn=document.getElementById('wm-audio');
  if(btn){btn.textContent='🔊 Слушать';btn.classList.remove('playing');}
}

function playWordAudio() {
  if (!('speechSynthesis' in window)){alert('Браузер не поддерживает озвучку.');return;}
  const btn=document.getElementById('wm-audio');
  window.speechSynthesis.cancel();
  const utt=new SpeechSynthesisUtterance(_mWord);
  utt.lang='en-US'; utt.rate=0.82; utt.pitch=1.1;
  const voices=window.speechSynthesis.getVoices();
  const enV=voices.filter(v=>v.lang.startsWith('en'));
  const femaleKw=['samantha','karen','moira','victoria','zoe','fiona','ava','emily','aria','jenny','allison','claire','susan','female','woman','girl'];
  const fem=enV.find(v=>femaleKw.some(k=>v.name.toLowerCase().includes(k)));
  if(fem) utt.voice=fem; else if(enV.length) utt.voice=enV[0];
  if(btn){btn.textContent='🎵 Воспроизводится…';btn.classList.add('playing');}
  utt.onend=()=>{if(btn){btn.textContent='🔊 Слушать';btn.classList.remove('playing');}};
  utt.onerror=()=>{if(btn){btn.textContent='🔊 Слушать';btn.classList.remove('playing');}};
  window.speechSynthesis.speak(utt);
}

function escRx(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function renderModalSentences(container, items) {
  if(!container||!items||!items.length) return;
  const w=_mWord;
  container.innerHTML=items.map(s=>{
    if(!s||!s.en) return '';
    const hl=s.en.replace(new RegExp('('+escRx(w)+')','gi'),
      '<b style="color:var(--t);font-weight:800;background:rgba(46,196,182,.15);border-radius:4px;padding:0 3px">$1</b>');
    return '<div class="modal-sentence-item">'+
      '<div class="modal-sentence-en">'+hl+'</div>'+
      (s.ru?'<div class="modal-sentence-ru">🇷🇺 '+s.ru+'</div>':'')+
      '</div>';
  }).filter(Boolean).join('');
}

const ANS_GROUPS = [
  { label:'✈️ Путешествия', topics:[1,2,6,11,16], color:'var(--bl)', acc:'var(--b)' },
  { label:'🍽️ Питание и покупки', topics:[3,4,5,22], color:'var(--ol)', acc:'var(--o)' },
  { label:'🏥 Сервисы и здоровье', topics:[7,12,13,14,15], color:'var(--tl)', acc:'var(--t)' },
  { label:'💼 Работа и карьера', topics:[9,24,25], color:'var(--pul)', acc:'var(--pu)' },
  { label:'🤝 Люди и общение', topics:[8,10,20,26], color:'var(--pl)', acc:'var(--p)' },
  { label:'🌿 Образ жизни', topics:[17,18,19,21,23,27,28], color:'var(--gl)', acc:'var(--g)' },
];