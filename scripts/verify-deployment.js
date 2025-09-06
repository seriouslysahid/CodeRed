#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that a deployment is working correctly by:
 * 1. Checking health endpoints
 * 2. Verifying API connectivity
 * 3. Testing critical user flows
 * 4. Validating performance metrics
 */

const https = require('https');
const http = require('http');

class DeploymentVerifier {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async verify() {
    console.log(`🚀 Starting deployment verification for: ${this.baseUrl}\n`);

    try {
      // Health checks
      await this.testHealthEndpoint();
      await this.testApiConnectivity();
      
      // Page accessibility
      await this.testPageAccessibility();
      
      // Performance checks
      await this.testPerformance();
      
      // Security headers
      await this.testSecurityHeaders();
      
      this.printResults();
      
      if (this.results.failed > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Verification failed with error:', error.message);
      process.exit(1);
    }
  }

  async testHealthEndpoint() {
    console.log('🔍 Testing health endpoint...');
    
    try {
      const response = await this.makeRequest('/api/health');
      const data = JSON.parse(response.body);
      
      if (response.statusCode === 200 && data.status === 'healthy') {
        this.recordTest('Health endpoint', true, 'Health check passed');
      } else {
        this.recordTest('Health endpoint', false, `Health check failed: ${data.status || 'unknown'}`);
      }
    } catch (error) {
      this.recordTest('Health endpoint', false, `Health endpoint error: ${error.message}`);
    }
  }

  async testApiConnectivity() {
    console.log('🔍 Testing API connectivity...');
    
    try {
      const response = await this.makeRequest('/api/health');
      const data = JSON.parse(response.body);
      
      if (data.api === 'connected') {
        this.recordTest('API connectivity', true, 'API is connected');
      } else {
        this.recordTest('API connectivity', false, 'API is not connected');
      }
    } catch (error) {
      this.recordTest('API connectivity', false, `API connectivity error: ${error.message}`);
    }
  }

  async testPageAccessibility() {
    console.log('🔍 Testing page accessibility...');
    
    const pages = [
      { path: '/', name: 'Landing page' },
      { path: '/dashboard', name: 'Dashboard page' },
      { path: '/admin', name: 'Admin page' }
    ];

    for (const page of pages) {
      try {
        const response = await this.makeRequest(page.path);
        
        if (response.statusCode === 200) {
          this.recordTest(`${page.name} accessibility`, true, `${page.name} is accessible`);
        } else {
          this.recordTest(`${page.name} accessibility`, false, `${page.name} returned ${response.statusCode}`);
        }
      } catch (error) {
        this.recordTest(`${page.name} accessibility`, false, `${page.name} error: ${error.message}`);
      }
    }
  }

  async testPerformance() {
    console.log('🔍 Testing performance...');
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest('/');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime < 3000) { // 3 seconds threshold
        this.recordTest('Page load performance', true, `Page loaded in ${responseTime}ms`);
      } else {
        this.recordTest('Page load performance', false, `Page took ${responseTime}ms to load (>3000ms)`);
      }
    } catch (error) {
      this.recordTest('Page load performance', false, `Performance test error: ${error.message}`);
    }
  }

  async testSecurityHeaders() {
    console.log('🔍 Testing security headers...');
    
    try {
      const response = await this.makeRequest('/');
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy'
      ];
      
      let missingHeaders = [];
      
      for (const header of requiredHeaders) {
        if (!headers[header]) {
          missingHeaders.push(header);
        }
      }
      
      if (missingHeaders.length === 0) {
        this.recordTest('Security headers', true, 'All required security headers present');
      } else {
        this.recordTest('Security headers', false, `Missing headers: ${missingHeaders.join(', ')}`);
      }
    } catch (error) {
      this.recordTest('Security headers', false, `Security headers test error: ${error.message}`);
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const isHttps = url.startsWith('https:');
      const client = isHttps ? https : http;
      
      const request = client.get(url, (response) => {
        let body = '';
        
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: body
          });
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  recordTest(name, passed, message) {
    this.results.tests.push({ name, passed, message });
    
    if (passed) {
      this.results.passed++;
      console.log(`  ✅ ${name}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`  ❌ ${name}: ${message}`);
    }
  }

  printResults() {
    console.log('\n📊 Verification Results:');
    console.log(`  ✅ Passed: ${this.results.passed}`);
    console.log(`  ❌ Failed: ${this.results.failed}`);
    console.log(`  📈 Total: ${this.results.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Deployment verification failed!');
      console.log('Please check the failed tests and fix the issues before proceeding.');
    } else {
      console.log('\n✅ Deployment verification passed!');
      console.log('All tests completed successfully. Deployment is ready for production.');
    }
  }
}

// CLI usage
if (require.main === module) {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.error('Usage: node verify-deployment.js <base-url>');
    console.error('Example: node verify-deployment.js https://your-app.vercel.app');
    process.exit(1);
  }
  
  const verifier = new DeploymentVerifier(baseUrl);
  verifier.verify();
}

module.exports = DeploymentVerifier;