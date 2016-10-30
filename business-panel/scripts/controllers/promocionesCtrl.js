/**
 * Created by Xisco on 01/02/2016.
 */

function escapar(){
    var source = document.getElementById("impresion");
    var divv = document.getElementById("superDiv");
    divv.style.display = 'none';
    document.getElementById('co').style.visibility = 'hidden';
    //document.getElementById('co').innerHTML = '';
}

angular.module('sbAdminApp')

    .factory('Empresa', ['$resource', function($resource) {
        return $resource('./../api/empresas/:id',  {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    //recoge un producto a partir de su id
    .factory('Productos', ['$resource', function($resource) {
        return $resource('./../api/productos/:id', {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: false}
        });
    }])

    .controller('promocionesCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = this;

        vm.promos = new Array;
        //vm.promos.push(vm.promo1, vm.promo2, vm.promo3, vm.promo4);

        var numElemsPag = 5;
        vm.inicioPaginacion = 0;
        vm.finPaginacion = numElemsPag;
        vm.numPags = 0;

        vm.paginacionActual = 1;
        vm.navegacion = [];

        //Con esto recuperamos el nombre y la id del usuario de la sesión y la almacenamos en el controlador
        if(document.getElementById("hiddenName")!=null) {

            vm.nombreUsuario = document.getElementById("hiddenName").value;
            vm.idUsuario = document.getElementById("hiddenId").value;
            vm.emailUsuario = document.getElementById("hiddenEmail").value;
            vm.fotoUsuario = document.getElementById("hiddenPhoto").value;

            var responseEmpresa = $http.post('./../api/empresas/empresaDeUsuario', {usuario: vm.idUsuario});
            responseEmpresa.success(function(data){
                empresa = data[0];
                var responseTipos = $http.post("./../api/empresas/tiposDisponibles", {id_empresa: empresa._id});
                responseTipos.success(function (data) {
                    vm.tiposDisponibles = data;
                });
                vm.devuelvePromociones(empresa._id);
            });
        }

        vm.devuelvePromociones = function(superId){
            var promocionesObj = [];
            var promocion;
            vm.promos = [];
            var response = $http.post('./../api/promociones/promocionesEmpresa', {'empresa': superId, inicio: vm.inicioPaginacion, cantidad: vm.finPaginacion});
            response.success(function(data)
            {
                var num = data.array.length;
                vm.numPags = Math.ceil(parseInt(data.total)/numElemsPag);

                for(var i=1; i<=vm.numPags; i++)
                    vm.navegacion.push(i);


                for(var i = 0; i < num; i++)
                {
                    vm.promo = { nombre: data.array[i].name, descripcion: data.array[i].description, barcode: data.array[i].barcode, tipo: data.array[i].tipo, f_desde: data.array[i].f_desde, f_hasta: data.array[i].f_hasta};
                    vm.promos.push(vm.promo);
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });
        }

        vm.formatearFechaPretty = function(fecha){
            var date = new Date(fecha);
            var fecha = date.getDate().toString() + " de " + vm.dameNombreMes(date.getMonth()) + " de " + date.getFullYear().toString();
            fecha += " - ";
            fecha += date.getHours()+":"+("0" + date.getMinutes()).slice(-2);
            return fecha;
        }

        vm.dameNombreMes = function(num){
            switch(num){
                case 0:  return "Enero"; break;
                case 1:  return "Febrero"; break;
                case 2:  return "Marzo"; break;
                case 3:  return "Abril"; break;
                case 4:  return "Mayo"; break;
                case 5:  return "Junio"; break;
                case 6:  return "Julio"; break;
                case 7:  return "Agosto"; break;
                case 8:  return "Septiembre"; break;
                case 9:  return "Octubre"; break;
                case 10: return "Noviembre"; break;
                case 11: return "Diciembre"; break;
            }
        }

        vm.cambiarPaginacion = function(num){
            if(num>0 && num<=vm.numPags) {
                vm.paginacionActual = num;
                vm.inicioPaginacion = (num - 1) * numElemsPag;
                vm.finPaginacion = vm.inicioPaginacion + numElemsPag;
                vm.devuelvePromociones(empresa._id);
            }
        }

        vm.imprimirCodigo = function(t)
        {
            document.getElementById('bar').innerHTML = '';

            var settings = {
                barWidth: 5,
                barHeight: 100,
                moduleSize: 10,
                showHRI: true,
                marginHRI: 2,
                bgColor: "#FFFFFF",
                color: "#000000",
                fontSize: 15,
                output: "css",
                posX: 0,
                posY: 0
            };


            $("#bar").barcode(
                t,
                "ean13",
                settings
            );


            var d = document.getElementById('bar');
            var co = document.getElementById("co");
            co.appendChild(d);


            //COMIENZO GENERAR PDF
            var pdf = new jsPDF('p', 'pt', 'letter');
            // source can be HTML-formatted string, or a reference
            // to an actual DOM element from which the text will be scraped.
            var nombreLista = 'Prueba';
            var source = co;
            var divv = document.getElementById("superDiv");
            divv.style.display = 'block';
            source.style.visibility = 'visible';



            // we support special element handlers. Register them with jQuery-style
            // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
            // There is no support for any other type of selectors
            // (class, of compound) at this time.
            var specialElementHandlers = {
                // element with id of "bypass" - jQuery style selector
                '#bypassme': function (element, renderer) {
                    // true = "handled elsewhere, bypass text extraction"
                    return true
                }
            };
            var margins = {
                top: 80,
                bottom: 60,
                left: 40,
                width: 522
            };

            // all coords and widths are in jsPDF instance's declared units
            // 'inches' in this case
            pdf.addHTML(source, function () {
                var string = pdf.output('datauristring');
                $('.preview-pane').attr('src', string);
            });


        }



        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27) {
                escapar();

            }
        };

    }]);