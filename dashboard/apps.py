from django.apps import AppConfig


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'

    def ready(self):
        try:
            from .create_superadmin import create_superadmin
            create_superadmin()
        except Exception as e:
            print(f"Error in ready method: {str(e)}")
