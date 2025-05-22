from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

class Command(BaseCommand):
    help = 'Sets up the project by running migrations and creating superadmin'

    def handle(self, *args, **options):
        try:
            # Run makemigrations
            self.stdout.write('Running makemigrations...')
            call_command('makemigrations')
            self.stdout.write(self.style.SUCCESS('Makemigrations completed successfully!'))

            # Run migrate
            self.stdout.write('Running migrations...')
            call_command('migrate')
            self.stdout.write(self.style.SUCCESS('Migrations completed successfully!'))

            # Create superadmin
            self.stdout.write('Creating superadmin...')
            if not User.objects.filter(email='admin@gmail.com').exists():
                User.objects.create_superuser(
                    username='admin',
                    email='admin@gmail.com',
                    password='admin@123',
                    first_name='Super',
                    last_name='Admin',
                    status='active'
                )
                self.stdout.write(self.style.SUCCESS('Superadmin created successfully!'))
            else:
                self.stdout.write(self.style.SUCCESS('Superadmin already exists!'))

            self.stdout.write(self.style.SUCCESS('\nProject setup completed successfully!'))
            self.stdout.write('\nYou can now login with:')
            self.stdout.write('Email: admin@gmail.com')
            self.stdout.write('Password: admin@123')

        except IntegrityError:
            self.stdout.write(self.style.ERROR('Error: Username \'admin\' might already exist. Please use a different username.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during setup: {str(e)}')) 