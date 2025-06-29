# POS Billing System

A modern Point of Sale (POS) billing system with Django REST Framework backend and Next.js frontend.

## Backend Setup (Django)

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Create and activate virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. Run migrations:
   \`\`\`bash
   python manage.py makemigrations
   python manage.py migrate
   \`\`\`

5. Create superuser (optional):
   \`\`\`bash
   python manage.py createsuperuser
   \`\`\`

6. Start the development server:
   \`\`\`bash
   python manage.py runserver
   \`\`\`

The Django API will be available at `http://127.0.0.1:8000/`

## Frontend Setup (Next.js)

The frontend is already configured to work with the Django backend. Make sure the Django server is running on port 8000.

## API Endpoints

- `GET /api/sales/` - List all sales
- `POST /api/sales/` - Create a new sale
- `GET /api/sales/{id}/` - Get specific sale details
- `GET /api/sales/daily_summary/` - Get daily sales summary
- `GET /api/sales/weekly_summary/` - Get weekly sales summary

## Features

### Frontend
- Add products with name, price, and quantity
- Real-time total calculations
- Discount management (percentage or fixed amount)
- Payment processing with change calculation
- Print receipt functionality
- Save sales to database
- Status notifications

### Backend
- RESTful API for sales management
- Sales and SaleItems models
- Automatic sale ID generation
- Daily and weekly sales summaries
- Django admin interface
- CORS enabled for frontend integration

## Database Schema

### Sale Model
- sale_id: Unique identifier
- subtotal: Total before discount
- discount_type: 'percentage' or 'amount'
- discount_value: Discount input value
- discount_amount: Calculated discount amount
- total_amount: Final total after discount
- payment_received: Amount paid by customer
- change_amount: Change given to customer
- payment_status: 'pending', 'completed', or 'cancelled'
- created_at/updated_at: Timestamps

### SaleItem Model
- sale: Foreign key to Sale
- product_name: Name of the product
- unit_price: Price per unit
- quantity: Number of items
- total_price: unit_price × quantity
- created_at: Timestamp
\`\`\`

## Key Features Added:

**Backend (Django REST Framework):**
- Complete Django project structure
- Sale and SaleItem models with relationships
- RESTful API endpoints for CRUD operations
- Automatic sale ID generation
- Daily and weekly sales summaries
- Django admin interface
- CORS configuration for frontend integration

**Frontend Updates:**
- API integration for saving sales data
- Loading states and status notifications
- Success/error handling
- Sale ID display in receipts
- Improved user feedback

**Database Features:**
- Proper relational database design
- Automatic calculations
- Payment status tracking
- Timestamps for audit trails

To get started:
1. Set up the Django backend first
2. Run migrations to create the database
3. Start the Django server on port 8000
4. The frontend will automatically connect to the API
