'use strict';

angular.module('korbjagdStats')
  .factory('Basket', function($resource, API) {
    return $resource(API + '/baskets/:baskjetId', {}, {
      query: {
        method: 'GET',
        url: API + '/sectors/:sectorId/baskets'
      }
    });
  });
