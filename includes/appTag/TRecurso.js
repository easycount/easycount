/**
 * Created by Miguel on 18/02/2016.
 */


/**CLASE TGESTORRECURSOS **/
function TGestorRecursos()
{
    this.misRecursos = [];
}

TGestorRecursos.prototype.getRecurso = function(nombre)
{
    var rec = null;
    var existeRecurso = false;
    for(var i=0; i<this.misRecursos.length; i++)
    {
        if(this.misRecursos[i].getNombre() == nombre)
        {
            existeRecurso = true;
            rec = this.misRecursos[i];
        }
    }

    /*
    if(existeRecurso == false)
    {
        rec = new TRecurso();
        rec.cargarFichero(nombre);
        this.misRecursos.push(rec);
    }
    */

    return rec
};

/**
 * SET RECURSO
 * @param rec
 */
TGestorRecursos.prototype.setRecurso = function( rec ) {
    if(rec != null)
        this.misRecursos.push(rec);
};



/** FIN CLASE TGESTORRECURSOS **/
/** ****************************************************************************/


/**CLASE TRECURSO **/
function TRecurso()
{
    this.miNombre = "";
}

TRecurso.prototype.getNombre = function()
{
    return this.miNombre;
};

TRecurso.prototype.setNombre = function(nombre)
{
    if(nombre != undefined && nombre != null)
        this.miNombre = nombre;
};

TRecurso.prototype.cargarFichero = function(nombre)
{

};
/** FIN CLASE TRECURSO **/
/** ****************************************************************************/



/**CLASE TRECURSOMALLA **/
function TRecursoMalla()
{
    TRecurso.call(this);

    /* No hace falta declararlas en el constructor
    this.objetoVertexNormalBuffer;
    this.objetoVertexTextureCoordBuffer;
    this.objetoVertexPositionBuffer;
    this.objetoVertexIndexBuffer;
    */


    this.vertTriangulos = null;
    this.nomTriangulos = null;
    this.textTriangulos = null;

    this.nTriangulos = null;

}
TRecursoMalla.prototype = new TRecurso();
TRecursoMalla.prototype.constructor = TRecursoMalla;

/** – Lee el fichero con el recurso y rellena los buffers de datos
 (vértices, triángulos, texturas…)
 – Para la lectura del fichero podemos implementar un parser
 propio o utilizar librerías de terceros */
TRecursoMalla.prototype.cargarFichero = function(fichero, contexto)
{
    var yo = this;
    var onSuccess = function(data)
    {
        console.log("Objeto cargado ");
        yo.initBuffers(contexto, data);
    }


    var onError = function(reason)
    {
        console.error("Error al cargar el fichero: "+reason);
    }

    abrirArchivo(fichero, onSuccess, onError); //usamos métodos callback para manejar la asincroneidad
}

/** Vuelca los buffers de datos en OpenGL */
TRecursoMalla.prototype.draw = function(recursoTextura, recursoMaterial)
{
    TEntidad.miMotor.setCurrentProgram(1);

    if(this.objetoVertexPositionBuffer == null || this.objetoVertexIndexBuffer == null)
    {
        return null;
    }
    //TEntidad.miMotor.miGl.bindFramebuffer(TEntidad.miMotor.miGl.FRAMEBUFFER, null);

    TEntidad.miMotor.miGl.enableVertexAttribArray(TEntidad.miMotor.currentProgram.vertexPositionAttribute); //decirle a webGL que queremos proporcionarle valores al atributo usando una lista.
    TEntidad.miMotor.miGl.enableVertexAttribArray(TEntidad.miMotor.currentProgram.vertexNormalAttribute);
    TEntidad.miMotor.miGl.enableVertexAttribArray(TEntidad.miMotor.currentProgram.textureCoordAttribute);

    if(recursoMaterial != null && recursoMaterial.getAlfa() < 1)
    {
        TEntidad.miMotor.miGl.blendFunc(TEntidad.miMotor.miGl.SRC_COLOR, TEntidad.miMotor.miGl.ONE);
        TEntidad.miMotor.miGl.enable(TEntidad.miMotor.miGl.BLEND);
        TEntidad.miMotor.miGl.depthMask(false);
    }
    else
    {
        TEntidad.miMotor.miGl.disable(TEntidad.miMotor.miGl.BLEND);
        TEntidad.miMotor.miGl.depthMask(true);
    }

    /*** DIBUJAMOS OBJETO ***/
    TEntidad.setMatrixUniforms(); //Indica a WebGL que almacene en la tarjeta grafica nuestra matriz modelo-vista actual

    TEntidad.miMotor.miGl.bindBuffer(TEntidad.miMotor.miGl.ARRAY_BUFFER, this.objetoVertexPositionBuffer); //Indicamos a WebGL el buffer actual
    TEntidad.miMotor.miGl.vertexAttribPointer(TEntidad.miMotor.currentProgram.vertexPositionAttribute, this.objetoVertexPositionBuffer.itemSize, TEntidad.miMotor.miGl.FLOAT, false, 0, 0); //Indicamos a WebGL los valores a utilizar para las posiciones de los vertices

    TEntidad.miMotor.miGl.bindBuffer(TEntidad.miMotor.miGl.ARRAY_BUFFER, this.objetoVertexNormalBuffer);
    TEntidad.miMotor.miGl.vertexAttribPointer(TEntidad.miMotor.currentProgram.vertexNormalAttribute, this.objetoVertexNormalBuffer.itemSize, TEntidad.miMotor.miGl.FLOAT, false, 0, 0);

    TEntidad.miMotor.miGl.bindBuffer(TEntidad.miMotor.miGl.ARRAY_BUFFER, this.objetoVertexTextureCoordBuffer);
    TEntidad.miMotor.miGl.vertexAttribPointer(TEntidad.miMotor.currentProgram.textureCoordAttribute, this.objetoVertexTextureCoordBuffer.itemSize, TEntidad.miMotor.miGl.FLOAT, false, 0, 0);

    if(TEntidad.miMotor.sombrasActivas)
    {
        var modelViewMatrixLight = mat4.create();
        modelViewMatrixLight = mat4.multiply(modelViewMatrixLight, TEntidad.miMotor.viewMatrixLight, TEntidad.mvMatrix);

        TEntidad.miMotor.miGl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.PmatrixShadowLight, false, lightMAX.miEntidad.getproyMatrix_Shadown());
        TEntidad.miMotor.miGl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.LmatrixShadow, false, modelViewMatrixLight);

        TEntidad.miMotor.miGl.activeTexture(TEntidad.miMotor.miGl.TEXTURE1);
        TEntidad.miMotor.miGl.bindTexture(TEntidad.miMotor.miGl.TEXTURE_2D, TEntidad.miMotor.frameTexture);
        TEntidad.miMotor.miGl.uniform1i(TEntidad.miMotor.currentProgram.samplerShadowMap, 1);
    }


    if(recursoTextura != null)
    {
        TEntidad.miMotor.miGl.uniform1i(TEntidad.miMotor.currentProgram.useTexturesUniform, true);
        TEntidad.miMotor.miGl.activeTexture(TEntidad.miMotor.miGl.TEXTURE0);
        TEntidad.miMotor.miGl.bindTexture(TEntidad.miMotor.miGl.TEXTURE_2D, recursoTextura.textura);
        TEntidad.miMotor.miGl.uniform1i(TEntidad.miMotor.currentProgram.samplerUniform, 0);
    }
    else
    {
        TEntidad.miMotor.miGl.uniform1i(TEntidad.miMotor.currentProgram.useTexturesUniform, false);
        //TEntidad.miMotor.miGl.bindTexture(TEntidad.miMotor.miGl.TEXTURE_2D, null);
    }

    if(recursoMaterial != null)
    {
        TEntidad.miMotor.miGl.uniform3fv(TEntidad.miMotor.currentProgram.materialDifuse, recursoMaterial.getDifuso());
        TEntidad.miMotor.miGl.uniform3fv(TEntidad.miMotor.currentProgram.materialAmbient, recursoMaterial.getAmbiental());
        TEntidad.miMotor.miGl.uniform3fv(TEntidad.miMotor.currentProgram.materialSpecular, recursoMaterial.getEspecular());
        TEntidad.miMotor.miGl.uniform1f(TEntidad.miMotor.currentProgram.materialShininess, recursoMaterial.getBrillo());
        TEntidad.miMotor.miGl.uniform1f(TEntidad.miMotor.currentProgram.materialAlfa, recursoMaterial.getAlfa());
    }
    else
    {
        TEntidad.miMotor.miGl.uniform3fv(TEntidad.miMotor.currentProgram.materialDifuse, [0.5,0.5,0.5]);
        TEntidad.miMotor.miGl.uniform3fv(TEntidad.miMotor.currentProgram.materialAmbient, [0.0,0.0,0.0]);
        TEntidad.miMotor.miGl.uniform3fv(TEntidad.miMotor.currentProgram.materialSpecular, [0.0,0.0,0.0]);
        TEntidad.miMotor.miGl.uniform1f(TEntidad.miMotor.currentProgram.materialShininess, 0.1);
        TEntidad.miMotor.miGl.uniform1f(TEntidad.miMotor.currentProgram.materialAlfa, 1.0);
    }

    TEntidad.miMotor.miGl.bindBuffer(TEntidad.miMotor.miGl.ELEMENT_ARRAY_BUFFER, this.objetoVertexIndexBuffer);

    TEntidad.miMotor.miGl.drawElements(TEntidad.miMotor.miGl.TRIANGLES, this.objetoVertexIndexBuffer.numItems, TEntidad.miMotor.miGl.UNSIGNED_INT, 0); // dibuja los vértices que te dí antes como triángulos, empezando con el elemento 0 del array y siguiendo con los siguientes numItems elementos


    TEntidad.miMotor.miGl.disableVertexAttribArray(TEntidad.miMotor.currentProgram.vertexPositionAttribute);
    TEntidad.miMotor.miGl.disableVertexAttribArray(TEntidad.miMotor.currentProgram.vertexNormalAttribute);
    TEntidad.miMotor.miGl.disableVertexAttribArray(TEntidad.miMotor.currentProgram.textureCoordAttribute);
    TEntidad.miMotor.miGl.flush();

    //console.log("Termina draw de TRecurso Malla");
}

TRecursoMalla.prototype.initBuffers = function(gl, objetoData)
{

    if(objetoData.vertexNormals != null)
    {
        this.objetoVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.objetoVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objetoData.vertexNormals), gl.STATIC_DRAW);
        this.objetoVertexNormalBuffer.itemSize = 3;
        this.objetoVertexNormalBuffer.numItems = objetoData.vertexNormals.length / 3;
    }

    if(objetoData.vertexTextureCoords != null)
    {
        this.objetoVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.objetoVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objetoData.vertexTextureCoords), gl.STATIC_DRAW);
        this.objetoVertexTextureCoordBuffer.itemSize = 2;
        this.objetoVertexTextureCoordBuffer.numItems = objetoData.vertexTextureCoords.length / 2;
    }

    this.objetoVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.objetoVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objetoData.vertexPositions), gl.STATIC_DRAW);
    this.objetoVertexPositionBuffer.itemSize = 3;
    this.objetoVertexPositionBuffer.numItems = objetoData.vertexPositions.length / 3;

    this.objetoVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.objetoVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(objetoData.indices), gl.STATIC_DRAW);
    this.objetoVertexIndexBuffer.itemSize = 1;
    this.objetoVertexIndexBuffer.numItems = objetoData.indices.length;

    //document.getElementById("loadingtext").style.display = 'none';
};

TRecursoMalla.prototype.drawShadownMap = function(light, viewMatrixLight)
{

    if(this.objetoVertexPositionBuffer == null || this.objetoVertexIndexBuffer == null)
    {
        return null;
    }
    var gl = TEntidad.miMotor.miGl;

    //gl.bindFramebuffer(gl.FRAMEBUFFER, TEntidad.miMotor.frameBuffers);

    TEntidad.miMotor.setCurrentProgram(2);

    gl.disable(TEntidad.miMotor.miGl.BLEND);
    gl.depthMask(true);

    gl.enableVertexAttribArray(TEntidad.miMotor.currentProgram.positionShadow);

    //gl.clearColor(1.0, 0.0, 0.0, 0.5); //red -> Z=Zfar on the shadow map

    //DRAW THE OBJECT
    gl.bindBuffer(gl.ARRAY_BUFFER, this.objetoVertexPositionBuffer);
    gl.vertexAttribPointer(TEntidad.miMotor.currentProgram.positionShadow, this.objetoVertexPositionBuffer.itemSize, gl.FLOAT, false,0 ,0) ;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.objetoVertexIndexBuffer);

    var modelViewMatrixLight = mat4.create();
    modelViewMatrixLight = mat4.multiply(modelViewMatrixLight, viewMatrixLight, TEntidad.mvMatrix);

    gl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.PmatrixShadow, false, light.miEntidad.getproyMatrix_Shadown());//proyeccion de la luz
    gl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.LmatrixShadow, false, modelViewMatrixLight); //dirección de la luz

    gl.drawElements(gl.TRIANGLES, this.objetoVertexIndexBuffer.numItems, gl.UNSIGNED_INT, 0);

    gl.disableVertexAttribArray(TEntidad.miMotor.currentProgram.positionShadow);

    //Sombras
    /*
    mat4.identity(TEntidad.mvMatrix);
    var matrAux = mat4.create();
    mat4.translate(matrAux, matrAux, [-10.0, 0.0, -20.0]);
    TEntidad.mvMatrix = mat4.multiply(TEntidad.mvMatrix, matrAux, TEntidad.mvMatrix);

    modelViewMatrixLight = mat4.multiply(modelViewMatrixLight, viewMatrixLight, TEntidad.mvMatrix);
    TEntidad.miMotor.setCurrentProgram(1);
    gl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.PmatrixShadow2, false, light.miEntidad.getproyMatrix_Shadown());
    gl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.LmatrixShadow, false, modelViewMatrixLight); //Cambiar por matriz de dirección
    */
    //Fin sombras
    gl.flush();
};
/** FIN CLASE TRECURSOMALLA **/
/** ****************************************************************************/



/**CLASE TRECURSOTEXTURA **/
function TRecursoTextura()
{
    TRecurso.call(this);

    this.textura = null;

}
TRecursoTextura.prototype = new TRecurso();
TRecursoTextura.prototype.constructor = TRecursoTextura;

TRecursoTextura.prototype.cargarTextura = function(fichero, gl)
{
    this.textura = gl.createTexture();
    this.textura.image = new Image();

    var yo = this;
    var manejadorTextura = function()
    {
        console.log("textura cargada");
        gl.bindTexture(gl.TEXTURE_2D, yo.textura);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, yo.textura.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    this.textura.image.onload = function()
    {
        manejadorTextura();
    };
    this.textura.image.onerror = function()
    {
        console.error("ERROR: No se pudo cargar la textura");
    };

    this.textura.image.src = fichero;
};

TRecursoTextura.prototype.getTextura = function()
{
    return this.textura;
};

TRecursoTextura.prototype.getNombre = function()
{
    return this.nombre;
};

TRecursoTextura.prototype.setNombre = function(nombre)
{
    this.nombre = nombre;
};
/** FIN CLASE TRECURSOTEXTURA **/
/** ****************************************************************************/



/** CLASE TRECURSOMATERIAL **/
function TRecursoMaterial()
{
    TRecurso.call(this);

    this.difuso    = [0,0,0];
    this.ambiental = [0,0,0];
    this.especular = [0,0,0];
    this.brillo    = 0.1;
    this.alfa      = 1.0;
    this.activo    = true;
}
TRecursoMaterial.prototype = new TRecurso();
TRecursoMaterial.prototype.constructor = TRecursoMaterial;

TRecursoMaterial.prototype.setDifuso = function(vector)
{
    this.difuso = vector;
};

TRecursoMaterial.prototype.setAmbiental = function(vector)
{
    this.ambiental = vector;
};

TRecursoMaterial.prototype.setEspecular = function(vector)
{
    this.especular = vector;
};

TRecursoMaterial.prototype.setBrillo = function(valor)
{
    this.brillo = valor;
};

TRecursoMaterial.prototype.setAlfa = function(valor)
{
    this.alfa = valor;
};

TRecursoMaterial.prototype.setActivo = function(bol)
{
    this.activo = bol;
};

TRecursoMaterial.prototype.getDifuso = function()
{
    return this.difuso;
};

TRecursoMaterial.prototype.getAmbiental = function()
{
    return this.ambiental;
};

TRecursoMaterial.prototype.getEspecular = function()
{
    return this.especular;
};

TRecursoMaterial.prototype.getBrillo = function()
{
    return this.brillo;
};

TRecursoMaterial.prototype.getAlfa = function()
{
    return this.alfa;
};

TRecursoMaterial.prototype.getActivo = function()
{
    return this.activo;
};
/** FIN CLASE TRECURSOMATERIAL **/
/** ****************************************************************************/