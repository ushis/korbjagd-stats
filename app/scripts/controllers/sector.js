'use strict';

angular.module('korbjagdStats')
  .controller('SectorCtrl', function($scope, sector, baskets, Map) {

    /* Sector object */
    $scope.sector = sector.sector;

    /* Baskets collection */
    $scope.baskets = baskets.baskets;

    /* Initialize the map and zoom into the sector */
    $scope.sMap = new Map('#sector-map', $scope.world, [$scope.sector], $scope.baskets);
    $scope.sMap.draw().zoom($scope.sector);

    /* Formats a point */
    $scope.formatPoint = function(p, digits) {
      return [
        p.latitude.toFixed(digits),
        p.longitude.toFixed(digits)
      ].join(', ');
    };
  });
