var mongoose = require('mongoose');

var TicketSchema = new mongoose.Schema({
    importe: Number,
    fecha: {type: Date, default: Date.now},
    empresa: String,
    usuario: String,
    productos: [{id_prod: String, cantidad: Number, precio_ud: Number}],
    establecimiento: String
});

module.exports = mongoose.model('Ticket', TicketSchema);
