const mongoose = require ('mongoose')

//schema
const brandSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Brand name required'],
            unique: [true, 'Brand must be unique'],
            minlength:[3,'too short Brand name'],
            maxlength:[23,'too long Brand name'],
            
        },
        slug:{
            type: String,
            lowercase: true,
        },
        image: String,
    },{timestamps: true}
);

const setImageURL = (doc) => {
    if (doc.image) {
        const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image = imageUrl;
    }
};
// findOne, findAll and update
brandSchema.post('init', (doc) => {
    setImageURL(doc);
});

// create
brandSchema.post('save', (doc) => {
    setImageURL(doc);
});
//creat model

module.exports =  mongoose.model('Brand',brandSchema);