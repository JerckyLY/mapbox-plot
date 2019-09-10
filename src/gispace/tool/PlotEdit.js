
P.PlotEdit = function(map,mapboxgl){
    if(!map || !mapboxgl){
        return;
    }
    goog.base(this, []);
    this.activePlot = null;
    this.startPoint = null;
    this.ghostControlPoints = null;
    this.controlPoints = null;
    this.map = map;
    this.mapboxgl = mapboxgl
    // this.mapViewport = this.map.getViewport();
    // change
    this.mapViewport = this.map.getCanvasContainer();
    this.mouseOver = false;
    this.elementTable = {};
    this.activeControlPointId = null;
    this.mapDragPan = null;
};

goog.inherits(P.PlotEdit, ol.Observable);

P.PlotEdit.prototype.Constants = {
    HELPER_HIDDEN_DIV: 'p-helper-hidden-div',
    HELPER_CONTROL_POINT_DIV: 'p-helper-control-point-div'
};

P.PlotEdit.prototype.initHelperDom = function(){
    if(!this.map || !this.activePlot){
        return;
    }
    var parent = this.getMapParentElement();
    if(!parent){
       return;
    }
    var hiddenDiv = P.DomUtils.createHidden('div', parent, this.Constants.HELPER_HIDDEN_DIV);

    var cPnts = this.getControlPoints();
    for(var i=0; i<cPnts.length; i++){
        var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
        P.DomUtils.create('div', this.Constants.HELPER_CONTROL_POINT_DIV, hiddenDiv, id);
        this.elementTable[id] = i;
    }
};

P.PlotEdit.prototype.getMapParentElement = function() {
    // var mapElement = this.map.getTargetElement();
    // change
    var mapElement = this.map.getContainer();
    if(!mapElement){
        return;
    }
    return mapElement.parentNode;
};

P.PlotEdit.prototype.destroyHelperDom = function(){
    //
    if(this.controlPoints){
        for(var i=0; i<this.controlPoints.length; i++){
            this.controlPoints[i].remove()
            // this.map.removeOverlay(this.controlPoints[i]);
            // var element = P.DomUtils.get(this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i);
            // if(element){
            //     P.DomUtils.removeListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
            //     P.DomUtils.removeListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
            // }
        }
        this.controlPoints = null;
    }
    //
    var parent = this.getMapParentElement();
    var hiddenDiv = P.DomUtils.get(this.Constants.HELPER_HIDDEN_DIV);
    if(hiddenDiv && parent){
        P.DomUtils.remove(hiddenDiv, parent);
    }
};

P.PlotEdit.prototype.initControlPoints = function(){
    if(!this.map || !this.mapboxgl){
        return;
    }
    this.controlPoints = [];
    var cPnts = this.getControlPoints();
    for(var i=0; i<cPnts.length; i++){
        var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
        var element = P.DomUtils.get(id);
        var pnt = new this.mapboxgl.Marker({draggable: true}).setLngLat(cPnts[i]).addTo(this.map);
        this.controlPoints.push(pnt);
        // 添加监听
        // pnt.on('dragend',this.markerDragEndHandle(pnt))
        pnt.on('dragend',function(){
            window._PlotEdit.dispatchEvent(new P.Event.PlotEditEvent(P.Event.PlotEditEvent.DRAG_POINT_END,  window._PlotEdit.handleMarkerDragEvent()));
        })

        // pnt.on('drag',this.markerDragMoveHandle(pnt))
        pnt.on('drag',function(){
            // console.log(pnt.getLngLat())
            window._PlotEdit.dispatchEvent(new P.Event.PlotEditEvent(P.Event.PlotEditEvent.DRAG_POINT_MOVING,  window._PlotEdit.handleMarkerDragEvent()));
        })
        // this.map.addOverlay(pnt);      // P.DomUtils.addListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
        // P.DomUtils.addListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
    }
};


P.PlotEdit.prototype.handleMarkerDragEvent = function(){
    var points = []
    for(var i =0;i<window._PlotEdit.controlPoints.length;i++){
        points.push([window._PlotEdit.controlPoints[i].getLngLat().lng,window._PlotEdit.controlPoints[i].getLngLat().lat])
    }
    var feature  =   P.PlotFactory.createPlot(window._PlotEdit.plotType, points, null)
    var data = JSON.parse(JSON.stringify({
        type: 'Feature',
        properties: {
            id: P.Utils.uuid(),
            coordinates: feature.points,     //锚点坐标
            isplot:true,
            plotType:window._PlotEdit.plotType // 标绘类型
        },
        geometry: {
            coordinates: P.Utils.handleArray(feature.A,P.Utils.getFeatureType(feature.type)),
            type:P.Utils.getFeatureType(feature.type)
        }
    }))

   return data

}

P.PlotEdit.prototype.controlPointMouseMoveHandler2 = function(e){
    e.stopImmediatePropagation();
};

P.PlotEdit.prototype.controlPointMouseDownHandler = function(e){
    var id = e.target.id;
    this.activeControlPointId = id;
    goog.events.listen(this.mapViewport, P.Event.EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, false, this);
    goog.events.listen(this.mapViewport, P.Event.EventType.MOUSEUP, this.controlPointMouseUpHandler, false, this);
};

P.PlotEdit.prototype.controlPointMouseMoveHandler = function(e){
    var coordinate = map.getCoordinateFromPixel([e.offsetX, e.offsetY]);
    if(this.activeControlPointId){
        var plot = this.activePlot;
        var index = this.elementTable[this.activeControlPointId];
        plot.updatePoint(coordinate, index);
        var overlay = this.map.getOverlayById(this.activeControlPointId);
        overlay.setPosition(coordinate);
    }
};

P.PlotEdit.prototype.controlPointMouseUpHandler = function(e){
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        this.controlPointMouseMoveHandler, false, this);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEUP,
        this.controlPointMouseUpHandler, false, this);
};

P.PlotEdit.prototype.activate = function(plot){

  /*  if(!plot || !(plot instanceof ol.Feature) || plot == this.activePlot) {
        return;
    }*/

    if(!plot['properties']['isplot']) {
        return;
    }

    // var geom = plot.getGeometry();
    // if(!geom.isPlot()){
    //     return;
    // }

    this.deactivate();

    this.plotType = plot['properties']['plotType'] // plot类型
    this.activePlot = new ol.Feature(P.PlotFactory.createPlot(plot['properties']['plotType'], JSON.parse(plot['properties']['coordinates']), null)) ;
    //
    window._PlotEdit = this;

    this.initHelperDom();
    //
    this.initControlPoints();
    //
    this.map.on("pointermove", this.plotMouseOverOutHandler);

};

P.PlotEdit.prototype.getControlPoints = function(){
    if(!this.activePlot){
        return [];
    }
    var geom = this.activePlot.getGeometry();
    return geom.getPoints();
};

P.PlotEdit.prototype.plotMouseOverOutHandler = function(e){
    var feature = map.queryRenderedFeatures(e.point)

    if(feature.length && feature == this.activePlot){
        if(!window._PlotEdit.mouseOver){
            window._PlotEdit.mouseOver = true;
            // this.map.getViewport().style.cursor = 'move';
            //change
            window._PlotEdit.map.getCanvasContainer().style.cursor = 'move';
            window._PlotEdit.map.on('pointerdown', window._PlotEdit.plotMouseDownHandler);
        }
    }else{
        if(window._PlotEdit.mouseOver){
            window._PlotEdit.mouseOver = false;
            //change
            window._PlotEdit.map.getCanvasContainer().style.cursor = 'default';
            window._PlotEdit.map.off('pointerdown', window._PlotEdit.plotMouseDownHandler);
        }
    }
};

P.PlotEdit.prototype.plotMouseDownHandler = function(e){
    window._PlotEdit.ghostControlPoints = window._PlotEdit.getControlPoints();
    window._PlotEdit.startPoint = e.coordinate;
    window._PlotEdit.disableMapDragPan();
    window._PlotEdit.map.on('pointerup', window._PlotEdit.plotMouseUpHandler);
    window._PlotEdit.map.on('pointerdrag', window._PlotEdit.plotMouseMoveHandler);
};

P.PlotEdit.prototype.plotMouseMoveHandler = function(e){
    var point = e.coordinate;
    var dx = point[0] - this.startPoint[0];
    var dy = point[1] - this.startPoint[1];
    var newPoints = [];
    for(var i=0; i<window._PlotEdit.ghostControlPoints.length; i++){
        var p = window._PlotEdit.ghostControlPoints[i];
        var coordinate = [p[0] + dx, p[1] + dy];
        newPoints.push(coordinate);
        var id = window._PlotEdit.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
        var overlay = window._PlotEdit.map.getOverlayById(id);
        overlay.setPosition(coordinate);
        overlay.setPositioning('center-center');
    }
    var plot = window._PlotEdit.activePlot.getGeometry();
    plot.setPoints(newPoints);
};

P.PlotEdit.prototype.plotMouseUpHandler = function(e){
    window._PlotEdit.enableMapDragPan();
    window._PlotEdit.map.off('pointerup', window._PlotEdit.plotMouseUpHandler);
    window._PlotEdit.map.off('pointerdrag', window._PlotEdit.plotMouseMoveHandler);
};

P.PlotEdit.prototype.disconnectEventHandlers = function () {
    this.map.off('pointermove', this.plotMouseOverOutHandler, this);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        this.controlPointMouseMoveHandler, false, this);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEUP,
        this.controlPointMouseUpHandler, false, this);
    this.map.off('pointerdown', this.plotMouseDownHandler, this);
    this.map.off('pointerup', this.plotMouseUpHandler, this);
    this.map.off('pointerdrag', this.plotMouseMoveHandler, this);
};

P.PlotEdit.prototype.deactivate = function(){
    this.activePlot = null;
    this.mouseOver = false;
    this.destroyHelperDom();
    this.disconnectEventHandlers();
    this.elementTable = {};
    this.activeControlPointId = null;
    this.startPoint = null;
};

P.PlotEdit.prototype.disableMapDragPan = function () {
    // var interactions = this.map.getInteractions();
    // var length = interactions.getLength();
    // for (var i = 0; i < length; i++) {
    //     var item = interactions.item(i);
    //     if (item instanceof ol.interaction.DragPan) {
    //         this.mapDragPan = item;
    //         item.setActive(false);
    //         break;
    //     }
    // }
};

P.PlotEdit.prototype.enableMapDragPan = function () {
    // if (this.mapDragPan != null) {
    //     this.mapDragPan.setActive(true);
    //     this.mapDragPan = null;
    // }
};

