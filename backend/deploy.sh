#!/bin/bash

# Deployment script for Lambda functions
# This script creates deployment packages for both Lambda functions

set -e  # Exit on error

echo "================================"
echo "Lambda Deployment Package Creator"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create deployment package
create_package() {
    local function_name=$1
    local function_dir="functions/$function_name"
    
    echo -e "${YELLOW}Processing $function_name...${NC}"
    
    # Check if directory exists
    if [ ! -d "$function_dir" ]; then
        echo -e "${RED}Error: Directory $function_dir not found${NC}"
        return 1
    fi
    
    # Navigate to function directory
    cd "$function_dir"
    
    # Install dependencies
    echo "  Installing dependencies..."
    npm install --production
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}  Failed to install dependencies${NC}"
        cd ../..
        return 1
    fi
    
    # Create zip file
    echo "  Creating deployment package..."
    zip -r "${function_name}.zip" . -x "*.git*" "*.zip"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}  Failed to create zip file${NC}"
        cd ../..
        return 1
    fi
    
    # Get file size
    local size=$(du -h "${function_name}.zip" | cut -f1)
    echo -e "${GREEN}  ✓ Created ${function_name}.zip (${size})${NC}"
    
    # Navigate back
    cd ../..
    
    return 0
}

# Main execution
echo "Creating deployment packages..."
echo ""

# Create registerStudent package
create_package "registerStudent"
REGISTER_STATUS=$?

echo ""

# Create listRegistrations package
create_package "listRegistrations"
LIST_STATUS=$?

echo ""
echo "================================"
echo "Summary"
echo "================================"

if [ $REGISTER_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ registerStudent.zip created successfully${NC}"
    echo "  Location: functions/registerStudent/registerStudent.zip"
else
    echo -e "${RED}✗ registerStudent.zip failed${NC}"
fi

if [ $LIST_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ listRegistrations.zip created successfully${NC}"
    echo "  Location: functions/listRegistrations/listRegistrations.zip"
else
    echo -e "${RED}✗ listRegistrations.zip failed${NC}"
fi

echo ""
echo "Next Steps:"
echo "1. Go to AWS Lambda Console"
echo "2. Upload the .zip files to respective functions"
echo "3. Configure environment variables"
echo "4. Test the functions"
echo ""

# Exit with error if any package failed
if [ $REGISTER_STATUS -ne 0 ] || [ $LIST_STATUS -ne 0 ]; then
    exit 1
fi

echo -e "${GREEN}All deployment packages created successfully!${NC}"
