
P.Geom.Polygon = function( geojson) {
    P.Geom.Feature.call(this, geojson);
    this.coordinates = this.coordinates.map(ring => ring.slice(0, -1));
};

P.Geom.Polygon.prototype = Object.create(P.Geom.Feature.prototype);

P.Geom.Polygon.prototype.isValid = function() {
    if (this.coordinates.length === 0) return false;
    return this.coordinates.every(ring => ring.length > 2);
};

// Expects valid geoJSON polygon geometry: first and last positions must be equivalent.
P.Geom.Polygon.prototype.incomingCoords = function(coords) {
    this.coordinates = coords.map(ring => ring.slice(0, -1));
};

// Does NOT expect valid geoJSON polygon geometry: first and last positions should not be equivalent.
P.Geom.Polygon.prototype.setCoordinates = function(coords) {
    this.coordinates = coords;
};

P.Geom.Polygon.prototype.addCoordinate = function(path, lng, lat) {
    const ids = path.split('.').map(x => parseInt(x, 10));

    const ring = this.coordinates[ids[0]];

    ring.splice(ids[1], 0, [lng, lat]);
};

P.Geom.Polygon.prototype.removeCoordinate = function(path) {
    const ids = path.split('.').map(x => parseInt(x, 10));
    const ring = this.coordinates[ids[0]];
    if (ring) {
        ring.splice(ids[1], 1);
        if (ring.length < 3) {
            this.coordinates.splice(ids[0], 1);
        }
    }
};

P.Geom.Polygon.prototype.getCoordinate = function(path) {
    const ids = path.split('.').map(x => parseInt(x, 10));
    const ring = this.coordinates[ids[0]];
    return JSON.parse(JSON.stringify(ring[ids[1]]));
};

P.Geom.Polygon.prototype.getCoordinates = function() {
    return this.coordinates.map(coords => coords.concat([coords[0]]));
};

P.Geom.Polygon.prototype.updateCoordinate = function(path, lng, lat) {
    const parts = path.split('.');
    const ringId = parseInt(parts[0], 10);
    const coordId = parseInt(parts[1], 10);

    if (this.coordinates[ringId] === undefined) {
        this.coordinates[ringId] = [];
    }

    this.coordinates[ringId][coordId] = [lng, lat];
};
