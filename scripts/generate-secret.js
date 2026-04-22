#!/usr/bin/env node

/**
 * Secret Generation Script
 * 
 * Generates secure random strings for JWT secrets, API keys, etc.
 * Usage: node scripts/generate-secret.js [length] [--base64]
 */

const crypto = require('crypto');

const args = process.argv.slice(2);
const length = parseInt(args[0]) || 64;
const useBase64 = args.includes('--base64');

function generateHexSecret(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

function generateBase64Secret(bytes) {
  return crypto.randomBytes(bytes).toString('base64').replace(/[+/=]/g, '');
}

function generateTOTPSecret() {
  // TOTP secrets are typically base32 encoded
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const bytes = crypto.randomBytes(20);
  for (let i = 0; i < 20; i++) {
    secret += chars[bytes[i] % chars.length];
  }
  return secret;
}

console.log('\n🔐 HCDC-X Secret Generator\n');
console.log('==========================================');

// JWT Secrets
const jwtSecret = useBase64 ? generateBase64Secret(32) : generateHexSecret(32);
const jwtRefreshSecret = useBase64 ? generateBase64Secret(32) : generateHexSecret(32);

console.log('\n📋 JWT Secrets (add to .env):');
console.log('------------------------------------------');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);

// TOTP Secret (for reference)
const totpSecret = generateTOTPSecret();
console.log('\n📱 TOTP Secret Example:');
console.log('------------------------------------------');
console.log(`TOTP Secret (Base32): ${totpSecret}`);

// API Key style
const apiKey = `hcdcx_${crypto.randomBytes(24).toString('hex')}`;
console.log('\n🔑 API Key Example:');
console.log('------------------------------------------');
console.log(`API_KEY=${apiKey}`);

// Session Secret
const sessionSecret = generateHexSecret(32);
console.log('\n🍪 Session Secret (if using express-session):');
console.log('------------------------------------------');
console.log(`SESSION_SECRET=${sessionSecret}`);

// Random ID
const randomId = crypto.randomBytes(16).toString('hex');
console.log('\n🆔 Random ID:');
console.log('------------------------------------------');
console.log(`${randomId}`);

console.log('\n==========================================');
console.log('✅ Copy the values above to your .env file');
console.log('⚠️  Keep these secrets secure and never commit them!\n');
