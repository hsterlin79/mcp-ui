import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getFlightSearchFormHtml(): string {
  const htmlTemplate = readFileSync(
    join(__dirname, 'flightSearchForm.html'),
    'utf-8'
  );

  const script = `
    console.log('Flight search form script loaded');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initForm);
    } else {
      initForm();
    }
    
    function initForm() {
      console.log('Initializing form...');
      const form = document.getElementById('flightSearchForm');
      const resultDiv = document.getElementById('result');
      const submitBtn = document.getElementById('submitBtn');
      
      console.log('Form elements:', { form, resultDiv, submitBtn });
      
      if (!form) {
        console.error('Form not found!');
        return;
      }
      
      console.log('Adding click event listener to button...');

      submitBtn.addEventListener('click', async (e) => {
        console.log('Button clicked!');
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = '🔍 Searching...';
        resultDiv.className = 'result info';
        resultDiv.textContent = 'Submitting your search request...';

        // Collect form data
        const formData = {
          originCity: document.getElementById('originCity').value,
          destinationCity: document.getElementById('destinationCity').value,
          dateOfTravel: document.getElementById('dateOfTravel').value,
          filters: {
            price: parseInt(document.getElementById('price').value),
            discountPercentage: parseFloat(document.getElementById('discountPercentage').value)
          }
        };

        const selectedTool = document.getElementById('toolSelection').value;

        // Send action to parent via MCP-UI action system
        const action = {
          type: 'tool',
          payload: {
            toolName: selectedTool,
            params: formData
          }
        };

        console.log('Action to send:', action);

        try {
          // Check if we're in an iframe (MCP-UI client context)
          const isInIframe = window.self !== window.top;
          console.log('Is in iframe:', isInIframe);
          
          if (isInIframe) {
            // Post message to parent window (MCP-UI client)
            console.log('Posting message to parent...');
            window.parent.postMessage(action, '*');
            console.log('Message posted successfully');
            resultDiv.className = 'result success';
            resultDiv.textContent = '✅ Search request sent! Tool "' + selectedTool + '" will be executed with your parameters.';
          } else {
            // Fallback for testing outside iframe - show the data that would be sent
            resultDiv.className = 'result info';
            resultDiv.innerHTML = '<strong>⚠️ Not in MCP-UI client context</strong><br><br>' +
              'This form is designed to work within an MCP-UI client (like ui-inspector).<br><br>' +
              '<strong>Action that would be sent:</strong><br>' +
              '<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">' +
              JSON.stringify(action, null, 2) +
              '</pre>';
          }
        } catch (error) {
          resultDiv.className = 'result error';
          resultDiv.textContent = '❌ Error: ' + error.message;
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Search Flights';
        }
      });
    }
  `;

  return htmlTemplate.replace('{{SCRIPT_PLACEHOLDER}}', script);
}

export function getAddressSelfContainedHtml(): string {
  const htmlTemplate = readFileSync(
    join(__dirname, 'addressSelfContained.html'),
    'utf-8'
  );

  return htmlTemplate;
}
