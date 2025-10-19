import base64
import json
import re
import requests
from fastapi import HTTPException

from backend.core import config
from backend.core.logging_config import logger

def generate_annotation_from_vlm(image_path: str) -> dict:
    try:
        with open(config.VLM_PROMPT_PATH, "r", encoding="utf-8") as f:
            vlm_prompt = f.read()
    except FileNotFoundError:
        logger.error(f"VLM prompt file not found at: {config.VLM_PROMPT_PATH}")
        raise HTTPException(status_code=500, detail="VLM prompt configuration missing.")

    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')

    headers = {
        "Authorization": f"Bearer {config.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": config.VLM_MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": vlm_prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }
        ],
        "max_tokens": 4096
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(data),
            timeout=180
        )
        response.raise_for_status()
        
        response_data = response.json()
        raw_content = response_data['choices'][0]['message']['content']
        
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', raw_content)
        cleaned_content = json_match.group(1).strip() if json_match else raw_content.strip()
        
        return json.loads(cleaned_content)
            
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from VLM response: {e}")
        raise HTTPException(status_code=500, detail=f"Error parsing VLM JSON response: {e}")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"VLM API request failed: {e}")
        raise HTTPException(status_code=500, detail=f"VLM API request error: {e}")
