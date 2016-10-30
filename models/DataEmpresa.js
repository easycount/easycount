var mongoose = require('mongoose');

var subSchemaInfoProductos = mongoose.Schema({
    precio:Number,
    prod_id: String,
    tipo: String,
    valMedTot: Number,
    valMedEmpresa: Number,
    vecesComprado: Number }
    ,{ _id : false }
);
//{tipo: String, valMedTipo: Number, valMedTipoTotal: Number, numProductosComprados: Number}
var subSchemaInfoTipos = mongoose.Schema({
        tipo: String,
        numProductosComprados: Number,
        valMedTipo: Number,
        valMedTipoTotal: Number,
        numValoraciones: Number,
        numValoracionesTotal: Number}
    ,{ _id : false }
);

var DataEmpresaSchema = new mongoose.Schema({
    empresa: String,
    infoProductos: [subSchemaInfoProductos],
    infoTipos: [subSchemaInfoTipos],
    infoCategoria: [{categoria: String, gastoMedio: Number, comprasMes: Number}],
    fecha: {type: Date, default: Date.now}
});

/*
***infoProductos***
* Array de todos los productos de la empresa
* valMedTot: Valoracion media del producto en el sistema
* valMedEmp: Valoracion media del producto para compras en la empresa
* vecesComprado: Numero de veces que se ha comprado ese producto en la empresa
*
***infoTipos***
* Array con los tipos de productos de la empresa
* valMedTipo: Valoración media de todos los productos de ese tipo en la empresa
* valMedTipoTotal: Valoración media de todos los productos de ese tipo en el sistema
* numProductosComprados: Numeros de veces que se ha comprado un producto de ese tipo en la empresa
*
***infoCategoria*** Añadir propiedad global
* gastoMedio: Gasto medio de los clientes de esa categoria por compra en la empresa
* comprasMes: Numero de compras que se realizan al mes de esa categoria en la empresa
 */

module.exports = mongoose.model('DataEmpresa', DataEmpresaSchema);