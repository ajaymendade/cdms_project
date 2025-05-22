// Initialize charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Activity Overview Chart
    const activityChart = document.getElementById('activityChart');
    if (activityChart) {
        new Chart(activityChart, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Data Entries',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Data Edits',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Task Distribution Chart
    const taskDistributionChart = document.getElementById('taskDistributionChart');
    if (taskDistributionChart) {
        new Chart(taskDistributionChart, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#48bb78',
                        '#4299e1',
                        '#ed8936'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Handle chart period buttons
    const periodButtons = document.querySelectorAll('.chart-actions .btn');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            periodButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Here you would typically update the chart data based on the selected period
            // For now, we'll just log the selected period
            console.log('Selected period:', this.textContent.trim());
        });
    });
}); 