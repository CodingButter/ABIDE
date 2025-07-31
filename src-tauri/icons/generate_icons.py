#!/usr/bin/env python3
from PIL import Image
import os

# Create a simple icon with proper dimensions
def create_icon(size):
    # Create a new image with RGBA mode
    img = Image.new('RGBA', (size, size), (50, 50, 50, 255))
    
    # Draw a simple pattern
    pixels = img.load()
    center = size // 2
    radius = size // 3
    
    for x in range(size):
        for y in range(size):
            dist = ((x - center) ** 2 + (y - center) ** 2) ** 0.5
            if dist < radius:
                # Create a gradient effect
                intensity = int(255 * (1 - dist / radius))
                pixels[x, y] = (100, 150, 200, intensity)
    
    return img

# Generate all required icon sizes
sizes = [32, 128, 256]
for size in sizes:
    img = create_icon(size)
    img.save(f'{size}x{size}.png')
    
    # Also create @2x version for macOS
    if size == 128:
        img.save('128x128@2x.png')

# Create ICO file (Windows)
img_32 = create_icon(32)
img_32.save('icon.ico', format='ICO')

print("Icons generated successfully!")