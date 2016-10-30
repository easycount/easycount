var mongoose = require('mongoose');

var ProductoSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    barcode: Number,
    marca: String,
    type: String,
    description: String,
    photo: String,
    valoraciones:[{puntuacion: Number, user: String, fecha: {type: Date, default: Date.now} , empresa:  String}],
    opiniones:[{texto: String, user: String, fecha: {type: Date, default: Date.now}, empresa: String, positivo: Boolean}],
    restricciones:[String]
});

module.exports = mongoose.model('Producto', ProductoSchema);