from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from .models import ActivityLog, User, Department, SubDepartment, DivisionBranch, BranchDepartmentLink, Logo, DataEntryRecord

def get_client_ip(request):
    """Get the client's IP address from the request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Get the first IP in case of multiple IPs
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def log_activity(user, action, page, model_name=None, object_id=None, details=None, request=None):
    """Create an activity log entry."""
    ip_address = None
    user_agent = None
    
    if request:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    ActivityLog.objects.create(
        user=user,
        action=action,
        page=page,
        model_name=model_name or '',
        object_id=str(object_id) if object_id else '',
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent
    )

# Model signals
@receiver(post_save, sender=User)
def log_user_activity(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=instance,
        action=action,
        page='User Management',
        model_name='User',
        object_id=instance.id,
        details={'username': instance.username, 'email': instance.email},
        request=request
    )

@receiver(post_save, sender=Department)
def log_department_activity(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=None,  # Will be set by the view
        action=action,
        page='Department Management',
        model_name='Department',
        object_id=instance.id,
        details={'name': instance.name, 'department_id': instance.department_id},
        request=request
    )

@receiver(post_save, sender=SubDepartment)
def log_subdepartment_activity(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=None,  # Will be set by the view
        action=action,
        page='Sub Department Management',
        model_name='SubDepartment',
        object_id=instance.id,
        details={'name': instance.name, 'sub_department_id': instance.sub_department_id},
        request=request
    )

@receiver(post_save, sender=DivisionBranch)
def log_division_branch_activity(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=None,  # Will be set by the view
        action=action,
        page='Division/Branch Management',
        model_name='DivisionBranch',
        object_id=instance.id,
        details={'name': instance.name, 'division_id': instance.division_id},
        request=request
    )

@receiver(post_save, sender=DataEntryRecord)
def log_data_entry_activity(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=instance.user,
        action=action,
        page='Data Entry',
        model_name='DataEntryRecord',
        object_id=instance.id,
        details={
            'branch': instance.branch.name,
            'department': instance.department.name,
            'sub_department': instance.sub_department.name
        },
        request=request
    )

# Delete signals
@receiver(post_delete, sender=User)
def log_user_deletion(sender, instance, **kwargs):
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=None,  # Will be set by the view
        action='delete',
        page='User Management',
        model_name='User',
        object_id=instance.id,
        details={'username': instance.username, 'email': instance.email},
        request=request
    )

@receiver(post_delete, sender=Department)
def log_department_deletion(sender, instance, **kwargs):
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=None,  # Will be set by the view
        action='delete',
        page='Department Management',
        model_name='Department',
        object_id=instance.id,
        details={'name': instance.name, 'department_id': instance.department_id},
        request=request
    )

@receiver(post_delete, sender=SubDepartment)
def log_subdepartment_deletion(sender, instance, **kwargs):
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=None,  # Will be set by the view
        action='delete',
        page='Sub Department Management',
        model_name='SubDepartment',
        object_id=instance.id,
        details={'name': instance.name, 'sub_department_id': instance.sub_department_id},
        request=request
    )

@receiver(post_delete, sender=DivisionBranch)
def log_division_branch_deletion(sender, instance, **kwargs):
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=None,  # Will be set by the view
        action='delete',
        page='Division/Branch Management',
        model_name='DivisionBranch',
        object_id=instance.id,
        details={'name': instance.name, 'division_id': instance.division_id},
        request=request
    )

@receiver(post_delete, sender=DataEntryRecord)
def log_data_entry_deletion(sender, instance, **kwargs):
    # Try to get the request from the instance
    request = getattr(instance, '_request', None)
    log_activity(
        user=instance.user,
        action='delete',
        page='Data Entry',
        model_name='DataEntryRecord',
        object_id=instance.id,
        details={
            'branch': instance.branch.name,
            'department': instance.department.name,
            'sub_department': instance.sub_department.name
        },
        request=request
    )

# Auth signals
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    log_activity(
        user=user,
        action='login',
        page='Login',
        model_name='User',
        object_id=user.id,
        details={'username': user.username},
        request=request
    )

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    log_activity(
        user=user,
        action='logout',
        page='Logout',
        model_name='User',
        object_id=user.id,
        details={'username': user.username},
        request=request
    ) 