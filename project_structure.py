from pathlib import Path
from datetime import datetime

# ==========================
# Configuration
# ==========================

PROJECT_ROOT = Path(__file__).parent
OUTPUT_FILE = PROJECT_ROOT / "project_structure.txt"

EXCLUDED_DIRS = {
    ".git",
    "venv",
    ".venv",
    "__pycache__",
    "node_modules",
    ".pytest_cache",
    ".idea",
    ".vscode",
}

SOURCE_EXTENSIONS = {
    ".py",
    ".html",
    ".css",
    ".js",
    ".md",
    ".txt",
    ".json",
    ".env",
    ".yml",
    ".yaml",
}

# ==========================
# Helper Functions
# ==========================

def is_excluded(path: Path) -> bool:
    return any(part in EXCLUDED_DIRS for part in path.parts)


def build_tree(folder: Path, indent: str = ""):
    lines = []

    items = sorted(
        folder.iterdir(),
        key=lambda x: (x.is_file(), x.name.lower())
    )

    items = [i for i in items if not is_excluded(i)]

    for index, item in enumerate(items):
        connector = "└── " if index == len(items) - 1 else "├── "

        if item.is_dir():
            lines.append(f"{indent}{connector}{item.name}/")
            extension = "    " if index == len(items) - 1 else "│   "
            lines.extend(build_tree(item, indent + extension))
        else:
            lines.append(f"{indent}{connector}{item.name}")

    return lines


# ==========================
# Collect Information
# ==========================

all_files = []
all_dirs = []

for path in PROJECT_ROOT.rglob("*"):
    if is_excluded(path):
        continue

    if path.is_dir():
        all_dirs.append(path)
    else:
        all_files.append(path)

python_files = [f for f in all_files if f.suffix == ".py"]
html_files = [f for f in all_files if f.suffix == ".html"]
css_files = [f for f in all_files if f.suffix == ".css"]
js_files = [f for f in all_files if f.suffix == ".js"]

missing_init = []

for directory in all_dirs:
    if directory.name in {
        "app",
        "api",
        "config",
        "database",
        "integrations",
        "models",
        "pipeline",
        "schemas",
        "services",
        "utils",
    }:
        if not (directory / "__init__.py").exists():
            missing_init.append(directory)

# ==========================
# Generate Report
# ==========================

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:

    f.write("=" * 60 + "\n")
    f.write("CV ANALYZER PROJECT INSPECTOR\n")
    f.write("=" * 60 + "\n\n")

    f.write(f"Generated: {datetime.now()}\n\n")

    f.write("=" * 60 + "\n")
    f.write("PROJECT STATISTICS\n")
    f.write("=" * 60 + "\n\n")

    f.write(f"Folders      : {len(all_dirs)}\n")
    f.write(f"Files        : {len(all_files)}\n")
    f.write(f"Python Files : {len(python_files)}\n")
    f.write(f"HTML Files   : {len(html_files)}\n")
    f.write(f"CSS Files    : {len(css_files)}\n")
    f.write(f"JS Files     : {len(js_files)}\n\n")

    f.write("=" * 60 + "\n")
    f.write("DIRECTORY TREE\n")
    f.write("=" * 60 + "\n\n")

    f.write(PROJECT_ROOT.name + "/\n")

    for line in build_tree(PROJECT_ROOT):
        f.write(line + "\n")

    f.write("\n")

    f.write("=" * 60 + "\n")
    f.write("FILE SIZES\n")
    f.write("=" * 60 + "\n\n")

    for file in sorted(all_files):
        relative = file.relative_to(PROJECT_ROOT)
        size = file.stat().st_size
        f.write(f"{size:>10} bytes   {relative}\n")

    f.write("\n")

    f.write("=" * 60 + "\n")
    f.write("MISSING __init__.py\n")
    f.write("=" * 60 + "\n\n")

    if missing_init:
        for folder in missing_init:
            f.write(str(folder.relative_to(PROJECT_ROOT)) + "\n")
    else:
        f.write("None 🎉\n")

    f.write("\n")

    f.write("=" * 60 + "\n")
    f.write("EMPTY DIRECTORIES\n")
    f.write("=" * 60 + "\n\n")

    empty = []

    for directory in all_dirs:
        if not any(directory.iterdir()):
            empty.append(directory)

    if empty:
        for directory in empty:
            f.write(str(directory.relative_to(PROJECT_ROOT)) + "\n")
    else:
        f.write("None\n")

print("=" * 60)
print("✅ Project inspection completed successfully!")
print("=" * 60)
print(f"Report saved to:\n{OUTPUT_FILE}")
print("=" * 60)