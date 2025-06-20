# Graduation Project API

[![Node.js](https://img.shields.io/badge/Node.js-v18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21.2-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v5.9.2-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A robust RESTful API built with Express.js and MongoDB for managing data with features including authentication, file uploads, data validation, and product similarity recommendations.

## Technologies Used

- **Express.js**: Fast, unopinionated web framework for Node.js
- **MongoDB/Mongoose**: NoSQL database and elegant MongoDB object modeling
- **Multer**: Middleware for handling multipart/form-data for file uploads
- **Sharp**: High-performance image processing library
- **Express Validator**: Middleware for data validation
- **UUID**: For generating unique identifiers
- **Slugify**: For creating URL-friendly slugs
- **Natural**: NLP library for text processing and similarity calculations
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Passport**: Authentication middleware for OAuth strategies

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/graduation.git

# Navigate to the project directory
cd graduation

# Install dependencies
npm install

# Set up environment variables
cp config.env.example config.env
# Edit config.env with your configuration

# Start development server
npm run start:dev

# Start production server
npm run start:prod
```

## API Endpoints

### Category Endpoints
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create a new category
- `GET /api/v1/categories/:id` - Get a specific category
- `PUT /api/v1/categories/:id` - Update a specific category
- `DELETE /api/v1/categories/:id` - Delete a specific category

### Subcategory Endpoints
- `GET /api/v1/subcategories` - Get all subcategories
- `POST /api/v1/subcategories` - Create a new subcategory
- `GET /api/v1/subcategories/:id` - Get a specific subcategory
- `PUT /api/v1/subcategories/:id` - Update a specific subcategory
- `DELETE /api/v1/subcategories/:id` - Delete a specific subcategory
- `GET /api/v1/categories/:categoryId/subcategory` - Get subcategories for a specific category

### Brand Endpoints
- `GET /api/v1/brand` - Get all brands
- `POST /api/v1/brand` - Create a new brand
- `GET /api/v1/brand/:id` - Get a specific brand
- `PUT /api/v1/brand/:id` - Update a specific brand
- `DELETE /api/v1/brand/:id` - Delete a specific brand

### Product Endpoints
- `GET /api/v1/products` - Get all products
- `POST /api/v1/products` - Create a new product
- `GET /api/v1/products/:id` - Get a specific product
- `PUT /api/v1/products/:id` - Update a specific product
- `DELETE /api/v1/products/:id` - Delete a specific product
- `GET /api/v1/products/:productId/similar` - Get similar products based on content similarity

### Review Endpoints
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create a new review
- `GET /api/v1/reviews/:id` - Get a specific review
- `PUT /api/v1/reviews/:id` - Update a specific review
- `DELETE /api/v1/reviews/:id` - Delete a specific review

### Authentication Endpoints
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login a user
- `GET /api/v1/auth/logout` - Logout a user
- `POST /api/v1/auth/forgotPassword` - Request password reset
- `POST /api/v1/auth/verifyResetCode` - Verify password reset code
- `PUT /api/v1/auth/resetPassword` - Reset password with code

### OAuth Endpoints
- `GET /api/v1/auth/google` - Authenticate with Google
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `GET /api/v1/auth/facebook` - Authenticate with Facebook
- `GET /api/v1/auth/facebook/callback` - Facebook OAuth callback

### User Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/updateMe` - Update current user profile
- `PUT /api/v1/users/changeMyPassword` - Change current user password
- `DELETE /api/v1/users/deleteMe` - Delete current user account

## Environment Variables

The application uses the following environment variables:

```
PORT=8000
NODE_ENV=development
HOST=0.0.0.0

# Database
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_URI=your_mongodb_connection_string
DB_NAME=your_database_name

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Similarity Calculation
SIMILARITY_THRESHOLD=0.1
BATCH_SIZE=100
```

## Project Structure

```
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middlewares/        # Custom middleware functions
├── models/             # Mongoose models
├── routes/             # API routes
├── services/           # Business logic
│   ├── auth/           # Authentication services
│   ├── handlersFactory.js  # Generic CRUD operations
│   └── productService.js   # Product-related services
├── utils/              # Utility functions
│   ├── validators/     # Request validation
│   └── apiFeatures.js  # Query building and pagination
├── uploads/            # Uploaded files
├── server.js           # Application entry point
├── similarity-calculator.js  # Product similarity calculation script
└── package.json        # Project dependencies
```

## Features

- **RESTful API Design**: Follows REST principles for intuitive API design
- **MongoDB Integration**: Efficient data storage and retrieval
- **Image Processing**: Resize and optimize uploaded images
- **Data Validation**: Comprehensive request validation
- **Error Handling**: Consistent error responses
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control
- **Social Login**: OAuth integration with Google and Facebook
- **Password Management**: Secure password reset flow
- **Product Recommendations**: Content-based similarity using TF-IDF and cosine similarity
- **Environment Configuration**: Different settings for development and production

## Product Similarity Engine

The project includes a product recommendation system based on content similarity:

- **TF-IDF Vectorization**: Converts product text (name, description) into numerical vectors
- **Cosine Similarity**: Measures similarity between product vectors
- **Batch Processing**: Efficiently processes large product catalogs
- **Pre-computation**: Calculates similarities offline and stores results for fast retrieval
- **Progress Visualization**: Visual feedback during similarity calculation

To run the similarity calculation:

```bash
# Run the similarity calculator
node similarity-calculator.js
```

This will:
1. Connect to your MongoDB database
2. Fetch all products
3. Calculate similarity scores between products using TF-IDF and cosine similarity
4. Store the results in the ProductSimilarity collection
5. Display progress with visual indicators

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
# Natural: AI Product Similarity for E-commerce

A powerful Node.js application that calculates product similarities using Natural Language Processing (NLP) techniques to enhance e-commerce recommendation systems.

## Overview

This application analyzes product names and descriptions to identify similar products using Term Frequency-Inverse Document Frequency (TF-IDF) and cosine similarity algorithms. The results are stored in MongoDB for quick access by e-commerce platforms to power "You might also like" or "Similar products" features.

## Features

- **TF-IDF Vectorization**: Converts product text into numerical vectors
- **Cosine Similarity Calculation**: Measures similarity between products
- **Batch Processing**: Efficiently handles large product catalogs
- **Progress Visualization**: Real-time terminal UI showing calculation progress
- **MongoDB Integration**: Stores similarity results for quick retrieval
- **Configurable Parameters**: Adjustable similarity threshold and batch size

## Technical Implementation

### Mathematical Foundation

#### TF-IDF (Term Frequency-Inverse Document Frequency)

TF-IDF measures the importance of a word in a document relative to a collection of documents:

1. **Term Frequency (TF)**: How often a word appears in a document
   ```
   TF(t) = (Number of times term t appears in document) / (Total number of terms in document)
   ```

2. **Inverse Document Frequency (IDF)**: How unique or rare a word is across all documents
   ```
   IDF(t) = log_e(Total number of documents / Number of documents containing term t)
   ```

3. **TF-IDF Score**: The product of TF and IDF
   ```
   TF-IDF(t) = TF(t) × IDF(t)
   ```

#### Cosine Similarity

Cosine similarity measures the cosine of the angle between two non-zero vectors, determining how similar they are regardless of their magnitude:

```
cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
```

Where:
- A · B is the dot product of vectors A and B
- ||A|| and ||B|| are the magnitudes (Euclidean norms) of vectors A and B

In our implementation:
```javascript
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
```

### Core Functions

#### 1. TF-IDF Corpus Building
```javascript
// Build TF-IDF Corpus
const tfidf = new TfIdf();
allProducts.forEach((product, index) => {
  tfidf.addDocument(`${product.name} ${product.description || ''}`);
});
```
This function creates a TF-IDF model from all product descriptions, establishing the foundation for similarity calculations.

#### 2. Vector Calculation
```javascript
// Pre-calculate all vectors
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
}
```
This function converts each product's text into a numerical vector where each dimension represents a term's TF-IDF score.

#### 3. Similarity Calculation
```javascript
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
  
  // Store similarities...
}
```
This function calculates the cosine similarity between each pair of products and stores the results if they exceed the threshold.

### Terminal UI Design

The application features an intuitive terminal UI with:

1. **Progress Bars**: Visual indicators for each processing stage
   ```javascript
   const corpusBar = new cliProgress.SingleBar({
     format: 'Building Corpus |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} products',
     barCompleteChar: '\u2588',
     barIncompleteChar: '\u2591',
     hideCursor: true
   });
   ```

2. **Color-Coded Messages**: Different colors for different types of information
   - Cyan: Process titles and summaries
   - Yellow: Progress updates and ongoing operations
   - Green: Success messages and completions
   - Red: Error messages

3. **Emoji Icons**: Visual cues for different stages
   - 🚀 Starting processes
   - 📊 Database operations
   - 🔍 Analysis operations
   - ✅ Successful completions
   - ❌ Errors and failures

4. **Summary Statistics**: Final overview of the process
   ```javascript
   console.log(colors.cyan('\n📊 Summary:'));
   console.log(colors.cyan(`Total products processed: ${processedCount}`));
   console.log(colors.cyan(`Similarity threshold used: ${similarityThreshold}`));
   console.log(colors.cyan(`Batch size used: ${BATCH_SIZE}`));
   ```

## Database Schema

### Product Schema
```javascript
const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  // ... other product fields
});
```

### Similarity Schema
```javascript
const similaritySchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  similarProducts: [{
    similarProductId: mongoose.Schema.Types.ObjectId,
    similarityScore: Number
  }]
});
```

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/natural.git
   cd natural
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB credentials
   ```
   # MongoDB Connection
   MONGODB_USERNAME=your_username
   MONGODB_PASSWORD=your_password
   MONGODB_CLUSTER=your_cluster.mongodb.net
   MONGODB_DATABASE=your_database_name
   
   # Application Settings
   SIMILARITY_THRESHOLD=0.1
   BATCH_SIZE=100
   ```

## Usage

Run the application:
```bash
node calculateSimilarities.js
```

## Performance Considerations

- **Memory Usage**: Pre-calculating vectors reduces redundant calculations but increases memory usage
- **Batch Processing**: Processing products in batches balances memory usage with performance
- **Bulk Database Operations**: Using MongoDB's bulk operations reduces database overhead
- **Similarity Threshold**: Adjusting the threshold controls the number of similar products stored

## Future Enhancements

- Word embeddings (Word2Vec, GloVe) for more semantic similarity
- Category-based similarity weighting
- Price and other metadata factoring into similarity scores
- API endpoints for retrieving similar products
- Scheduled recalculation of similarities for new products

## License

MIT

## Contributors

- Your Name - Initial work
