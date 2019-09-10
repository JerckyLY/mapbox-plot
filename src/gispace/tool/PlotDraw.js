
P.PlotDraw = function(map){
    goog.base(this, []);
    this.points = null;
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.mapViewport = null;
    this.dblClickZoomInteraction = null;
    // change ol --> mapbox
    // var stroke = new ol.style.Stroke({color: '#000000', width: 1.25});
    // var fill = new ol.style.Fill({color: 'rgba(0,0,0,0.4)'});
    // this.style = new ol.style.Style({fill:fill, stroke:stroke});
    // this.featureSource = new ol.source.Vector();
    // this.drawOverlay = new ol.layer.Vector({
    //     source: this.featureSource
    // });
    // this.drawOverlay.setStyle(this.style);
    //
    this.featureSourceID = 'plot-draw-source-point'
    this.featureSource = {
        'type':'geojson',
        'data':{
            'type':'Feature',
            "geometry": {
                "type": "Point",
                "coordinates": []
            }
        }
    }
    this.drawOverlay = {
        'id':'plot-draw-overlayer-point-layer',
        'source':'plot-draw-source-point',
        'type': 'circle',
        'paint':{
            "circle-radius": 4,
            "circle-color": "#B42222"
        }
    }
    this.setMap(map);
};

goog.inherits(P.PlotDraw, ol.Observable);

P.PlotDraw.prototype.activate = function (type, params) {
    this.deactivate();
    this.deactivateMapTools();
    window._PlotDraw = this
    this.map.on("click", this.mapFirstClickHandler);
    this.plotType = type;
    this.plotParams = params;
    this.map.addSource(this.featureSourceID,this.featureSource)
    this.map.addLayer(this.drawOverlay);
};

P.PlotDraw.prototype.deactivate = function () {
    this.disconnectEventHandlers();
    if(this.map.getLayer(this.drawOverlay.id)){
        this.map.removeLayer(this.drawOverlay.id);
        this.map.removeSource('plot-draw-source-point')
    }
    // this.featureSource.clear();
    this.points = [];
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.activateMapTools();
};

P.PlotDraw.prototype.isDrawing = function(){
    return this.plotType != null;
};

P.PlotDraw.prototype.setMap = function (value) {
    this.map = value;
    //change
    this.mapViewport = this.map.getCanvasContainer();
};

P.PlotDraw.prototype.mapFirstClickHandler = function (e) {
    //change
    window._PlotDraw.points.push([e.lngLat.lng,e.lngLat.lat]);
    window._PlotDraw.plot = P.PlotFactory.createPlot(window._PlotDraw.plotType, window._PlotDraw.points, window._PlotDraw.plotParams);
    // this.feature = new ol.Feature(this.plot);
    window._PlotDraw.feature = window._PlotDraw.plot;
    // this.featureSource.addFeature(this.feature);
    //change
    window._PlotDraw.map.off("click", window._PlotDraw.mapFirstClickHandler);
    //
    if (window._PlotDraw.plot.fixPointCount == window._PlotDraw.plot.getPointCount()) {
        window._PlotDraw.mapDoubleClickHandler(e);
        return;
    }
    //
    window._PlotDraw.map.on("click", window._PlotDraw.mapNextClickHandler);
    if(!window._PlotDraw.plot.freehand){
        window._PlotDraw.map.on("dblclick", window._PlotDraw.mapDoubleClickHandler);
    }
    goog.events.listen(window._PlotDraw.mapViewport, P.Event.EventType.MOUSEMOVE,
        window._PlotDraw.mapMouseMoveHandler, false, window._PlotDraw);
};

P.PlotDraw.prototype.mapMouseMoveHandler = function (e) {
    //change
    // var coordinate = map.getCoordinateFromPixel([e.offsetX, e.offsetY]);
    var coor = this.map.unproject([e.offsetX,e.offsetY])
    var pixCoordinate =  this.map.project([coor.lng,coor.lat])
    var coordinate = [coor.lng,coor.lat]
    if (P.PlotUtils.distance([coor.lng,coor.lat], this.points[this.points.length - 1]) < P.Constants.ZERO_TOLERANCE)
        return;

    if(!this.plot.freehand){
        var pnts = this.points.concat([coordinate]);
        this.plot.setPoints(pnts);
    }else{
        this.points.push(coordinate);
        this.plot.setPoints(this.points);
    }
    var data = JSON.parse(JSON.stringify({
        type: 'Feature',
        properties: {},
        geometry: {
            coordinates: P.Utils.handleArray(this.feature.A,P.Utils.getFeatureType(this.feature.type)),
            type:P.Utils.getFeatureType(this.feature.type)
        }
    }))
    this.dispatchEvent(new P.Event.PlotDrawEvent(P.Event.PlotDrawEvent.DRAW_MOVING, data));
};

P.PlotDraw.prototype.mapNextClickHandler = function (e) {
    var coordinate = [e.lngLat.lng,e.lngLat.lat]
    if(! window._PlotDraw.plot.freehand){
        if (P.PlotUtils.distance(coordinate,  window._PlotDraw.points[ window._PlotDraw.points.length - 1]) < P.Constants.ZERO_TOLERANCE)
            return;
    }
    window._PlotDraw.points.push(coordinate);
    window._PlotDraw.plot.setPoints( window._PlotDraw.points);
    if ( window._PlotDraw.plot.fixPointCount ==  window._PlotDraw.plot.getPointCount()) {
        window._PlotDraw.mapDoubleClickHandler(e);
        return;
    }
    if( window._PlotDraw.plot &&  window._PlotDraw.plot.freehand){
        window._PlotDraw.mapDoubleClickHandler(e);
    }
};

P.PlotDraw.prototype.mapDoubleClickHandler = function (e) {
    window._PlotDraw.disconnectEventHandlers();
    window._PlotDraw.plot.finishDrawing();
    e.preventDefault();
    window._PlotDraw.drawEnd();
};

P.PlotDraw.prototype.disconnectEventHandlers = function () {
    // change
    this.map.off("click", this.mapFirstClickHandler);
    this.map.off("click", this.mapNextClickHandler);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        this.mapMouseMoveHandler, false, this);
    this.map.off("dblclick", this.mapDoubleClickHandler);
};

P.PlotDraw.prototype.drawEnd = function (feature) {

    var data = JSON.parse(JSON.stringify({
        type: 'Feature',
        properties: {
            id: P.Utils.uuid(),
            coordinates: this.feature.points,     //锚点坐标
            isplot:true,
            plotType:this.plotType // 标绘类型
        },
        geometry: {
            coordinates: P.Utils.handleArray(this.feature.A,P.Utils.getFeatureType(this.feature.type)),
            type:P.Utils.getFeatureType(this.feature.type)
        }
    }))
    this.activateMapTools();
    this.disconnectEventHandlers();
    if(this.map.getLayer(this.drawOverlay.id)){
        this.map.removeLayer(this.drawOverlay.id);
        this.map.removeSource('plot-draw-source-point')
    }
    this.points = [];
    this.plot = null;
    this.plotType = null;
    this.plotParams = null;
    this.dispatchEvent(new P.Event.PlotDrawEvent(P.Event.PlotDrawEvent.DRAW_END, data));
    this.feature = null;
};

P.PlotDraw.prototype.deactivateMapTools = function () {
    // var interactions = map.getInteractions();
    // var length = interactions.getLength();
    // for (var i = 0; i < length; i++) {
    //     var item = interactions.item(i);
    //     if (item instanceof ol.interaction.DoubleClickZoom) {
    //         this.dblClickZoomInteraction = item;
    //         interactions.remove(item);
    //         break;
    //     }
    // }
};

P.PlotDraw.prototype.activateMapTools = function () {
    // if (this.dblClickZoomInteraction != null) {
    //     map.getInteractions().push(this.dblClickZoomInteraction);
    //     this.dblClickZoomInteraction = null;
    // }
};