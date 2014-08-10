'use strict';

angular.module('korbjagdStats')
  .factory('Sectors', function($q, Sector) {

    /* Loads all sectors */
    var load = function() {
      var deferred = $q.defer();

      /* Load first page */
      Sector.query().$promise
        .then(function(resp) {
          var i, promises = [], sectors = resp.sectors;

          var onload = function(resp) {
            sectors = sectors.concat(resp.sectors);
          };

          /* Load remaining pages */
          for (i = 2; i <= resp.params.total_pages; i++) {
            var promise = Sector.query({page: i}).$promise;
            promise.then(onload);
            promises.push(promise);
          }

          /* Resolve all sectors */
          $q.all(promises).then(function() {
            deferred.resolve({sectors: sectors});
          });
        })
        .catch(function(resp) {
          deferred.reject(resp);
        });

      return deferred.promise;
    };

    return {all: load};
  });
