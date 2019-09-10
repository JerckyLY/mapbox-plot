
P.Geom.LineString = function( geojson) {
    P.Geom.Feature.call(this, geojson);
};

P.Geom.LineString.prototype = Object.create(P.Geom.Feature.prototype);

P.Geom.LineString.prototype.isValid = function() {
    return this.coordinates.length > 1;
};

P.Geom.LineString.prototype.addCoordinate = function(path, lng, lat) {
    const id = parseInt(path, 10);
    this.coordinates.splice(id, 0, [lng, lat]);
};
P.Geom.LineString.prototype.setCoordinate = function(coords) {
    this.coordinates = coords;
};

P.Geom.LineString.prototype.getCoordinate = function(path) {
    const id = parseInt(path, 10);
    return JSON.parse(JSON.stringify(this.coordinates[id]));
};

P.Geom.LineString.prototype.removeCoordinate = function(path) {
    this.coordinates.splice(parseInt(path, 10), 1);
};

P.Geom.LineString.prototype.updateCoordinate = function(path, lng, lat) {
    const id = parseInt(path, 10);
    this.coordinates[id] = [lng, lat];
};
