#!/bin/bash

# Script to set up Firebase configuration for GoShotBroad
# Usage: ./setup-env.sh

# Output colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔥 GoShotBroad Firebase Configuration Setup 🔥"
echo "---------------------------------------------"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo -e "${YELLOW}A .env.local file already exists.${NC}"
  read -p "Do you want to overwrite it? (y/n): " overwrite
  if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
    echo -e "${YELLOW}Setup canceled. Your .env.local file was not modified.${NC}"
    exit 0
  fi
fi

echo "Please enter your Firebase configuration details:"
echo "(Press Enter to keep existing values if applicable)"
echo ""

# Read existing values if file exists
if [ -f ".env.local" ]; then
  API_KEY=$(grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local | cut -d '=' -f2 | tr -d '"')
  AUTH_DOMAIN=$(grep NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN .env.local | cut -d '=' -f2 | tr -d '"')
  PROJECT_ID=$(grep NEXT_PUBLIC_FIREBASE_PROJECT_ID .env.local | cut -d '=' -f2 | tr -d '"')
  STORAGE_BUCKET=$(grep NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET .env.local | cut -d '=' -f2 | tr -d '"')
  MESSAGING_SENDER_ID=$(grep NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID .env.local | cut -d '=' -f2 | tr -d '"')
  APP_ID=$(grep NEXT_PUBLIC_FIREBASE_APP_ID .env.local | cut -d '=' -f2 | tr -d '"')
  MEASUREMENT_ID=$(grep NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID .env.local | cut -d '=' -f2 | tr -d '"')
fi

# Prompt for Firebase configuration values
read -p "Firebase API Key [$API_KEY]: " input_api_key
API_KEY=${input_api_key:-$API_KEY}

read -p "Firebase Auth Domain [$AUTH_DOMAIN]: " input_auth_domain
AUTH_DOMAIN=${input_auth_domain:-$AUTH_DOMAIN}

read -p "Firebase Project ID [$PROJECT_ID]: " input_project_id
PROJECT_ID=${input_project_id:-$PROJECT_ID}

read -p "Firebase Storage Bucket [$STORAGE_BUCKET]: " input_storage_bucket
STORAGE_BUCKET=${input_storage_bucket:-$STORAGE_BUCKET}

read -p "Firebase Messaging Sender ID [$MESSAGING_SENDER_ID]: " input_messaging_sender_id
MESSAGING_SENDER_ID=${input_messaging_sender_id:-$MESSAGING_SENDER_ID}

read -p "Firebase App ID [$APP_ID]: " input_app_id
APP_ID=${input_app_id:-$APP_ID}

read -p "Firebase Measurement ID [$MEASUREMENT_ID]: " input_measurement_id
MEASUREMENT_ID=${input_measurement_id:-$MEASUREMENT_ID}

# Create or update .env.local file
cat > .env.local << EOL
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${MESSAGING_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${APP_ID}
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${MEASUREMENT_ID}
EOL

echo ""
echo -e "${GREEN}✅ Firebase configuration has been saved to .env.local${NC}"
echo ""
echo "To apply these changes, restart your development server:"
echo "npm run dev"
echo ""
echo -e "${YELLOW}Important:${NC} Make sure .env.local is in your .gitignore to keep your API keys secure."
echo "Current .gitignore status for .env.local:"

if grep -q ".env.local" .gitignore; then
  echo -e "${GREEN}✅ .env.local is properly listed in .gitignore${NC}"
else
  echo -e "${RED}❌ .env.local is NOT listed in .gitignore - consider adding it${NC}"
fi
