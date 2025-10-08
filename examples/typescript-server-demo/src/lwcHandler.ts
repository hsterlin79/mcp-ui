import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class LwcHandler {
  private lwcBundlePath: string;
  private modulesPath: string;

  constructor() {
    this.lwcBundlePath = join(process.cwd(), 'dist', 'lwc-bundle.js');
    this.modulesPath = join(process.cwd(), 'src', 'modules');
  }

  /**
   * Generates HTML content for the LWC component
   * @param flightData Optional flight data to inject into the component
   * @returns HTML string with embedded LWC bundle
   */
  generateLwcHtml(flightData?: any): string {
    try {
      // Read the bundled LWC JavaScript
      const lwcBundle = readFileSync(this.lwcBundlePath, 'utf8');
      
      // Create HTML that loads the LWC component
      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LWC Component Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="lwc-container">
            <p>Loading LWC component...</p>
        </div>
    </div>
    <script>
        console.log('About to load LWC bundle');
        
        // Inject flight data if provided
        ${flightData ? `window.flightData = ${JSON.stringify(flightData)};` : ''}
        
        ${lwcBundle}
        console.log('LWC bundle loaded');
    </script>
</body>
</html>`;
    } catch (error) {
      throw new Error(`Error loading LWC component: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure to run "pnpm run build:lwc" first.`);
    }
  }

  /**
   * Checks if the LWC bundle exists
   * @returns boolean indicating if bundle exists
   */
  isLwcBundleAvailable(): boolean {
    try {
      readFileSync(this.lwcBundlePath, 'utf8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parses component name from URL (e.g., "x-flightDetails" -> {namespace: "x", component: "flightDetails"})
   * @param componentName The component name from URL
   * @returns Object with namespace and component name, or null if invalid
   */
  parseComponentName(componentName: string): { namespace: string; component: string } | null {
    const parts = componentName.split('-');
    if (parts.length !== 2) {
      return null;
    }
    return {
      namespace: parts[0],
      component: parts[1]
    };
  }

  /**
   * Checks if a component exists in the modules directory
   * @param namespace The namespace (e.g., "x")
   * @param component The component name (e.g., "flightDetails")
   * @returns boolean indicating if component exists
   */
  componentExists(namespace: string, component: string): boolean {
    const componentPath = join(this.modulesPath, namespace, component);
    const jsFile = join(componentPath, `${component}.js`);
    const htmlFile = join(componentPath, `${component}.html`);
    
    return existsSync(jsFile) && existsSync(htmlFile);
  }

  /**
   * Generates HTML for a specific component with optional data
   * @param componentName The fully qualified component name (e.g., "x-flightDetails")
   * @param data Optional data to inject into the component
   * @returns HTML string with embedded LWC bundle
   */
  generateComponentHtml(componentName: string, data?: any): string {
    const parsed = this.parseComponentName(componentName);
    if (!parsed) {
      throw new Error(`Invalid component name format: ${componentName}. Expected format: namespace-componentName`);
    }

    if (!this.componentExists(parsed.namespace, parsed.component)) {
      throw new Error(`Component not found: ${componentName}. Check if ${parsed.namespace}/${parsed.component} exists in modules directory.`);
    }

    try {
      // Read the bundled LWC JavaScript
      const lwcBundle = readFileSync(this.lwcBundlePath, 'utf8');
      
      // Create HTML that loads the specific LWC component
      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName} Component</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="lwc-container">
            <p>Loading ${componentName} component...</p>
        </div>
    </div>
    <script>
        console.log('About to load LWC bundle for ${componentName}');
        
        // Inject component data if provided
        ${data ? `window.componentData = ${JSON.stringify(data)};` : ''}
        window.targetComponent = '${componentName}';
        
        ${lwcBundle}
        console.log('LWC bundle loaded for ${componentName}');
    </script>
</body>
</html>`;
    } catch (error) {
      throw new Error(`Error loading LWC component ${componentName}: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure to run "pnpm run build:lwc" first.`);
    }
  }

  generateComponentAsRawHtml(componentName: string, data?: any): string {
    const parsed = this.parseComponentName(componentName);
    if (!parsed) {
      throw new Error(`Invalid component name format: ${componentName}. Expected format: namespace-componentName`);
    }

    if (!this.componentExists(parsed.namespace, parsed.component)) {
      throw new Error(`Component not found: ${componentName}. Check if ${parsed.namespace}/${parsed.component} exists in modules directory.`);
    }

    try {
      // Read the bundled LWC JavaScript
      const lwcBundle = readFileSync(this.lwcBundlePath, 'utf8');

      // Create HTML that loads the specific LWC component
      return `
        <div class="container">
            <div id="lwc-container">
                <p>Loading ${componentName} component...</p>
            </div>
        </div>
        <script>
            console.log('About to load LWC bundle for ${componentName}');

            // Inject component data if provided
            ${data ? `window.componentData = ${JSON.stringify(data)};` : ''}
            window.targetComponent = '${componentName}';

            ${lwcBundle}
            console.log('LWC bundle loaded for ${componentName}');
        </script>
        `;
    } catch (error) {
      throw new Error(`Error loading LWC component ${componentName}: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure to run "pnpm run build:lwc" first.`);
    }
  }
}
