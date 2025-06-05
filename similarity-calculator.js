const natural = require('natural');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' }); // <-- update path
const cliProgress = require('cli-progress');
const colors = require('colors/safe');

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Define MongoDB schemas
const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  // ... other product fields
});

const similaritySchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  similarProducts: [{
    similarProductId: mongoose.Schema.Types.ObjectId,
    similarityScore: Number
  }]
});

const Product = mongoose.model('Product', productSchema);
const ProductSimilarity = mongoose.model('ProductSimilarity', similaritySchema);

// Choose the appropriate connection string format
let MONGODB_URI;
if (process.env.db_URI) {
  MONGODB_URI = process.env.db_URI;
  console.log(colors.blue('Using db_URI from config.env'));
} else if (process.env.db_Username && process.env.db_Password && process.env.db_NAME) {
  MONGODB_URI = `mongodb+srv://${process.env.db_Username}:${process.env.db_Password}@localhost:27017/${process.env.db_NAME}`;
  console.log(colors.blue('Using manual connection string from config.env'));
} else {
  MONGODB_URI = 'mongodb://localhost:27017/products';
  console.log(colors.blue('Using fallback localhost connection'));
}

// Log the connection string (with password masked)
const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
console.log(colors.blue(`Connection string: ${maskedUri}`));

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  allTerms.forEach(term => {
    const valA = vecA[term] || 0;
    const valB = vecB[term] || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  });

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

async function calculateAndStoreSimilarities() {
  console.log(colors.cyan('🚀 Starting similarity calculation...'));

  try {
    // Connect to database
    console.log(colors.yellow('📊 Connecting to MongoDB...'));
    await mongoose.connect(MONGODB_URI);
    console.log(colors.green('✅ Connected to database successfully.'));

    // 1. Get all products from database
    console.log(colors.yellow('📚 Fetching products from database...'));
    const allProducts = await Product.find({});

    if (allProducts.length === 0) {
      console.log(colors.red('❌ No products found for similarity calculation.'));
      return;
    }

    console.log(colors.green(`✅ Found ${allProducts.length} products.`));

    // 2. Build TF-IDF Corpus
    console.log(colors.yellow('🔍 Building TF-IDF Corpus...'));
    const tfidf = new TfIdf();

    // Create a progress bar for corpus building
    const corpusBar = new cliProgress.SingleBar({
      format: 'Building Corpus |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} products',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    corpusBar.start(allProducts.length, 0);

    allProducts.forEach((product, index) => {
      tfidf.addDocument(`${product.name} ${product.description || ''}`);
      corpusBar.update(index + 1);
    });

    corpusBar.stop();
    console.log(colors.green('✅ TF-IDF Corpus built.'));

    // Pre-calculate all vectors
    console.log(colors.yellow('🧮 Pre-calculating TF-IDF vectors...'));

    const vectorBar = new cliProgress.SingleBar({
      format: 'Calculating Vectors |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} vectors',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    vectorBar.start(allProducts.length, 0);

    const productVectors = [];
    for (let idx = 0; idx < allProducts.length; idx++) {
      const product = allProducts[idx];
      const vector = {};
      const text = `${product.name} ${product.description || ''}`.toLowerCase();
      const terms = tokenizer.tokenize(text);

      terms.forEach(term => {
        vector[term] = tfidf.tfidf(term, idx);
      });

      productVectors.push({ product, vector });
      vectorBar.update(idx + 1);
    }

    vectorBar.stop();
    console.log(colors.green('✅ All vectors calculated.'));

    // 3. Calculate similarities using pre-calculated vectors
    const similarityThreshold = parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.1;
    const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;
    let processedCount = 0;

    console.log(colors.yellow(`🔄 Starting similarity calculation with threshold ${similarityThreshold}...`));

    // Create a progress bar for overall progress
    const mainBar = new cliProgress.SingleBar({
      format: 'Overall Progress |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} products',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    mainBar.start(productVectors.length, 0);

    for (let i = 0; i < productVectors.length; i += BATCH_SIZE) {
      const batch = productVectors.slice(i, i + BATCH_SIZE);

      const bulkOps = [];

      // Create a progress bar for current batch
      const batchBar = new cliProgress.SingleBar({
        format: 'Current Batch |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} in batch',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });

      batchBar.start(batch.length, 0);

      for (let j = 0; j < batch.length; j++) {
        const { product: productA, vector: vectorA } = batch[j];
        const currentSimilarities = [];

        for (const { product: productB, vector: vectorB } of productVectors) {
          if (productA._id.toString() === productB._id.toString()) continue;

          const similarity = cosineSimilarity(vectorA, vectorB);

          if (similarity >= similarityThreshold) {
            currentSimilarities.push({
              similarProductId: productB._id,
              similarityScore: similarity
            });
          }
        }

        bulkOps.push({
          updateOne: {
            filter: { productId: productA._id },
            update: { $set: { similarProducts: currentSimilarities } },
            upsert: true
          }
        });

        processedCount++;
        batchBar.update(j + 1);
      }

      batchBar.stop();

      // Execute bulk operation if there are operations to perform
      if (bulkOps.length > 0) {
        console.log(colors.yellow(`💾 Saving batch results to database...`));
        await ProductSimilarity.bulkWrite(bulkOps);
        console.log(colors.green(`✅ Saved similarities for ${bulkOps.length} products.`));
      }

      mainBar.update(processedCount);
    }

    mainBar.stop();
    console.log(colors.green(`\n✅ Similarity calculation completed for all ${processedCount} products.`));

    // Display some stats
    console.log(colors.cyan('\n📊 Summary:'));
    console.log(colors.cyan(`Total products processed: ${processedCount}`));
    console.log(colors.cyan(`Similarity threshold used: ${similarityThreshold}`));
    console.log(colors.cyan(`Batch size used: ${BATCH_SIZE}`));

    console.log(colors.green('\n🎉 Similarity calculation and storage completed successfully!'));
  } catch (error) {
    console.error(colors.red('\n❌ Error during similarity calculation:'));
    console.error(colors.red(error));
  } finally {
    await mongoose.disconnect();
    console.log(colors.yellow('📡 Disconnected from database.'));
  }
}

// Run the function
calculateAndStoreSimilarities();
