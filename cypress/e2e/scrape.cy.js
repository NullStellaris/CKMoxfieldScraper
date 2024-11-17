// custom-test.js
describe('Custom Test Script', () => {
    it('Processes Input', () => {
        // Retrieve command-line arguments
        const args = Cypress.env('inputText');
        const lines = args.replace(/"/, '').split('-');
        
        // Process input (example: reverse each line)
        const processed = lines.map((line) => line);

        // Log result to console (output will be captured by Node.js)
        cy.task('log', JSON.stringify(processed));
    });
});
