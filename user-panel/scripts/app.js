'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 *
 */
angular
    .module('sbAdminApp', [
        'oc.lazyLoad',
        'ui.router',
        'ui.bootstrap',
        'angular-loading-bar',
        'ngResource',
        'ngCookies'
    ])

    .run(function($http, $cookies) {
        $http.defaults.headers.common.Authorization = 'Bearer '+$cookies['tokenAPI'];
    })

    .run([ '$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }])

    .directive("owlCarousel", function() {
        return {
            restrict: 'E',
            transclude: false,
            link: function (scope) {
                scope.initCarousel = function(element) {
                    // provide any default options you want
                    var defaultOptions = {
                    };
                    var customOptions = scope.$eval($(element).attr('data-options'));
                    // combine the two options objects
                    for(var key in customOptions) {
                        defaultOptions[key] = customOptions[key];
                    }
                    // init carousel
                    $(element).owlCarousel(defaultOptions);
                };
            }
        };
    })
    .directive('owlCarouselItem', [function() {
        return {
            restrict: 'A',
            transclude: false,
            link: function(scope, element) {
                // wait for the last item in the ng-repeat then call init
                if(scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }])

    .directive('tablaItem', [function() {
        return {
            restrict: 'A',
            transclude: false,
            link: function(scope) {
                // wait for the last item in the ng-repeat then call init
                if(scope.$last) {
                    inicializarTabla();
                    console.log('ultimooo');
                }
            }
        };
    }])

    .factory('Tickets', ['$resource', function($resource) {
        return $resource('./../api/tickets',  null, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
        });
    }])

    .factory('TicketUnico', ['$resource', function($resource) {
        return $resource('./../api/tickets/:id',  {id: '@_id' }, {
            'update': {method: 'PUT'}
        });
    }])

    .factory('Productos', ['$resource', function($resource) {
        return $resource('./../api/productos/:id', {id: '@_id' }, {
            'update': {method: 'PUT'}
        });
    }])

    //recoge un usuario a partir de su id
    .factory('Usuarios', ['$resource', function($resource) {
        return $resource('./../api/usuarios/:id',  {id: '@_id' }, {
            'update': {method: 'PUT'}
        });
    }])

    .factory('Listas', ['$resource', function($resource) {
        return $resource('./../api/listas/:id',   {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
        });
    }])

    .factory('ListaUnica', ['$resource', function($resource) {
        return $resource('./../api/listas/:id',   {id: '@_id' }, {
            'update': {method: 'PUT'}
        });
    }])

    .factory('ListasMulti', ['$resource', function($resource){
        return $resource('./../api/listas/',  { predefinida: '@predefinida'}, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
        });
    }])

    .factory('ProductosMulti', ['$resource', function($resource) {
        return $resource('./../api/productos/',   {id: '@_id' }, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
        });
    }])


    .factory('Empresas', ['$resource', function($resource) {
        return $resource('./../api/empresas',   {id: '@_id' }, {
            'update': {method: 'PUT'}
        });
    }])

    .factory('Empresa', ['$resource', function($resource) {
        return $resource('./../api/empresas/:id',   {id: '@_id' }, {
            'update': {method: 'PUT'}
        });
    }])

    .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {

        $ocLazyLoadProvider.config({
            debug:false,
            events:true
        });

        $urlRouterProvider.otherwise('/dashboard/home');

        $stateProvider
            .state('dashboard', {
                url:'/dashboard',
                templateUrl: 'views/dashboard/main.html',
                resolve: {
                    loadMyDirectives:function($ocLazyLoad){
                        return $ocLazyLoad.load(
                            {
                                name:'sbAdminApp',
                                files:[
                                    'scripts/directives/header/header.js',
                                    'scripts/directives/header/header-notification/header-notification.js',
                                    'scripts/directives/sidebar/sidebar.js',
                                    'scripts/directives/sidebar/sidebar-search/sidebar-search.js'
                                ]
                            }),
                            $ocLazyLoad.load(
                                {
                                    name:'toggle-switch',
                                    files:["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                                        "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                                    ]
                                }),
                            $ocLazyLoad.load(
                                {
                                    name:'ngAnimate',
                                    files:['bower_components/angular-animate/angular-animate.js']
                                })


                        $ocLazyLoad.load(
                            {
                                name:'ngCookies',
                                files:['bower_components/angular-cookies/angular-cookies.js']
                            })
                        $ocLazyLoad.load(
                            {
                                name:'ngResource',
                                files:['bower_components/angular-resource/angular-resource.js']
                            })

                        $ocLazyLoad.load(
                            {
                                name:'ngSanitize',
                                files:['bower_components/angular-sanitize/angular-sanitize.js']
                            })
                        $ocLazyLoad.load(
                            {
                                name:'ngTouch',
                                files:['bower_components/angular-touch/angular-touch.js']
                            })
                    }
                }
            })

            .state('dashboard.home',{
                url:'/home',
                templateUrl:'views/dashboard/home.html',
                data: {
                    pageTitle: 'Dashboard - EasyCount'
                },
                resolve: {
                    loadMyFiles:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:[
                                'scripts/controllers/main.js',
                                'scripts/directives/timeline/timeline.js',
                                'scripts/directives/notifications/notifications.js',
                                'scripts/directives/chat/chat.js',
                                'scripts/directives/dashboard/stats/stats.js'
                            ]
                        }).then(function success(args) {
                            return args;
                        }, function error(err) {
                            return err;
                        });
                    }
                },
                controller: 'MainCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.valoraciones',{
                templateUrl:'views/valoraciones.html',
                url:'/valoraciones',
                data: {
                    pageTitle: 'Valoraciones - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                                name:'sbAdminApp',
                                files:['scripts/controllers/productosController.js']
                            })
                            .then(function success(args) {
                                return args;
                            }, function error(err) {
                                return err;
                            });
                    }
                },
                controller: 'ProductosCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.listas',{
                templateUrl:'views/listas2.html',
                url:'/listas',
                data: {
                    pageTitle: 'Listas - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                                name:'sbAdminApp',
                                files:['scripts/controllers/listasController.js']
                            })
                            .then(function success(args) {
                                return args;
                            }, function error(err) {
                                return err;
                            });
                    }
                },
                controller: 'ListasCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.viewLista',{
                templateUrl:'views/viewLista.html',
                url:'/viewLista/:listaId',
                data: {
                    pageTitle: 'Ver lista - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/listasController.js']
                        }).then(function success(args) {
                            return args;
                        }, function error(err) {
                            return err;
                        });
                    }
                },
                controller: 'ListasCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.productos',{
                templateUrl:'views/productos.html',
                url:'/productos/:superId',
                data: {
                    pageTitle: 'Productos - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/productosController.js']
                        }).then(function success(args) {
                            return args;
                        }, function error(err) {
                            return err;
                        });
                    }
                },
                controller: 'ProductosCtrl',
                controllerAs: 'vm',
            })
            .state('dashboard.producto',{
                templateUrl:'views/producto.html',
                url:'/producto:id',
                data: {
                    pageTitle: 'Detalle de producto - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/productoController.js']
                        }).then(function success(args) {
                            return args;
                        }, function error(err) {
                            return err;
                        });
                    }
                },
                controller: 'ProductoCtrl',
                controllerAs: 'vm',
            })
            .state('dashboard.tickets',{
                templateUrl:'views/tickets.html',
                url:'/tickets',
                data: {
                    pageTitle: 'Historial de compras - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/ticketsController.js']
                        }).then(function success(args) {
                            return args;
                        }, function error(err) {
                            return err;
                        });
                    }
                },
                controller: 'TicketsCtrl',
                controllerAs: 'vm',
            })

            .state('dashboard.viewTicket',{
                templateUrl:'views/viewTicket.html',
                url:'/viewTicket/:ticketId',
                data: {
                    pageTitle: 'Ver ticket - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/ticketsController.js']
                        })
                    }
                },
                controller: 'TicketsCtrl',
                controllerAs: 'vm',
            })

            .state('dashboard.promociones',{
                templateUrl:'views/promociones.html',
                url:'/promociones',
                data: {
                    pageTitle: 'Promociones - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                                name:'sbAdminApp',
                                files:['scripts/controllers/promocionesController.js']
                            })
                            .then(function success(args) {
                                return args;
                            }, function error(err) {
                                return err;
                            });
                    }
                },
                controller: 'PromocionesCtrl',
                controllerAs: 'vm'
            })

            .state('dashboard.blank',{
                templateUrl:'views/pages/blank.html',
                url:'/blank'
            })
            .state('login',{
                templateUrl:'views/pages/login.html',
                url:'/login'
            })
            .state('dashboard.chart',{
                templateUrl:'views/chart.html',
                url:'/chart',
                data: {
                    pageTitle: 'Estadísticas - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'chart.js',
                            files:[
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }),
                            $ocLazyLoad.load({
                                name:'sbAdminApp',
                                files:['scripts/controllers/chartContoller.js']
                            })
                    }
                },
                controller:'ChartCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.table',{
                templateUrl:'views/comercios.html',
                url:'/comercios',
                data: {
                    pageTitle: 'Comercios - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/supermercadosController.js']
                        })
                    }
                },
                controller: 'SupermercadosCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.panels-wells',{
                templateUrl:'views/ui-elements/panels-wells.html',
                url:'/panels-wells'
            })
            .state('dashboard.buttons',{
                templateUrl:'views/ui-elements/buttons.html',
                url:'/buttons'
            })
            .state('dashboard.notifications',{
                templateUrl:'views/ui-elements/notifications.html',
                url:'/notifications'
            })
            .state('dashboard.typography',{
                templateUrl:'views/ui-elements/typography.html',
                url:'/typography'
            })
            .state('dashboard.icons',{
                templateUrl:'views/ui-elements/icons.html',
                url:'/icons'
            })
            .state('dashboard.grid',{
                templateUrl:'views/ui-elements/grid.html',
                url:'/grid'
            })

            .state('dashboard.perfil',{
                url:'/perfil',
                templateUrl:'views/perfil.html',
                data: {
                    pageTitle: 'Perfil - EasyCount'
                },
                resolve: {
                    loadMyFiles:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/main.js']
                        })
                    }
                },
                controller: 'MainCtrl',
                controllerAs: 'vm'
            })

            .state('dashboard.nuevaLista',{
                templateUrl:'views/nuevaLista.html',
                url:'/nuevaLista',
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/nuevaListaController.js']
                        })
                    }
                },
                controller: 'nuevaListaCtrl',
                controllerAs: 'vm',
            })
            .state('dashboard.valoracionesRealizadas',{
                templateUrl:'views/valoracionesRealizadas.html',
                url:'/valoracionesRealizadas/:userId',
                data: {
                    pageTitle: 'Valoraciones realizadas - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/valoracionesController.js']
                        })
                    }
                },
                controller: 'valoracionesCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.opinionesRealizadas',{
                templateUrl:'views/opinionesRealizadas.html',
                url:'/opinionesRealizadas/:userId',
                data: {
                    pageTitle: 'Opiniones realizadas - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/valoracionesController.js']
                        })
                    }
                },
                controller: 'valoracionesCtrl',
                controllerAs: 'vm'
            })
            .state('dashboard.piramide',{
                templateUrl:'views/piramide.html',
                url:'/piramide',
                data: {
                    pageTitle: 'Pirámide nutricional - EasyCount'
                },
                resolve: {
                    loadMyFile:function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'sbAdminApp',
                            files:['scripts/controllers/piramideController.js']
                        })
                    }
                },
                controller: 'piramideCtrl',
                controllerAs: 'vm'
            })
    }]);

