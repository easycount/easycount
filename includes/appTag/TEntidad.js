/**
 * Created by Miguel on 12/02/2016.
 *
 * clase  Entidad
 */

/** CLASE TENTIDAD **/
function TEntidad(motor) {
    /* Atributos */
    if(TEntidad.miMotor == undefined)
        TEntidad.miMotor = motor;
    if(TEntidad.mvMatrix == undefined)
        TEntidad.mvMatrix = mat4.create();
    if(TEntidad.vMatrix == undefined)
        TEntidad.vMatrix = mat4.create();
    if(TEntidad.mvMatrixStack == undefined)
        TEntidad.mvMatrixStack = [];
    if(TEntidad.pMatrix == undefined)
        TEntidad.pMatrix =  mat4.create();

    TEntidad.setMatrixUniforms = function()
    {
        var modelViewMatrix = mat4.create();
        modelViewMatrix = mat4.multiply(modelViewMatrix, TEntidad.vMatrix, TEntidad.mvMatrix);

        TEntidad.miMotor.miGl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.pMatrixUniform, false, TEntidad.pMatrix);
        TEntidad.miMotor.miGl.uniformMatrix4fv(TEntidad.miMotor.currentProgram.mvMatrixUniform, false, modelViewMatrix);

        var normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, TEntidad.mvMatrix);
        mat3.invert(normalMatrix,normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);
        TEntidad.miMotor.miGl.uniformMatrix3fv(TEntidad.miMotor.currentProgram.nMatrixUniform, false, normalMatrix);
    }

}
    /* Métodos */
    TEntidad.prototype.beginDraw = function(){};
    TEntidad.prototype.endDraw = function(){};

/** FIN CLASE TENTIDAD **/
/** ****************************************************************************/


/** CLASE TTRANSFORM **/
function TTransform(motor)
{
    TEntidad.call(this, motor); //Con esto se llama al constructor del padre
    this.miMatriz =  mat4.create();

    mvPushMatrix = function()
    {
        var copy = mat4.create();
        mat4.copy(copy, TEntidad.mvMatrix);
        TEntidad.mvMatrixStack.push(copy);
    }

    mvPopMatrix = function()
    {
        if(TEntidad.mvMatrixStack.length == 0)
        {
            throw "PopMatrix invalido";
        }
        TEntidad.mvMatrix = TEntidad.mvMatrixStack.pop();
    }
}
TTransform.prototype = new TEntidad();
TTransform.prototype.constructor = TTransform;

TTransform.prototype.identidad = function()
{
    mat4.identity(this.miMatriz);
}

TTransform.prototype.cargar = function(nuevaMatriz)
{

    if(nuevaMatriz != null)
    {
        this.miMatriz = mat4.clone(nuevaMatriz);
    }
    console.log("Matriz cargada: " + this.miMatriz);
}

TTransform.prototype.transponer = function()
{
    mat4.transpose(this.miMatriz, this.miMatriz);
};

TTransform.prototype.matrizPorVector = function()
{

};

TTransform.prototype.matrizPorMatriz = function(matriz)
{
    mat4.multiply(this.miMatriz,this.miMatriz,matriz);
};

TTransform.prototype.invertir = function()
{
    mat4.invert(this.miMatriz, this.miMatriz);
};


TTransform.prototype.trasladar = function(vector)
{
    if(vector != null)
        mat4.translate(this.miMatriz, this.miMatriz, vector);
    else
        console.error("trasladar > vector pasado es nulo");
};

TTransform.prototype.rotar = function(rad, vector)
{
    mat4.rotate(this.miMatriz, this.miMatriz, rad, vector);
};

TTransform.prototype.escalar = function(vector)
{
    if(vector != null)
        mat4.scale(this.miMatriz, this.miMatriz, vector);
    else
        console.error("escalar > vector pasado es nulo");
};

TTransform.prototype.reflejar = function (x,y,z){
    //seleccionamos el eje sobre el que se quiere reflejar

    //relfejamos sobre el eje X
    if(x==1){
        this.miMatriz[1] = this.miMatriz[4]* -1;
        this.miMatriz[5] = this.miMatriz[5]* -1;
        this.miMatriz[9] = this.miMatriz[6]* -1;
        this.miMatriz[13] = this.miMatriz[7]* -1;
    }
    else if (y==1){
        this.miMatriz[1] = this.miMatriz[0]* -1;
        this.miMatriz[5] = this.miMatriz[1]* -1;
        this.miMatriz[9] = this.miMatriz[2]* -1;
        this.miMatriz[13] = this.miMatriz[3]* -1;

    }
    else if(z==1){
        this.miMatriz[1] = this.miMatriz[8]* -1;
        this.miMatriz[5] = this.miMatriz[9]* -1;
        this.miMatriz[9] = this.miMatriz[10]* -1;
        this.miMatriz[13] = this.miMatriz[11]* -1;
    }
};

TTransform.prototype.moverA = function(x,y,z){

}

TTransform.prototype.getmiMatriz = function()
{
    return this.miMatriz;
}

TTransform.prototype.setMiMatriz = function(mat)
{
    mat4.copy(this.miMatriz, mat);
}

TTransform.prototype.beginDraw = function()
{
    mvPushMatrix();
    TEntidad.mvMatrix = mat4.multiply(TEntidad.mvMatrix, this.miMatriz , TEntidad.mvMatrix);
};


TTransform.prototype.endDraw = function()
{
    mvPopMatrix();
};
/** FIN CLASE TTransform **/
/** ****************************************************************************/


/** CLASE TLUZ **/
function TLuz(r,g,b)
{
    TEntidad.call(this); //Con esto se llama al constructor del padre
    this.proyMatrix_Shadown = mat4.create();
    mat4.ortho(this.proyMatrix_Shadown, -20, 20, -16, 16, 0.1, 100);
    this.miTipo;
    this.miDireccion = new Array(3);
    this.miIntensidad = [];
    this.miColor = null;
    this.miPosicion = null;
    this.miAtenuacion = null;
    this.miForma = null;
    this.luzActiva = false;

    this.miIntensidad[0] = r;
    this.miIntensidad[1] = g;
    this.miIntensidad[2] = b;
}

TLuz.prototype = new TEntidad();
TLuz.prototype.constructor = TLuz;

TLuz.prototype.setIntensidad = function(r,g,b)
{
    this.miIntensidad[0] = r;
    this.miIntensidad[1] = g;
    this.miIntensidad[2] = b;
};

TLuz.prototype.getIntensidad = function()
{
    return this.miIntensidad;
};

TLuz.prototype.activarLuz = function()
{
    this.luzActiva = true;
};

TLuz.prototype.apagarLuz = function()
{
    this.luzActiva = false;
};

TLuz.prototype.getLuzEstado = function()
{
    return this.luzActiva;
};

TLuz.prototype.getproyMatrix_Shadown = function()
{
    return this.proyMatrix_Shadown;
};

TLuz.prototype.setproyMatrix_Shadown = function(left, right, bottom, top, near, far)
{
    mat4.ortho(this.proyMatrix_Shadown, left, right, bottom, top, near, far);
};

TLuz.prototype.beginDraw = function()
{
};

TLuz.prototype.endDraw = function()
{
};
/** FIN CLASE TLUZ **/
/** ****************************************************************************/



/** CLASE TCAMARA **/
function TCamara()
{
    TEntidad.call(this); //Con esto se llama al constructor del padre
    this.miMatriz = mat4.create();
    this.esPerspectiva ;

    this.cercano;
    this.lejano;
    this.izquierda;
    this.derecha;
    this.abajo;
    this.arriba;
    this.fovy;
    this.aspect;
    this.camaraActiva = true;

    if(this.esPerspectiva)
        this.setPerspectiva();
    else
        this.setParalela();
}

TCamara.prototype = new TEntidad();
TCamara.prototype.constructor = TCamara;

TCamara.prototype.setPerspectiva = function(fovy, aspect, cerca, lejos)
{
    this.esPerspectiva = true;
    this.fovy = fovy;
    this.aspect = aspect;
    this.cercano = cerca;
    this.lejano = lejos;

    mat4.perspective(this.miMatriz, this.fovy, this.aspect, this.cercano, this.lejano);
};

TCamara.prototype.setParalela = function(izquierda, derecha, abajo, arriba, cerca, lejos)
{
    this.esPerspectiva = false;

    this.cercano = cerca;
    this.lejano = lejos;
    this.izquierda = izquierda;
    this.derecha = derecha;
    this.abajo = abajo;
    this.arriba = arriba;

    mat4.ortho(this.miMatriz, this.izquierda, this.derecha, this.abajo, this.arriba, this.cercano, this.lejano );
};

TCamara.prototype.activarCamara = function()
{
    this.camaraActiva = true;
};

TCamara.prototype.apagarCamara = function()
{
    this.camaraActiva = false;
};

TCamara.prototype.getmiMatriz = function()
{
    return this.miMatriz;
}

TCamara.prototype.beginDraw = function()
{
};

TCamara.prototype.endDraw = function()
{
};
/** FIN CLASE TCAMARA **/
/** ****************************************************************************/


/** CLASE TMALLA **/
function TMalla(fichero, contexto) //Igual se puede cambiar el contexto por variable estatica de TEntidad
{
    TEntidad.call(this);
    this.miRecurso  = null;
    this.miTextura  = null;
    this.miMaterial = null;

    if(fichero != undefined && contexto != undefined)
        this.cargarMalla(fichero, contexto);
}
TMalla.prototype = new TEntidad();
TMalla.prototype.constructor = TMalla;

TMalla.prototype.cargarMalla = function(fichero, contexto)
{
    if(this.miRecurso == null)
        this.miRecurso = new TRecursoMalla();

    this.miRecurso.cargarFichero(fichero, contexto);


    return this.miRecurso;
};

TMalla.prototype.setRecurso = function(rec)
{
    if(rec != null)
    {
        if(rec instanceof TRecursoMalla)
            this.miRecurso = rec;
        if(rec instanceof TRecursoTextura)
            this.miTextura = rec;
        if(rec instanceof TRecursoMaterial)
            this.miMaterial = rec;
    }

};



TMalla.prototype.beginDraw = function()
{
    this.miRecurso.draw(this.miTextura, this.miMaterial);
};

TMalla.prototype.endDraw = function()
{
};

TMalla.prototype.drawShadownMap = function(light, viewMatrixLight)
{
    this.miRecurso.drawShadownMap(light, viewMatrixLight);
};

/** FIN CLASE TMALLA **/
/** ****************************************************************************/

/** CLASE TANIMACION **/
function TAnimacion(fichero, contexto)
{
    TMalla.call(this);
    this.miRecurso  = [];
    this.miPosicion = 0;
    this.animacionRollback = false;
    this.ultimoFrame = 0;
    this.velocidadAnimacion = 60;

}
TAnimacion.prototype = new TMalla();
TAnimacion.prototype.constructor = TAnimacion;

TAnimacion.prototype.cargarAnimacion = function(contexto)
{
    for(var cont = 0; cont < arguments[1].length; cont++)
    {
        var malla = null;

        if(malla == null)
            malla = new TRecursoMalla();

        malla.cargarFichero(arguments[1][cont], contexto);

        this.miRecurso.push(malla);
    }

    return this.miRecurso;
};

TAnimacion.prototype.setAnimacionRollback = function(rollback)
{
    this.animacionRollback = rollback;
};

TAnimacion.prototype.setVelocidadAnimacion = function(velocidad)
{
    this.velocidadAnimacion = velocidad;
};

TAnimacion.prototype.getAnimacionRollback = function()
{
    return this.animacionRollback;
};

TAnimacion.prototype.getVelocidadAnimacion = function()
{
    return this.velocidadAnimacion;
};

TAnimacion.prototype.beginDraw = function()
{
    if(this.miPosicion == this.miRecurso.length)
    {
        this.miPosicion = 0;
        if(this.animacionRollback)
            this.miRecurso.reverse();
    }

    this.miRecurso[this.miPosicion].draw(this.miTextura, this.miMaterial);

    var d = new Date();
    var n = d.getTime();
    if(n - this.ultimoFrame > this.velocidadAnimacion )
    {
        this.miPosicion++;

        this.ultimoFrame = n;
    }
};

TAnimacion.prototype.endDraw = function()
{
};

TAnimacion.prototype.drawShadownMap = function(light, viewMatrixLight)
{
    if(this.miPosicion == this.miRecurso.length)
    {
        this.miPosicion = 0;
        if(this.animacionRollback)
            this.miRecurso.reverse();
    }

    this.miRecurso[this.miPosicion].drawShadownMap(light, viewMatrixLight);

    var d = new Date();
    var n = d.getTime();
    if(n - this.ultimoFrame > this.velocidadAnimacion )
    {
        this.miPosicion++;

        this.ultimoFrame = n;
    }
};

/** FIN CLASE TANIMACION **/
/** ****************************************************************************/