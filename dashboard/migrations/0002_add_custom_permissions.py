from django.db import migrations
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

def create_custom_permissions(apps, schema_editor):
    # Get the content type for the User model
    content_type = ContentType.objects.get_for_model(apps.get_model('dashboard', 'User'))
    
    # List of all custom permissions to create
    custom_permissions = [
        # Data Management permissions
        ('can_access_data', 'Can access data management'),
        ('can_access_data_entry', 'Can access data entry'),
        ('can_view_data_entry', 'Can view data entry'),
        ('can_delete_data_entry', 'Can delete data entry'),
        ('can_update_data_entry', 'Can update data entry'),
        ('can_access_data_edit', 'Can access data edit'),
        ('can_view_data_edit', 'Can view data edit'),
        ('can_delete_data_edit', 'Can delete data edit'),
        ('can_update_data_edit', 'Can update data edit'),
        ('can_access_enquiry', 'Can access enquiry'),
        ('can_view_enquiry', 'Can view enquiry'),
        ('can_delete_enquiry', 'Can delete enquiry'),
        ('can_update_enquiry', 'Can update enquiry'),
        
        # Setup permissions
        ('can_access_setup', 'Can access setup'),
        ('can_access_department', 'Can access department'),
        ('can_view_department', 'Can view department'),
        ('can_delete_department', 'Can delete department'),
        ('can_update_department', 'Can update department'),
        ('can_access_sub_department', 'Can access sub department'),
        ('can_view_sub_department', 'Can view sub department'),
        ('can_delete_sub_department', 'Can delete sub department'),
        ('can_update_sub_department', 'Can update sub department'),
        ('can_access_division_branch', 'Can access division branch'),
        ('can_view_division_branch', 'Can view division branch'),
        ('can_delete_division_branch', 'Can delete division branch'),
        ('can_update_division_branch', 'Can update division branch'),
        ('can_access_branch_dep_link', 'Can access branch department link'),
        ('can_view_branch_dep_link', 'Can view branch department link'),
        ('can_delete_branch_dep_link', 'Can delete branch department link'),
        ('can_update_branch_dep_link', 'Can update branch department link'),
        ('can_access_logo_upload', 'Can access logo upload'),
        ('can_view_logo_upload', 'Can view logo upload'),
        ('can_delete_logo_upload', 'Can delete logo upload'),
        ('can_update_logo_upload', 'Can update logo upload'),
        ('can_access_bulk_upload', 'Can access bulk upload'),
        ('can_view_bulk_upload', 'Can view bulk upload'),
        ('can_delete_bulk_upload', 'Can delete bulk upload'),
        ('can_update_bulk_upload', 'Can update bulk upload'),
        
        # User Management permissions
        ('can_access_user', 'Can access user management'),
        ('can_access_users', 'Can access users'),
        ('can_view_users', 'Can view users'),
        ('can_delete_users', 'Can delete users'),
        ('can_update_users', 'Can update users'),
        ('can_access_user_rights', 'Can access user rights'),
        ('can_view_user_rights', 'Can view user rights'),
        ('can_delete_user_rights', 'Can delete user rights'),
        ('can_update_user_rights', 'Can update user rights'),
        ('can_access_password_change', 'Can access password change'),
        ('can_view_password_change', 'Can view password change'),
        ('can_delete_password_change', 'Can delete password change'),
        ('can_update_password_change', 'Can update password change'),
        
        # Report permissions
        ('can_access_report', 'Can access reports'),
        ('can_access_log_report', 'Can access log report'),
        ('can_view_log_report', 'Can view log report'),
        ('can_delete_log_report', 'Can delete log report'),
        ('can_update_log_report', 'Can update log report'),
        ('can_access_register', 'Can access register'),
        ('can_view_register', 'Can view register'),
        ('can_delete_register', 'Can delete register'),
        ('can_update_register', 'Can update register'),
    ]
    
    # Create each permission
    for codename, name in custom_permissions:
        try:
            # Try to get existing permission
            perm = Permission.objects.get(
                codename=codename,
                content_type=content_type
            )
            # Update name if it exists
            perm.name = name
            perm.save()
        except Permission.DoesNotExist:
            # Create new permission if it doesn't exist
            Permission.objects.create(
                codename=codename,
                name=name,
                content_type=content_type,
            )

def remove_custom_permissions(apps, schema_editor):
    # Get the content type for the User model
    content_type = ContentType.objects.get_for_model(apps.get_model('dashboard', 'User'))
    
    # Remove all custom permissions
    Permission.objects.filter(content_type=content_type).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('dashboard', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_custom_permissions, remove_custom_permissions),
    ] 