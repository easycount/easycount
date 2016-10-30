var mongoose = require('mongoose');

var infoSistemaSchema = new mongoose.Schema({
    entradasSistema: [{usuario: String, provider: String, fecha: {type: Date, default: Date.now}}],
    llamadasAPI: [{contador: Number, mes: Number, anyo: Number}],
    llamadasFalladasAPI: [{contador: Number, mes: Number, anyo: Number}],
    valoraciones: [{contador: Number, mes: Number, anyo: Number}],
    opiniones: [{contador: Number, mes: Number, anyo: Number}],
});

// Los nuevos usuarios y el número de usuarios se pueden mirar directamente gracias
// al campo fecha de registro de los usuarios

// Los nuevos tickets y el número de tickets se pueden mirar directamente gracias
// al campo fecha de los tickets

// Las nuevas listas y el número de listas se pueden mirar directamente gracias
// al campo fecha de las listas

module.exports = mongoose.model('InfoSistema', infoSistemaSchema);