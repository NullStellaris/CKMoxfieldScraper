const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('public'));

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle form submission
app.post('/generate-csv', (req, res) => {
    const textInput = req.body.textInput;
    // convert newlines to dashes
    const dashText = textInput.replace(/\n/g, '-');
    console.log(`Received input: ${dashText}`);
    // Execute Cypress script with the input as an environment variable
    exec(
        `npx cypress run --spec cypress/e2e/scrape.cy.js --env inputText="${dashText}"`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Cypress: ${error.message}`);
                return res.status(500).send('Error running Cypress script');
            }

            // Extract JSON result from Cypress output
            const match = stdout.match(/\[(.*)\]/); // Adjust regex if necessary
            // Remove quotes from the string
            const split = match[1].replace(/"/g, '').split(',');

            // Get card information in format <qty> <name> (<set>) <collector number>
            const cards = split.map((card) => {
                const qty = card.match(/^\d+/)[0];
                const name = card.match(/(?<=\d\s)(.*?)(?=\s\()/)[0];
                const set = card.match(/(?<=\()\w+(?=\))/)[0];
                const collectorNumber = card.match(/\d+$/)[0];
                const price = 1.69; // Placeholder price
                return {
                    qty: qty,
                    name: name,
                    set: set,
                    collectorNumber: collectorNumber,
                    price: price,
                };
            });

            // indicate success if JSON result was found and send the result as a json response
            if (match && cards) {
                console.log(`Cypress output: ${split}`);
                return res.json(cards);
            } else {
                console.error('Error parsing Cypress output');
                return res.status(500).send('Error parsing Cypress output');
            }
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
