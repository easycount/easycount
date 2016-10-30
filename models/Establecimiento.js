var mongoose = require('mongoose');

var EstablecimientoSchema = new mongoose.Schema({
    name: String,
    empresa: String,
    ciudad: String,
    comunidad: String,
    coordenadas: String
});

module.exports = mongoose.model('Establecimiento', EstablecimientoSchema);
