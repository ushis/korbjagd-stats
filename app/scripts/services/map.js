'use strict';

angular.module('korbjagdStats')
  .factory('Map', function(_, d3, topojson) {

    /* Constructs a new map */
    var Map = function(selector, world, sectors, baskets) {
      this.el = d3.select(selector);
      this.world = topojson.feature(world, world.objects.land);
      this.events = {};
      this.setSectors(sectors);
      this.baskets = baskets || [];
    };

    /* Registers a new event handler */
    Map.prototype.on = function(name, handler) {
      if (this.events[name] === undefined) {
        this.events[name] = [];
      }
      this.events[name].push(handler);
    };

    /* Dispatches an event */
    Map.prototype.dispatch = function() {
      var args = _.toArray(arguments);
      var name = args.shift();

      if (this.events[name] === undefined) {
        return;
      }

      this.events[name].forEach(function(handler) {
        handler.apply(this, args);
      }, this);
    };

    /* Returns the width of the map container */
    Map.prototype.width = function() {
      return this.el.node().clientWidth;
    };

    /* Returns the height of the map container */
    Map.prototype.height = function() {
      return this.el.node().clientHeight;
    };

    /* Returns a unique identifier */
    Map.prototype.uid = function(prefix) {
      return prefix + '-' + Math.round(Math.random() * 1000000);
    };

    /* Sets the sectors and calculates the scores, based on baskets_count */
    Map.prototype.setSectors = function(sectors) {
      this.sectors = sectors;
      var max = _.max(sectors, 'baskets_count').baskets_count;

      this.sectors.forEach(function(sector) {
        sector.score = Math.log(sector.baskets_count) / Math.log(max);
      });
    };

    /* Returns the bounds of all sectors */
    Map.prototype.bounds = function() {
      var swPoints = _.pluck(this.sectors, 'south_west');
      var nePoints = _.pluck(this.sectors, 'north_east');

      return {
        south_west: {
          latitude: _.min(_.pluck(swPoints, 'latitude')),
          longitude: _.min(_.pluck(swPoints, 'longitude'))
        },
        north_east: {
          latitude: _.max(_.pluck(nePoints, 'latitude')),
          longitude: _.max(_.pluck(nePoints, 'longitude'))
        }
      };
    };

    /* Returns the corner points of a sector */
    Map.prototype.sectorCorners = function(sector) {
      var points = [
        [sector.south_west.longitude, sector.south_west.latitude],
        [sector.south_west.longitude, sector.north_east.latitude],
        [sector.north_east.longitude, sector.north_east.latitude],
        [sector.north_east.longitude, sector.south_west.latitude]
      ];

      return _.map(points, function(point) {
        return this.projection(point);
      }, this);
    };

    /* Clears the map */
    Map.prototype.clear = function() {
      try {
        this.svg.remove();
      } catch (_) {}
    };

    /* Prepares the SVG */
    Map.prototype.prepareSVG = function() {
      this.clear();

      this.svg = this.el.append('svg');
      this.svg.attr('width', this.width());
      this.svg.attr('height', this.height());

      this.clip = this.svg.append('defs').append('clipPath');
      this.clip.attr('id', this.uid('clip'));

      this.features = this.svg.append('g');
      this.features.attr('clip-path', 'url(#' + this.clip.attr('id') + ')');

      this.projection = d3.geo.mercator();
      this.projection.translate([this.width() / 2, this.height() / 2]);

      this.path = d3.geo.path().projection(this.projection);
    };

    /* Draws the world */
    Map.prototype.drawWorld = function() {
      var map = this.clip.append('path');
      map.datum(this.world);
      map.attr('d', this.path);
      map.attr('fill', '#ffffff');
    };

    /* Draws the sectors */
    Map.prototype.drawSectors = function() {
      this.sectors.forEach(function(sector) {
        var me = this;
        var points = this.sectorCorners(sector);

        points = _.map(points, function(point) {
          return point.join(' ');
        }).join(',');

        var polygon = this.features.append('polygon');
        polygon.attr('id', 'sector-' + sector.id);
        polygon.attr('points', points);
        polygon.attr('opacity', (sector.score * 0.5) + 0.5);

        polygon.on('mouseover', function() {
          me.dispatch('mouseover', sector, polygon);
        });

        polygon.on('click', function() {
          me.dispatch('click', sector, polygon);
        });
      }, this);
    };

    /* Draws the baskets */
    Map.prototype.drawBaskets = function() {
      this.baskets.forEach(function(basket) {
        var point = this.projection([basket.longitude, basket.latitude]);
        var circle = this.features.append('circle');
        circle.attr('r', 0.2);
        circle.attr('cx', point[0]);
        circle.attr('cy', point[1]);
      }, this);
    };

    /* Zooms into a specified sector */
    Map.prototype.zoom = function(sector) {
      var points = this.sectorCorners((sector) ? sector : this.bounds());

      var translate = [
        -0.5 * (points[2][0] + points[0][0]),
        -0.5 * (points[0][1] + points[2][1])
      ].join(',');

      var scale = Math.min(
        this.width() / (points[2][0] - points[0][0]),
        this.height() / (points[0][1] - points[2][1])
      );

      var transform = [
        'translate(', this.projection.translate(), ')',
        'scale(', scale, ')',
        'translate(', translate, ')'
      ].join('');

      this.features.attr('transform', transform);
      return this;
    };

    /* Draws the map */
    Map.prototype.draw = function() {
      this.prepareSVG();
      this.drawWorld();
      this.drawSectors();
      this.drawBaskets();
      return this;
    };

    /* Return the Map class */
    return Map;
  });
