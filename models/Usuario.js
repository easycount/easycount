var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var subSchemaLista = mongoose.Schema({
    //your subschema content
    lista_id: mongoose.Schema.Types.ObjectId
},{ _id : false });

var subSchemaProducto = mongoose.Schema({
    //your subschema content
    id_prod: String,
    cantidad: Number,
    empresa: String,
    fecha: {type: Date, default: Date.now}
},{ _id : false });

var UsuarioSchema = new mongoose.Schema({
    name: String,
    email: String,
    f_nacimiento: Date,
    genero: String,
    password: String,
    role: {type:String, default:"user"},
    fregistro: {type: Date, default: Date.now},
    productos: [subSchemaProducto],
    categorias: [String],
    restricciones: [String],
    provider:   {type: String, default: "web"}, //red social
    provider_id: {type: String}, //id de red social
    photo: String,   //Foto de red social
    n_personas: Number
});

// Métodos para seguridad de contraseña ======================
// genera un hash
UsuarioSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Comprueba que la contraseña es correcta
UsuarioSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);