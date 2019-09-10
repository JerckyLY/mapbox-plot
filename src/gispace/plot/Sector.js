
P.Plot.Sector = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.SECTOR;
    this.fixPointCount = 3;
    this.setPoints(points);
};

goog.inherits(P.Plot.Sector, ol.geom.Polygon);

goog.mixin(P.Plot.Sector.prototype, P.Plot.prototype);

P.Plot.Sector.prototype.generate = function(){
    if(this.getPointCount()<2)
        return;
    if(this.getPointCount()==2)
        this.setCoordinates([this.points]);
    else{
        var pnts = this.getPoints();
        var center = pnts[0];
        var pnt2 = pnts[1];
        var pnt3 = pnts[2];
        var radius = P.PlotUtils.distance(P.PlotUtils.wgsToMercator(pnt2), P.PlotUtils.wgsToMercator(center));
        var startAngle = P.PlotUtils.getAzimuth(P.PlotUtils.wgsToMercator(pnt2), P.PlotUtils.wgsToMercator(center));
        var endAngle = P.PlotUtils.getAzimuth(P.PlotUtils.wgsToMercator(pnt3), P.PlotUtils.wgsToMercator(center));
        var pList = P.PlotUtils.getArcPoints(P.PlotUtils.wgsToMercator(center), radius, startAngle, endAngle);
        pList.push(center, pList[0]);
        this.setCoordinates([pList]);
    }
};