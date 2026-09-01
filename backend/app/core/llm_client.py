import os
import requests

class LLMClient:
    def __init__(self, api_key: str = None, base_url: str = "http://localhost:20128/v1"):
        self.api_key = api_key or os.getenv("OMNIROUTE_API_KEY")
        if not self.api_key:
            raise ValueError("OMNIROUTE_API_KEY environment variable not set")
        self.base_url = base_url
        self.model = "auto"
        self.timeout = 60

    def generate(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "max_tokens": 8192
        }
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]