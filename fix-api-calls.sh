#!/bin/bash

# Script to fix all API calls to use the correct backend URL

FILES=(
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/dashboard/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/chat/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/gamification/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/study-buddy/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/groups/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/scheduler/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/mentors/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/income/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/resume-scanner/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/roadmap/new/page.tsx"
  "/home/oduai/PathWise/frontend/src/app/(dashboard)/roadmap/[id]/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Add import if not present
    if ! grep -q "import { getApiUrl } from" "$file"; then
      # Find the last import line and add after it
      sed -i '/^import.*from/a import { getApiUrl } from "@/lib/fetch-api";' "$file"
    fi
    
    # Replace all fetch("/api/v1 with fetch(getApiUrl("/api/v1
    sed -i 's/fetch("\(\/api\/v1[^"]*\)"/fetch(getApiUrl("\1")/g' "$file"
    
    echo "Fixed $file"
  fi
done

echo "All files fixed!"
