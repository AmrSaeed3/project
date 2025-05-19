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
    },{timestamps: true}
);



//creat model
const categoryModel = mongoose.model('Category',categorySchema)

module.exports = categoryModel;