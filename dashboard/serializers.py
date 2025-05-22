from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from .models import User, Department, SubDepartment, DivisionBranch, BranchDepartmentLink, Logo, DataEntryRecord, DataEntryFile, UserSubDepartment, ActivityLog
import re

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    can_update_users = serializers.SerializerMethodField()
    can_delete_users = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'mobile_number', 'status', 'is_active', 'date_joined', 'last_login', 'password',
                 'can_update_users', 'can_delete_users')
        read_only_fields = ('id', 'date_joined', 'last_login')

    def get_can_update_users(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.has_perm('dashboard.change_users') or request.user.can_update_users
        return False

    def get_can_delete_users(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.has_perm('dashboard.delete_users') or request.user.can_delete_users
        return False

    def validate_username(self, value):
        # Check if username already exists (excluding current user in update)
        user = getattr(self, 'instance', None)
        if User.objects.filter(username=value).exclude(pk=getattr(user, 'pk', None)).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def validate_email(self, value):
        # Check if email already exists (excluding current user in update)
        user = getattr(self, 'instance', None)
        if User.objects.filter(email=value).exclude(pk=getattr(user, 'pk', None)).exists():
            raise serializers.ValidationError('Email already exists')
        return value

    def validate_mobile_number(self, value):
        # Remove any spaces or special characters
        value = re.sub(r'[^0-9+]', '', value)
        
        # Check if mobile number already exists (excluding current user in update)
        user = getattr(self, 'instance', None)
        if User.objects.filter(mobile_number=value).exclude(pk=getattr(user, 'pk', None)).exists():
            raise serializers.ValidationError('Mobile number already exists')
        
        # Validate mobile number format
        if not re.match(r'^\+?[0-9]{10,15}$', value):
            raise serializers.ValidationError(
                'Enter a valid mobile number (10-15 digits, optionally starting with +)'
            )
        return value

    def validate_password(self, value):
        if not value:  # Skip validation if password is not provided (for updates)
            return value
            
        # Check password length
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long')
        
        # Check for at least one number
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError('Password must contain at least one number')
        
        # Check for at least one uppercase letter
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError('Password must contain at least one uppercase letter')
        
        # Check for at least one lowercase letter
        if not any(char.islower() for char in value):
            raise serializers.ValidationError('Password must contain at least one lowercase letter')
        
        # Check for at least one special character
        if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?/' for char in value):
            raise serializers.ValidationError('Password must contain at least one special character')
        
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Username is required',
            'blank': 'Username cannot be blank'
        }
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            'required': 'Password is required',
            'blank': 'Password cannot be blank'
        }
    )

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        error_messages={
            'required': 'Password is required',
            'blank': 'Password cannot be blank'
        }
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            'required': 'Confirm password is required',
            'blank': 'Confirm password cannot be blank'
        }
    )
    username = serializers.CharField(
        required=True,
        min_length=3,
        max_length=150,
        error_messages={
            'required': 'Username is required',
            'blank': 'Username cannot be blank',
            'min_length': 'Username must be at least 3 characters long',
            'max_length': 'Username cannot be more than 150 characters'
        }
    )
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'Email is required',
            'blank': 'Email cannot be blank',
            'invalid': 'Enter a valid email address'
        }
    )
    first_name = serializers.CharField(
        required=True,
        error_messages={
            'required': 'First name is required',
            'blank': 'First name cannot be blank'
        }
    )
    last_name = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Last name is required',
            'blank': 'Last name cannot be blank'
        }
    )
    mobile_number = serializers.CharField(
        required=True,
        max_length=15,
        error_messages={
            'required': 'Mobile number is required',
            'blank': 'Mobile number cannot be blank',
            'max_length': 'Mobile number cannot be more than 15 characters'
        }
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 
                 'first_name', 'last_name', 'mobile_number')

    def validate_username(self, value):
        # Check if username already exists
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        
        # Check username format (only letters, numbers, and @/./+/-/_)
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(
                'Username can only contain letters, numbers, and @/./+/-/_ characters'
            )
        return value

    def validate_email(self, value):
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value

    def validate_mobile_number(self, value):
        # Remove any spaces or special characters
        value = re.sub(r'[^0-9+]', '', value)
        
        # Check if mobile number already exists
        if User.objects.filter(mobile_number=value).exists():
            raise serializers.ValidationError('Mobile number already exists')
        
        # Validate mobile number format
        if not re.match(r'^\+?[0-9]{10,15}$', value):
            raise serializers.ValidationError(
                'Enter a valid mobile number (10-15 digits, optionally starting with +)'
            )
        return value

    def validate_password(self, value):
        # Check password length
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long')
        
        # Check for at least one number
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError('Password must contain at least one number')
        
        # Check for at least one uppercase letter
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError('Password must contain at least one uppercase letter')
        
        # Check for at least one lowercase letter
        if not any(char.islower() for char in value):
            raise serializers.ValidationError('Password must contain at least one lowercase letter')
        
        # Check for at least one special character
        if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?/' for char in value):
            raise serializers.ValidationError('Password must contain at least one special character')
        
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            mobile_number=validated_data['mobile_number'],
            status='active'
        )
        return user 

class DepartmentSerializer(serializers.ModelSerializer):
    can_update = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_view = serializers.SerializerMethodField()
    can_create = serializers.SerializerMethodField()
    sub_departments = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'department_id', 'name', 'created_at', 'updated_at', 
                 'can_update', 'can_delete', 'can_view', 'can_create', 'sub_departments']
        read_only_fields = ['id', 'created_at', 'updated_at', 
                           'can_update', 'can_delete', 'can_view', 'can_create']
        extra_kwargs = {
            'department_id': {
                'required': True,
                'error_messages': {
                    'required': 'Department ID is required',
                    'blank': 'Department ID cannot be blank'
                }
            },
            'name': {
                'required': True,
                'error_messages': {
                    'required': 'Department name is required',
                    'blank': 'Department name cannot be blank'
                }
            }
        }

    def get_can_update(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_update_department
        return False

    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_delete_department
        return False

    def get_can_view(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_view_department
        return False

    def get_can_create(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_create_department
        return False

    def get_sub_departments(self, obj):
        request = self.context.get('request')
        if not request:
            print("No request context found")
            return []

        # Get user's sub-department mappings
        user_mappings = UserSubDepartment.objects.filter(user=request.user).first()
        if not user_mappings:
            print(f"No user mappings found for user {request.user.id}")
            return []

        mappings = user_mappings.get_mappings()
        if not mappings:
            print(f"No mappings found for user {request.user.id}")
            return []

        # Get sub-departments for this department from mappings
        sub_department_ids = set()
        for mapping in mappings.values():
            if str(mapping['department_id']) == str(obj.id):
                sub_department_ids.add(mapping['subdepartment_id'])
                print(f"Added sub-department {mapping['subdepartment_id']} for department {obj.id}")

        print(f"Found sub-department IDs for department {obj.id}: {sub_department_ids}")

        # Get sub-departments
        sub_departments = SubDepartment.objects.filter(id__in=sub_department_ids)
        print(f"Found {sub_departments.count()} sub-departments for department {obj.id}")
        
        serializer = SubDepartmentSerializer(sub_departments, many=True)
        return serializer.data

    def validate_department_id(self, value):
        print(f"Validating department_id: {value}")
        print(f"Current instance: {getattr(self, 'instance', None)}")
        
        if not value:
            print("Department ID is empty")
            raise serializers.ValidationError('Department ID is required')
            
        # Check if department_id already exists (excluding current instance in update)
        instance = getattr(self, 'instance', None)
        if Department.objects.filter(department_id=value).exclude(pk=getattr(instance, 'pk', None)).exists():
            print(f"Department ID {value} already exists")
            raise serializers.ValidationError('Department ID already exists')
        
        print(f"Department ID {value} is valid")
        return value

    def validate_name(self, value):
        print(f"Validating name: {value}")
        
        if not value:
            print("Department name is empty")
            raise serializers.ValidationError('Department name is required')
        
        print(f"Department name {value} is valid")
        return value

    def validate(self, attrs):
        print(f"Validating all attributes: {attrs}")
        print(f"Current instance: {self.instance}")
        return attrs

class SubDepartmentSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    can_update = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_view = serializers.SerializerMethodField()

    class Meta:
        model = SubDepartment
        fields = ['id', 'department', 'department_name', 'sub_department_id', 'name', 
                 'fields', 'created_at', 'updated_at', 'can_update', 'can_delete', 'can_view']
        read_only_fields = ['id', 'created_at', 'updated_at', 'can_update', 'can_delete', 'can_view']
        extra_kwargs = {
            'department': {'required': True},
            'sub_department_id': {
                'required': True,
                'error_messages': {
                    'required': 'Sub Department ID is required',
                    'blank': 'Sub Department ID cannot be blank'
                }
            },
            'name': {
                'required': True,
                'error_messages': {
                    'required': 'Sub Department name is required',
                    'blank': 'Sub Department name cannot be blank'
                }
            }
        }

    def get_can_update(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_update_sub_department
        return False

    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_delete_sub_department
        return False

    def get_can_view(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_view_sub_department
        return False

    def validate_sub_department_id(self, value):
        if not value:
            raise serializers.ValidationError('Sub Department ID is required')
            
        # Check if sub_department_id already exists (excluding current instance in update)
        instance = getattr(self, 'instance', None)
        if SubDepartment.objects.filter(sub_department_id=value).exclude(pk=getattr(instance, 'pk', None)).exists():
            raise serializers.ValidationError('Sub Department ID already exists')
        
        return value

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError('Sub Department name is required')
        return value

    def validate_fields(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError('Fields must be a list')
        
        for field in value:
            if not isinstance(field, dict):
                raise serializers.ValidationError('Each field must be an object')
            
            required_keys = ['name', 'data_type', 'requirement']
            for key in required_keys:
                if key not in field:
                    raise serializers.ValidationError(f'Field is missing required key: {key}')
            
            if not field['name'].strip():
                raise serializers.ValidationError('Field name cannot be empty')
            
            if field['data_type'] not in ['alphanumeric', 'numeric', 'date']:
                raise serializers.ValidationError('Invalid data type')
            
            if field['requirement'] not in ['optional', 'essential']:
                raise serializers.ValidationError('Invalid requirement type')
            
            # Set default verify value if not provided
            if 'verify' not in field:
                field['verify'] = False
        
        return value

    def validate(self, attrs):
        print(f"Validating all attributes: {attrs}")
        print(f"Current instance: {self.instance}")
        return attrs

class DivisionBranchSerializer(serializers.ModelSerializer):
    can_update = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_view = serializers.SerializerMethodField()
    can_create = serializers.SerializerMethodField()

    class Meta:
        model = DivisionBranch
        fields = ['id', 'division_id', 'name', 'address', 'created_at', 'updated_at',
                 'can_update', 'can_delete', 'can_view', 'can_create']
        read_only_fields = ['id', 'created_at', 'updated_at',
                           'can_update', 'can_delete', 'can_view', 'can_create']
        extra_kwargs = {
            'division_id': {
                'required': True,
                'error_messages': {
                    'required': 'Division ID is required',
                    'blank': 'Division ID cannot be blank'
                }
            },
            'name': {
                'required': True,
                'error_messages': {
                    'required': 'Division name is required',
                    'blank': 'Division name cannot be blank'
                }
            },
            'address': {
                'required': True,
                'error_messages': {
                    'required': 'Address is required',
                    'blank': 'Address cannot be blank'
                }
            }
        }

    def get_can_update(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_update_division_branch
        return False

    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_delete_division_branch
        return False

    def get_can_view(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_view_division_branch
        return False

    def get_can_create(self, obj):
        request = self.context.get('request')
        if request:
            return request.user.can_create_division_branch
        return False

    def validate_division_id(self, value):
        if not value:
            raise serializers.ValidationError('Division ID is required')
            
        # Check if division_id already exists (excluding current instance in update)
        instance = getattr(self, 'instance', None)
        if DivisionBranch.objects.filter(division_id=value).exclude(pk=getattr(instance, 'pk', None)).exists():
            raise serializers.ValidationError('Division ID already exists')
        
        return value

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError('Division name is required')
        return value

    def validate_address(self, value):
        if not value:
            raise serializers.ValidationError('Address is required')
        return value

    def validate(self, attrs):
        return attrs 

class BranchDepartmentLinkSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    sub_department_name = serializers.CharField(source='sub_department.name', read_only=True)

    class Meta:
        model = BranchDepartmentLink
        fields = ['id', 'branch', 'branch_name', 'department', 'department_name', 
                 'sub_department', 'sub_department_name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] 

class LogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logo
        fields = ['id', 'name', 'organization_name', 'logo_data', 'is_active', 'created_at', 'updated_at', 'created_by', 'updated_by']
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']

    def create(self, validated_data):
        print("LogoSerializer create method")
        print(f"Validated data: {validated_data}")
        validated_data['created_by'] = self.context['request'].user
        validated_data['updated_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        print("LogoSerializer update method")
        print(f"Validated data: {validated_data}")
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)

class BranchSerializer(serializers.ModelSerializer):
    departments = serializers.SerializerMethodField()

    class Meta:
        model = DivisionBranch
        fields = ['id', 'name', 'departments']

    def get_departments(self, obj):
        request = self.context.get('request')
        if not request:
            return []

        # Get user's sub-department mappings
        user_mappings = UserSubDepartment.objects.filter(user=request.user).first()
        if not user_mappings:
            print(f"No user mappings found for user {request.user.id}")
            return []

        mappings = user_mappings.get_mappings()
        if not mappings:
            print(f"No mappings found for user {request.user.id}")
            return []

        # Get departments for this branch from mappings
        department_ids = set()
        for mapping in mappings.values():
            if str(mapping['branch_id']) == str(obj.id):
                department_ids.add(mapping['department_id'])
                print(f"Added department {mapping['department_id']} for branch {obj.id}")

        print(f"Found department IDs for branch {obj.id}: {department_ids}")

        # Get departments with their sub-departments
        departments = Department.objects.filter(id__in=department_ids)
        print(f"Found {departments.count()} departments for branch {obj.id}")
        
        serializer = DepartmentSerializer(departments, many=True, context={'request': request})
        return serializer.data

class DataEntryFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataEntryFile
        fields = ['id', 'file_name', 'file_type', 'file_size', 'uploaded_at']

class DataEntryRecordSerializer(serializers.ModelSerializer):
    files = DataEntryFileSerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    sub_department_name = serializers.CharField(source='sub_department.name', read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = DataEntryRecord
        fields = ['id', 'user', 'branch', 'branch_name', 'department', 'department_name', 
                 'sub_department', 'sub_department_name', 'field_values', 
                 'files', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at'] 

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'user_name', 'action', 'page', 'model_name', 
                 'object_id', 'details', 'ip_address', 'user_agent', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return 'System' 