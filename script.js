// Ensure browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    const resultField = document.getElementById('result');
    const startBtn = document.getElementById('start-btn');
    const instructions = document.getElementById('instructions');

    // Set recognition properties
    recognition.continuous = false;
    recognition.lang = 'en-US';

    // Start voice recognition when button is clicked
    startBtn.addEventListener('click', () => {
        recognition.start();
        instructions.textContent = "Listening...";
    });

    // Process the result
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        resultField.value = transcript;
        instructions.textContent = "Processing...";

        const sanitizedInput = sanitizeInput(transcript);
        if (sanitizedInput) {
            resultField.value = evaluateExpression(sanitizedInput);
            instructions.textContent = "Say another calculation or click the button.";
        } else {
            instructions.textContent = "Invalid input. Please try again.";
        }
    };

    // Error handling
    recognition.onerror = function(event) {
        instructions.textContent = "Error occurred in recognition: " + event.error;
    };

    // Sanitize input to convert spoken words into an expression for eval
    function sanitizeInput(input) {
        input = input.toLowerCase();

        // Replace spoken words with operators
        input = input.replace(/plus/g, '+');
        input = input.replace(/minus/g, '-');
        input = input.replace(/times/g, '*');
        input = input.replace(/multiplied by/g, '*');
        input = input.replace(/divided by/g, '/');
        input = input.replace(/over/g, '/');
        input = input.replace(/by/g, '');

        // Add additional operations
        input = input.replace(/power of|to the power of/g, '^');    // Exponentiation
        input = input.replace(/square root of/g, 'sqrt');           // Square root
        input = input.replace(/percent of/g, '*0.01*');             // Percentage
        input = input.replace(/mod|remainder of/g, '%');            // Modulo (remainder)
        input = input.replace(/negative/g, '-');                    // Negative number

        // Remove 'and' that could appear in spoken input
        input = input.replace(/ and /g, '');

        // Only allow valid characters (numbers, operators, and spaces)
        return input.match(/^[0-9+\-*/^%sqrt(). ]+$/) ? input : null;
    }

    // Evaluate the sanitized expression
    function evaluateExpression(expression) {
        try {
            // Replace ^ with ** for exponentiation in JavaScript
            expression = expression.replace(/\^/g, '**');

            // Handle square root calculations
            if (expression.includes('sqrt')) {
                expression = expression.replace(/sqrt\((\d+)\)/g, 'Math.sqrt($1)');
                expression = expression.replace(/sqrt (\d+)/g, 'Math.sqrt($1)');
            }

            return eval(expression);
        } catch (e) {
            return "Error!";
        }
    }
} else {
    // If browser doesn't support speech recognition
    alert("Sorry, your browser doesn't support speech recognition.");
}
