
P.Utils = {
    _stampId: 0
};

P.Utils.trim = function(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
};

P.Utils.stamp = function(obj) {
    var key = '_p_id_';
    obj[key] = obj[key] || this._stampId++;
    return obj[key];
};
P.Utils.uuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid
}
P.Utils.getFeatureType = function (type) {
    switch (type){
        case P.PlotTypes.ARC:
            return 'LineString';
        case P.PlotTypes.ELLIPSE:
            return 'Polygon';
        case P.PlotTypes.CURVE:
            return 'LineString';
        case P.PlotTypes.CLOSED_CURVE:
            return 'Polygon';
        case P.PlotTypes.LUNE:
            return 'Polygon';
        case P.PlotTypes.SECTOR:
            return 'Polygon';
        case P.PlotTypes.GATHERING_PLACE:
            return 'Polygon';
        case P.PlotTypes.STRAIGHT_ARROW:
            return 'LineString';
        case P.PlotTypes.ASSAULT_DIRECTION:
            return 'Polygon';
        case P.PlotTypes.ATTACK_ARROW:
            return 'Polygon';
        case P.PlotTypes.FINE_ARROW:
            return 'Polygon';
        case P.PlotTypes.CIRCLE:
            return 'Polygon';
        case P.PlotTypes.DOUBLE_ARROW:
            return 'Polygon';
        case P.PlotTypes.TAILED_ATTACK_ARROW:
            return 'Polygon';
        case P.PlotTypes.SQUAD_COMBAT:
            return 'Polygon';
        case P.PlotTypes.TAILED_SQUAD_COMBAT:
            return 'Polygon';
        case P.PlotTypes.FREEHAND_LINE:
            return 'LineString';
        case P.PlotTypes.FREEHAND_POLYGON:
            return 'Polygon';
        case P.PlotTypes.POLYGON:
            return 'Polygon';
        case P.PlotTypes.MARKER:
            return 'Point';
        case P.PlotTypes.RECTANGLE:
            return 'Polygon';
        case P.PlotTypes.POLYLINE:
            return 'LineString';
    }
};

P.Utils.handleArray = function (arr,type) {
    var array = []
    if(type === 'Point'){
        array = arr
    }else if(type === "Polygon"){
        var data = []
        for (var i =0;i<arr.length;i++){
            if(i%2>0){
                data.push([arr[i-1],arr[i]])
            }
        }
        data.push(data[0])
        array.push(data)
    }else{
        for (var i =0;i<arr.length;i++){
            if(i%2>0){
                array.push([arr[i-1],arr[i]])
            }
        }
    }
    return array
}
