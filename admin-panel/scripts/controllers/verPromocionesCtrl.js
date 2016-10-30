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

    .controller('verPromocionesCtrl', ['$scope', '$timeout','Empresa','Productos', '$stateParams', '$http', function ($scope, $timeout,Empresa,Productos,$stateParams,$http) {

        var vm = $scope;

        vm.promos = new Array;
        //vm.promos.push(vm.promo1, vm.promo2, vm.promo3, vm.promo4);

        vm.devuelvePromociones = function(){
            var promocionesObj = [];
            var promocion;

            var response = $http.get('./../api/promociones');
            response.success(function(data)
            {
                var j = 0;

                for(var i = 0; i < data.length; i++)
                {
                    var emp = data[i].empresa;
                    var response2 = $http.get('./../api/empresas/'+emp);
                    response2.success(function(data2)
                    {
                        vm.promo = { nombre: data[j].name, descripcion: data[j].description, barcode: data[j].barcode, tipo: data[j].tipo, f_desde: data[j].f_desde, f_hasta: data[j].f_hasta, empresa: data2.name};
                        vm.promos.push(vm.promo);
                        j++;
                    });
                }
            },function(reason){
                console.log("Error en buscarEstablecimiento por: "+reason);
            });


        }

        vm.devuelvePromociones();

        vm.imprimirCodigo = function(t)
        {
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

$(document).ready(function(){

    $.getScript('//cdnjs.cloudflare.com/ajax/libs/select2/3.4.8/select2.min.js',function(){
        $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/js/bootstrap-datepicker.min.js',function(){
            $.getScript('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.6.0/moment.min.js',function(){
                $.getScript('//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/3.0.0/js/bootstrap-datetimepicker.min.js',function(){
                    $.getScript('//cdnjs.cloudflare.com/ajax/libs/jasny-bootstrap/3.1.3/js/jasny-bootstrap.min.js',function(){

                        $("#mySel").select2({
                            closeOnSelect:false
                        });

                        $("#mySel2").select2({
                            closeOnSelect:false
                        });

                        /*
                         $('#datepicker').datepicker({
                         autoclose:true,
                         }).on("changeDate", function(e){
                         console.log(e.date);
                         });

                         $('.input-daterange').datepicker({
                         autoclose:true
                         }).on("changeDate", function(e){
                         console.log(e.date);
                         });

                         $('#timepicker').datetimepicker({
                         pickDate: false
                         });*/

                        $("input").bind('keyup change',function() {
                            var $t = $(this);
                            var $par = $t.parent();
                            var min = $t.attr("data-valid-min");
                            var match = $t.attr("data-valid-match");
                            var pattern = $t.attr("pattern");

                            if (typeof match!="undefined"){
                                if ($t.val()!=$('#'+match).val()) {
                                    $par.removeClass('has-success').addClass('has-error');
                                }
                                else {
                                    $par.removeClass('has-error').addClass('has-success');
                                }
                            }
                            else if (!this.checkValidity()) {
                                $par.removeClass('has-success').addClass('has-error');
                            }
                            else {
                                $par.removeClass('has-error').addClass('has-success');
                            }

                            if ($par.hasClass("has-success")) {
                                $par.find('.form-control-feedback').removeClass('fade');
                            }
                            else {
                                $par.find('.form-control-feedback').addClass('fade');
                            }

                        });





                    });//script
                });//script
            });//script
        });//script
    });//script

});
