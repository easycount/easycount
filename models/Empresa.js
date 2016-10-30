var mongoose = require('mongoose');

var subSchemaCatalogo = mongoose.Schema({
        prod_id: String,
        precio: Number
    }
    ,{ _id : false });

var EmpresaSchema = new mongoose.Schema({
    name: String,
    cif: String,
    photo: String,
    catalogo: [subSchemaCatalogo],
    usuarios:[String],
    fregistro: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Empresa', EmpresaSchema);