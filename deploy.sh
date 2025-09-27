#!/bin/bash

# 🚀 Offer Bazar Deployment Script
echo "🚀 Starting Offer Bazar Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    
    cd backend
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Initialize git if not already done
    if [ ! -d ".git" ]; then
        print_status "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial backend commit"
    fi
    
    # Deploy to Railway
    print_status "Deploying to Railway..."
    railway up
    
    if [ $? -eq 0 ]; then
        print_success "Backend deployed successfully!"
        print_status "Please note your Railway URL for the next step."
    else
        print_error "Backend deployment failed!"
        exit 1
    fi
    
    cd ..
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    cd frontend
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        print_success "Frontend deployed successfully!"
    else
        print_error "Frontend deployment failed!"
        exit 1
    fi
    
    cd ..
}

# Main deployment process
main() {
    echo "🎯 Offer Bazar Deployment Script"
    echo "================================"
    
    # Check requirements
    check_requirements
    
    # Ask user for deployment choice
    echo ""
    echo "Choose deployment option:"
    echo "1. Deploy Backend Only"
    echo "2. Deploy Frontend Only"
    echo "3. Deploy Both (Full Deployment)"
    echo "4. Exit"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            echo ""
            print_status "Backend deployed. Now deploying frontend..."
            deploy_frontend
            ;;
        4)
            print_status "Deployment cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment completed!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Set environment variables in your deployment platforms"
    echo "2. Configure CORS settings in your backend"
    echo "3. Test your application"
    echo "4. Set up custom domains (optional)"
    echo ""
    echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
}

# Run main function
main
