#!/bin/bash

# Request Management System - Project Structure Setup Script
# Run with: bash scripts/setup.sh

echo "🚀 Setting up Request Management System structure..."
echo ""

# Create app directories
echo "📁 Creating app directories..."
mkdir -p app/login
mkdir -p app/signup
mkdir -p app/requests
mkdir -p app/student/dashboard
mkdir -p app/student/create-request
mkdir -p app/student/requests
mkdir -p app/staff/dashboard
mkdir -p app/staff/requests
mkdir -p app/cellule/dashboard
mkdir -p app/cellule/requests

# Create component directories
echo "📁 Creating component directories..."
mkdir -p components/shared
mkdir -p components/tables
mkdir -p components/ui
mkdir -p components/forms

# Create lib directory
mkdir -p lib

# Create public directory
mkdir -p public/images

echo ""
echo "📄 Creating page files..."

# Create app page files
touch app/login/page.tsx
touch app/signup/page.tsx
touch app/requests/\[id\]/page.tsx
touch app/student/dashboard/page.tsx
touch app/student/create-request/page.tsx
touch app/student/requests/page.tsx
touch app/student/requests/\[id\]/page.tsx
touch app/staff/dashboard/page.tsx
touch app/staff/requests/page.tsx
touch app/staff/requests/\[id\]/page.tsx
touch app/cellule/dashboard/page.tsx
touch app/cellule/requests/page.tsx
touch app/cellule/requests/\[id\]/page.tsx

echo ""
echo "📄 Creating component files..."

# Create shared components
touch components/shared/navbar.tsx
touch components/shared/sidebar.tsx
touch components/shared/layout-wrapper.tsx
touch components/shared/progress-map.tsx
touch components/shared/timeline-popover.tsx
touch components/shared/response-modal.tsx

# Create table components
touch components/tables/data-table.tsx
touch components/tables/columns.tsx

# Create form components
touch components/forms/request-form.tsx
touch components/forms/response-form.tsx

echo ""
echo "📄 Creating lib files..."

# Create lib files
touch lib/api.ts
touch lib/utils.ts
touch lib/types.ts
touch lib/pdf-export.ts
touch lib/tanstack-table-utils.ts

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📋 Summary:"
echo "   ✓ 10 app directories"
echo "   ✓ 4 component directories"
echo "   ✓ 13 page files"
echo "   ✓ 6 shared components"
echo "   ✓ 2 table components"
echo "   ✓ 2 form components"
echo "   ✓ 5 lib files"
echo ""
echo "🎉 Ready to start development!"
