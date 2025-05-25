document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('data-entry-form');
    const branchSelect = document.getElementById('division');
    const departmentSelect = document.getElementById('department');
    const subDepartmentSelect = document.getElementById('sub-department');
    const dynamicFieldsContainer = document.getElementById('dynamic-fields');
    const fileInput = document.getElementById('document-upload');
    const fileList = document.getElementById('files-list');
    const uploadArea = document.getElementById('file-upload-area');
    const browseButton = document.getElementById('browse-btn');

    // Store uploaded files
    const uploadedFiles = new Map();

    // Fetch branches and populate branch dropdown
    fetch('/api/data-entry/get_hierarchy/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received hierarchy data:', data); // Debug log
            branchSelect.innerHTML = '<option value="" selected disabled>Select Division/Branch</option>';
            data.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                branchSelect.appendChild(option);
            });
            branchSelect.disabled = false;
        })
        .catch(error => {
            console.error('Error fetching branches:', error);
            showAlert('error', 'Error loading branches. Please try again.');
        });

    // Handle branch selection
    branchSelect.addEventListener('change', function() {
        const branchId = this.value;
        departmentSelect.innerHTML = '<option value="" selected disabled>Select Department</option>';
        subDepartmentSelect.innerHTML = '<option value="" selected disabled>Select Sub Department</option>';
        dynamicFieldsContainer.innerHTML = '';
        departmentSelect.disabled = true;
        subDepartmentSelect.disabled = true;

        if (branchId) {
            fetch('/api/data-entry/get_hierarchy/')
                .then(response => response.json())
                .then(data => {
                    const branch = data.find(b => b.id === parseInt(branchId));
                    if (branch && branch.departments) {
                        branch.departments.forEach(dept => {
                            const option = document.createElement('option');
                            option.value = dept.id;
                            option.textContent = dept.name;
                            departmentSelect.appendChild(option);
                        });
                        departmentSelect.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error fetching departments:', error);
                    showAlert('error', 'Error loading departments. Please try again.');
                });
        }
    });

    // Handle department selection
    departmentSelect.addEventListener('change', function() {
        const departmentId = this.value;
        subDepartmentSelect.innerHTML = '<option value="" selected disabled>Select Sub Department</option>';
        dynamicFieldsContainer.innerHTML = '';
        subDepartmentSelect.disabled = true;

        if (departmentId) {
            fetch('/api/data-entry/get_hierarchy/')
                .then(response => response.json())
                .then(data => {
                    const branch = data.find(b => b.departments.some(d => d.id === parseInt(departmentId)));
                    if (branch) {
                        const department = branch.departments.find(d => d.id === parseInt(departmentId));
                        if (department && department.sub_departments) {
                            department.sub_departments.forEach(subDept => {
                                const option = document.createElement('option');
                                option.value = subDept.id;
                                option.textContent = subDept.name;
                                subDepartmentSelect.appendChild(option);
                            });
                            subDepartmentSelect.disabled = false;
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching sub-departments:', error);
                    showAlert('error', 'Error loading sub-departments. Please try again.');
                });
        }
    });

    // Handle sub-department selection
    subDepartmentSelect.addEventListener('change', function() {
        const subDepartmentId = this.value;
        dynamicFieldsContainer.innerHTML = '';

        if (subDepartmentId) {
            fetch(`/api/data-entry/get_subdepartment_fields/?sub_department_id=${subDepartmentId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.fields) {
                        const row = document.createElement('div');
                        row.className = 'row g-3';
                        
                        data.fields.forEach(field => {
                            const col = document.createElement('div');
                            col.className = 'col-md-6'; // Two fields per row
                            
                            const fieldGroup = document.createElement('div');
                            fieldGroup.className = 'mb-3';
                            
                            const label = document.createElement('label');
                            label.className = 'form-label';
                            label.textContent = field.name;
                            if (field.requirement === 'essential') {
                                label.innerHTML += ' <span class="text-danger">*</span>';
                            }
                            
                            let input;
                            switch (field.data_type) {
                                case 'numeric':
                                    input = document.createElement('input');
                                    input.type = 'number';
                                    input.pattern = '[0-9]*';
                                    input.className = 'form-control dynamic-field';
                                    break;
                                    
                                case 'date':
                                    input = document.createElement('input');
                                    input.type = 'date';
                                    input.className = 'form-control dynamic-field';
                                    break;
                                    
                                case 'alphanumeric':
                                default:
                                    input = document.createElement('input');
                                    input.type = 'text';
                                    input.className = 'form-control dynamic-field';
                                    break;
                            }
                            
                            input.name = field.name;
                            input.setAttribute('data-field-name', field.name);
                            input.required = field.requirement === 'essential';
                            
                            // Add validation attributes based on data type
                            if (field.data_type === 'alphanumeric') {
                                input.pattern = '[a-zA-Z0-9\\s]*';
                                input.title = 'Only letters, numbers, and spaces are allowed';
                            }
                            
                            // Add validation message
                            const invalidFeedback = document.createElement('div');
                            invalidFeedback.className = 'invalid-feedback';
                            invalidFeedback.textContent = `Please enter a valid ${field.name}`;
                            
                            fieldGroup.appendChild(label);
                            fieldGroup.appendChild(input);
                            fieldGroup.appendChild(invalidFeedback);
                            col.appendChild(fieldGroup);
                            row.appendChild(col);
                        });
                        
                        dynamicFieldsContainer.appendChild(row);
                    }
                })
                .catch(error => {
                    console.error('Error fetching sub-department fields:', error);
                    showAlert('Error loading fields. Please try again.', 'danger');
                });
        }
    });

    // Handle file selection
    function handleFiles(files) {
        console.log('handleFiles called with files:', files);
        Array.from(files).forEach(file => {
            console.log('Processing file:', file.name, file.size, file.type);
            if (file instanceof File) {  // Ensure it's a valid File object
                uploadedFiles.set(file.name, file);
                addFileToList(file);
                console.log('File added to uploadedFiles Map');
            } else {
                console.log('Invalid file object:', file);
            }
        });
        updateFileList();
        console.log('Current uploadedFiles Map:', Array.from(uploadedFiles.entries()));
    }

    // Add file to list
    function addFileToList(file) {
        console.log('Adding file to list:', file.name);
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item d-flex justify-content-between align-items-center p-2 border-bottom';
        fileItem.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${getFileIcon(file.type)} me-2"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size ms-2 text-muted">(${formatFileSize(file.size)})</span>
            </div>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeFile('${file.name}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        fileList.appendChild(fileItem);
        console.log('File added to list UI');
    }

    // Update file list
    function updateFileList() {
        const documentPreviewSection = document.getElementById('document-preview-section');
        if (uploadedFiles.size > 0) {
            documentPreviewSection.style.display = 'block';
        } else {
            documentPreviewSection.style.display = 'none';
        }
    }

    // Remove file
    window.removeFile = function(fileName) {
        console.log('Removing file:', fileName);
        uploadedFiles.delete(fileName);
        const fileItems = fileList.getElementsByClassName('file-item');
        Array.from(fileItems).forEach(item => {
            if (item.querySelector('.file-name').textContent === fileName) {
                item.remove();
            }
        });
        updateFileList();
        console.log('Files remaining:', Array.from(uploadedFiles.entries()));
    };

    // Remove all files
    document.getElementById('remove-all-documents').addEventListener('click', function() {
        console.log('Removing all files');
        uploadedFiles.clear();
        fileList.innerHTML = '';
        updateFileList();
    });

    // Handle file input change
    fileInput.addEventListener('change', function(e) {
        console.log('File input changed:', this.files);
        if (this.files.length > 0) {
            handleFiles(this.files);
            this.value = ''; // Reset the input to allow selecting the same file again
        }
    });

    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        console.log('Files dropped:', e.dataTransfer.files);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });

    // Handle browse button click
    browseButton.addEventListener('click', function() {
        fileInput.click();
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submission started');
        
        // Check if user has create permission
        if (!this.querySelector('#save-btn').disabled) {
            try {
                // Validate form fields
                if (!validateForm()) {
                    return;
                }

                const formData = new FormData();
                console.log('FormData created');
                
                // Add basic form fields
                formData.append('branch', document.getElementById('division').value);
                formData.append('department', document.getElementById('department').value);
                formData.append('sub_department', document.getElementById('sub-department').value);
                
                // Add field values
                const fieldValues = {};
                document.querySelectorAll('#dynamic-fields input, #dynamic-fields select').forEach(input => {
                    if (input.name && input.value) {
                        fieldValues[input.name.replace('field_', '')] = input.value;
                    }
                });
                formData.append('field_values', JSON.stringify(fieldValues));
                console.log('Field values added to FormData:', fieldValues);
                
                // Add files from uploadedFiles Map
                console.log('Adding files to FormData...');
                let filesAdded = 0;
                
                // Add files from the Map
                for (const [fileName, file] of uploadedFiles.entries()) {
                    if (file instanceof File) {
                        console.log(`Adding file from Map: ${fileName}`, file);
                        // Use the same key for all files to allow multiple file uploads
                        formData.append('documents', file, fileName);
                        filesAdded++;
                    }
                }
                
                console.log(`Total files added to FormData: ${filesAdded}`);
                
                // Log FormData contents
                console.log('FormData contents:');
                for (let pair of formData.entries()) {
                    if (pair[1] instanceof File) {
                        console.log('FormData entry:', pair[0], 'File:', pair[1].name, pair[1].size, pair[1].type);
                    } else {
                        console.log('FormData entry:', pair[0], pair[1]);
                    }
                }
                
                // Disable submit button to prevent double submission
                const submitButton = this.querySelector('#save-btn');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Saving...';
                
                console.log('Sending request to server...');
                const response = await fetch('/api/data-entry/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData
                });
                
                console.log('Server response received:', response.status);
                if (!response.ok) {
                    const error = await response.json();
                    console.error('Server error:', error);
                    throw new Error(error.error || 'Failed to create entry');
                }
                
                const responseData = await response.json();
                console.log('Server response data:', responseData);
                
                // Show success message
                showAlert('success', 'Entry created successfully');
                
                // Reset form
                this.reset();
                document.getElementById('dynamic-fields').innerHTML = '';
                document.getElementById('document-preview-section').style.display = 'none';
                document.getElementById('files-list').innerHTML = '';
                uploadedFiles.clear(); // Clear the uploaded files Map
                console.log('Form reset complete');
                
            } catch (error) {
                console.error('Error creating entry:', error);
                showAlert('danger', error.message || 'Failed to create entry');
            } finally {
                // Re-enable submit button
                const submitButton = this.querySelector('#save-btn');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save me-2"></i> Save Entry';
            }
        } else {
            console.log('User does not have create permission');
            showAlert('danger', 'You don\'t have permission to create entries');
        }
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Validate required fields
        const requiredFields = ['division', 'department', 'sub-department'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        // Validate dynamic fields
        document.querySelectorAll('#dynamic-fields input[required], #dynamic-fields select[required]').forEach(input => {
            if (!input.value) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        if (!isValid) {
            showAlert('danger', 'Please fill in all required fields');
        }
        
        return isValid;
    }

    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-file-image';
        if (fileType.startsWith('video/')) return 'fa-file-video';
        if (fileType.startsWith('audio/')) return 'fa-file-audio';
        if (fileType === 'application/pdf') return 'fa-file-pdf';
        if (fileType.includes('word')) return 'fa-file-word';
        if (fileType.includes('excel') || fileType.includes('sheet')) return 'fa-file-excel';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
        return 'fa-file';
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Show Alert
    function showAlert(type, message) {
        // Use the global showAlert function from base.html
        window.showAlert(type, message);
    }
}); 