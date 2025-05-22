from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import DataEntryViewSet, ActivityLogViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'sub-departments', views.SubDepartmentViewSet)
router.register(r'division-branches', views.DivisionBranchViewSet)
router.register(r'branch-department-links', views.BranchDepartmentLinkViewSet, basename='branch-department-link')
router.register(r'logos', views.LogoViewSet)
router.register(r'data-entry', DataEntryViewSet, basename='data-entry')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')

urlpatterns = [
    # API URLs - Moved to top to ensure they take precedence
    path('api/', include(router.urls)),
    
    # Auth URLs
    path('', views.login_view, name='login'),
    path('api/auth/login/', views.LoginView.as_view(), name='api_login'),
    path('api/auth/register/', views.RegisterView.as_view(), name='api_register'),
    path('api/auth/profile/', views.UserProfileView.as_view(), name='api_profile'),
    path('api/auth/permissions/', views.PagePermissionsView.as_view(), name='api_permissions'),
    path('api/auth/logout/', views.LogoutView.as_view(), name='api_logout'),
    path('logout/', views.logout_view, name='logout_view'),
    
    # Dashboard URLs
    path('dashboard/', views.dashboard_home, name='dashboard_home'),
    path('dashboard/config/', views.dashboard_config, name='dashboard_config'),
    
    # Data URLs
    path('dashboard/data/entry/', views.data_entry, name='data_entry'),
    path('dashboard/data/edit/', views.data_edit, name='data_edit'),
    path('dashboard/data/enquiry/', views.enquiry, name='enquiry'),
    
    # Setup URLs
    path('dashboard/setup/department/', views.department, name='department'),
    path('dashboard/setup/sub-department/', views.sub_department, name='sub_department'),
    path('dashboard/setup/division-branch/', views.division_branch, name='division_branch'),
    path('dashboard/setup/branch-dep-link/', views.branch_dep_link, name='branch_dep_link'),
    path('dashboard/setup/logo-upload/', views.logo_upload, name='logo_upload'),
    path('dashboard/setup/bulk-upload/', views.bulk_upload, name='bulk_upload'),
    path('process-bulk-upload/', views.process_bulk_upload, name='process_bulk_upload'),
    path('bulk-upload/template/', views.download_bulk_upload_template, name='download_bulk_upload_template'),
    
    # User URLs
    path('dashboard/users/', views.users, name='users'),
    path('dashboard/user/rights/', views.user_rights, name='user_rights'),
    path('dashboard/user/get-permissions/<int:user_id>/', views.get_user_permissions, name='get_user_permissions'),
    path('dashboard/user/password-change/', views.password_change, name='password_change'),
    path('dashboard/user/change-password/', views.change_password, name='change_password'),
    
    # User API URLs
    path('api/users/', views.user_list, name='user_list'),
    path('api/users/<int:pk>/', views.user_detail, name='user_detail'),
    path('api/user/<int:user_id>/branch-departments/', views.user_branch_departments, name='user_branch_departments'),
    
    # Report URLs
    path('dashboard/report/log/', views.log_report, name='log_report'),
    path('dashboard/report/register/', views.register, name='register'),
] 