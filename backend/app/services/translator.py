import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Initialize client once if possible, or per request if needed
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def translate_text(text_list: list, target_language: str) -> list:
    if not text_list:
        return []

    input_json = json.dumps(text_list)
    
    system_prompt = f"""
    You are a strictly compliant translation engine.
    You will receive a JSON array of strings.
    You must return a JSON array containing the {target_language} translations.

    MUST FOLLOW Rules:
    1. The output must be a valid JSON array of strings.
    2. The output array must have exactly the same number of elements as the inputs.
    3. Do not translate proper nouns, brand names, or technical keys if inappropriate.
    4. Do not output any markdown formatting (like ```json), just keep the raw JSON.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite", # Updated to a stable model alias if needed
            config={'system_instruction': system_prompt},
            contents=input_json
        )
        
        raw_json_string = response.candidates[0].content.parts[0].text
        # Clean potential markdown just in case the model ignores instructions
        clean_json = raw_json_string.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)
        
    except Exception as e:
        print(f"Translation error: {e}")
        # Return original text as fallback so the app doesn't crash
        return text_list