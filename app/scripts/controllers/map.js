'use strict';

angular.module('korbjagdStats')
  .controller('MapCtrl', function (_, $scope, $state, $window, Map, sectors, world) {

    /* List of all "populated" sectors */
    $scope.sectors = _.filter(sectors.sectors, 'baskets_count');

    /* Topo data of the world */
    $scope.world = world.data;

    /* Initialize the map */
    $scope.map = new Map('#map', $scope.world, $scope.sectors).draw();

    /* Go to sector on click */
    $scope.map.on('click', function(sector) {
      $state.go('map.sector', {sectorId: sector.id});
    });

    /* Resize the map on window resize */
    $window.addEventListener('resize', _.debounce(function() {
      $scope.map.draw();
    }, 200));
  });
