from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

def create_superadmin():
    """
    Creates a superadmin user if it doesn't exist.
    Email: admin@gmail.com
    Password: admin@123
    """
    try:
        # Check if superadmin already exists
        if not User.objects.filter(email='admin@gmail.com').exists():
            # Create superadmin
            User.objects.create_superuser(
                username='admin',
                email='admin@gmail.com',
                password='admin@123',
                first_name='Super',
                last_name='Admin',
                status='active'
            )
            print("Superadmin created successfully!")
        else:
            print("Superadmin already exists!")
    except IntegrityError:
        print("Error: Username 'admin' might already exist. Please use a different username.")
    except Exception as e:
        print(f"Error creating superadmin: {str(e)}")

# This will be called when the app starts
create_superadmin() 