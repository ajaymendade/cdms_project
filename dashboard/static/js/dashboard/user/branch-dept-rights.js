document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const userSelect = document.getElementById('branchDeptUserSelect');
    const form = document.getElementById('branchDeptForm');
    const loadingSpinner = document.getElementById('branchDeptLoadingSpinner');
    const saveButton = document.getElementById('saveBranchDeptButton');
    const branchList = document.querySelector('.branch-list');
    const successAlert = document.getElementById('branchDeptSuccessAlert');
    const errorAlert = document.getElementById('branchDeptErrorAlert');

    // Reset form function
    function resetBranchDeptForm() {
        // Clear all checkboxes
        document.querySelectorAll('input[name="subdepartments[]"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset save button
        saveButton.disabled = true;
        
        // Hide alerts
        hideAlert(successAlert);
        hideAlert(errorAlert);
        
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
    }

    // Function to create branch-department hierarchy
    function createBranchDeptHierarchy(data) {
        branchList.innerHTML = '';
        
        data.branches.forEach(branch => {
            const branchDiv = document.createElement('div');
            branchDiv.className = 'branch-item';
            branchDiv.dataset.branchId = branch.id;
            
            // Branch header
            const branchHeader = document.createElement('div');
            branchHeader.className = 'branch-header';
            branchHeader.innerHTML = `
                <i class="fas fa-building"></i>
                <span>${branch.name} (ID: ${branch.id})</span>
            `;
            branchDiv.appendChild(branchHeader);
            
            // Branch content
            const branchContent = document.createElement('div');
            branchContent.className = 'branch-content';
            
            // Departments
            branch.departments.forEach(dept => {
                const deptDiv = document.createElement('div');
                deptDiv.className = 'department-item';
                deptDiv.dataset.departmentId = dept.id;
                
                // Department header
                const deptHeader = document.createElement('div');
                deptHeader.className = 'department-header';
                deptHeader.innerHTML = `
                    <i class="fas fa-sitemap"></i>
                    <span>${dept.name} (ID: ${dept.id})</span>
                `;
                deptDiv.appendChild(deptHeader);
                
                // Department content
                const deptContent = document.createElement('div');
                deptContent.className = 'department-content';
                
                // Subdepartments
                dept.subdepartments.forEach(subdept => {
                    const subdeptDiv = document.createElement('div');
                    subdeptDiv.className = 'subdepartment-item';
                    subdeptDiv.innerHTML = `
                        <label>
                            <input type="checkbox" 
                                   name="subdepartments[]" 
                                   value="${subdept.id}"
                                   ${subdept.assigned ? 'checked' : ''}>
                            <span>${subdept.name} (ID: ${subdept.id})</span>
                        </label>
                    `;
                    deptContent.appendChild(subdeptDiv);
                });
                
                deptDiv.appendChild(deptContent);
                branchContent.appendChild(deptDiv);
            });
            
            branchDiv.appendChild(branchContent);
            branchList.appendChild(branchDiv);
        });
    }

    // Handle user selection
    userSelect.addEventListener('change', function() {
        const userId = this.value;
        if (!userId) {
            branchList.innerHTML = '';
            saveButton.disabled = true;
            return;
        }

        loadingSpinner.style.display = 'flex';
        saveButton.disabled = true;

        fetch(`/api/user/${userId}/branch-departments/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            createBranchDeptHierarchy(data);
            loadingSpinner.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.style.display = 'none';
            showAlert(errorAlert, 'Error loading branch-department mappings');
        });
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const userId = userSelect.value;
        if (!userId) return;

        // Get all checked subdepartments with their branch and department IDs
        const subdepartments = Array.from(document.querySelectorAll('input[name="subdepartments[]"]:checked'))
            .map(checkbox => {
                const subdeptDiv = checkbox.closest('.subdepartment-item');
                const deptDiv = subdeptDiv.closest('.department-item');
                const branchDiv = deptDiv.closest('.branch-item');
                
                return {
                    branch_id: branchDiv.dataset.branchId,
                    department_id: deptDiv.dataset.departmentId,
                    subdepartment_id: checkbox.value
                };
            });

        loadingSpinner.style.display = 'flex';
        saveButton.disabled = true;

        fetch(`/api/user/${userId}/branch-departments/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subdepartments })
        })
        .then(response => response.json())
        .then(data => {
            loadingSpinner.style.display = 'none';
            saveButton.disabled = true;
            showAlert(successAlert, 'Branch-department mappings updated successfully');
            
            // Wait for 3 seconds before resetting the form
            setTimeout(() => {
                // Reset form and fields
                resetBranchDeptForm();
                userSelect.value = ''; // Reset user selection
                branchList.innerHTML = ''; // Clear branch list
            }, 3000);
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.style.display = 'none';
            showAlert(errorAlert, 'Error updating branch-department mappings');
        });
    });

    // Handle checkbox changes
    branchList.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            saveButton.disabled = false;
        }
    });

    // Utility functions
    function showAlert(alertElement, message) {
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }

    function hideAlert(alertElement) {
        alertElement.style.display = 'none';
    }

    function getCSRFToken() {
        const name = 'csrftoken';
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
}); 