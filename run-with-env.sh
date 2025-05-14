#!/bin/bash

# Script to help run the application with proper Firebase configuration
# Usage: ./run-with-env.sh

# Output colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔥 GoShotBroad Startup Helper 🔥"
echo "--------------------------------"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Warning: .env.local file not found.${NC}"
  echo -e "Creating a template .env.local file for you..."
  
  # Create template .env.local file
  cat > .env.local << EOL
# Firebase Configuration
# Replace these values with your actual Firebase project credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
EOL
  
  echo -e "${YELLOW}Please edit the .env.local file with your Firebase credentials before proceeding.${NC}"
  echo -e "You can find these values in your Firebase project settings."
  read -p "Do you want to edit the file now? (y/n): " edit_file
  
  if [[ $edit_file == "y" || $edit_file == "Y" ]]; then
    if command -v nano &> /dev/null; then
      nano .env.local
    elif command -v vim &> /dev/null; then
      vim .env.local
    elif command -v code &> /dev/null; then
      code .env.local
    else
      echo -e "${YELLOW}Please open and edit .env.local manually with your preferred editor.${NC}"
    fi
  fi
else
  echo -e "${GREEN}.env.local file found.${NC}"
fi

# Start the application
echo ""
echo -e "${GREEN}Starting GoShotBroad...${NC}"
npm run dev
