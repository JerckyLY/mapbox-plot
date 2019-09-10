
P.Geom.Feature = function(geojson) {
    this.properties = geojson.properties || {};
    this.coordinates = geojson.geometry.coordinates;
    this.id = geojson.id || P.Utils.uuid();
    this.type = geojson.geometry.type;
};


P.Geom.Feature.prototype.incomingCoords = function(coords) {
    this.setCoordinates(coords);
};

P.Geom.Feature.prototype.setCoordinates = function(coords) {
    this.coordinates = coords;
};

P.Geom.Feature.prototype.getCoordinates = function() {
    return JSON.parse(JSON.stringify(this.coordinates));
};

P.Geom.Feature.prototype.setProperty = function(property, value) {
    this.properties[property] = value;
};

P.Geom.Feature.prototype.toGeoJSON = function() {
    return JSON.parse(JSON.stringify({
        id: this.id,
        type: 'feature',
        properties: this.properties,
        geometry: {
            coordinates: this.getCoordinates(),
            type: this.type
        }
    }));
};

P.Geom.Feature.prototype.internal = function() {
    const properties = {
        id: this.id,
        meta: 'feature',
        'meta:type': this.type,
    };

    if (this.ctx.options.userProperties) {
        for (const name in this.properties) {
            properties[`user_${name}`] = this.properties[name];
        }
    }

    return {
        type: 'Feature',
        properties: properties,
        geometry: {
            coordinates: this.getCoordinates(),
            type: this.type
        }
    };
};
