from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    User, DivisionBranch, Department, SubDepartment, 
    BranchDepartmentLink, Logo, UserSubDepartment,
    DataEntryRecord, DataEntryFile, ActivityLog
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin interface for the User model."""
    
    list_display = ('email', 'username', 'first_name', 'last_name', 'mobile_number', 'status', 'is_staff', 'date_joined')
    list_filter = ('status', 'is_staff', 'is_superuser', 'groups')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'mobile_number')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'mobile_number')}),
        (_('Status'), {'fields': ('status',)}),
        (_('Permissions'), {
            'fields': ('user_permissions',),
            'classes': ('collapse',),
            'description': _('User permissions for different sections of the application')
        }),
        (_('System Rights'), {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
            'classes': ('collapse',),
            'description': _('System-level permissions')
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'mobile_number', 'password1', 'password2', 'status'),
        }),
    )
    
    def get_queryset(self, request):
        """Return a QuerySet of all model instances that can be edited by the admin site."""
        return super().get_queryset(request)
    
    def get_form(self, request, obj=None, **kwargs):
        """Return a Form class for use in the admin add view."""
        form = super().get_form(request, obj, **kwargs)
        if obj is None:  # This is the add form
            form.base_fields['status'].initial = 'active'
        return form

    def get_fieldsets(self, request, obj=None):
        """Return fieldsets for the admin form."""
        fieldsets = super().get_fieldsets(request, obj)
        if obj is None:  # This is the add form
            return self.add_fieldsets
        return fieldsets

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        """Customize the form field for many-to-many relationships."""
        if db_field.name == "user_permissions":
            # Get the current section being edited
            section = request.GET.get('section', '')
            
            # Filter permissions based on the section
            if section == 'crud':
                kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                    content_type__app_label='dashboard',
                    codename__in=['can_view', 'can_edit', 'can_delete', 'can_update']
                ).order_by('name')
            elif section == 'menu':
                kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                    content_type__app_label='dashboard',
                    codename__in=[
                        'can_access_data',
                        'can_access_setup',
                        'can_access_user',
                        'can_access_report'
                    ]
                ).order_by('name')
            elif section == 'pages':
                kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                    content_type__app_label='dashboard',
                    codename__startswith='can_access_',
                    codename__not__in=[
                        'can_access_data',
                        'can_access_setup',
                        'can_access_user',
                        'can_access_report'
                    ]
                ).order_by('name')
            else:
                kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                    content_type__app_label='dashboard'
                ).order_by('name')
        return super().formfield_for_manytomany(db_field, request, **kwargs)

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
