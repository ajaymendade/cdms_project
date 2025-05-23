# Generated by Django 5.2.1 on 2025-05-19 18:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0003_alter_user_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'ordering': ['-date_joined'], 'permissions': [('can_view', 'Can view records'), ('can_edit', 'Can edit records'), ('can_delete', 'Can delete records'), ('can_update', 'Can update records'), ('can_access_data', 'Can access data management'), ('can_access_setup', 'Can access setup'), ('can_access_user', 'Can access user management'), ('can_access_report', 'Can access reports'), ('can_access_data_entry', 'Can access data entry'), ('can_access_data_edit', 'Can access data edit'), ('can_access_enquiry', 'Can access enquiry'), ('can_access_department', 'Can access department'), ('can_access_sub_department', 'Can access sub department'), ('can_access_division_branch', 'Can access division branch'), ('can_access_branch_dep_link', 'Can access branch department link'), ('can_access_logo_upload', 'Can access logo upload'), ('can_access_bulk_upload', 'Can access bulk upload'), ('can_access_create_user', 'Can access create user'), ('can_access_user_list', 'Can access user list'), ('can_access_user_rights', 'Can access user rights'), ('can_access_password_change', 'Can access password change'), ('can_access_log_report', 'Can access log report'), ('can_access_register', 'Can access register')], 'verbose_name': 'user', 'verbose_name_plural': 'users'},
        ),
    ]
