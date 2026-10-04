#!/usr/bin/env tsx
/**
 * DataNexus Build-Time Route Consistency Verification Script
 * Validates that every API endpoint invoked in `src/` exists in `server.ts`.
 */

import fs from 'fs';
import path from 'path';

function getSourceFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseServerRoutes(serverFilePath: string): Set<string> {
  const serverContent = fs.readFileSync(serverFilePath, 'utf8');
  const serverRoutes = new Set<string>();

  // Matches app.get('/api/...', app.post('/api/...', etc.
  const routeRegex = /app\.(get|post|put|delete|patch|options|all)\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = routeRegex.exec(serverContent)) !== null) {
    const endpoint = match[2];
    if (endpoint.startsWith('/api')) {
      serverRoutes.add(endpoint);
    }
  }

  return serverRoutes;
}

function normalizeRoutePattern(route: string): string[] {
  const variations = [route];

  // If template literal contained expressions replaced with wildcard/param
  // e.g. /api/stores/${id}/sync -> /api/stores/:id/sync
  const paramNormalized = route
    .replace(/\$\{[^}]+\}/g, ':id')
    .replace(/\/([0-9a-fA-F-]{8,}|[0-9]+)(\/|$)/g, '/:id$2');
  variations.push(paramNormalized);

  // If last part might be a parameter
  const lastParamNormalized = route.replace(/\/[^/]+$/, '/:id');
  variations.push(lastParamNormalized);

  return variations;
}

function verifyRoutes() {
  console.log('🔍 [DataNexus] Verifying frontend-to-backend API route parity...');

  const rootDir = process.cwd();
  const serverPath = path.join(rootDir, 'server.ts');
  const srcDir = path.join(rootDir, 'src');

  if (!fs.existsSync(serverPath)) {
    console.error(`❌ Error: server.ts not found at ${serverPath}`);
    process.exit(1);
  }

  const serverRoutes = parseServerRoutes(serverPath);
  console.log(`📡 Discovered ${serverRoutes.size} API routes defined in server.ts`);

  const srcFiles = getSourceFiles(srcDir);
  const detectedCalls: Array<{ file: string; line: number; rawRoute: string }> = [];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((lineText, lineIdx) => {
      // Find /api/... string literals and template literals
      const matches = [
        ...lineText.matchAll(/['"`](\/api\/[a-zA-Z0-9_\-\/${}:.]+)['"`]/g)
      ];

      for (const m of matches) {
        const rawRoute = m[1];
        // Filter out non-endpoint paths or comment tokens
        if (rawRoute.startsWith('/api/')) {
          detectedCalls.push({
            file: path.relative(rootDir, file),
            line: lineIdx + 1,
            rawRoute
          });
        }
      }
    });
  }

  console.log(`🔎 Auditing ${detectedCalls.length} API call references across frontend...`);

  const missingEndpoints: Array<{ file: string; line: number; route: string }> = [];

  for (const call of detectedCalls) {
    const variations = normalizeRoutePattern(call.rawRoute);
    const exists = variations.some(v => serverRoutes.has(v) || serverRoutes.has(v.split('?')[0]));

    if (!exists) {
      missingEndpoints.push({
        file: call.file,
        line: call.line,
        route: call.rawRoute
      });
    }
  }

  if (missingEndpoints.length > 0) {
    console.error('\n❌ Build Failure: Unrecognized or missing API routes detected in src/:');
    missingEndpoints.forEach(err => {
      console.error(`   - ${err.route}  -->  ${err.file}:${err.line}`);
    });
    console.error('\nPlease ensure corresponding endpoint handlers are defined in server.ts.\n');
    process.exit(1);
  }

  console.log('✅ Success: All frontend API calls are strictly defined and validated against server.ts!');
}

verifyRoutes();
