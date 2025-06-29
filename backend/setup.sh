#!/bin/bash

# Create virtual environment
python -m venv venv

# Activate virtual environment (Linux/Mac)
# source venv/bin/activate

# For Windows, use: 
source venv/Scripts/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
