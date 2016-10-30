'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
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

    .factory('Tickets', ['$resource', function($resource) {
        return $resource('./../api/tickets',  null, {
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
        });
    }])

    .factory('DataEmpresa', ['$resource', function($resource) {
        return $resource('./../api/dataempresas',  null, {
            'update': {method: 'PUT'}
        });
    }])

    .factory('DataUsuario', ['$resource', function($resource) {
        return $resource('./../api/datausuarios',  null, {
            'update': {method: 'PUT'}
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
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true}
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
            events:true,
        });


        $urlRouterProvider.otherwise('/dashboard/entradasSistemaKpi');

        $stateProvider
            .state('dashboard', {
                url:'/dashboard',
                templateUrl: 'views/dashboard/main.html',
                data: {
                    pageTitle: 'Dashboard - EasyCount'
                },
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
                controller: 'MainCtrl',
                controllerAs: 'vm',
                templateUrl:'views/dashboard/home.html',
                data: {
                    pageTitle: 'Home - EasyCount'
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
                        })
                    }
                }
            })
            .state('dashboard.form',{
                templateUrl:'views/form.html',
                url:'/form'
            })
            .state('dashboard.blank',{
                templateUrl:'views/pages/blank.html',
                url:'/blank'
            })
            .state('login',{
                templateUrl:'views/pages/login.html',
                url:'/login'
            })
            .state('dashboard.comercio', {
                templateUrl: 'views/comercio.html',
                data: {
                    pageTitle: 'Comercios - EasyCount'
                },
                url: '/comercio',
                controller: 'comerciosCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/comerciosCtrl.js']
                        })
                    }
                }


            })
            .state('dashboard.nuevoUsuario', {
                templateUrl: 'views/nuevoUsuario.html',
                data: {
                    pageTitle: 'Nuevos usuarios - EasyCount'
                },
                url: '/nuevoUsuario',
                controller: 'nuevoUsuarioCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/nuevoUsuarioCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.verUsuarios', {
                templateUrl: 'views/verUsuarios.html',
                data: {
                    pageTitle: 'Ver usuarios - EasyCount'
                },
                url: '/verUsuarios',
                controller: 'verUsuariosCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/verUsuariosCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.editarUsuario', {
                templateUrl: 'views/editarUsuario.html',
                data: {
                    pageTitle: 'Editar usuario - EasyCount'
                },
                url: '/editarUsuario',
                controller: 'editarUsuarioCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/editarUsuarioCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.verProductos', {
                templateUrl: 'views/verProductos.html',
                data: {
                    pageTitle: 'Ver productos - EasyCount'
                },
                url: '/verProductos',
                controller: 'verProductosCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/verProductosCtrl.js']
                        })
                    }
                }


            })
            .state('dashboard.nuevoProducto', {
                templateUrl: 'views/nuevoProducto.html',
                data: {
                    pageTitle: 'Nuevo producto - EasyCount'
                },
                url: '/nuevoProducto',
                controller: 'nuevoProductoCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/nuevoProductoCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.editarProducto', {
                templateUrl: 'views/editarProducto.html',
                data: {
                    pageTitle: 'Editar producto - EasyCount'
                },
                url: '/editarProducto',
                controller: 'editarProductoCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/editarProductoCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.verPromociones', {
                templateUrl: 'views/verPromociones.html',
                data: {
                    pageTitle: 'Ver promociones - EasyCount'
                },
                url: '/verPromociones',
                controller: 'verPromocionesCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/verPromocionesCtrl.js']
                        })
                    }
                }


            })
            .state('dashboard.nuevaPromocion', {
                templateUrl: 'views/nuevaPromocion.html',
                data: {
                    pageTitle: 'Nueva promoción - EasyCount'
                },
                url: '/nuevaPromocion',
                controller: 'nuevaPromocionCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/nuevaPromocionCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.verTickets', {
                templateUrl: 'views/verTickets.html',
                data: {
                    pageTitle: 'Ver tickets - EasyCount'
                },
                url: '/verTickets',
                controller: 'verTicketsCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/verTicketsCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.nuevoTicket', {
                templateUrl: 'views/nuevoTicket.html',
                data: {
                    pageTitle: 'Nuevo ticket - EasyCount'
                },
                url: '/nuevoTicket',
                controller: 'nuevoTicketCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/nuevoTicketCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.verEmpresas', {
                templateUrl: 'views/verEmpresas.html',
                data: {
                    pageTitle: 'Ver empresas - EasyCount'
                },
                url: '/verEmpresas',
                controller: 'verEmpresasCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/verEmpresasCtrl.js']
                        })
                    }
                }


            })
            .state('dashboard.nuevaEmpresa', {
                templateUrl: 'views/nuevaEmpresa.html',
                data: {
                    pageTitle: 'Nueva empresa - EasyCount'
                },
                url: '/nuevaEmpresa',
                controller: 'nuevaEmpresaCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/nuevaEmpresaCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.asignarUsuario', {
                templateUrl: 'views/asignarUsuario.html',
                data: {
                    pageTitle: 'Asignar usuario a empresa - EasyCount'
                },
                url: '/asignarUsuario',
                controller: 'asignarUsuarioCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/asignarUsuarioCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.verListas', {
                templateUrl: 'views/verListas.html',
                data: {
                    pageTitle: 'Ver listas - EasyCount'
                },
                url: '/verListas',
                controller: 'verListasCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/verListasCtrl.js']
                        })
                    }
                }
            })
            .state('dashboard.nuevaLista', {
                templateUrl: 'views/nuevaLista.html',
                data: {
                    pageTitle: 'Nueva lista - EasyCount'
                },
                url: '/nuevaLista',
                controller: 'nuevaListaCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/nuevaListaCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.verEstablecimientos', {
                templateUrl: 'views/verEstablecimientos.html',
                data: {
                    pageTitle: 'Ver establecimientos - EasyCount'
                },
                url: '/verEstablecimientos',
                controller: 'verEstablecimientosCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/verEstablecimientosCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.nuevoEstablecimiento', {
                templateUrl: 'views/nuevoEstablecimiento.html',
                data: {
                    pageTitle: 'Nuevo establecimiento - EasyCount'
                },
                url: '/nuevoEstablecimiento',
                controller: 'nuevoEstablecimientoCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/nuevoEstablecimientoCtrl.js']
                        })
                    }
                }


            })

            .state('dashboard.algoritmo', {
                templateUrl: 'views/algoritmo.html',
                data: {
                    pageTitle: 'Algoritmo - EasyCount'
                },
                url: '/algoritmo',
                controller: 'algoritmoCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/algoritmoCtrl.js']
                        })
                    }
                }
            })
            .state('dashboard.entradasSistemaKpi', {
                templateUrl: 'views/kpiEntradasSistema.html',
                data: {
                    pageTitle: 'Entradas al sistema - EasyCount'
                },
                url: '/entradasSistemaKpi',
                controller: 'kpiEntradasSistemaCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'chart.js',
                            files:[
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }),
                            $ocLazyLoad.load({
                                name: 'sbAdminApp',
                                files: ['scripts/controllers/kpiEntradasSistemaCtrl.js']
                            })
                    }
                }
            })
            .state('dashboard.llamadasAPIKpi', {
                templateUrl: 'views/kpiLlamadasApi.html',
                data: {
                    pageTitle: 'Llamadas API - EasyCount'
                },
                url: '/llamadasApiKpi',
                controller: 'kpiLlamadasApiCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'chart.js',
                            files:[
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }), $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/kpiLlamadasApiCtrl.js']
                        })
                    }
                }
            })
            .state('dashboard.valoracionesOpinionesKpi', {
                templateUrl: 'views/kpiValoracionesOpiniones.html',
                data: {
                    pageTitle: 'Valoraciones y opiniones - EasyCount'
                },
                url: '/valoracionesOpinionesKpi',
                controller: 'kpiValoracionesOpinionesCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'chart.js',
                            files:[
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }), $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/kpiValoracionesOpinionesCtrl.js']
                        })
                    }
                }
            })

            .state('dashboard.ticketsListasKpi', {
                templateUrl: 'views/kpiTicketsListas.html',
                data: {
                    pageTitle: 'Tickets y listas - EasyCount'
                },
                url: '/ticketsListasKpi',
                controller: 'kpiTicketsListasCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'chart.js',
                            files:[
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }), $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/kpiTicketsListasCtrl.js']
                        })
                    }
                }
            })

            .state('dashboard.usuariosKpi', {
                templateUrl: 'views/kpiUsuarios.html',
                data: {
                    pageTitle: 'Nuevos usuarios - EasyCount'
                },
                url: '/usuariosKpi',
                controller: 'kpiUsuariosCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'chart.js',
                            files:[
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }), $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/kpiUsuariosCtrl.js']
                        })
                    }
                }
            })

            .state('dashboard.comerciosKpi', {
                templateUrl: 'views/kpiComercios.html',
                data: {
                    pageTitle: 'Nuevos comercios - EasyCount'
                },
                url: '/comerciosKpi',
                controller: 'kpiComerciosCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name:'chart.js',
                            files:[
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.css'
                            ]
                        }), $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/kpiComerciosCtrl.js']
                        })
                    }
                }
            })

            .state('dashboard.productos',{
                templateUrl:'views/productos.html',
                url:'/productos'
            })

            .state('dashboard.table',{
                templateUrl:'views/comercios.html',
                url:'/table'
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
    }]);

    
