import json
from pathlib import Path

thumb_dir = Path("images/thumb")
output_file = Path("images/images_id.json")

if not thumb_dir.exists():
    print(f"Error: Directory '{thumb_dir}' not found.")
    exit(1)

image_map = {}
if output_file.exists():
    with open(output_file, "r") as f:
        try:
            image_map = json.load(f)
        except json.JSONDecodeError:
            image_map = {}

valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}
for file_path in thumb_dir.iterdir():
    if file_path.is_file() and file_path.suffix.lower() in valid_extensions:
        file_name = file_path.name
        if file_name not in image_map:
            image_map[file_name] = "YOUR_GOOGLE_DRIVE_FILE_ID"

with open(output_file, "w") as f:
    json.dump(image_map, f, indent=2)

print(f"Successfully updated {output_file} with {len(image_map)} images.")