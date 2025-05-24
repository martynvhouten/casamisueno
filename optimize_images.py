from PIL import Image
import os
from pathlib import Path
import shutil

def optimize_image(input_path, output_path, max_size=(1920, 1080), quality=85):
    """Optimize an image by resizing and compressing it."""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Calculate new dimensions while maintaining aspect ratio
            ratio = min(max_size[0] / img.width, max_size[1] / img.height)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            
            # Resize image
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Create output directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Save optimized image
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            # Print optimization results
            original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
            new_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            print(f"Optimized {input_path}: {original_size:.1f}MB -> {new_size:.1f}MB")
            
    except Exception as e:
        print(f"Error processing {input_path}: {str(e)}")

def process_directory(input_dir, output_dir, max_size=(1920, 1080), quality=85):
    """Process all images in a directory and its subdirectories."""
    input_path_obj = Path(input_dir).resolve() # Use absolute paths
    output_path_obj = Path(output_dir).resolve() # Use absolute paths
    
    # Clean up any existing optimized directory
    if output_path_obj.exists():
        shutil.rmtree(output_path_obj)
    
    # Create fresh output directory
    output_path_obj.mkdir(parents=True, exist_ok=True)
    
    # Process all image files
    for file_path in input_path_obj.rglob('*'):
        # Resolve to absolute path to prevent issues with relative paths
        resolved_file_path = file_path.resolve()

        # Skip if the file is already in the output directory or a subdirectory of it
        if output_path_obj in resolved_file_path.parents:
            print(f"Skipping {resolved_file_path} as it is in the output directory.")
            continue

        if file_path.is_file() and file_path.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'):
            # Create corresponding output path
            rel_path = file_path.relative_to(input_path_obj)
            out_file = output_path_obj / rel_path.with_suffix('.jpg')
            
            # Process the image
            optimize_image(str(file_path), str(out_file), max_size, quality)

if __name__ == '__main__':
    # Define input and output directories
    input_dir = 'images'
    output_dir = 'images/optimized'
    
    # Process images
    print("Starting image optimization...")
    process_directory(input_dir, output_dir)
    print("Image optimization complete!") 