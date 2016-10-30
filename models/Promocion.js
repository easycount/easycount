var mongoose = require('mongoose');


var PromocionSchema = new mongoose.Schema({
    name: String,
    productos: [mongoose.Schema.Types.ObjectId], //Estos son los productos a los que afecta la promocion
    description: String,
    barcode: String,
    empresa: mongoose.Schema.Types.ObjectId,
    categorias:[String],
    tipo: String, //Indica el tipo de promocion y a que afecta, en plan todos los productos,algunos en concreto...
    f_desde: Date,
    f_hasta: Date
},{ collection: 'promociones' });


module.exports = mongoose.model('Promocion', PromocionSchema);
