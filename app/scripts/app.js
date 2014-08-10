'use strict';

angular
  .module('korbjagdStats', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router'
  ])
  .constant('_', window._)
  .constant('d3', window.d3)
  .constant('topojson', window.topojson)
  .constant('API', 'https://api.korbjagd.de/v1')
  .config(function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('map', {
        url: '/',
        templateUrl: 'views/map.html',
        controller: 'MapCtrl',
        resolve: {
          sectors: ['Sectors', function(Sectors) {
            return Sectors.all();
          }],
          world: ['$http', function($http) {
            return $http.get('data/world.json');
          }]
        }
      })
      .state('map.sector', {
        url: 'sectors/:sectorId',
        templateUrl: 'views/sector.html',
        controller: 'SectorCtrl',
        resolve: {
          sector: ['$stateParams', 'Sector', function($stateParams, Sector) {
            return Sector.get($stateParams).$promise;
          }],
          baskets: ['$stateParams', 'Basket', function($stateParams, Basket) {
            return Basket.query($stateParams).$promise;
          }]
        }
      });
  });
