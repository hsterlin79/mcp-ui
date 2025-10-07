import { readFileSync } from 'fs';
import { join } from 'path';

export class LwcHandler {
  private lwcBundlePath: string;

  constructor() {
    this.lwcBundlePath = join(process.cwd(), 'dist', 'lwc-bundle.js');
  }

  /**
   * Generates HTML content for the LWC component
   * @returns HTML string with embedded LWC bundle
   */
  generateLwcHtml(): string {
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
}
