/**
 * Created by Miguel on 11/02/2016.
 *
 * Clase TNodo para el arbol de escena
 */


/** CLASE TNODO **/
function TNodo() {
    /* Atributos */
    /** si los declaras con VAR haces atributos privados, si los declaras con THIS publicos **/
    this.miEntidad = null;
    this.misHijos = new Array;
    this.miPadre = this;
    if(TNodo.registroLuces == undefined)
        TNodo.registroLuces = [];
    if(TNodo.registroCamaras == undefined)
        TNodo.registroCamaras = [];

    // atributos para imprimir el arbol por pantalla
    this.miNombre ="";
    TNodo.nivel = 0;
}

/* Métodos */ /** si queremos un método privado se declara sin THIS */
TNodo.prototype.addHijo = function(nuevoNodo)
{
    var recorrido = true;
    do
    {
        if(nuevoNodo === nuevoNodo.getPadre())
            recorrido = false;
        else
            nuevoNodo = nuevoNodo.getPadre();
    }while(recorrido)


    this.misHijos.push(nuevoNodo);
    nuevoNodo.setPadre(this);

    return this.misHijos.length;
};

TNodo.prototype.remHijo = function(nodo)
{
    var aux = this.misHijos.indexOf(nodo);
    if(aux != -1)
        this.misHijos.splice(aux, 1);

    return this.misHijos.length;
};

TNodo.prototype.setEntidad = function(nuevaEntidad)
{
    if(nuevaEntidad != null)
    {
        this.miEntidad = nuevaEntidad;

        if(this.miEntidad instanceof TCamara)
        {
            TNodo.registroCamaras.push(this);
        }
        else if(this.miEntidad instanceof TLuz)
        {
            TNodo.registroLuces.push(this);
        }

        return true;
    }
    else
    {
        return false;
    }
};

TNodo.prototype.getEntidad = function()
{
    return this.miEntidad;
};

TNodo.prototype.getPadre = function()
{
    return this.miPadre;
};

TNodo.prototype.setPadre = function(padre)
{
    this.miPadre = padre;
};

TNodo.prototype.draw = function()
{
    //console.log("draw");

    if(this.miEntidad!=null)
    {
        this.miEntidad.beginDraw();
        TNodo.nivel++;
    }

    for(var i=0; i<this.misHijos.length; i++)
    {
        this.misHijos[i].draw(); //Hay que comprobar que el hijo no sea camara o luz
    }

    if(this.miEntidad!=null)
    {
        this.miEntidad.endDraw();
        TNodo.nivel--;
    }
};

TNodo.prototype.drawShadownMap = function(light, viewMatrixLight)
{


    if(this.miEntidad!=null)
    { //
        if(this.miEntidad instanceof TMalla)
        {
            this.miEntidad.drawShadownMap(light, viewMatrixLight);
            TNodo.nivel++;
        }
        else
        {
            this.miEntidad.beginDraw();
            TNodo.nivel++;
        }

        TNodo.nivel++;
    }

    for(var i=0; i<this.misHijos.length; i++)
    {
        this.misHijos[i].drawShadownMap(light, viewMatrixLight); //Hay que comprobar que el hijo no sea camara o luz
    }

    if(this.miEntidad!=null)
    {
        this.miEntidad.endDraw();
        TNodo.nivel--;
    }
};

TNodo.prototype.setNombre = function(nombre)
{
    this.miNombre = nombre;
}

TNodo.prototype.getNombre = function()
{
    return this.miNombre;
}
/** FIN CLASE TNODO **/
/** ****************************************************************************/