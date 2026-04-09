// Debug namespace regex parsing

const fs = require('fs');

const content = fs.readFileSync('simple-namespace-test.tsp', 'utf8');
console.log('=== Input content ===');
console.log(content);
console.log('\n=== Namespace regex test ===');

const namespaceRegex = /namespace\s+(\w+)\s*\{\s*([\s\S]*?)\s*\}/g;

let match;
let matchCount = 0;
while ((match = namespaceRegex.exec(content)) !== null) {
  matchCount++;
  console.log(`\nMatch ${matchCount}:`);
  console.log('Full match:', JSON.stringify(match[0]));
  console.log('Namespace name:', match[1]);
  console.log('Namespace content:', JSON.stringify(match[2]));
  console.log('Content length:', match[2].length);
}

console.log(`\nTotal matches: ${matchCount}`);

// Also test the model parsing on the extracted content
if (matchCount > 0) {
  const testContent = match[2];
  console.log('\n=== Testing model parsing on namespace content ===');
  const modelRegex = /model\s+(\w+)\s*\{\s*(.*?)\s*\}/gs;
  let modelMatch;
  let modelCount = 0;
  while ((modelMatch = modelRegex.exec(testContent)) !== null) {
    modelCount++;
    console.log(`Model ${modelCount}:`, modelMatch[1]);
  }
  console.log(`Total models found: ${modelCount}`);
}