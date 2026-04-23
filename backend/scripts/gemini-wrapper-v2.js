/**
 * Modern Gemini Wrapper V2 (Atomic Design Edition)
 * Main Entry Point
 */
const { log } = require('./gemini-wrapper/atoms/logger');
const { SDKAdapter } = require('./gemini-wrapper/organisms/sdk-adapter');
const { CLIAdapter } = require('./gemini-wrapper/organisms/cli-adapter');
const { BridgeOrchestrator } = require('./gemini-wrapper/organisms/bridge-orchestrator');

log('--- Modern Gemini Wrapper V2 (Atomic) Starting ---');

const sdk = new SDKAdapter();
const cli = new CLIAdapter();
const orchestrator = new BridgeOrchestrator(sdk, cli);

// Bootstrap
orchestrator.init();

// Graceful Shutdown
function shutdown(signal) {
    log(`Received ${signal}. Shutting down...`);
    cli.stop();
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    log(`CRITICAL: Uncaught Exception: ${err.message}`);
    log(err.stack);
    shutdown('UNCAUGHT_EXCEPTION');
});

log('Wrapper V2 Bootstrap Complete.');