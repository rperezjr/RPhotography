import os
import json

IMAGE_DIR = 'images'
OUTPUT_FILE = os.path.join(IMAGE_DIR, 'manifest.json')

def generate_manifest():
    if not os.path.exists(IMAGE_DIR):
        print(f"Error: Directory '{IMAGE_DIR}' does not exist.")
        return

    # Find all files starting with _WAC and ending with .JPG (case-insensitive)
    files = []
    for filename in os.listdir(IMAGE_DIR):
        if filename.upper().startswith('_WAC') and filename.upper().endswith(('.JPG', '.JPEG', '.PNG')):
            files.append(filename)

    # Sort files naturally
    files.sort()

    # Write out manifest.json inside images/
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(files, f, indent=2)
    
    print(f"Successfully generated manifest with {len(files)} images at '{OUTPUT_FILE}'.")

if __name__ == '__main__':
    generate_manifest()