from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Permission
from django.utils.translation import gettext_lazy as _
from .models import (
    User, DivisionBranch, Department, SubDepartment, 
    BranchDepartmentLink, Logo, UserSubDepartment,
    DataEntryRecord, DataEntryFile, ActivityLog
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin interface for the User model."""
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'status', 'is_staff')
    list_filter = ('status', 'is_staff', 'is_superuser', 'groups')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'mobile_number')}),
        (_('Basic Permissions'), {
            'fields': ('is_active', 'status', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Data Management'), {
            'classes': ('collapse',),
            'fields': (
                'can_access_data',
                ('can_access_data_entry', 'can_view_data_entry',
                'can_create_data_entry', 'can_delete_data_entry', 'can_update_data_entry'),
                ('can_access_data_edit', 'can_view_data_edit', 'can_create_data_edit',
                'can_delete_data_edit', 'can_update_data_edit'),
                ('can_access_enquiry', 'can_view_enquiry', 'can_create_enquiry',
                'can_delete_enquiry', 'can_update_enquiry'),
            ),
        }),
        (_('Setup Management'), {
            'classes': ('collapse',),
            'fields': (
                'can_access_setup',
                ('can_access_department', 'can_view_department',
                'can_create_department', 'can_delete_department', 'can_update_department'),
                ('can_access_sub_department', 'can_view_sub_department',
                'can_create_sub_department', 'can_delete_sub_department',
                'can_update_sub_department'),
                ('can_access_division_branch', 'can_view_division_branch',
                'can_create_division_branch', 'can_delete_division_branch',
                'can_update_division_branch'),
                ('can_access_branch_dep_link', 'can_view_branch_dep_link',
                'can_create_branch_dep_link', 'can_delete_branch_dep_link',
                'can_update_branch_dep_link'),
                ('can_access_logo_upload', 'can_view_logo_upload',
                'can_create_logo_upload', 'can_delete_logo_upload',
                'can_update_logo_upload'),
                ('can_access_bulk_upload', 'can_view_bulk_upload',
                'can_create_bulk_upload', 'can_delete_bulk_upload',
                'can_update_bulk_upload'),
            ),
        }),
        (_('User Management'), {
            'classes': ('collapse',),
            'fields': (
                'can_access_user',
                ('can_access_users', 'can_view_users',
                'can_create_users', 'can_delete_users', 'can_update_users'),
                ('can_access_user_rights', 'can_view_user_rights',
                'can_create_user_rights', 'can_delete_user_rights',
                'can_update_user_rights'),
                ('can_access_password_change', 'can_view_password_change',
                'can_create_password_change', 'can_delete_password_change',
                'can_update_password_change'),
            ),
        }),
        (_('Report Management'), {
            'classes': ('collapse',),
            'fields': (
                'can_access_report',
                ('can_access_log_report', 'can_view_log_report',
                'can_create_log_report', 'can_delete_log_report', 'can_update_log_report'),
                ('can_access_register', 'can_view_register', 'can_create_register',
                'can_delete_register', 'can_update_register'),
            ),
        }),
        (_('Important dates'), {'fields': ('last_login',)}),
    )
    
    readonly_fields = ('last_login',)
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'mobile_number'),
        }),
    )

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }

    def save_model(self, request, obj, form, change):
        """Override save_model to handle permission hierarchy."""
        super().save_model(request, obj, form, change)
        
        # Define permission hierarchy
        permission_hierarchy = {
            'can_access_data': ['can_access_data_entry', 'can_access_data_edit', 'can_access_enquiry'],
            'can_access_data_entry': ['can_view_data_entry', 'can_create_data_entry', 'can_delete_data_entry', 'can_update_data_entry'],
            'can_access_data_edit': ['can_view_data_edit', 'can_create_data_edit', 'can_delete_data_edit', 'can_update_data_edit'],
            'can_access_enquiry': ['can_view_enquiry', 'can_create_enquiry', 'can_delete_enquiry', 'can_update_enquiry'],
            'can_access_setup': ['can_access_department', 'can_access_sub_department', 'can_access_division_branch', 
                               'can_access_branch_dep_link', 'can_access_logo_upload', 'can_access_bulk_upload'],
            'can_access_department': ['can_view_department', 'can_create_department', 'can_delete_department', 'can_update_department'],
            'can_access_sub_department': ['can_view_sub_department', 'can_create_sub_department', 'can_delete_sub_department', 'can_update_sub_department'],
            'can_access_division_branch': ['can_view_division_branch', 'can_create_division_branch', 'can_delete_division_branch', 'can_update_division_branch'],
            'can_access_branch_dep_link': ['can_view_branch_dep_link', 'can_create_branch_dep_link', 'can_delete_branch_dep_link', 'can_update_branch_dep_link'],
            'can_access_logo_upload': ['can_view_logo_upload', 'can_create_logo_upload', 'can_delete_logo_upload', 'can_update_logo_upload'],
            'can_access_bulk_upload': ['can_view_bulk_upload', 'can_create_bulk_upload', 'can_delete_bulk_upload', 'can_update_bulk_upload'],
            'can_access_user': ['can_access_users', 'can_access_user_rights', 'can_access_password_change'],
            'can_access_users': ['can_view_users', 'can_create_users', 'can_delete_users', 'can_update_users'],
            'can_access_user_rights': ['can_view_user_rights', 'can_create_user_rights', 'can_delete_user_rights', 'can_update_user_rights'],
            'can_access_password_change': ['can_view_password_change', 'can_create_password_change', 'can_delete_password_change', 'can_update_password_change'],
            'can_access_report': ['can_access_log_report', 'can_access_register'],
            'can_access_log_report': ['can_view_log_report', 'can_create_log_report', 'can_delete_log_report', 'can_update_log_report'],
            'can_access_register': ['can_view_register', 'can_create_register', 'can_delete_register', 'can_update_register'],
        }
        
        # Update permissions based on hierarchy
        for field in obj._meta.fields:
            if field.name.startswith('can_'):
                if getattr(obj, field.name):
                    # Set parent permissions
                    for parent, children in permission_hierarchy.items():
                        if field.name in children:
                            setattr(obj, parent, True)
                    
                    # Add to user_permissions if it exists in the Permission model
                    try:
                        perm = Permission.objects.get(codename=field.name)
                        obj.user_permissions.add(perm)
                    except Permission.DoesNotExist:
                        continue
        
        obj.save()

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_id', 'name', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('department_id', 'name')
    ordering = ('department_id',)

@admin.register(SubDepartment)
class SubDepartmentAdmin(admin.ModelAdmin):
    list_display = ('sub_department_id', 'name', 'department', 'created_at', 'updated_at')
    list_filter = ('department', 'created_at', 'updated_at')
    search_fields = ('sub_department_id', 'name', 'department__name')
    ordering = ('department', 'sub_department_id')
    raw_id_fields = ('department',)

@admin.register(DivisionBranch)
class DivisionBranchAdmin(admin.ModelAdmin):
    list_display = ('division_id', 'name', 'address', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('division_id', 'name', 'address')
    ordering = ('division_id',)

@admin.register(BranchDepartmentLink)
class BranchDepartmentLinkAdmin(admin.ModelAdmin):
    list_display = ('branch', 'department', 'sub_department', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('branch__name', 'department__name', 'sub_department__name')
    raw_id_fields = ('branch', 'department', 'sub_department')
    ordering = ('branch', 'department', 'sub_department')

@admin.register(Logo)
class LogoAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization_name', 'is_active', 'created_at', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('name', 'organization_name')
    readonly_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(UserSubDepartment)
class UserSubDepartmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(DataEntryRecord)
class DataEntryRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'branch', 'department', 'sub_department', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'branch', 'department', 'sub_department')
    search_fields = ('user__username', 'branch__name', 'department__name', 'sub_department__name')
    raw_id_fields = ('user', 'branch', 'department', 'sub_department')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(DataEntryFile)
class DataEntryFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'file_type', 'file_size', 'record', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('file_name', 'record__user__username')
    raw_id_fields = ('record',)
    readonly_fields = ('uploaded_at',)
    ordering = ('-uploaded_at',)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'page', 'model_name', 'object_id', 'created_at')
    list_filter = ('action', 'page', 'model_name', 'created_at')
    search_fields = ('user__username', 'page', 'model_name', 'object_id')
    readonly_fields = ('user', 'action', 'page', 'model_name', 'object_id', 'details', 'ip_address', 'user_agent', 'created_at')
    ordering = ('-created_at',)
