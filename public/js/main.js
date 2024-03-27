document.addEventListener("DOMContentLoaded", function() {
    const leaveApplicationForm = document.getElementById('leaveApplicationForm');
    if (leaveApplicationForm) {
        leaveApplicationForm.addEventListener('submit', function(e) {
            const leaveType = document.getElementById('leaveType').value;
            const reason = document.getElementById('reason').value;
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);

            let errorMessages = [];

            // Checking if all fields are filled
            if (!leaveType || !reason || !startDate || !endDate) {
                errorMessages.push('All fields are required.');
            }

            // Checking if start date is before end date
            if (startDate >= endDate) {
                errorMessages.push('Start date must be before end date.');
            }

            // Displaying errors if any
            if (errorMessages.length > 0) {
                e.preventDefault(); // Prevent form submission
                // Using Bootstrap's Modal for displaying validation errors
                const errorModalBody = document.getElementById('validationErrorModalBody');
                if (errorModalBody) {
                    errorModalBody.innerHTML = errorMessages.join('<br>');
                    const validationErrorModal = new bootstrap.Modal(document.getElementById('validationErrorModal'), {});
                    validationErrorModal.show();
                } else {
                    console.error('Error modal body element not found');
                }
            }
        });
    } else {
        console.log('Leave application form not found');
    }

    // New code for handling the display of the applied leaves table
    const leaveApplicationsTable = document.querySelector('.table.table-hover');
    if (leaveApplicationsTable) {
        const leaveApplications = leaveApplicationsTable.querySelectorAll('tbody tr');

        if (leaveApplications.length === 0) {
            leaveApplicationsTable.style.display = 'none'; // Hide the table if no leave applications
            const noApplicationsMessage = document.createElement('div');
            noApplicationsMessage.className = 'alert alert-info';
            noApplicationsMessage.role = 'alert';
            noApplicationsMessage.textContent = 'No leave applications found.';
            leaveApplicationsTable.parentNode.insertBefore(noApplicationsMessage, leaveApplicationsTable);
        }
    }
});