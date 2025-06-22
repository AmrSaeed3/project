// const asyncHandler = require('express-async-handler');
// const Product = require('../models/productModel');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config();

// // Check if API key is available
// if (!process.env.GEMINI_API_KEY) {
//   console.error('GEMINI_API_KEY is not defined in environment variables');
// }

// // Initialize Gemini API with proper API key
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// exports.llmSearch = asyncHandler(async (req, res) => {
//     // Get search query from query parameters (for GET requests)
//     const userQuery = req.query.q;

//     console.log('Search query received:', userQuery); // Debug log

//     if (!userQuery) {
//         return res.status(400).json({ 
//             message: 'Search query is required. Use query parameter "q" (example: /api/v1/llm-search?q=your search)' 
//         });
//     }

//     try {
//         // Try to use LLM for advanced query understanding
//         console.log('Attempting to use Gemini API...');

//         // Get the model - try different model names based on API version
//         let model;
//         try {
//             // First try the latest model name
//             model = genAI.getGenerativeModel({ model: "gemini-pro" });
//         } catch (modelError) {
//             console.log('Failed with gemini-pro, trying gemini-1.0-pro...');
//             try {
//                 model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
//             } catch (modelError2) {
//                 console.log('Failed with gemini-1.0-pro, trying models/gemini-pro...');
//                 model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
//             }
//         }

//         const prompt = `Given the user's e-commerce search query in any language, identify potential product names, categories, subcategories, keywords, or attributes.
//         Format the output as a JSON object with a 'keywords' array and optionally 'categories', 'subcategories', 'minPrice', 'maxPrice', 'sizes'.

//         Example User Query: "أريد أحذية أمان مضادة للانزلاق مقاس 42 بسعر أقل من 500 جنيه"
//         Example LLM Output: { "keywords": ["أحذية أمان", "مضادة للانزلاق"], "sizes": ["42"], "maxPrice": 500 }

//         User Query: "${userQuery}"
//         LLM Output:`;

//         console.log('Sending prompt to Gemini...');

//         // Generate content with the model
//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text().trim();

//         console.log("LLM Raw Output:", text);

//         // Try to parse the LLM output as JSON
//         let parsedLLMOutput;
//         try {
//             parsedLLMOutput = JSON.parse(text);
//             console.log("Successfully parsed LLM output:", parsedLLMOutput);
//         } catch (jsonError) {
//             console.error("Failed to parse LLM output as JSON:", jsonError);
//             throw new Error("Failed to parse LLM output");
//         }

//         // Extract search parameters from LLM output
//         const { keywords = [], categories = [], subcategories = [], minPrice, maxPrice, sizes = [] } = parsedLLMOutput;

//         // Construct MongoDB query
//         const mongoQuery = {};

//         if (keywords.length > 0) {
//             // Create a regex pattern for each keyword
//             const keywordPatterns = keywords.map(keyword => new RegExp(keyword, 'i'));

//             mongoQuery.$or = [
//                 { name: { $in: keywordPatterns } },
//                 { description: { $in: keywordPatterns } }
//             ];
//         }

//         if (categories.length > 0) {
//             mongoQuery.category = { $in: categories.map(cat => new RegExp(cat, 'i')) };
//         }

//         if (minPrice !== undefined || maxPrice !== undefined) {
//             mongoQuery.price = {};
//             if (minPrice !== undefined) mongoQuery.price.$gte = minPrice;
//             if (maxPrice !== undefined) mongoQuery.price.$lte = maxPrice;
//         }

//         if (sizes.length > 0) {
//             mongoQuery.sizes = { $in: sizes };
//         }

//         // Execute MongoDB query
//         const products = await Product.find(mongoQuery).limit(20);

//         res.json({
//             originalQuery: userQuery,
//             llmParsedQuery: parsedLLMOutput,
//             mongoQuery: mongoQuery,
//             results: products,
//             note: "Using AI-enhanced search"
//         });

//     } catch (error) {
//         console.error('AI Search Error:', error);

//         // Fallback to basic search if AI fails
//         console.log('Falling back to basic search...');

//         // Simple keyword extraction
//         const keywords = userQuery.split(' ').filter(word => word.length > 2);

//         // Simple price extraction
//         let minPrice, maxPrice;
//         const priceMatch = userQuery.match(/price\s*=\s*(\d+)/i);
//         if (priceMatch) {
//             const price = parseInt(priceMatch[1]);
//             // Create a price range around the specified price
//             minPrice = Math.max(0, price * 0.9);
//             maxPrice = price * 1.1;
//         }

//         const parsedQuery = { 
//             keywords: keywords,
//             minPrice: minPrice,
//             maxPrice: maxPrice
//         };

//         // Construct MongoDB query
//         const mongoQuery = {};

//         if (keywords.length > 0) {
//             mongoQuery.$or = [
//                 { name: { $regex: new RegExp(keywords.join('|'), 'i') } },
//                 { description: { $regex: new RegExp(keywords.join('|'), 'i') } }
//             ];
//         }

//         if (minPrice || maxPrice) {
//             mongoQuery.price = {};
//             if (minPrice) mongoQuery.price.$gte = minPrice;
//             if (maxPrice) mongoQuery.price.$lte = maxPrice;
//         }

//         // Execute MongoDB query
//         const products = await Product.find(mongoQuery).limit(20);

//         res.json({
//             originalQuery: userQuery,
//             parsedQuery: parsedQuery,
//             mongoQuery: mongoQuery,
//             results: products,
//             note: "Using basic search (AI processing failed)"
//         });
//     }
// });
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel'); // Assume this is the correct product model path
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai'); // Ensure the necessary plugins are imported
require('dotenv').config();

// Check the key API on startup
if (!process.env.GEMINI_API_KEY) {
    console.error('Fatal error: GEMINI_API_KEY is not defined in environment variables. AI search will not work.');
    // You can choose to stop the application from here if the API key is absolutely necessary
    // process. exit(1);
}

// Initialize the Gemini API only if the key exists
let genAI;
let GeminiModel;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try to initialize the model here, and an error can be handled if it fails
    try {
        // Try the latest new model names or the model you've confirmed works
        geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        //geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" }); // or
        console.log("Gemini model initialized successfully (e.g., Gemini-1.5-flash-latest).");
    } catch (modelInitError) {
        console.error("Failed to initialize Gemini model: ${modelInitError.message}. AI search may be down.");
        gminiModel = null; // Set to zero until later validation code
    }
}

// Keyword fallback function
async function fallbackSearch(res, userQuery, aiErrorMessage) {
    console.warn("Return to basic keyword search. Reason: ${aiErrorMessage}");

    const numbersInQuery = userQuery.match(/\d+(\.\d+)?/g) || []; // Request all numbers
    const keywords = userQuery.split(' ').filter(word => word.length > 2 && isNaN(word)); // Ignore pure numbers

    const potentialPrices = [];
    let minPrice, maxPrice;

    // Try to request orders from the number in the reference
    numbersInQuery.forEach(numStr => {
        potentialPrices.push(parseFloat(numStr));
    });

    // If prices aren't explicitly specified, but there are numbers, the smallest one must be the min and the largest the max
    // This is very simple and may need improvements

    if (potentialPrices.length > 0) {
        if (userQuery.match(/less than|less than/i) && potentialPrices.length === 1) { // less than
            maxPrice = potentialPrices[0];
        } else if (userQuery.match(/greater than|by|more than|greater than|greater than/i) && potentialPrices.length === 1) { // greater than
            minPrice = potentialPrices[0];
        } else if (potentialPrices.length === 1) { // Only one number, I don't think it's an approximate price
            minPrice = potentialPrices[0] * 0.8;
            maxPrice = potentialPrices[0] * 1.2;
        } else if (potentialPrices.length >= 2) {
            potentialPrices.sort((a, b) => a - b);
            minPrice = potentialPrices[0];
            maxPrice = potentialPrices[potentialPrices.length - 1];
        }
    }
    const parsedQuery = {
        keywordsUsed: keywords,
        minPriceFound: minPrice,
        maxPriceFound: maxPrice
    };

    const mongoQuery = {};

    if (keywords.length > 0) {
        mongoQuery.$or = [
            { name: { $regex: new RegExp(keywords.join('|'), 'i') } },
            { description: { $regex: new RegExp(keywords.join('|'), 'i') } },
            { category: { $regex: new RegExp(keywords.join('|'), 'i') } }, // Add search in category as well
            { brand: { $regex: new RegExp(keywords.join('|'), 'i') } } // Add search in brand
        ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        mongoQuery.price = {};
        if (minPrice !== undefined) mongoQuery.price.$gte = minPrice;
        if (maxPrice !== undefined) mongoQuery.price.$lte = maxPrice;
    }

    try {
        const products = await Product.find(mongoQuery).limit(20);
        res.status(200).json({
            originalQuery: userQuery,
            searchMethod: "Basic Keyword Search",
            reasonForFallback: aiErrorMessage,
            parsedQueryByFallback: parsedQuery,
            mongoQueryUsed: mongoQuery,
            results: products,
        });
    } catch (dbError) {
        console.error('Error during fallback MongoDB query:', dbError);
        res.status(500).json({ message: "Error performing basic search.", error: dbError.message });
    }
}
exports.llmSearch = asyncHandler(async (req, res) => {
    const userQuery = req.query.q;

    console.log('Search query received:', userQuery);

    if (!userQuery) {
        return res.status(400).json({
            message: 'Search query (q) is required. Example: /api/v1/llm-search?q=your search query'
        });
    }

    // Check whether the Gemini model has been initialized successfully 
    if (!geminiModel) {
        console.error('Gemini model is not initialized. Falling back to basic search.');
        return fallbackSearch(res, userQuery, "Gemini model not initialized (check API key or model name).");
    }

    try {
        console.log('Attempting to use Gemini API for enhanced search...');

        // modify the Prompt to be more specific and strict about JSON output 
        const prompt = `You are an expert e-commerce search query parser. Your sole task is to analyze the user's search query, provided in any language, and extract relevant information for a product database query. 

            You MUST output ONLY a single, valid JSON object. This JSON object should contain: 
            - "keywords": An array of strings representing key search terms (product names, descriptive adjectives, features). 
            - "categories": An optional array of strings for identified product categories. 
            - "subcategories": An optional array of strings for identified product subcategories. 
            - "brand": An optional string or array of strings for identified brands. 
            - "color": An optional string or array of strings for identified colors. 
            - "sizes": An optional array of strings for identified sizes (e.g., "42", "XL", "Large"). 
            - “minPrice”: An optional number for the minimum price. 
            - "maxPrice": An optional number for the maximum price.

            If a piece of information is not clearly present or inferable from the user query, omit its key from the JSON output or use an empty array [] for the array fields.
            DO NOT include any introductory text, including text, explanations, or markdown formatting (like \`\`\`json \`\`\`) around the JSON object. The entire response must be the JSON object itself.

            Example User Query 1 (Arabic): "I want non-slip safety shoes, size 42, for less than 500 Egyptian pounds."
            Expected LLM Output for Query 1: { "keywords": ["safety shoes", "non-slip"], "sizes": ["42"], "maxPrice": 500 }

            Example User Query 2 (English): "red gaming laptop under $1500 with RTX graphics."
            Expected LLM Output for Query 2: { "keywords": ["gaming laptop", "rtx graphics"], "color": ["red"], "maxPrice": 1500, "categories": ["electronics", "computers"] } 

            Example User Query 3 (English): "summer dresses for women" 
            Expected LLM Output for Query 3: { "keywords": ["summer dresses"], "categories": ["clothing", "dresses"], "attributes": ["for women"] } 

            User Query: "${userQuery}" 
            LLM Output:`;

        console.log('Sending prompt to Gemini...');
        // إعدادات الأمان (اختياري، لكن يفضل للتحكم في المحتوى)
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const generationConfig = {
            // temperature: 0.7, // You can control the model's creativity
            // topK: 1,
            topP: 1,
            maxOutputTokens: 2048, // Set a maximum output limit if necessary
        };

        const result = await geminiModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });

        // const response = await result.response; // The old method may not work with all SDK versions
        // const text = response.text().trim();

        let text = "";
        if (result.response && typeof result.response.text === 'function') {
            text = result.response.text().trim();
        } else if (result.response && result.response.candidates && result.response.candidates.length > 0 &&
            result.response.candidates[0].content && result.response.candidates[0].content.parts &&
            result.response.candidates[0].content.parts.length > 0 &&
            result.response.candidates[0].content.parts[0].text) {
            text = result.response.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("LLM response structure not as expected:", JSON.stringify(result.response, null, 2));
            return fallbackSearch(res, userQuery, "LLM did not return a parseable text response.");
        }

        console.log("LLM Raw Output:", text);

        let cleanedText = text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            cleanedText = jsonMatch[1].trim();
        } else {
            // If not surrounded by markdown, try to remove anything before the first '{' and after the last '}'
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
            }
        }

        let parsedLLMOutput;
        try {
            parsedLLMOutput = JSON.parse(cleanedText);
            console.log("Successfully parsed LLM output:", parsedLLMOutput);
        } catch (jsonError) {
            console.error("Failed to parse LLM output as JSON:", jsonError.message);
            console.error("Cleaned text that failed parsing:", cleanedText);
            return fallbackSearch(res, userQuery, `Failed to parse LLM output as JSON. Raw LLM output: "${text.substring(0, 100)}..."`);
        }
        // Extract search parameters from LLM output
        const {
            keywords = [],
            categories = [],
            subcategories = [], // Not currently used in query construction, but can be added
            brand, // Can be text or array
            color, // Can be text or array
            minPrice,
            maxPrice,
            sizes = []
        } = parsedLLMOutput;

        // Build a MongoDB query
        const mongoQuery = {};
        const orConditions = [];

        if (keywords && keywords.length > 0) {
            keywords.forEach(keyword => {
                const regex = new RegExp(keyword.trim(), 'i');
                orConditions.push({ name: regex });
                orConditions.push({ description: regex });
                orConditions.push({ 'tags': regex }); // Assume you have a tags field
            });
        }

        if (categories && categories.length > 0) {
            // If categories is an array, use $in
            mongoQuery.category = { $in: categories.map(cat => new RegExp(cat.trim(), 'i')) };
        }

        if (brand) {
            if (Array.isArray(brand)) {
                mongoQuery.brand = { $in: brand.map(b => new RegExp(b.trim(), 'i')) };
            } else {
                mongoQuery.brand = new RegExp(String(brand).trim(), 'i');
            }
        }

        if (color) {
            if (Array.isArray(color)) {
                // If you have a colors field as an array in the product: mongoQuery.colors = { $in: color.map(c => new RegExp(c.trim(), 'i')) };
                // If the color field is a single string:
                const colorRegexes = color.map(c => new RegExp(c.trim(), 'i'));
                orConditions.push({ color: { $in: colorRegexes } }); // Or depending on the product model 
            } else {
                orConditions.push({ color: new RegExp(String(color).trim(), 'i') });
            }
        }

        if (orConditions.length > 0) {
            mongoQuery.$or = orConditions;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            mongoQuery.price = {};
            if (minPrice !== undefined && !isNaN(parseFloat(minPrice))) mongoQuery.price.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) mongoQuery.price.$lte = parseFloat(maxPrice);
            // Ensure that price is not an empty object if neither minPrice nor maxPrice is provided
            if (Object.keys(mongoQuery.price).length === 0) {
                delete mongoQuery.price;
            }
        }

        if (sizes && sizes.length > 0) {
            // Assume you have an 'availableSizes' or 'sizes' field in the product model that is an array
            mongoQuery['attributes.size'] = { $in: sizes.map(s => String(s).trim()) }; // Example if size is within attributes
            // or mongoQuery.sizes = { $in: sizes.map(s => String(s).trim().toUpperCase()) }; // If it is a direct field
        }

        console.log("Constructed MongoDB Query:", JSON.stringify(mongoQuery, null, 2));

        // Execute a MongoDB query
        const products = await Product.find(mongoQuery)
            .populate('category brand') // Example for fetching category and brand information
            .limit(20); // Limit the number of results

        res.status(200).json({
            originalQuery: userQuery,
            searchMethod: "AI-Enhanced Search",
            llmInterpretation: parsedLLMOutput,
            mongoQueryUsed: mongoQuery,
            resultsCount: products.length,
            results: products
        });

    } catch (error) {
        console.error('AI Search Main Error:', error);
        // If anything in the AI ​​try block fails, fallback to the main search
        return fallbackSearch(res, userQuery, error.message || "An unexpected error occurred during AI processing.");
    }
});