
P.Event.PlotEditEvent = function(type, feature){
    goog.base(this, type);
    this.feature = feature;
};

goog.inherits(P.Event.PlotEditEvent, goog.events.Event);

P.Event.PlotEditEvent.EDIT_START = "edit_start";
P.Event.PlotEditEvent.EDIT_END = "edit_end";

P.Event.PlotEditEvent.DRAG_POINT_MOVING = 'drag_point_moving';
P.Event.PlotEditEvent.DRAG_POINT_END = 'drag_point_end'
P.Event.PlotEditEvent.DRAG_PLOT_MOVING = 'drag_plot_moving';
P.Event.PlotEditEvent.DRAG_PLOT_END = 'drag_plot_end';