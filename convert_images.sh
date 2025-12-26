#!/bin/bash

# Navigate to the directory containing the images
cd src/assets/images || exit

# Find and convert all jpg, jpeg, and png images to webp
for img in *.jpg *.jpeg *.png; do
  if [ -f "$img" ]; then
    convert "$img" -quality 75 "${img%.*}.webp"
  fi
done
