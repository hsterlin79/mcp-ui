# typescript-server-demo

This barebones server demonstrates how to use `@mcp-ui/server` to generate all three types of UI resources via three separate tools:

- `showExternalUrl`: Renders an `<iframe>` pointing to an external URL.
- `showRawHtml`: Renders a static block of HTML.
- `showRemoteDom`: Executes a script that uses a custom component (`<ui-text>`) to render content, demonstrating how to leverage a client-side component library.

For a detailed explanation of how this server works, see the [TypeScript Server Walkthrough](https://mcpui.dev/guide/server/typescript/walkthrough.html).

## Running the server

To run the server in development mode, first install the dependencies, then run the `dev` command:

```bash
pnpm install
pnpm dev
```

The server will be available at `http://localhost:3000`.

You can view the UI resources from this server by connecting to it with the [`ui-inspector`](https://github.com/idosal/ui-inspector) (target `http://localhost:3000/mcp` with Streamable HTTP Transport Type).


# Lightning Web Component (LWC) Support

### Building the LWC Component

Before running the server, you need to compile the LWC component:

```bash
# Build the LWC bundle
pnpm run build:lwc
```

**Start the server:**
```bash
pnpm dev
```


This command uses Rollup to bundle the LWC component into `dist/lwc-bundle.js`.

### **Test the LWC endpoint:**
   Open your browser and navigate to `http://localhost:3010/lwc`
   
   You should see:
   - An LWC component displaying "This is an LWC component"
   - No console errors about missing containers

### Troubleshooting LWC Issues

If you encounter mounting issues:

1. **Check that the LWC bundle exists:**
   ```bash
   ls -la dist/lwc-bundle.js
   ```

2. **Rebuild the LWC bundle:**
   ```bash
   pnpm run build:lwc
   ```

3. **Check the browser console** for any JavaScript errors

4. **Verify the container element** exists in the HTML by viewing the page source

The LWC component includes retry logic that attempts to mount up to 10 times, waiting for the DOM to be ready.


## Tool to return LWC Component as HTML
* Use tool `getStaticLwc` from UI-Inspector to test this behavior

