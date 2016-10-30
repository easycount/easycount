/**
 * Created by Francisco on 27/02/2016.
 */
/**
 * clase Motor
 */

//CLASE TMotor
function TMotor(NombreCanvas) {
    this.miEscena = null;
    this.miGestor = new TGestorRecursos();
    this.registroCamaras = [];
    this.registroLuces = [];
    this.registroViewPort = [];
    this.camaraActiva = null;
    this.viewPortActivo = null;
    this.miCanvas = null;
    this.miGl = null;
    this.currentProgram = null;
    this.programs = [];
    this.frameBuffers = null;
    this.frameTexture = null;
    this.viewMatrixLight;
    this.sombrasActivas = true;

    this.start(NombreCanvas);
}

TMotor.prototype.start = function(NombreCanvas)
{
    this.miCanvas = document.getElementById(NombreCanvas);
    this.miGl = initWebGL();
    initTextureFramebuffer(this);
    initShaders(this);
}


/**
 * Crea el nodo raiz de la escena y se lo asigna a la variable correspondiente.
 */
TMotor.prototype.nodoRaiz = function () {
    this.miEscena = new TNodo();
    this.miEscena.setNombre('escena');

    return this.miEscena;
};

/**
 * CREAR MALLA.
 * Crea un recurso malla el cual se incluye dentro del los recursos del gestor y se carga el fichero correspondiente.
 * @param fichero
 * @returns {TRecursoMalla}
 */
TMotor.prototype.crearMalla = function (fichero) {

    var rec = null;
    if(fichero != null && this.miGl != null){
        rec  = new TRecursoMalla();
        rec.setNombre(fichero);

        rec.cargarFichero(fichero, this.miGl);
        this.miGestor.setRecurso(rec);

    }
    return rec;
};

/**
 * CREAR ANIMACION.
 * Crea un recurso animacion el cual se incluye dentro del los recursos del gestor y se carga el fichero correspondiente.
 * @param ficheros
 * @returns {TRecursoAnimacion}
 */
TMotor.prototype.crearAnimacion = function () {

    var rec = null;
    if(arguments.length >= 0 && this.miGl != null){
        rec  = new TAnimacion();

        rec.cargarAnimacion(this.miGl,arguments);
        this.miGestor.setRecurso(rec);

    }
    return rec;
};

/**
 * CREAR TEXTURA.
 * Crea un recurso textura el cual se incluye dentro del los recursos del gestor y se carga el fichero correspondiente.
 * @param fichero
 * @returns {TRecursoTextura}
 */
TMotor.prototype.crearTextura = function (fichero) {

    var rec = null;
    if(fichero != null && this.miGl != null){
        rec  = new TRecursoTextura();
        rec.setNombre(fichero);

        rec.cargarTextura(fichero,this.miGl);
        this.miGestor.setRecurso(rec);

    }
    return rec;
};


/**
 * CREAR MATERIAL.
 * Crea un recurso textura el cual se incluye dentro del los recursos del gestor y se carga el fichero correspondiente.
 * @param nombre
 * @returns {TRecursoMaterial}
 */
TMotor.prototype.crearMaterial = function(nombre)
{
    var rec = null;

    rec  = new TRecursoMaterial();
    rec.setNombre(nombre);

    this.miGestor.setRecurso(rec);

    return rec;
};


/** crearNodo :
 *  crea un nodo hoja con sus transformaciones y asociarle la entidad
 *  añadir el nuevo nodo como hijo de sus transformaciones
 *  padre
 *  devolver la referencia al nodo creado
 * @param entidad
 * @returns {TNodo}
 */
TMotor.prototype.crearObjeto = function(recurso) {

    /** Crear nodos **/
    var nTrRotacionNodo   = new TNodo();
    var nTrEscaladoNodo   = new TNodo();
    var nTrTraslacionNodo = new TNodo();
    var nodo              = new TNodo();

    /** nombre nodos **/
    nTrRotacionNodo.setNombre("rotacionMalla");
    nTrEscaladoNodo.setNombre("escaladoMalla");
    nTrTraslacionNodo.setNombre("traslacionMalla");
    nodo.setNombre("hojaMalla");

    /** añadir hijos **/
    nTrRotacionNodo.addHijo(nTrEscaladoNodo);
    nTrEscaladoNodo.addHijo(nTrTraslacionNodo);
    nTrTraslacionNodo.addHijo(nodo);

    /** Crear entidades **/
    var entidadRotacion   = new TTransform(this);
    var entidadEscalado   = new TTransform(this);
    var entidadTraslacion = new TTransform(this);
    var entidadMalla      = new TMalla(this);

    /** Añadir entidades **/
    nTrRotacionNodo.setEntidad(entidadRotacion);
    nTrEscaladoNodo.setEntidad(entidadEscalado);
    nTrTraslacionNodo.setEntidad(entidadTraslacion);
    nodo.setEntidad(entidadMalla);



    if(recurso != undefined && recurso != null) //Si nos pasan un recurso le añadimos ya el recurso
    {
        entidadMalla.setRecurso(recurso)
    }

    return nodo;
};


/**
 *  Crear cámara y devolverla
 * @returns {TNodo}
 */
TMotor.prototype.crearCamara = function () {
    /** Crear nodos **/
    var nTrRotacionNodo   = new TNodo();
    var nTrEscaladoNodo   = new TNodo();
    var nTrTraslacionNodo = new TNodo();
    var nodo              = new TNodo();

    /** nombre nodos **/
    nTrRotacionNodo.setNombre("rotacionCamara");
    nTrEscaladoNodo.setNombre("escaladoCamara");
    nTrTraslacionNodo.setNombre("traslacionCamara");
    nodo.setNombre("hojaCamara");

    /** añadir hijos **/
    nTrRotacionNodo.addHijo(nTrEscaladoNodo);
    nTrEscaladoNodo.addHijo(nTrTraslacionNodo);
    nTrTraslacionNodo.addHijo(nodo);

    /** Crear entidades **/
    var entidadRotacion   = new TTransform(this);
    var entidadEscalado   = new TTransform(this);
    var entidadTraslacion = new TTransform(this);
    var entidadCamara      = new TCamara();

    if(arguments.length == 4)
        entidadCamara.setPerspectiva(arguments[0],arguments[1],arguments[2],arguments[3]);
    else if(arguments.length == 6)
        entidadCamara.setParalela(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);
    else
        entidadCamara.setPerspectiva(45, this.miGl.viewportWidth / this.miGl.viewportHeight, 0.1, 100.0);


    /** Añadir entidades **/
    nTrRotacionNodo.setEntidad(entidadRotacion);
    nTrEscaladoNodo.setEntidad(entidadEscalado);
    nTrTraslacionNodo.setEntidad(entidadTraslacion);
    nodo.setEntidad(entidadCamara);

    return nodo;
};


/**
 *Crear luz y devolverla
 * @param tipo
 * @returns {TLuz}
 */
TMotor.prototype.crearLuz = function (r,g,b) {

    /** Crear nodos **/
    var nTrRotacionNodo   = new TNodo();
    var nTrEscaladoNodo   = new TNodo();
    var nTrTraslacionNodo = new TNodo();
    var nodo              = new TNodo();

    /** nombre nodos **/
    nTrRotacionNodo.setNombre("rotacionLuz");
    nTrEscaladoNodo.setNombre("escaladoLuz");
    nTrTraslacionNodo.setNombre("traslacionLuz");
    nodo.setNombre("hojaLuz");

    /** añadir hijos **/
    nTrRotacionNodo.addHijo(nTrEscaladoNodo);
    nTrEscaladoNodo.addHijo(nTrTraslacionNodo);
    nTrTraslacionNodo.addHijo(nodo);

    /** Crear entidades **/
    var entidadRotacion   = new TTransform();
    var entidadEscalado   = new TTransform();
    var entidadTraslacion = new TTransform();
    var entidadLuz        = new TLuz(r,g,b);

    /** Añadir entidades **/
    nTrRotacionNodo.setEntidad(entidadRotacion);
    nTrEscaladoNodo.setEntidad(entidadEscalado);
    nTrTraslacionNodo.setEntidad(entidadTraslacion);
    nodo.setEntidad(entidadLuz);


    return nodo;
};

/**
 * asignarRecurso:
 * Asigna un recurso a un nodo malla
 * @param nodo
 * @param recurso
 * @returns {string}
 */
TMotor.prototype.asignarRecurso = function(nodo, recurso)
{
    var msg = "";
    if(nodo != null && recurso != null )
    {
        if(nodo.getNombre() == "hojaMalla")
        {
            if(recurso instanceof TAnimacion)
            {
                nodo.setEntidad(recurso);
            }
            else
                nodo.miEntidad.setRecurso(recurso);

            msg = "recurso asignado";
        }
        else
        {
            msg = "El nodo no es una malla";
        }
    }
    else
    {
        msg = "nodo o recurso no definidos";
    }

    return(msg);
};


/**
 * buscarRecurso:
 * busca un recurso en TGestorRecursos y lo devuelve, si no existe lo crea.
 * @param fichero
 * @returns {TRecursoMalla}
 */
TMotor.prototype.buscarRecurso = function(nombre){

    recurso = this.miGestor.getRecurso(fichero);
    if(recurso == null)
    {
        recurso = this.crearRecurso(nombre);
    }

    return recurso;
};


/**
 * crearGrupo:
 * Crea un grupo de transformaciones y devuelve el último nodo
 * @returns {TTransform}
 */
TMotor.prototype.crearGrupo = function() {
    /** Crear nodos **/
    var nTrRotacionNodo   = new TNodo();
    var nTrEscaladoNodo   = new TNodo();
    var nTrTraslacionNodo = new TNodo();

    /** nombre nodos **/
    nTrRotacionNodo.setNombre("rotacionGrupo");
    nTrEscaladoNodo.setNombre("escaladoGrupo");
    nTrTraslacionNodo.setNombre("traslacionGrupo");

    /** añadir hijos **/
    nTrRotacionNodo.addHijo(nTrEscaladoNodo);
    nTrEscaladoNodo.addHijo(nTrTraslacionNodo);

    /** Crear entidades **/
    var entidadRotacion   = new TTransform();
    var entidadEscalado   = new TTransform();
    var entidadTraslacion = new TTransform();

    /** Añadir entidades **/
    nTrRotacionNodo.setEntidad(entidadRotacion);
    nTrEscaladoNodo.setEntidad(entidadEscalado);
    nTrTraslacionNodo.setEntidad(entidadTraslacion);

    return nTrTraslacionNodo;
};


/**
 * REGISTRAR LUZ
 * @param luz
 * @returns {number}
 */
TMotor.prototype.registrarLuz = function ( luz )
{
    if(luz != null ){
        var n = this.registroLuces.push(luz);

        return n-1;
    }
    else {
        return -1;
    }
};


/**
 * REGISTRAR CAMARA
 * @param cam
 * @returns {number}
 */
TMotor.prototype.registrarCamara = function ( cam ) {

    if(cam != null) {
        var n = this.registroCamaras.push(cam);

        return n-1;
    }
    else {
        return -1;
    }
};


/**
 * REGISTRAR VIEW PORT
 * Se crea el view port con los parametros pasados y se anhade al array de viewports.
 * @param x
 * @param y
 * @param alto
 * @param ancho
 * @returns {number}
 */
TMotor.prototype.registrarViewPort = function (x, y, alto, ancho ) {

    var vp =  new viewPort(x, y, alto, ancho);
    var n = this.registroViewPort.push(vp);

    return n-1;
};


/**
 * SET LUZ ACTIVA
 * @param nLuz
 */
TMotor.prototype.setLuzActiva = function ( nLuz ) {
    if(nLuz >= 0 && nLuz<this.registroLuces.length){
        this.registroLuces[nLuz].miEntidad.activarLuz();
    }
};


/**
 * APAGAR LUZ
 * @param nLuz
 */
TMotor.prototype.apagarLuz = function (nLuz) {
    if(nLuz > 0){
        this.registroLuces[nLuz].apagarLuz();
    }
};


/**
 * SET CAMARA ACTIVA
 * @param nCam
 */
TMotor.prototype.setCamaraActiva = function ( nCam ){

    if(nCam >= 0) {
        this.camaraActiva = this.registroCamaras[nCam];
        this.camaraActiva.miEntidad.activarCamara();
    }
};

/**
 * GET CAMARA ACTIVA
 * @return nCam
 */
TMotor.prototype.getCamaraActiva = function()
{
    return this.camaraActiva;
};

/**
 * SET PROGRAM ACTIVO
 * @param programa
 */
TMotor.prototype.setCurrentProgram = function (n){
    if(this.programs[n] != null)
    {
        this.currentProgram = this.programs[n];
    }

    this.miGl.useProgram(this.currentProgram);
};

/**
 * GET PROGRAM ACTIVO
 * @return programa
 */
TMotor.prototype.getCurrentProgram = function (){
    return this.currentProgram;
};



/**
 * SET VIEW PORT ACTIVO
 * @param nVP
 */
TMotor.prototype.setViewPortActivo = function ( nVP ) {
    if( nVP > 0 ) {
        this.viewPortActivo = this.registroViewPort[nVP];
    }
};

/**
 * trasladarNodo:
 * Traslada el nodo dado si es un nodo hoja
 * @param nodo
 * @param vector
 */
TMotor.prototype.trasladarNodo = function(nodo, vector)
{
    var tipoNodo = nodo.getNombre();

    var entTrasladar = nodo.getPadre().getEntidad();
    entTrasladar.trasladar(vector);

};

/**
 * escalarNodo:
 * escala el nodo dado si es un nodo hoja
 * @param nodo
 * @param vector
 */
TMotor.prototype.escalarNodo = function(nodo, vector)
{
    var tipoNodo = nodo.getNombre();

    var entEscalar = nodo.getPadre().getPadre().getEntidad();
    entEscalar.escalar(vector);

};

/**
 * rotarNodo:
 * rota el nodo dado si es un nodo hoja
 * @param nodo
 * @param rad
 * @param vector
 */
TMotor.prototype.rotarNodo = function(nodo, rad, vector)
{
    var tipoNodo = nodo.getNombre();
    var entRotar;

    if(tipoNodo  == "traslacionGrupo")
    {
        entRotar = nodo.getPadre().getPadre().getEntidad();
        entRotar.rotar(rad, vector);
    }
    else
    {
        entRotar = nodo.getPadre().getPadre().getPadre().getEntidad();
        entRotar.rotar(rad, vector);
    }
};


/**
 * rotarGrupo:
 * rota un grupo dado
 * @param grupo
 * @param rad
 * @param vector
 */
TMotor.prototype.rotarGrupo = function(grupo, rad, vector)
{
    var tipoNodo = nodo.getNombre();

    var entRotar = nodo.getPadre().getPadre().getEntidad();
    entRotar.rotar(rad, vector);

};

/**
 * usarSombras:
 * activa/desactiva las sombras
 * @param opcion
 */
TMotor.prototype.usarSombras = function(opcion)
{
    this.sombrasActivas = opcion;
    this.miGl.uniform1i(this.currentProgram.sombrasActivas, opcion);
};


/**
 * DRAW
 * Inicializar la librería gráfica como sea necesario
 * Inicializar las luces como se ha explicado
 * Inicializar el viewport activo con la librería gráfica
 * Inicializar la cámara como se ha explicado
 */
TMotor.prototype.draw = function() {

    var yo = this;
    this.miGl.clearColor(0.3, 0.7, 0.4, 1.0);
    this.miGl.enable(this.miGl.DEPTH_TEST);
    this.miGl.depthFunc(this.miGl.LESS);

    tick(yo);
};

function tick(motor)
{
    requestAnimationFrame(function() {tick(motor); }); //La función se llama a si misma al volver a pintar el escenario

    /* INICIAR LIBRERIA GRAFICA */
    motor.miGl.viewport(0, 0, motor.miGl.viewportWidth, motor.miGl.viewportHeight); //Le decimos al canvas qué puede pintar. En este caso usamos el canvas entero


    motor.miGl.bindFramebuffer(motor.miGl.FRAMEBUFFER, null);
    motor.miGl.clear(motor.miGl.COLOR_BUFFER_BIT | motor.miGl.DEPTH_BUFFER_BIT); //Limpiamos el trozo de canvas definido y nos preparamos para dibujar en el

    /* INICIAR CAMARA */
    //mat4.perspective(TEntidad.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    //mat4.ortho(TEntidad.pMatrix,-15,15,-12,12, 0.1, 100.0) //out, left, right, bottom, top, near, far
    var nodo;

    var camara = motor.getCamaraActiva();
    nodo = camara;

    if(camara!=null)
    {
        var rama = [];
        var matAux = mat4.create();

        var recorrido = true;
        while (recorrido) {
            if (nodo === nodo.getPadre())
                recorrido = false;
            else {
                rama.push(nodo);
                nodo = nodo.getPadre();
            }
        }

        rama.reverse();
        for (var i = 0; i < rama.length-1; i++) {
            mat4.multiply(matAux, rama[i].miEntidad.getmiMatriz(), matAux);
        }

        mat4.invert(matAux, matAux);

        mat4.copy(TEntidad.vMatrix, matAux);
        mat4.copy(TEntidad.pMatrix, camara.miEntidad.getmiMatriz());
    }

    /* INICIAR LUCES */
    var arrayPosiciones = [];
    var arrayIntensidad = [];
    for(var i=0; i < motor.registroLuces.length; i++)
    {
        if(motor.registroLuces[i].miEntidad.getLuzEstado())
        {
            var nodo = motor.registroLuces[i];
            var rama = [];
            var matAux = mat4.create();

            var recorrido = true;
            while (recorrido)
            {
                if (nodo === nodo.getPadre())
                    recorrido = false;
                else
                {
                    rama.push(nodo);
                    nodo = nodo.getPadre();
                }
            }
            rama.reverse();

            for (var j = 0; j < rama.length-1; j++) {
                mat4.multiply(matAux, rama[j].miEntidad.getmiMatriz(), matAux);
            }

            mat4.multiply(matAux, TEntidad.vMatrix, matAux );
            arrayPosiciones.push(matAux[12]);
            arrayPosiciones.push(matAux[13]);
            arrayPosiciones.push(matAux[14]);

            var intensidad = motor.registroLuces[i].miEntidad.getIntensidad();
            arrayIntensidad.push(intensidad[0]);
            arrayIntensidad.push(intensidad[1]);
            arrayIntensidad.push(intensidad[2]);
        }
    }

    motor.miGl.uniform3fv(motor.currentProgram.pointLightingLocationUniform, arrayPosiciones);
    motor.miGl.uniform3fv(motor.currentProgram.pointLightingColorUniform, arrayIntensidad);
    motor.miGl.uniform3f(motor.currentProgram.ambientColorUniform, 0.2, 0.7, 0.2);


    /* DIBUJAR SOMBRAS */
    motor.miGl.bindFramebuffer(motor.miGl.FRAMEBUFFER, TEntidad.miMotor.frameBuffers);
    motor.miGl.clear(motor.miGl.COLOR_BUFFER_BIT | motor.miGl.DEPTH_BUFFER_BIT);

    if(motor.sombrasActivas)
    {
        for (var i = 0; i < motor.registroLuces.length-1; i++)
        {
            var rama = [];
            var viewMatrixLight = mat4.create();
            var nodo = motor.registroLuces[i];

            var recorrido = true;
            while (recorrido) {
                if (nodo === nodo.getPadre())
                    recorrido = false;
                else {
                    rama.push(nodo);
                    nodo = nodo.getPadre();
                }
            }
            rama.reverse();
            for (var j = 0; j < rama.length-1; j++) {
                mat4.multiply(viewMatrixLight, rama[j].miEntidad.getmiMatriz(), viewMatrixLight);
            }

            mat4.invert(viewMatrixLight, viewMatrixLight);

            motor.viewMatrixLight = viewMatrixLight;

            mat4.identity(TEntidad.mvMatrix);
            lightMAX = motor.registroLuces[i];

            //motor.miGl.clear(motor.miGl.COLOR_BUFFER_BIT | motor.miGl.DEPTH_BUFFER_BIT);
            motor.miEscena.drawShadownMap(motor.registroLuces[i], viewMatrixLight); //Dibujar ShadownMap
        }
    }

    /* DIBUJAR ESCENA */
    TEntidad.miMotor.miGl.bindFramebuffer(TEntidad.miMotor.miGl.FRAMEBUFFER, null);
    motor.miEscena.draw();
}

function initWebGL()
{
    var gl = null;
    try //Intentamos lanzar el contexto estandar, si falla lo intentamos conn el experimental
    {
        gl = this.miCanvas.getContext("webgl") || this.miCanvas.getContext("experimental-webgl");
        var EXT = gl.getExtension("OES_element_index_uint") ||
            gl.getExtension("MOZ_OES_element_index_uint") ||
            gl.getExtension("WEBKIT_OES_element_index_uint");

        gl.viewportWidth = this.miCanvas.width;
        gl.viewportHeight = this.miCanvas.height;
    }catch(e) {}

    //Si no tenemos el contexti nos salimos
    if(!gl)
    {
        alert("No se puede inicializar WebGL");
        gl = null;
    }
    return gl;
}

function initTextureFramebuffer(motor)
{
    var rttFramebuffer = motor.miGl.createFramebuffer();
    motor.miGl.bindFramebuffer(motor.miGl.FRAMEBUFFER, rttFramebuffer);

    var renderbuffer = motor.miGl.createRenderbuffer();
    motor.miGl.bindRenderbuffer(motor.miGl.RENDERBUFFER, renderbuffer);
    motor.miGl.renderbufferStorage(motor.miGl.RENDERBUFFER, motor.miGl.DEPTH_COMPONENT16, motor.miGl.viewportWidth, motor.miGl.viewportHeight);
    motor.miGl.framebufferRenderbuffer(motor.miGl.FRAMEBUFFER, motor.miGl.DEPTH_ATTACHMENT, motor.miGl.RENDERBUFFER, renderbuffer);


    var rttTexture = motor.miGl.createTexture();
    motor.miGl.bindTexture(motor.miGl.TEXTURE_2D, rttTexture);
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_MAG_FILTER, motor.miGl.LINEAR);
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_MIN_FILTER, motor.miGl.LINEAR);
    // Prevents s-coordinate wrapping (repeating).
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_WRAP_S, motor.miGl.CLAMP_TO_EDGE);
    // Prevents t-coordinate wrapping (repeating).
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_WRAP_T, motor.miGl.CLAMP_TO_EDGE);

    // make the texture the same size as the image
    motor.miGl.texImage2D(motor.miGl.TEXTURE_2D, 0, motor.miGl.RGBA, motor.miGl.viewportWidth, motor.miGl.viewportHeight, 0, motor.miGl.RGBA, motor.miGl.UNSIGNED_BYTE, null);
    // Attach a texture to the frameBuffer.
    motor.miGl.framebufferTexture2D(motor.miGl.FRAMEBUFFER, motor.miGl.COLOR_ATTACHMENT0, motor.miGl.TEXTURE_2D, rttTexture, 0);

    motor.miGl.bindTexture(motor.miGl.TEXTURE_2D, null);
    motor.miGl.bindRenderbuffer(motor.miGl.RENDERBUFFER, null);
    motor.miGl.bindFramebuffer(motor.miGl.FRAMEBUFFER, null);

    motor.frameBuffers = rttFramebuffer;
    motor.frameTexture = rttTexture;
}

TMotor.prototype.crearFrameTextura = function()
{
    var rttTexture = motor.miGl.createTexture();
    motor.miGl.bindTexture(motor.miGl.TEXTURE_2D, rttTexture);
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_MAG_FILTER, motor.miGl.LINEAR);
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_MIN_FILTER, motor.miGl.LINEAR);
    // Prevents s-coordinate wrapping (repeating).
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_WRAP_S, motor.miGl.CLAMP_TO_EDGE);
    // Prevents t-coordinate wrapping (repeating).
    motor.miGl.texParameteri(motor.miGl.TEXTURE_2D, motor.miGl.TEXTURE_WRAP_T, motor.miGl.CLAMP_TO_EDGE);

    // make the texture the same size as the image
    motor.miGl.texImage2D(motor.miGl.TEXTURE_2D, 0, motor.miGl.RGBA, motor.miGl.viewportWidth, motor.miGl.viewportHeight, 0, motor.miGl.RGBA, motor.miGl.UNSIGNED_BYTE, null);

    return rttTexture;
};

function createProgram(motor, fragmentShaderID, vertexShaderID)
{
    var fragmentShader = getShader(motor, fragmentShaderID); //Se utiliza getShader para obtener dos objetos, fragment y vertex.
    var vertexShader = getShader(motor, vertexShaderID);

    var shaderProgram = motor.miGl.createProgram(); //Un programa es una forma de especificar que algo debe ejecutarse con la tarjeta grafica
    motor.miGl.attachShader(shaderProgram, vertexShader);
    motor.miGl.attachShader(shaderProgram, fragmentShader);
    motor.miGl.linkProgram(shaderProgram); // Une los dos objetos en un programa

    if(!motor.miGl.getProgramParameter(shaderProgram, motor.miGl.LINK_STATUS))
    {
        alert("No se pueden iniciar los shaders");
    }

    //motor.miGl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = motor.miGl.getAttribLocation(shaderProgram, "aVertexPosition");
    //motor.miGl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute); //decirle a webGL que queremos proporcionarle valores al atributo usando una lista.

    shaderProgram.vertexNormalAttribute = motor.miGl.getAttribLocation(shaderProgram, "aVertexNormal");
    //motor.miGl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute = motor.miGl.getAttribLocation(shaderProgram, "aTextureCoord");
    //motor.miGl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.positionShadow = motor.miGl.getAttribLocation(shaderProgram, "position");


    shaderProgram.pMatrixUniform               = motor.miGl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform              = motor.miGl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform               = motor.miGl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform               = motor.miGl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.useTexturesUniform           = motor.miGl.getUniformLocation(shaderProgram, "uUseTextures");
    shaderProgram.useLightingUniform           = motor.miGl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.ambientColorUniform          = motor.miGl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform = motor.miGl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingColorUniform    = motor.miGl.getUniformLocation(shaderProgram, "uPointLightingColor");

    shaderProgram.materialDifuse               = motor.miGl.getUniformLocation(shaderProgram, "Kd");
    shaderProgram.materialAmbient              = motor.miGl.getUniformLocation(shaderProgram, "Ka");
    shaderProgram.materialSpecular             = motor.miGl.getUniformLocation(shaderProgram, "Ks");
    shaderProgram.materialShininess            = motor.miGl.getUniformLocation(shaderProgram, "Shininess");
    shaderProgram.materialAlfa                 = motor.miGl.getUniformLocation(shaderProgram, "Alfa");

    shaderProgram.PmatrixShadow                = motor.miGl.getUniformLocation(shaderProgram, "Pmatrix");
    shaderProgram.PmatrixShadowLight           = motor.miGl.getUniformLocation(shaderProgram, "PmatrixLight");
    shaderProgram.LmatrixShadow                = motor.miGl.getUniformLocation(shaderProgram, "Lmatrix");
    shaderProgram.samplerShadowMap             = motor.miGl.getUniformLocation(shaderProgram, "samplerShadowMap");
    shaderProgram.sombrasActivas               = motor.miGl.getUniformLocation(shaderProgram, "sombrasActivas");



    return(shaderProgram);
}

function initShaders(motor)
{
    var perPhongProgram    = createProgram(motor, "per-vertex-phong-fs", "per-vertex-phong-vs");
    var perFragmentProgram = createProgram(motor, "per-fragment-lighting-fs", "per-fragment-lighting-vs");
    var shadowMap          = createProgram(motor, "shader_fragment_source_shadowMap", "shader_vertex_source_shadowMap");

    motor.programs.push(perFragmentProgram);
    motor.programs.push(perPhongProgram);
    motor.programs.push(shadowMap);

    motor.setCurrentProgram(1);

}

function getShader(motor, id)
{
    var shaderScript = document.getElementById(id);
    if(!shaderScript) {return null;}

    var str = "";
    var k = shaderScript.firstChild;
    while(k)
    {
        if(k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    var shader;
    if(shaderScript.type == "x-shader/x-fragment")
    {
        shader = motor.miGl.createShader(motor.miGl.FRAGMENT_SHADER);
    }
    else if(shaderScript.type == "x-shader/x-vertex")
    {
        shader = motor.miGl.createShader(motor.miGl.VERTEX_SHADER);
    }
    else
    {
        return null;
    }

    motor.miGl.shaderSource(shader, str);
    motor.miGl.compileShader(shader);

    if(!motor.miGl.getShaderParameter(shader, motor.miGl.COMPILE_STATUS))
    {

        alert(motor.miGl.getShaderInfoLog(shader));
        return null;
    }

    return shader;

}

/*** CLASE VIEWPORT */
/* SOLO SE UTILIZA COMO UN OBJETO PARA AGRUPAR LOS DATOS DE CADA UNO DE LOS VIEWPORTS, NO TIENE ACCIONES, SOLO ATRIBUTOS */

function viewPort (x, y, alto, ancho){
    this.x = x;
    this.y = y;
    this.alto = alto;
    this.ancho = ancho;
}

