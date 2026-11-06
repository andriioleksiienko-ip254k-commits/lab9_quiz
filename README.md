# QuizMind — інтерактивний ШІ-квіз генератор

Вебзастосунок Flask + Google Gemini: генерує тести українською мовою на довільну тему, підтримує рівні складності, 5/10 питань, підрахунок балів, пояснення відповідей та історію результатів у SQLite.

## Локальний запуск (Windows / PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

У `.env` встановіть `GEMINI_API_KEY` (отримати у https://aistudio.google.com/apikey), а також власний випадковий `SECRET_KEY`.

```powershell
python app.py
```

Відкрийте http://127.0.0.1:5000.

## Деплой на Render

1. Запуште всі файли проєкту на GitHub, **окрім `.env` та `quiz.db`**.
2. Render → New → Web Service → оберіть репозиторій.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app`
5. Environment: `GEMINI_API_KEY`, `SECRET_KEY`, за потреби `GEMINI_MODEL`.
6. Після деплою відкрийте згенероване Render посилання.

**Важливо:** локальний SQLite-файл на типовому Render Web Service є тимчасовим: історія губиться після перезапуску або redeploy. Для постійної історії налаштуйте платний persistent disk (`DB_PATH=/var/data/quiz.db`) або перейдіть на PostgreSQL. Історія прив'язана до cookie браузера, тому це навчальна демонстрація, не повноцінні акаунти користувачів. Немає rate limiting; перед відкриттям сервісу для широкої аудиторії варто додати обмеження частоти API-запитів.

## API

- `POST /api/generate` — тема, складність, кількість питань.
- `POST /api/submit` — перевірка відповідей, запис результатів.
- `GET /api/history` — останні 20 тестів для поточного браузера.

## Сценарій короткого демо

1. Обрати тему «Історія України», 5 питань, середній рівень.
2. Згенерувати тест через ШІ.
3. Відповісти на запитання та завершити тест.
4. Показати бали, правильні відповіді та пояснення.
5. Прокрутити до історії проходжень.
