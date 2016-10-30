'use strict';
/**
 * Created by Xisco on 05/02/2016.
 */
var arrayTiposCliente = [];
var arrayTypes = ['-----','Infusiones y solubles','Animales', 'Agua', 'Limpieza', 'Dietéticos', 'Botiquín', 'Azucar y edulcorantes', 'Postres', 'Fruta', 'Untables', 'Aceites', 'Sal, especias y sazonadores', 'Caldos y purés', 'Precocinados', 'Cosméticos', 'Lácteos y huevos', 'Higiene', 'Bebidas alcohólicas', 'Aperitivos', 'Refrescos', 'Panadería', 'Dulces', 'Pescados', 'Carnes', 'Bebés', 'Electrónica', 'Papelería', 'Multimedia', 'Deportes', 'Ropa y calzado', 'Muebles', 'Legumbres', 'Pastas', 'Vegetales', 'Salsas', 'Congelados', 'Conservas'];
arrayTypes = arrayTypes.sort();
var types = [];
var fichero;
var mapeo = [];
var etiquetas = [ ["-----","Marca esto si no coincide con ningun campo"],["Identificador", "Identificador del producto"], ["Nombre", "Nombre del prodcuto"], ["Codigo de barras", "Codigo de barras del producto"], ["Tipo", "Tipo de producto"], ["Descripcion", "Breve descripcion del producto"], ["Imagen", "Enlaces a imagenes del producto"], ["Precio", "Precio del producto"]] ;
var etiquetas2 = [ ["-----","Marca esto si no coincide con ningun campo"],["Identificador", "Identificador del producto"], ["Nombre", "Nombre del prodcuto"], ["Codigo de barras", "Codigo de barras del producto"], ["Tipo", "Tipo de producto"], ["Descripcion", "Breve descripcion del producto"], ["Imagen", "Enlaces a imagenes del producto"], ["Precio", "Precio del producto"]] ;
var oldTagId = [];
var previo = '';
var wrapper;


function changeSelects(sel)
{
    var deleted = sel.value;

    var lg = etiquetas.length;

    var idx;

    for(var i = 0; i < lg; i++)
    {
        if(etiquetas[i][0] == deleted)
            idx = i;
    }


    //var idx = etiquetas.indexOf(deleted); // Localizamos el indice del elemento en array
    if(idx!=-1 && idx != 0) etiquetas.splice(idx, 1); // Lo borramos definitivamente

    sel.blur();
    //if(idx != -1 && idx != 0)
    if(idx != -1 && deleted != 'Imagen')
        cargarSelectores(deleted, sel);
}

function cargarSelectores(deleted, sel)
{


    if(deleted != '-----')
    {

        var selectores = $(".selectores");

        var lg = selectores.length;

        for(var i = 0; i < lg; i++)
        {
            if(selectores[i] == sel)
            {
            }
            else
            {
                //console.log(selectores[i].length);
                var lg2 = selectores[i].length;

                for(var j = 0; j < lg2 ; j++)
                {
                    //console.log(selectores[i][j]);

                    if(selectores[i][j].value == deleted)
                    {
                        selectores[i].remove(j);
                        break;
                    }
                }
            }
        }
    }
    if(previo != deleted && previo != '' && previo != '-----' && previo != 'Imagen')
    {
        //console.log("llega");
        //console.log(previo);
        var selectores = $(".selectores");

        var lg = selectores.length;

        for(var i = 0; i < lg; i++)
        {
            if(selectores[i] == sel)
            {

            }
            else
            {

                //console.log(selectores[i]);
                var option = document.createElement("option");
                option.text = previo;
                option.value = previo;
                selectores[i].add(option);

                var array = selectores[i].options;
                var array2 = [];
                var lg2 = array.length;
                for(var j = 1; j < lg2; j++)
                {
                    array2.push(array[j].value);
                }
                array2.sort();

                var seleccionada = selectores[i].value;
                var lg3 = array2.length;

                var html2 = "<option value='-----'>-----</option>";

                for(var k = 0; k < lg3; k++)
                {
                    var desc;

                    for(var z = 0; z < etiquetas2.length; z++)
                    {

                        if(etiquetas2[z][0] == array2[k])
                        {
                            desc = etiquetas2[z][1];
                        }
                    }

                    html2 += "<option title='"+desc+"' value='" + array2[k] + "' >" + array2[k] + "</option>";
                }

                selectores[i].innerHTML = html2;

                var lg3 = selectores[i].length;
                for(var k = 0; k < lg3; k++)
                {
                    if(selectores[i][k].value == seleccionada)
                    {
                        selectores[i][k].selected = true;
                    }
                }
                etiquetas.push(previo);
            }
        }
    }
}

function obtenerPrevio(selector)
{
    previo = selector.value;
    //console.log(previo);

}



angular.module('sbAdminApp')

        .directive('fileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function(){
                        scope.$apply(function(){
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }])

        .factory('Productos', ['$resource', function($resource) {
            return $resource('./../api/productos/:id', {id: '@_id' }, {
                'update': {method: 'PUT'},
                'query': {method: 'GET', isArray: false}
            });
        }])

        .service('fileUpload', ['$http', function ($http) {
            this.uploadFileToUrl = function(file, uploadUrl){
                var fd = new FormData();
                fd.append('file', file);

                $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })

                    .success(function(){
                    })

                    .error(function(){
                    });
            }
}])


    .controller('importacionCtrl', ['$scope', '$http', 'fileUpload', 'Productos', function ($scope,$http, fileUpload, Productos) {
        var vm = $scope;

        var parseXml;

        var empresa;
        if(document.getElementById("hiddenName")!=null) {

            var idUsuario = document.getElementById("hiddenId").value;
            var responseEmpresa = $http.post('./../api/empresas/empresaDeUsuario', {usuario: idUsuario});
            responseEmpresa.success(function(data){
                empresa = data[0]._id;

            });
        }

        function cargarTodo()
        {
            var selectores = $(".selectores");

            etiquetas.sort();

            var lg = selectores.length;

            for(var i = 0; i < lg; i++)
            {
                var html = '';

                var lg2 = etiquetas.length;

                for(var j = 0; j < lg2; j++)
                {
                    //html += "<option onmouseover='Clientes.show(this)' title='" + etiquetas[j][1] + "' value='" + etiquetas[j][0] + "' >" + etiquetas[j][0] + "</option>";
                    html += "<option title='" + etiquetas[j][1] + "' value='" + etiquetas[j][0] + "' >" + etiquetas[j][0] + "</option>";
                }

                selectores[i].innerHTML = html;
            }

        }


        function elementChildren (element) {
            var childNodes = element.childNodes,
                children = [],
                i = childNodes.length;

            while (i--) {
                if (childNodes[i].nodeType == 1) {
                    children.unshift(childNodes[i]);
                }
            }

            return children;
        }

        parseXml = function(xmlStr)
        {
            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        }

        vm.mapear = function()
        {
            var selectores = $(".selectores");
            var lg = selectores.length;

            for(var i = 0; i < lg; i++) {
                if (selectores[i].value != '-----') {

                    var campo = selectores[i].value;
                    var etiqueta = $(selectores[i]).attr('tagid');

                    console.log("Mapeo: etiqueta " + campo + " --> campo " + etiqueta);
                }
            }
        }

        vm.insertarElemento = function(codigo, nombre, tipo, descripcion, imagen, precio, identificador){


            var responseInsertarElemento = $http.post('./../api/productos/buscar', {'barcode': codigo });
            /*//var responseInsertarElemento = $http.post('./../api/productos/buscar', {'barcode': codigo });
            $http.post('./../api/productos/buscar', {'barcode': codigo }).then(function successCallback(response){
                console.log(response);
            }, function errorCallback(response){
                console.log('Error: ' + response)
            });

            return;*/
            responseInsertarElemento.success(function(data)
            {

                //producto no encontrado
                if(data.length == 0)
                {
                    var response2 = $http.post('./../api/productos', {'barcode': codigo, 'name' : nombre, 'type' : tipo, 'description' : descripcion, 'photo': imagen  });

                    response2.success(function(data2)
                    {
                        var response3 = $http.post('./../api/empresas/modificarPrecio', {'id_empresa': empresa, 'id_producto' : data2._id, 'precio' : precio });
                        response3.success(function(data3)
                        {

                        },function(reason){
                            console.log("Error en actualizarPrecio por: "+reason);
                        });


                    },function(reason){
                        console.log("Error en insertarProducto por: "+reason);
                    });
                }
                //producto encontrado
                else
                {
                    if(data[0].name == '')
                        Productos.update({id: data[0]._id}, {
                            name : nombre
                        }, function (err){
                            console.log(err);
                        });

                    if(data[0].description == '')
                        Productos.update({id: data[0]._id}, {
                            description : descripcion
                        }, function (err){
                            console.log(err);
                        });

                    if(data[0].type == '')
                        Productos.update({id: data[0]._id}, {
                            type : tipo
                        }, function (err){
                            console.log(err);
                        });


                    if(data[0].photo == '')
                        Productos.update({id: data[0]._id}, {
                            photo : imagen
                        }, function (err){
                            console.log(err);
                        });

                    var response3 = $http.post('./../api/empresas/modificarPrecio', {'id_empresa': empresa , 'id_producto' : data[0]._id, 'precio' : precio });
                    response3.success(function(data3)
                    {
                    },function(reason){
                        console.log("Error en actualizarPrecio por: "+reason);
                    });

                }
            },function(reason){
                console.log("Error en buscarProducto por: "+reason);
            });

        }

        vm.uploadFile = function(){

            var contenedor = document.getElementById("contenedor").value;
            wrapper = contenedor;

            if(contenedor == '')
            {
                swal("Rellena el campo de etiqueta contenedor!");
                return;
            }


            var file = $scope.myFile;

            //console.log('file is ' );
            //console.dir(file);

            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;

                var xml = parseXml(contents);

                var items = xml.getElementsByTagName(contenedor);

                fichero = items;

                var i = items.length;

                var tabla = '<div class="portlet-body"><table class="table table-striped table-bordered table-hover" id="tags"><thead><tr><th>Etiqueta</th><th>Campo</th></tr></thead><tbody>';
                var contenido = '';

                for(var x = 0; x < i; x++)
                {
                    var producto = items[x];

                    var elements = elementChildren(producto);

                    var j = elements.length;

                    for(var y = 0; y < j; y++)
                    {
                        if(elementChildren(elements[y]) != '')
                        {
                            var elements2 = elementChildren(elements[y]);
                            var k = elements2.length;
                            contenido += '<tr><td>&lt;' + elements[y].tagName + '&gt;</td><td>-----</td></tr>';
                            for(var z = 0; z < k; z++)
                            {
                                contenido += '<tr><td><p style="margin-left:30px">&lt;' + elements2[z].tagName + '&gt;'  + ' Ej. (' +  elements2[z].childNodes[0].nodeValue + ')</p></td><td><select onfocus="obtenerPrevio(this)" onchange="changeSelects(this)" class="selectores form-control input-medium left" tagid="' + elements[y].tagName + '&' + elements2[z].tagName + '"></select></td></tr>';
                            }
                        }
                        else
                            contenido += '<tr><td>&lt;' + elements[y].tagName + '&gt;'  + ' Ej. (' +  elements[y].childNodes[0].nodeValue + ')</td><td><select onfocus="obtenerPrevio(this)" onchange="changeSelects(this)" class="selectores form-control input-medium left" tagid="' + elements[y].tagName + '"></select></td></tr>';


                    }

                    //tabla += contenido + '</tbody></table><input type="button" onclick="mapear2()" value="Mapear campos"/> </div>';
                    tabla += contenido + '</tbody></table><input type="button" id="botonMapear" value="Mapear campos"/> </div>';

                    document.getElementById('selectores').innerHTML = tabla;


                    cargarTodo();

                    break;
                }
                //console.log(contents);
            }
            r.readAsText(file);


        };

        $(document).on( "click","#botonMapear",  function(e){

            var selectores = $(".selectores");
            var lg = selectores.length;

            /*
             $.each( $(".selectores"), function(i, v){
             console.log( v );
             console.log( $(v) );
             });
             */

            for(var i = 0; i < lg; i++) {
                if (selectores[i].value != '-----') {

                    var campo = selectores[i].value;
                    var etiqueta = $(selectores[i]).attr('tagid');

                    var ClaveValor = [campo, etiqueta];

                    mapeo.push(ClaveValor);
                }
            }

            var tipos = [];

            var i = mapeo.length;

            for(var x = 0; x < i; x++)
            {
                if(mapeo[x][0] == 'Tipo')
                {
                    var j = fichero.length;

                    for(var y = 0; y < j; y++)
                    {
                        var prod = fichero[y];

                        var field = mapeo[x][1];

                        if(field.indexOf('&') == -1)
                        {
                            var childs = elementChildren(prod);

                            var l = childs.length;

                            for(var w = 0; w < l; w++)
                            {
                                if(field == childs[w].tagName)
                                {
                                    tipos.push(childs[w].textContent);
                                }
                            }
                        }
                        else
                        {
                            var parts = field.split('&');

                            var k = parts.length;

                            var childs = elementChildren(prod);
                            var child2;

                            var l = childs.length;

                            for(var z = 0; z < k; z++)
                            {
                                var tag = parts[z];

                                for(var w = 0; w < l; w++)
                                {
                                    if(tag == childs[w].tagName)
                                    {

                                        if(z == k-1)
                                            child2 = childs[w];

                                        childs = elementChildren(childs[w]);
                                        break;
                                    }
                                }
                            }

                            tipos.push(child2.textContent);

                        }

                    }
                }
            }

            var types = [];
            for (var i = 0; i < tipos.length; i++) {
                if (types.indexOf(tipos[i]) == -1) {
                    types.push(tipos[i]);
                }
            }
            //types = jQuery.unique( tipos );



            //CARGAMOS LOS TIPOS

            var longitud = types.length;

            var tabla = '<div class="portlet-body"><table class="table table-striped table-bordered table-hover" id="tags"><thead><tr><th>Tus tipos</th><th>Nuestro tipos</th></tr></thead><tbody>';

            var contenido = '';

            for(var i = 0; i < longitud; i++)
            {
                contenido += '<tr><td>' + types[i] + '</td><td><select class="selectores2 form-control input-medium left" tagid="' + types[i] + '"></select></td></tr>';

            }

            //tabla += contenido + '</tbody></table><input type="button" onclick="mapear3()" value="Mapear" /></div>';
            tabla += contenido + '</tbody></table><input type="button" id="botonMapear2" value="Mapear" /></div>';

            document.getElementById('selectores').innerHTML = tabla;

            //CARGAMOS LOS SELECTORES DE TIPO
            var selectores = $(".selectores2");

            var lg = selectores.length;

            for(var j = 0; j < lg; j++)
            {
                var html = '';

                var longitud = arrayTypes.length;

                for(var i = 0; i < longitud; i++)
                {
                    html += "<option value='" + arrayTypes[i] + "' >" + arrayTypes[i] + "</option>";
                }

                selectores[j].innerHTML = html;
            }

        });

        $(document).on( "click","#botonMapear2",  function(e){

            var selectores = $("select.selectores2");

            var lg = selectores.length;

            for(var i = 0; i < lg; i++)
            {
                var campo = selectores[i].value;
                var etiqueta = $(selectores[i]).attr('tagid');

                arrayTiposCliente.push([campo,etiqueta]);
            }


            var i = fichero.length;

            for(var x = 0; x < i; x++)
            {
                if(x > 200)
                    break;
                   /* console.log('durmiendo');
                    var now = new Date().getTime();
                    while(new Date().getTime() < now + 2000){  }
*/

                var identificador;
                var descripcion;
                var codigo;
                var nombre;
                var precio;
                var tipo;
                var imagen;

                var prod = fichero[x];

                var j = mapeo.length;

                for(var y = 0; y < j; y++)
                {
                    var field = mapeo[y][1];
                    var column = mapeo[y][0];

                    if(field.indexOf('&') == -1)
                    {
                        var childs = elementChildren(prod);

                        var l = childs.length;

                        for(var w = 0; w < l; w++)
                        {
                            if(field == childs[w].tagName)
                            {
                                if(column == 'Precio')
                                {
                                    precio = childs[w].textContent;
                                }
                                else if(column == 'Codigo de barras')
                                {
                                    codigo = childs[w].textContent;
                                }
                                else if(column == 'Tipo')
                                {
                                    tipo = childs[w].textContent;
                                    var t = arrayTiposCliente.length;
                                    for(var tt = 0; tt < t; tt++)
                                    {
                                        if(arrayTiposCliente[tt][1] == tipo)
                                        {
                                            tipo = arrayTiposCliente[tt][0];
                                        }
                                    }
                                }
                                else if(column == 'Nombre')
                                {
                                    nombre = childs[w].textContent;
                                }
                                else if(column == 'Identificador')
                                {
                                    identificador = childs[w].textContent;
                                }
                                else if(column == 'Descripcion')
                                {
                                    descripcion = childs[w].textContent;
                                }
                                else if(column == 'Imagen')
                                {
                                    imagen = childs[w].textContent;
                                }

                            }
                        }

                    }
                    else
                    {
                        var parts = field.split('&');

                        var k = parts.length;

                        var childs = elementChildren(prod);
                        var child2;

                        var l = childs.length;

                        for(var z = 0; z < k; z++)
                        {
                            var tag = parts[z];

                            for(var w = 0; w < l; w++)
                            {
                                if(tag == childs[w].tagName)
                                {

                                    if(z == k-1)
                                        child2 = childs[w];

                                    childs = elementChildren(childs[w]);
                                    break;
                                }
                            }
                        }

                        if(column == 'Precio')
                        {
                            precio = child2.textContent;
                        }
                        else if(column == 'Codigo de barras')
                        {
                            codigo = child2.textContent;
                        }
                        else if(column == 'Tipo')
                        {
                            tipo = child2.textContent;

                            var t = arrayTiposCliente.length;
                            for(var tt = 0; tt < t; tt++)
                            {
                                if(arrayTiposCliente[tt][1] == tipo)
                                {
                                    tipo = arrayTiposCliente[tt][0];
                                }
                            }

                        }
                        else if(column == 'Nombre')
                        {
                            nombre = child2.textContent;
                        }
                        else if(column == 'Identificador')
                        {
                            identificador = child2.textContent;
                        }
                        else if(column == 'Descripcion')
                        {
                            descripcion = child2.textContent;
                        }
                        else if(column == 'Imagen')
                        {
                            imagen = child2.textContent;
                        }


                    }
                }

                vm.insertarElemento(codigo, nombre, tipo,descripcion, imagen, precio, identificador);

            }
        });


}]);