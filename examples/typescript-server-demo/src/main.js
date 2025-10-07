import { createElement } from 'lwc';
import App from 'x/app';

console.log('LWC main.js loaded');

function mountLWC() {
  console.log('Looking for lwc-container');
  const container = document.getElementById('lwc-container');
  console.log('Container found:', container);
  if (container) {
    console.log('Creating LWC element');
    const elm = createElement('x-app', { is: App });
    console.log('LWC element created:', elm);
    container.innerHTML = ''; // Clear loading message
    container.appendChild(elm);
    console.log('LWC element appended to container');
    return true;
  } else {
    console.log('lwc-container not found, will retry...');
    return false;
  }
}

// Use multiple strategies to ensure the container is found
function tryMountWithRetry() {
  let attempts = 0;
  const maxAttempts = 10;
  
  function attemptMount() {
    attempts++;
    console.log(`Mount attempt ${attempts}/${maxAttempts}`);
    
    if (mountLWC()) {
      console.log('LWC mounted successfully!');
      return;
    }
    
    if (attempts < maxAttempts) {
      setTimeout(attemptMount, 100); // Retry every 100ms
    } else {
      console.error('Failed to mount LWC after', maxAttempts, 'attempts');
    }
  }
  
  attemptMount();
}

// Try multiple approaches
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryMountWithRetry);
} else {
  // DOM is already ready
  tryMountWithRetry();
}
