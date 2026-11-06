const $ = (id) => document.getElementById(id);
let quiz = null, answers = [], current = 0;
const show = (id) => { for (const x of ['setup', 'quiz', 'results']) $(x).classList.toggle('hidden', x !== id); };
function toast(message) { $('toast').textContent = message; $('toast').classList.remove('hidden'); setTimeout(() => $('toast').classList.add('hidden'), 5500); }
async function api(path, opts = {}) {
  const response = await fetch(path, opts);
  let data;
  try { data = await response.json(); } catch { throw new Error('Сервер повернув некоректну відповідь.'); }
  if (!response.ok) throw new Error(data.error || 'Сталася помилка.');
  return data;
}
const post = (path, body) => api(path, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
$('generate-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const btn = $('generate-btn'); btn.disabled = true; btn.textContent = 'Генеруємо питання...';
  try {
    quiz = await post('/api/generate', {topic:$('topic').value.trim(), difficulty:$('difficulty').value, count:Number($('count').value)});
    answers = Array(quiz.questions.length).fill(null); current = 0;
    $('quiz-title').textContent = quiz.topic;
    $('quiz-subtitle').textContent = `${quiz.difficulty} рівень · ${quiz.questions.length} питань`;
    show('quiz'); drawQuestion();
    $('quiz').scrollIntoView({behavior:'smooth', block:'start'});
  } catch (err) { toast(err.message); }
  finally { btn.disabled = false; btn.innerHTML = '✦ Згенерувати тест <span>↗</span>'; }
});
function drawQuestion() {
  const q = quiz.questions[current];
  $('progress-count').textContent = `${current + 1} / ${quiz.questions.length}`;
  $('progress-bar').style.width = `${100 * (current + 1) / quiz.questions.length}%`;
  const area = $('question-area'); area.replaceChildren();
  const number = document.createElement('div'); number.className = 'question-number'; number.textContent = `Питання ${current + 1}`; area.append(number);
  const title = document.createElement('h3'); title.className = 'question-title'; title.textContent = q.question; area.append(title);
  q.options.forEach((option, idx) => {
    const label = document.createElement('label'); label.className = 'option' + (answers[current] === idx ? ' selected' : '');
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'answer'; input.checked = answers[current] === idx;
    input.addEventListener('change', () => { answers[current] = idx; drawQuestion(); });
    const text = document.createElement('span'); text.textContent = option;
    label.append(input, text); area.append(label);
  });
  $('prev-btn').disabled = current === 0;
  $('next-btn').textContent = current === quiz.questions.length - 1 ? 'Завершити тест ✓' : 'Далі →';
}
$('prev-btn').addEventListener('click', () => { if(current > 0) {current--; drawQuestion();} });
$('next-btn').addEventListener('click', async () => {
  if(answers[current] === null) { toast('Спочатку обери відповідь.'); return; }
  if(current < quiz.questions.length - 1) {current++; drawQuestion(); return;}
  if(answers.some(a => a === null)) { toast('Дай відповіді на всі питання.'); return; }
  $('next-btn').disabled = true;
  try { const result = await post('/api/submit', {quiz_id:quiz.quiz_id, answers}); drawResults(result); await loadHistory(); }
  catch(err) { toast(err.message); }
  finally { $('next-btn').disabled = false; }
});
function drawResults(result) {
  $('result-score').textContent = `${result.score} / ${result.total}`;
  const percent = Math.round(100 * result.score / result.total);
  $('result-message').textContent = percent >= 80 ? 'Чудовий результат! Продовжуй у тому ж дусі.' : percent >= 50 ? 'Непогано! Переглянь пояснення та спробуй ще.' : 'Це хороший привід потренуватися ще раз.';
  const feedback = $('feedback'); feedback.replaceChildren();
  result.details.forEach((item, i) => {
    const card = document.createElement('article'); card.className = 'feedback-item';
    const heading = document.createElement('strong'); heading.textContent = `${i + 1}. ${item.question}`;
    const status = document.createElement('div'); status.className = item.correct ? 'correct' : 'wrong';
    status.textContent = item.correct ? '✓ Правильно' : `✗ Твоя відповідь: ${item.options[item.chosen_index]}`;
    const right = document.createElement('p'); right.textContent = `Правильна відповідь: ${item.options[item.correct_index]}`;
    const explanation = document.createElement('p'); explanation.textContent = item.explanation;
    card.append(heading, status, right, explanation); feedback.append(card);
  });
  show('results'); $('results').scrollIntoView({behavior:'smooth', block:'start'});
}
$('again-btn').addEventListener('click', () => { quiz = null; show('setup'); $('setup').scrollIntoView({behavior:'smooth'}); });
async function loadHistory() {
  try {
    const data = await api('/api/history'); const list = $('history-list'); list.replaceChildren();
    if(!data.results.length) {list.textContent = 'Поки немає завершених тестів. Пройди перший!'; return;}
    data.results.forEach(r => {
      const row = document.createElement('div'); row.className = 'history-row';
      const left = document.createElement('div');
      const name = document.createElement('div'); name.className = 'history-name'; name.textContent = r.topic;
      const meta = document.createElement('div'); meta.className = 'history-meta'; meta.textContent = `${r.difficulty} · ${new Date(r.completed_at).toLocaleString('uk-UA')}`;
      const score = document.createElement('div'); score.className = 'history-score'; score.textContent = `${r.score}/${r.total}`;
      left.append(name, meta); row.append(left, score); list.append(row);
    });
  } catch(err) { toast(err.message); }
}
$('refresh-history').addEventListener('click', loadHistory);
loadHistory();
