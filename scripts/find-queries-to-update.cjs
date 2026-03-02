#!/usr/bin/env node

/**
 * Script to find all Supabase queries that need property_id filtering
 * Run: node scripts/find-queries-to-update.js
 */

const fs = require('fs');
const path = require('path');

// Tables that need property_id filtering
const TABLES_TO_CHECK = [
  'rooms',
  'bookings',
  'users',
  'blocked_dates',
  'facilities',
  'testimonials',
  'tourist_attractions',
  'contact_messages',
  'social_media_links',
  'room_images',
  'features',
  'house_rules',
  'faqs',
  'resort_closures',
  'whatsapp_sessions'
];

// Directories to scan
const DIRS_TO_SCAN = [
  'src/pages',
  'src/components',
  'src/lib',
  'netlify/functions'
];

// Pattern to match Supabase queries
const QUERY_PATTERNS = [
  /supabase\.from\(['"`](\w+)['"`]\)/g,
  /\.from\(['"`](\w+)['"`]\)/g
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const findings = [];
  
  // Check each pattern
  QUERY_PATTERNS.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, 'g');
    
    while ((match = regex.exec(content)) !== null) {
      const tableName = match[1];
      
      // Check if this table needs property_id
      if (TABLES_TO_CHECK.includes(tableName)) {
        // Get line number
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const lineContent = content.split('\n')[lineNumber - 1].trim();
        
        // Check if property_id is already being used nearby
        const contextStart = Math.max(0, match.index - 200);
        const contextEnd = Math.min(content.length, match.index + 200);
        const context = content.substring(contextStart, contextEnd);
        
        const hasPropertyId = context.includes('property_id') || 
                             context.includes('propertyId') ||
                             context.includes('roomsQuery') ||
                             context.includes('bookingsQuery') ||
                             context.includes('Query.');
        
        findings.push({
          table: tableName,
          line: lineNumber,
          content: lineContent,
          hasPropertyId,
          needsUpdate: !hasPropertyId
        });
      }
    }
  });
  
  return findings;
}

function scanDirectory(dir) {
  const results = {};
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.match(/\.(tsx?|jsx?|cjs)$/)) {
        const findings = scanFile(filePath);
        if (findings.length > 0) {
          results[filePath] = findings;
        }
      }
    });
  }
  
  walk(dir);
  return results;
}

function main() {
  console.log('🔍 Scanning for Supabase queries that need property_id filtering...\n');
  
  const allResults = {};
  let totalFiles = 0;
  let totalQueries = 0;
  let queriesNeedingUpdate = 0;
  
  DIRS_TO_SCAN.forEach(dir => {
    const results = scanDirectory(dir);
    Object.assign(allResults, results);
  });
  
  // Sort by priority (files with most queries needing update first)
  const sortedFiles = Object.entries(allResults).sort((a, b) => {
    const aNeeds = a[1].filter(f => f.needsUpdate).length;
    const bNeeds = b[1].filter(f => f.needsUpdate).length;
    return bNeeds - aNeeds;
  });
  
  // Print results
  sortedFiles.forEach(([filePath, findings]) => {
    const needsUpdate = findings.filter(f => f.needsUpdate);
    const alreadyUpdated = findings.filter(f => !f.needsUpdate);
    
    if (needsUpdate.length > 0) {
      totalFiles++;
      console.log(`\n📄 ${filePath}`);
      console.log(`   ⚠️  ${needsUpdate.length} queries need updating`);
      
      needsUpdate.forEach(finding => {
        totalQueries++;
        queriesNeedingUpdate++;
        console.log(`   Line ${finding.line}: .from('${finding.table}')`);
        console.log(`      ${finding.content.substring(0, 80)}...`);
      });
      
      if (alreadyUpdated.length > 0) {
        console.log(`   ✅ ${alreadyUpdated.length} queries already updated`);
      }
    }
  });
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files with queries needing update: ${totalFiles}`);
  console.log(`Total queries needing update: ${queriesNeedingUpdate}`);
  console.log('\n💡 PRIORITY ORDER (update these first):');
  
  const priorityFiles = sortedFiles
    .filter(([_, findings]) => findings.some(f => f.needsUpdate))
    .slice(0, 10);
  
  priorityFiles.forEach(([filePath, findings], index) => {
    const needsCount = findings.filter(f => f.needsUpdate).length;
    console.log(`${index + 1}. ${filePath} (${needsCount} queries)`);
  });
  
  console.log('\n📖 See MULTI_TENANT_QUERY_PATTERNS.md for update patterns');
  console.log('📖 See PHASE_1_IMPLEMENTATION_GUIDE.md for full guide\n');
}

main();
