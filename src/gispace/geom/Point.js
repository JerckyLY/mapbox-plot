 P.Geom.Point = function(geojson) {
    P.Geom.Feature.call(this,geojson);
};

 P.Geom.Point.prototype = Object.create(P.Geom.Feature.prototype);

 P.Geom.Point.prototype.isValid = function() {
    return typeof this.coordinates[0] === 'number' &&
        typeof this.coordinates[1] === 'number';
};

 P.Geom.Point.prototype.updateCoordinate = function(pathOrLng, lngOrLat, lat) {
    if (arguments.length === 3) {
        this.coordinates = [lngOrLat, lat];
    } else {
        this.coordinates = [pathOrLng, lngOrLat];
    }
};

 P.Geom.Point.prototype.getCoordinate = function() {
    return this.getCoordinates();
};
 P.Geom.Point.prototype.setCoordinate = function(coords) {
     this.coordinates = coords;
 };
