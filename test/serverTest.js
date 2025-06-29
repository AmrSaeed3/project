const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8080/api/v1';

// Test functions
async function testServerHealth() {
    console.log('🔍 Testing server health...');
    try {
        // Test if server is running by hitting a simple endpoint
        const response = await axios.get(`${BASE_URL}/products?limit=1`);
        console.log('✅ Server is running and responding');
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📦 Products found: ${response.data.results || 0}`);
        return true;
    } catch (error) {
        console.log('❌ Server health check failed:', error.message);
        return false;
    }
}

async function testProductsEndpoint() {
    console.log('\n🛍️ Testing products endpoint...');
    try {
        const response = await axios.get(`${BASE_URL}/products?limit=5`);
        console.log('✅ Products endpoint working');
        console.log(`📊 Status: ${response.status}`);
        console.log(`📦 Products returned: ${response.data.results || 0}`);
        
        if (response.data.data && response.data.data.length > 0) {
            const firstProduct = response.data.data[0];
            console.log(`🏷️ First product: ${firstProduct.name || 'No name'}`);
            console.log(`💰 Price: ${firstProduct.price || 'No price'}`);
            console.log(`❤️ Has isWishlisted field: ${firstProduct.hasOwnProperty('isWishlisted')}`);
            if (firstProduct.hasOwnProperty('isWishlisted')) {
                console.log(`❤️ isWishlisted value: ${firstProduct.isWishlisted}`);
            }
        }
        return true;
    } catch (error) {
        console.log('❌ Products endpoint test failed:', error.message);
        return false;
    }
}

async function testSearchEndpoint() {
    console.log('\n🔍 Testing search functionality...');
    try {
        const response = await axios.get(`${BASE_URL}/products?keyword=laptop&limit=3`);
        console.log('✅ Search endpoint working');
        console.log(`📊 Status: ${response.status}`);
        console.log(`🔍 Search results: ${response.data.results || 0}`);
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('📝 Search results include:');
            response.data.data.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name || 'No name'} - $${product.price || 'No price'}`);
            });
        }
        return true;
    } catch (error) {
        console.log('❌ Search endpoint test failed:', error.message);
        return false;
    }
}

async function testAISearchEndpoint() {
    console.log('\n🤖 Testing AI search functionality...');
    try {
        const response = await axios.get(`${BASE_URL}/llm-search?q=gaming laptop under 1500`);
        console.log('✅ AI search endpoint working');
        console.log(`📊 Status: ${response.status}`);
        console.log(`🤖 Search method: ${response.data.searchMethod || 'Unknown'}`);
        console.log(`🔍 Results count: ${response.data.resultsCount || 0}`);
        
        if (response.data.results && response.data.results.length > 0) {
            console.log('🎯 AI search found:');
            response.data.results.slice(0, 3).forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name || 'No name'} - $${product.price || 'No price'}`);
                console.log(`      ❤️ isWishlisted: ${product.isWishlisted}`);
            });
        }
        return true;
    } catch (error) {
        console.log('❌ AI search endpoint test failed:', error.message);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data?.message || 'No message'}`);
        }
        return false;
    }
}

async function testCategoriesEndpoint() {
    console.log('\n📂 Testing categories endpoint...');
    try {
        const response = await axios.get(`${BASE_URL}/categories?limit=5`);
        console.log('✅ Categories endpoint working');
        console.log(`📊 Status: ${response.status}`);
        console.log(`📂 Categories found: ${response.data.results || 0}`);
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('📝 Categories include:');
            response.data.data.forEach((category, index) => {
                console.log(`   ${index + 1}. ${category.name || 'No name'}`);
            });
        }
        return true;
    } catch (error) {
        console.log('❌ Categories endpoint test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting MENG E-Commerce API Tests\n');
    console.log('=' .repeat(50));
    
    const tests = [
        { name: 'Server Health', fn: testServerHealth },
        { name: 'Products Endpoint', fn: testProductsEndpoint },
        { name: 'Search Functionality', fn: testSearchEndpoint },
        { name: 'AI Search', fn: testAISearchEndpoint },
        { name: 'Categories Endpoint', fn: testCategoriesEndpoint }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ Test "${test.name}" crashed:`, error.message);
            failed++;
        }
        console.log('-'.repeat(30));
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Your API is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testServerHealth,
    testProductsEndpoint,
    testSearchEndpoint,
    testAISearchEndpoint,
    testCategoriesEndpoint,
    runAllTests
};
