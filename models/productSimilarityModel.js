const mongoose = require('mongoose');

const productSimilaritySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  // Make sure this matches your Product model name
    required: true
  },
  similarProducts: [{
    similarProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'  // Make sure this matches your Product model name
    },
    similarityScore: Number
  }]
});

module.exports = mongoose.model('ProductSimilarity', productSimilaritySchema);
