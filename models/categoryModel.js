const mongoose = require ('mongoose')

//schema
const categorySchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'category name required'],
            unique: [true, 'Category must be unique'],
            minlength:[3,'too short category name'],
            maxlength:[23,'too long category name'],
            
        },
        slug:{
            type: String,
            lowercase: true,
        },
        image: String,
    },{timestamps: true}
);


categorySchema.post('init',(doc) => {
    if(doc.image){
        doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
    }
});
const setImageURL = (doc) => {
    if (doc.image) {
        const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
        doc.image = imageUrl;
    }
};
// findOne, findAll and update
categorySchema.post('init', (doc) => {
    setImageURL(doc);
});

// create
categorySchema.post('save', (doc) => {
    setImageURL(doc);
});

//creat model
const categoryModel = mongoose.model('Category',categorySchema)

module.exports = categoryModel;