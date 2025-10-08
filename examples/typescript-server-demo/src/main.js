import { createElement } from 'lwc';
import App from 'x/app';
import FlightDetails from 'x/flightDetails';

console.log('LWC main.js loaded');

// Component registry
const componentRegistry = {
  'x-app': App,
  'x-flightDetails': FlightDetails
};

function mountLWC() {
  console.log('Looking for lwc-container');
  const container = document.getElementById('lwc-container');
  console.log('Container found:', container);
  
  if (container) {
    // Determine which component to load
    const targetComponent = window.targetComponent || 'x-app';
    const componentClass = componentRegistry[targetComponent];
    
    if (!componentClass) {
      console.error(`Component not found: ${targetComponent}`);
      container.innerHTML = `<p>Error: Component ${targetComponent} not found</p>`;
      return true;
    }
    
    console.log(`Creating LWC element for ${targetComponent}`);
    const elm = createElement(targetComponent, { is: componentClass });
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
