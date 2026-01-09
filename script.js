// Toggle conditional fields based on Yes/No answers
function toggleQ6Details() {
    const q6Yes = document.querySelector('input[name="q6"][value="yes"]');
    const q6Details = document.getElementById('q6-details');
    
    if (q6Yes && q6Yes.checked) {
        q6Details.style.display = 'block';
    } else {
        q6Details.style.display = 'none';
        // Clear the input when hidden
        const detailsInput = document.querySelector('input[name="q6_details"]');
        if (detailsInput) {
            detailsInput.value = '';
        }
    }
}

function toggleQ15Details() {
    const q15Yes = document.querySelector('input[name="q15"][value="yes"]');
    const q15Details = document.getElementById('q15-details');
    
    if (q15Yes && q15Yes.checked) {
        q15Details.style.display = 'block';
    } else {
        q15Details.style.display = 'none';
        // Clear the textarea when hidden
        const detailsTextarea = document.querySelector('textarea[name="q15_details"]');
        if (detailsTextarea) {
            detailsTextarea.value = '';
        }
    }
}

// Form submission handler
document.getElementById('assessmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect all form data
    const formData = new FormData(this);
    const data = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // If key already exists, convert to array
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    // Log the data (in a real application, you would send this to a server)
    console.log('Form Data:', data);
    
    // Show success message
    alert('Thank you for completing the assessment! Your responses have been recorded.');
    
    // In a real application, you would send the data to your server:
    // fetch('/api/submit-assessment', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(result => {
    //     alert('Assessment submitted successfully!');
    //     this.reset();
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    //     alert('There was an error submitting your assessment. Please try again.');
    // });
});

// Add visual feedback for radio buttons
document.addEventListener('DOMContentLoaded', function() {
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    
    radioInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Remove checked styling from siblings
            const siblings = document.querySelectorAll(`input[name="${this.name}"]`);
            siblings.forEach(sibling => {
                const label = sibling.closest('label');
                if (label) {
                    label.style.borderColor = '#ddd';
                    label.style.backgroundColor = '';
                }
            });
            
            // Add checked styling to selected option
            const label = this.closest('label');
            if (label && this.checked) {
                label.style.borderColor = '#667eea';
                label.style.backgroundColor = '#f8f9ff';
            }
        });
    });
});
