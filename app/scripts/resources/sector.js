'use strict';

angular.module('korbjagdStats')
  .factory('Sector', function($resource, API) {
    return $resource(API + '/sectors/:sectorId', {}, {
      query: {method: 'GET'}
    });
  });
