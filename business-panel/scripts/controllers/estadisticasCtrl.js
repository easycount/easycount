'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('EstadisticasCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        $scope.line = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            series: ['Tus gastos', 'Gasto medio'],
            data: [
                [65, 59, 80, 81, 56, 55],
                [45, 67, 72, 4, 15, 39]
            ],
            onClick: function (points, evt) {
                console.log(points, evt);
            }
        };

        $scope.bar = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            series: ['Carrefour', 'Mercadona', 'Caprabo'],

            data: [
                [65, 59, 80, 81, 56, 55],
                [45, 67, 72, 4, 15, 39],
                [46, 55, 12, 102, 43, 22]
            ]

        };

        $scope.donut = {
            labels: ["Download Sales", "In-Store Sales", "Mail-Order Sales"],
            data: [300, 500, 100]
        };

        $scope.radar = {
            labels:["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],

            data:[
                [65, 59, 90, 81, 56, 55, 40],
                [28, 48, 40, 19, 96, 27, 100]
            ]
        };

        $scope.pie = {
            labels : ["Download Sales", "In-Store Sales", "Mail-Order Sales"],
            data : [300, 500, 100]
        };

        $scope.polar = {
            labels : ["Download Sales", "In-Store Sales", "Mail-Order Sales", "Tele Sales", "Corporate Sales"],
            data : [300, 500, 100, 40, 120]
        };

        $scope.dynamic = {
            labels : ["Download Sales", "In-Store Sales", "Mail-Order Sales", "Tele Sales", "Corporate Sales"],
            data : [300, 500, 100, 40, 120],
            type : 'PolarArea',

            toggle : function ()
            {
                this.type = this.type === 'PolarArea' ?
                    'Pie' : 'PolarArea';
            }
        };

    }]);