# Generated by Django 5.2.1 on 2025-05-19 19:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0004_alter_user_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='can_access_password_change',
            field=models.BooleanField(default=False, verbose_name='Change Password'),
        ),
        migrations.AddField(
            model_name='user',
            name='can_access_user',
            field=models.BooleanField(default=False, verbose_name='Access User Management'),
        ),
        migrations.AddField(
            model_name='user',
            name='can_access_user_rights',
            field=models.BooleanField(default=False, verbose_name='Access User Rights'),
        ),
        migrations.AddField(
            model_name='user',
            name='can_access_users',
            field=models.BooleanField(default=False, verbose_name='Access Users Page'),
        ),
        migrations.AddField(
            model_name='user',
            name='can_delete_users',
            field=models.BooleanField(default=False, verbose_name='Delete Users'),
        ),
        migrations.AddField(
            model_name='user',
            name='can_edit_users',
            field=models.BooleanField(default=False, verbose_name='Edit Users'),
        ),
        migrations.AddField(
            model_name='user',
            name='can_update_users',
            field=models.BooleanField(default=False, verbose_name='Update Users'),
        ),
        migrations.AddField(
            model_name='user',
            name='can_view_users',
            field=models.BooleanField(default=False, verbose_name='View Users'),
        ),
    ]
