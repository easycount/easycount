var mongoose = require('mongoose');

var DataUsuarioSchema = new mongoose.Schema({
    usuario: String,
    gastoMedioMensual: Number,
    gastoMedioAnual: Number,
    gastos: [{mes: Number, año: Number, importe: Number, numCompras: Number}]
});

/*
 ***infoProductos***
 El valor de gasto mensual acumulado se extrae directamente de la BBDD de forma dinámica
 El valor de productos mejor valorados en general y por tipo de producto se puede extraer de datos empresa
 Producto más comprado se extrae directamente de los tickets de forma dinámica.
 */

module.exports = mongoose.model('DataUsuario', DataUsuarioSchema);
