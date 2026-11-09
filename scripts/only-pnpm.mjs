#!/usr/bin/env node
// Fails an install started by anything but pnpm. Keeps pnpm-lock.yaml authoritative
// now that bun.lock is gone.
const userAgent = process.env.npm_config_user_agent ?? '';

if (!userAgent.startsWith('pnpm')) {
    console.error(`This project uses pnpm (detected "${userAgent || 'unknown'}"). Run: corepack enable && pnpm install`);
    process.exit(1);
}
