import os
from PIL import Image

def generate_icons(img_path):
    img = Image.open(img_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        # Crop to the exact logo bounds
        img = img.crop(bbox)
        
        width, height = img.size
        # The user requested 120% scale, so the canvas should be smaller than the logo
        # canvas size = logo max dim / 1.2
        max_dim = max(width, height)
        canvas_size = int(max_dim / 1.2)
        
        # Create transparent canvas
        new_img = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 0))
        
        # Center the 1.2x logo inside the 1x canvas
        offset_x = (canvas_size - width) // 2
        offset_y = (canvas_size - height) // 2
        new_img.paste(img, (offset_x, offset_y), img)
        
        # Android launcher icon sizes
        sizes = {
            "mipmap-mdpi": 48,
            "mipmap-hdpi": 72,
            "mipmap-xhdpi": 96,
            "mipmap-xxhdpi": 144,
            "mipmap-xxxhdpi": 192
        }
        
        base_dir = "android/app/src/main/res"
        for folder, size in sizes.items():
            folder_path = os.path.join(base_dir, folder)
            if os.path.exists(folder_path):
                # Resize the 2x canvas to the correct Android density sizes
                resized = new_img.resize((size, size), Image.Resampling.LANCZOS)
                resized.save(os.path.join(folder_path, "ic_launcher.png"))
                resized.save(os.path.join(folder_path, "ic_launcher_round.png"))
                
        print("Generated 2x padded and centered Android icons successfully!")
    else:
        print("Image is entirely transparent")

generate_icons("src/Assets/Images/Logo.png")
