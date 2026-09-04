import yaml
from pathlib import Path

def load_config() -> dict:
    config_path = Path(__file__).parent.parent / "config" / "matching_config.yaml"
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")
    with open(config_path, "r") as f:
        return yaml.safe_load(f)