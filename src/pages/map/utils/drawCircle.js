import MapboxDraw from "@mapbox/mapbox-gl-draw"

import {
    CircleMode,
    DragCircleMode,
    DirectMode,
    SimpleSelectMode
} from 'maplibre-gl-draw-circle';

const drawCircle = new MapboxDraw({
   
    // userProperties: true,
    modes: {
      ...MapboxDraw.modes,
      draw_circle  : CircleMode,
      drag_circle  : DragCircleMode,
      direct_select: DirectMode,
      simple_select: SimpleSelectMode
    }
  });
  export default drawCircle;

  
