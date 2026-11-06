from google import genai
from google.genai import errors
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

models = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.5-flash"
]

for model in models:
    print(f"\nПеревірка: {model}")

    try:
        response = client.models.generate_content(
            model=model,
            contents="Напиши одне коротке питання з історії України."
        )
        print("УСПІХ:", response.text)
        print("Рекомендована модель:", model)
        break

    except errors.APIError as e:
        print(f"ПОМИЛКА {e.code}: {e.message}")