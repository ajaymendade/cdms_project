from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', 'active')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    """Custom user model with email as the unique identifier."""
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )
    email = models.EmailField(_('email address'), unique=True)
    mobile_number = models.CharField(_('mobile number'), max_length=15, blank=True)
    status = models.CharField(
        _('status'),
        max_length=10,
        choices=STATUS_CHOICES,
        default='active',
        help_text=_('User account status')
    )
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    last_login = models.DateTimeField(_('last login'), auto_now=True)

    # Data Management Permissions
    can_access_data = models.BooleanField(default=False, verbose_name="Access Data Management")
    can_access_data_entry = models.BooleanField(default=False, verbose_name="Access Data Entry")
    can_view_data_entry = models.BooleanField(default=False, verbose_name="View Data Entry")
    can_create_data_entry = models.BooleanField(default=False, verbose_name="Create Data Entry")
    can_delete_data_entry = models.BooleanField(default=False, verbose_name="Delete Data Entry")
    can_update_data_entry = models.BooleanField(default=False, verbose_name="Update Data Entry")
    can_access_data_edit = models.BooleanField(default=False, verbose_name="Access Data Edit")
    can_view_data_edit = models.BooleanField(default=False, verbose_name="View Data Edit")
    can_create_data_edit = models.BooleanField(default=False, verbose_name="Create Data Edit")
    can_delete_data_edit = models.BooleanField(default=False, verbose_name="Delete Data Edit")
    can_update_data_edit = models.BooleanField(default=False, verbose_name="Update Data Edit")
    can_access_enquiry = models.BooleanField(default=False, verbose_name="Access Enquiry")
    can_view_enquiry = models.BooleanField(default=False, verbose_name="View Enquiry")
    can_create_enquiry = models.BooleanField(default=False, verbose_name="Create Enquiry")
    can_delete_enquiry = models.BooleanField(default=False, verbose_name="Delete Enquiry")
    can_update_enquiry = models.BooleanField(default=False, verbose_name="Update Enquiry")

    # Setup Permissions
    can_access_setup = models.BooleanField(default=False, verbose_name="Access Setup")
    can_access_department = models.BooleanField(default=False, verbose_name="Access Department")
    can_view_department = models.BooleanField(default=False, verbose_name="View Department")
    can_create_department = models.BooleanField(default=False, verbose_name="Create Department")
    can_delete_department = models.BooleanField(default=False, verbose_name="Delete Department")
    can_update_department = models.BooleanField(default=False, verbose_name="Update Department")
    can_access_sub_department = models.BooleanField(default=False, verbose_name="Access Sub Department")
    can_view_sub_department = models.BooleanField(default=False, verbose_name="View Sub Department")
    can_create_sub_department = models.BooleanField(default=False, verbose_name="Create Sub Department")
    can_delete_sub_department = models.BooleanField(default=False, verbose_name="Delete Sub Department")
    can_update_sub_department = models.BooleanField(default=False, verbose_name="Update Sub Department")
    can_access_division_branch = models.BooleanField(default=False, verbose_name="Access Division Branch")
    can_view_division_branch = models.BooleanField(default=False, verbose_name="View Division Branch")
    can_create_division_branch = models.BooleanField(default=False, verbose_name="Create Division Branch")
    can_delete_division_branch = models.BooleanField(default=False, verbose_name="Delete Division Branch")
    can_update_division_branch = models.BooleanField(default=False, verbose_name="Update Division Branch")
    can_access_branch_dep_link = models.BooleanField(default=False, verbose_name="Access Branch Department Link")
    can_view_branch_dep_link = models.BooleanField(default=False, verbose_name="View Branch Department Link")
    can_create_branch_dep_link = models.BooleanField(default=False, verbose_name="Create Branch Department Link")
    can_delete_branch_dep_link = models.BooleanField(default=False, verbose_name="Delete Branch Department Link")
    can_update_branch_dep_link = models.BooleanField(default=False, verbose_name="Update Branch Department Link")
    can_access_logo_upload = models.BooleanField(default=False, verbose_name="Access Logo Upload")
    can_view_logo_upload = models.BooleanField(default=False, verbose_name="View Logo Upload")
    can_create_logo_upload = models.BooleanField(default=False, verbose_name="Create Logo Upload")
    can_delete_logo_upload = models.BooleanField(default=False, verbose_name="Delete Logo Upload")
    can_update_logo_upload = models.BooleanField(default=False, verbose_name="Update Logo Upload")
    can_access_bulk_upload = models.BooleanField(default=False, verbose_name="Access Bulk Upload")
    can_view_bulk_upload = models.BooleanField(default=False, verbose_name="View Bulk Upload")
    can_create_bulk_upload = models.BooleanField(default=False, verbose_name="Create Bulk Upload")
    can_delete_bulk_upload = models.BooleanField(default=False, verbose_name="Delete Bulk Upload")
    can_update_bulk_upload = models.BooleanField(default=False, verbose_name="Update Bulk Upload")

    # User Management Permissions
    can_access_user = models.BooleanField(default=False, verbose_name="Access User Management")
    can_access_users = models.BooleanField(default=False, verbose_name="Access Users")
    can_view_users = models.BooleanField(default=False, verbose_name="View Users")
    can_create_users = models.BooleanField(default=False, verbose_name="Create Users")
    can_delete_users = models.BooleanField(default=False, verbose_name="Delete Users")
    can_update_users = models.BooleanField(default=False, verbose_name="Update Users")
    can_access_user_rights = models.BooleanField(default=False, verbose_name="Access User Rights")
    can_view_user_rights = models.BooleanField(default=False, verbose_name="View User Rights")
    can_create_user_rights = models.BooleanField(default=False, verbose_name="Create User Rights")
    can_delete_user_rights = models.BooleanField(default=False, verbose_name="Delete User Rights")
    can_update_user_rights = models.BooleanField(default=False, verbose_name="Update User Rights")
    can_access_password_change = models.BooleanField(default=False, verbose_name="Access Password Change")
    can_view_password_change = models.BooleanField(default=False, verbose_name="View Password Change")
    can_create_password_change = models.BooleanField(default=False, verbose_name="Create Password Change")
    can_delete_password_change = models.BooleanField(default=False, verbose_name="Delete Password Change")
    can_update_password_change = models.BooleanField(default=False, verbose_name="Update Password Change")

    # Report Permissions
    can_access_report = models.BooleanField(default=False, verbose_name="Access Reports")
    can_access_log_report = models.BooleanField(default=False, verbose_name="Access Log Report")
    can_view_log_report = models.BooleanField(default=False, verbose_name="View Log Report")
    can_create_log_report = models.BooleanField(default=False, verbose_name="Create Log Report")
    can_delete_log_report = models.BooleanField(default=False, verbose_name="Delete Log Report")
    can_update_log_report = models.BooleanField(default=False, verbose_name="Update Log Report")
    can_access_register = models.BooleanField(default=False, verbose_name="Access Register")
    can_view_register = models.BooleanField(default=False, verbose_name="View Register")
    can_create_register = models.BooleanField(default=False, verbose_name="Create Register")
    can_delete_register = models.BooleanField(default=False, verbose_name="Delete Register")
    can_update_register = models.BooleanField(default=False, verbose_name="Update Register")

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
        permissions = [
            # Parent Menu Access Permissions
            ("can_access_data", "Can access data management"),
            ("can_access_setup", "Can access setup"),
            ("can_access_user", "Can access user management"),
            ("can_access_report", "Can access reports"),
            
            # Data Management Pages
            ("can_access_data_entry", "Can access data entry"),
            ("can_view_data_entry", "Can view data entry"),
            ("can_create_data_entry", "Can create data entry"),
            ("can_delete_data_entry", "Can delete data entry"),
            ("can_update_data_entry", "Can update data entry"),
            
            ("can_access_data_edit", "Can access data edit"),
            ("can_view_data_edit", "Can view data edit"),
            ("can_create_data_edit", "Can create data edit"),
            ("can_delete_data_edit", "Can delete data edit"),
            ("can_update_data_edit", "Can update data edit"),
            
            ("can_access_enquiry", "Can access enquiry"),
            ("can_view_enquiry", "Can view enquiry"),
            ("can_create_enquiry", "Can create enquiry"),
            ("can_delete_enquiry", "Can delete enquiry"),
            ("can_update_enquiry", "Can update enquiry"),
            
            # Setup Pages
            ("can_access_department", "Can access department"),
            ("can_view_department", "Can view department"),
            ("can_create_department", "Can create department"),
            ("can_delete_department", "Can delete department"),
            ("can_update_department", "Can update department"),
            
            ("can_access_sub_department", "Can access sub department"),
            ("can_view_sub_department", "Can view sub department"),
            ("can_create_sub_department", "Can create sub department"),
            ("can_delete_sub_department", "Can delete sub department"),
            ("can_update_sub_department", "Can update sub department"),
            
            ("can_access_division_branch", "Can access division branch"),
            ("can_view_division_branch", "Can view division branch"),
            ("can_create_division_branch", "Can create division branch"),
            ("can_delete_division_branch", "Can delete division branch"),
            ("can_update_division_branch", "Can update division branch"),
            
            ("can_access_branch_dep_link", "Can access branch department link"),
            ("can_view_branch_dep_link", "Can view branch department link"),
            ("can_create_branch_dep_link", "Can create branch department link"),
            ("can_delete_branch_dep_link", "Can delete branch department link"),
            ("can_update_branch_dep_link", "Can update branch department link"),
            
            ("can_access_logo_upload", "Can access logo upload"),
            ("can_view_logo_upload", "Can view logo upload"),
            ("can_create_logo_upload", "Can create logo upload"),
            ("can_delete_logo_upload", "Can delete logo upload"),
            ("can_update_logo_upload", "Can update logo upload"),
            
            ("can_access_bulk_upload", "Can access bulk upload"),
            ("can_view_bulk_upload", "Can view bulk upload"),
            ("can_create_bulk_upload", "Can create bulk upload"),
            ("can_delete_bulk_upload", "Can delete bulk upload"),
            ("can_update_bulk_upload", "Can update bulk upload"),
            
            # User Management Pages
            ("can_access_users", "Can access users"),
            ("can_view_users", "Can view users"),
            ("can_create_users", "Can create users"),
            ("can_delete_users", "Can delete users"),
            ("can_update_users", "Can update users"),
            
            ("can_access_user_rights", "Can access user rights"),
            ("can_view_user_rights", "Can view user rights"),
            ("can_create_user_rights", "Can create user rights"),
            ("can_delete_user_rights", "Can delete user rights"),
            ("can_update_user_rights", "Can update user rights"),
            
            ("can_access_password_change", "Can access password change"),
            ("can_view_password_change", "Can view password change"),
            ("can_create_password_change", "Can create password change"),
            ("can_delete_password_change", "Can delete password change"),
            ("can_update_password_change", "Can update password change"),
            
            # Report Pages
            ("can_access_log_report", "Can access log report"),
            ("can_view_log_report", "Can view log report"),
            ("can_create_log_report", "Can create log report"),
            ("can_delete_log_report", "Can delete log report"),
            ("can_update_log_report", "Can update log report"),
            
            ("can_access_register", "Can access register"),
            ("can_view_register", "Can view register"),
            ("can_create_register", "Can create register"),
            ("can_delete_register", "Can delete register"),
            ("can_update_register", "Can update register"),
        ]

    def __str__(self):
        return self.email

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def get_page_permissions(self):
        return {
            'data_management': {
                'access': self.can_access_data,
                'pages': {
                    'data_entry': {
                        'access': self.can_access_data_entry,
                        'permissions': {
                            'view': self.can_view_data_entry,
                            'create': self.can_create_data_entry,
                            'delete': self.can_delete_data_entry,
                            'update': self.can_update_data_entry
                        }
                    },
                    'data_edit': {
                        'access': self.can_access_data_edit,
                        'permissions': {
                            'view': self.can_view_data_edit,
                            'create': self.can_create_data_edit,
                            'delete': self.can_delete_data_edit,
                            'update': self.can_update_data_edit
                        }
                    },
                    'enquiry': {
                        'access': self.can_access_enquiry,
                        'permissions': {
                            'view': self.can_view_enquiry,
                            'create': self.can_create_enquiry,
                            'delete': self.can_delete_enquiry,
                            'update': self.can_update_enquiry
                        }
                    }
                }
            },
            'setup': {
                'access': self.can_access_setup,
                'pages': {
                    'department': {
                        'access': self.can_access_department,
                        'permissions': {
                            'view': self.can_view_department,
                            'create': self.can_create_department,
                            'delete': self.can_delete_department,
                            'update': self.can_update_department
                        }
                    },
                    'sub_department': {
                        'access': self.can_access_sub_department,
                        'permissions': {
                            'view': self.can_view_sub_department,
                            'create': self.can_create_sub_department,
                            'delete': self.can_delete_sub_department,
                            'update': self.can_update_sub_department
                        }
                    },
                    'division_branch': {
                        'access': self.can_access_division_branch,
                        'permissions': {
                            'view': self.can_view_division_branch,
                            'create': self.can_create_division_branch,
                            'delete': self.can_delete_division_branch,
                            'update': self.can_update_division_branch
                        }
                    },
                    'branch_dep_link': {
                        'access': self.can_access_branch_dep_link,
                        'permissions': {
                            'view': self.can_view_branch_dep_link,
                            'create': self.can_create_branch_dep_link,
                            'delete': self.can_delete_branch_dep_link,
                            'update': self.can_update_branch_dep_link
                        }
                    },
                    'logo_upload': {
                        'access': self.can_access_logo_upload,
                        'permissions': {
                            'view': self.can_view_logo_upload,
                            'create': self.can_create_logo_upload,
                            'delete': self.can_delete_logo_upload,
                            'update': self.can_update_logo_upload
                        }
                    },
                    'bulk_upload': {
                        'access': self.can_access_bulk_upload,
                        'permissions': {
                            'view': self.can_view_bulk_upload,
                            'create': self.can_create_bulk_upload,
                            'delete': self.can_delete_bulk_upload,
                            'update': self.can_update_bulk_upload
                        }
                    }
                }
            },
            'user_management': {
                'access': self.can_access_user,
                'pages': {
                    'users': {
                        'access': self.can_access_users,
                        'permissions': {
                            'view': self.can_view_users,
                            'create': self.can_create_users,
                            'delete': self.can_delete_users,
                            'update': self.can_update_users
                        }
                    },
                    'user_rights': {
                        'access': self.can_access_user_rights,
                        'permissions': {
                            'view': self.can_view_user_rights,
                            'create': self.can_create_user_rights,
                            'delete': self.can_delete_user_rights,
                            'update': self.can_update_user_rights
                        }
                    },
                    'password_change': {
                        'access': self.can_access_password_change,
                        'permissions': {
                            'view': self.can_view_password_change,
                            'create': self.can_create_password_change,
                            'delete': self.can_delete_password_change,
                            'update': self.can_update_password_change
                        }
                    }
                }
            },
            'reports': {
                'access': self.can_access_report,
                'pages': {
                    'log_report': {
                        'access': self.can_access_log_report,
                        'permissions': {
                            'view': self.can_view_log_report,
                            'create': self.can_create_log_report,
                            'delete': self.can_delete_log_report,
                            'update': self.can_update_log_report
                        }
                    },
                    'register': {
                        'access': self.can_access_register,
                        'permissions': {
                            'view': self.can_view_register,
                            'create': self.can_create_register,
                            'delete': self.can_delete_register,
                            'update': self.can_update_register
                        }
                    }
                }
            }
        }

class Department(models.Model):
    department_id = models.CharField(max_length=50, unique=True, help_text="Unique identifier for the department")
    name = models.CharField(max_length=100, help_text="Name of the department")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['department_id']
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'

    def __str__(self):
        return f"{self.department_id} - {self.name}"

class SubDepartment(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='sub_departments')
    sub_department_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    fields = models.JSONField(default=list)  # Store field configurations as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['department', 'sub_department_id']

    def __str__(self):
        return f"{self.department.name} - {self.name}"

class DivisionBranch(models.Model):
    division_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Division/Branch'
        verbose_name_plural = 'Divisions/Branches'
        ordering = ['division_id']

    def __str__(self):
        return f"{self.name} ({self.division_id})"

class BranchDepartmentLink(models.Model):
    branch = models.ForeignKey(DivisionBranch, on_delete=models.CASCADE, related_name='department_links')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='branch_links')
    sub_department = models.ForeignKey(SubDepartment, on_delete=models.CASCADE, related_name='branch_links', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Branch Department Link'
        verbose_name_plural = 'Branch Department Links'
        unique_together = [('branch', 'department', 'sub_department')]
        ordering = ['branch', 'department', 'sub_department']

    def __str__(self):
        if self.sub_department:
            return f"{self.branch.name} - {self.department.name} - {self.sub_department.name}"
        return f"{self.branch.name} - {self.department.name}"

class Logo(models.Model):
    name = models.CharField(max_length=255)
    organization_name = models.CharField(max_length=255)
    logo_data = models.BinaryField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_logos')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_logos')

    def save(self, *args, **kwargs):
        if self.is_active:
            # Deactivate all other logos
            Logo.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

class UserSubDepartment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mappings = models.JSONField(default=dict, help_text="JSON containing subdepartment mappings with their branch and department IDs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User SubDepartment Mapping"
        verbose_name_plural = "User SubDepartment Mappings"
        unique_together = ('user',)

    def __str__(self):
        return f"{self.user.get_full_name()} - SubDepartment Mappings"

    def get_mappings(self):
        """Returns the mappings in a structured format"""
        return self.mappings if self.mappings else {}

    def add_mapping(self, branch_id, department_id, subdepartment_id):
        """Adds a new mapping to the JSON field"""
        if not self.mappings:
            self.mappings = {}
        
        key = f"{branch_id}_{department_id}_{subdepartment_id}"
        self.mappings[key] = {
            'branch_id': branch_id,
            'department_id': department_id,
            'subdepartment_id': subdepartment_id
        }
        self.save()

    def remove_mapping(self, branch_id, department_id, subdepartment_id):
        """Removes a mapping from the JSON field"""
        if not self.mappings:
            return
        
        key = f"{branch_id}_{department_id}_{subdepartment_id}"
        if key in self.mappings:
            del self.mappings[key]
            self.save()

    def clear_mappings(self):
        """Clears all mappings"""
        self.mappings = {}
        self.save()

class DataEntryRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data_entries')
    branch = models.ForeignKey('DivisionBranch', on_delete=models.CASCADE)
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    sub_department = models.ForeignKey('SubDepartment', on_delete=models.CASCADE)
    field_values = models.JSONField(default=dict, encoder=DjangoJSONEncoder)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Data Entry Record'
        verbose_name_plural = 'Data Entry Records'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.sub_department.name} - {self.created_at}"

class DataEntryFile(models.Model):
    record = models.ForeignKey(DataEntryRecord, on_delete=models.CASCADE, related_name='files')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    file_data = models.BinaryField()
    file_size = models.IntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Data Entry File'
        verbose_name_plural = 'Data Entry Files'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.file_name

class ActivityLog(models.Model):
    ACTION_TYPES = (
        ('view', 'View'),
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='activity_logs')
    action = models.CharField(max_length=10, choices=ACTION_TYPES)
    page = models.CharField(max_length=100, help_text="Page/View where action was performed")
    model_name = models.CharField(max_length=100, help_text="Model/Entity that was affected")
    object_id = models.CharField(max_length=100, help_text="ID of the affected object")
    details = models.JSONField(default=dict, help_text="Additional details about the action")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.action} - {self.model_name} - {self.created_at}"
