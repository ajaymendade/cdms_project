# Generated by Django 5.2.1 on 2025-05-20 09:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0010_department'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubDepartment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sub_department_id', models.CharField(max_length=50, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('fields', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sub_departments', to='dashboard.department')),
            ],
            options={
                'ordering': ['department', 'sub_department_id'],
            },
        ),
    ]
