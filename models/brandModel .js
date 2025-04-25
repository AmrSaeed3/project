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

//creat model

module.exports =  mongoose.model('Brand',brandSchema);