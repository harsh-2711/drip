const DiscoveryAgent = require('./agents/discovery');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('Starting Agent A: Trendy Brand Discovery');
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Initialize and run the discovery agent
    const discoveryAgent = new DiscoveryAgent();
    const discoveredBrands = await discoveryAgent.discoverBrands();
    
    // Save the discovered brands to a JSON file
    const outputPath = path.join(outputDir, 'discovered_brands.json');
    fs.writeFileSync(outputPath, JSON.stringify(discoveredBrands, null, 2));
    
    console.log(`Discovery complete! Found ${discoveredBrands.length} brands.`);
    console.log(`Results saved to ${outputPath}`);
  } catch (error) {
    console.error('Error running discovery agent:', error);
  }
}

main();
