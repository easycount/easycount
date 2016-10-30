var mongoose = require('mongoose');

var subSchema = mongoose.Schema({
    //your subschema content
    prod_id: String,
    cantidad: Number,
    empresa: String
},{ _id : false });

var ListaSchema = new mongoose.Schema({
    name: String,
    productos: [subSchema],
    fecha: {type: Date, default: Date.now},
    importe: Number,
    description: String,
    predefinida: Boolean,
    usuario: String
},{ strict: false });


module.exports = mongoose.model('Lista', ListaSchema);