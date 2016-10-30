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
            events:true,
        });

        $urlRouterProvider.otherwise('/dashboard/estadisticasProducto');

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
            .state('dashboard.catalogo', {
                templateUrl: 'views/catalogo.html',
                data: {
                    pageTitle: 'Catálogo - EasyCount'
                },
                url: '/catalogo',
                controller: 'catalogoCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/catalogoCtrl.js']
                        })
                    }
                }
            })

            .state('dashboard.estadisticas-usuario',{
                templateUrl:'views/estadisticasUsuario.html',
                url:'/estadisticasUsuario',
                controller:'EstadisticasUsuarioCtrl',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Estadísticas usuario - EasyCount'
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
                                files:['scripts/controllers/estadisticasUsuarioCtrl.js']
                            })
                    }
                }
            })

            .state('dashboard.estadisticas-producto',{
                templateUrl:'views/estadisticasProducto.html',
                url:'/estadisticasProducto',
                controller:'EstadisticasProductoCtrl',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Estadísticas producto - EasyCount'
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
                                files:['scripts/controllers/estadisticasProductoCtrl.js']
                            })
                    }
                }
            })

            .state('dashboard.estadisticas-tipoProducto',{
                templateUrl:'views/estadisticasTipoProducto.html',
                url:'/estadisticasTipoProducto',
                controller:'EstadisticasTipoProductoCtrl',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Estadísticas tipo de productos - EasyCount'
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
                                files:['scripts/controllers/estadisticasTipoProductoCtrl.js']
                            })
                    }
                }
            })


            .state('dashboard.estadisticas',{
                templateUrl:'views/estadisticas.html',
                url:'/estadisticas',
                controller:'EstadisticasCtrl',
                controllerAs: 'vm',
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
                                files:['scripts/controllers/estadisticasCtrl.js']
                            })
                    }
                }
            })

            .state('dashboard.promociones', {
                templateUrl: 'views/promociones.html',
                data: {
                    pageTitle: 'Promociones - EasyCount'
                },
                url: '/promociones',
                controller: 'promocionesCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/promocionesCtrl.js']
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

            .state('dashboard.importacion', {
                templateUrl: 'views/importacion.html',
                data: {
                    pageTitle: 'Importación - EasyCount'
                },
                url: '/importacion',
                controller: 'importacionCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/importacionCtrl.js']
                        })
                    }
                }
            })

            .state('dashboard.establecimientos', {
                templateUrl: 'views/establecimientos.html',
                data: {
                    pageTitle: 'Establecimientos - EasyCount'
                },
                url: '/establecimientos',
                controller: 'establecimientosCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/establecimientosCtrl.js']
                        })
                    }
                }
            })

            .state('dashboard.producto',{
                templateUrl:'views/producto.html',
                data: {
                    pageTitle: 'Producto - EasyCount'
                },
                url:'/producto/:superId',
                controller: 'productoCtrl',
                controllerAs: 'vm',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'sbAdminApp',
                            files: ['scripts/controllers/productoCtrl.js']
                        })
                    }
                }
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

    
