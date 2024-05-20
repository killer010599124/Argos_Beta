import MapboxDraw from "@mapbox/mapbox-gl-draw"


const drawGeoFence =
    new MapboxDraw({

        displayControlsDefault: false,
        // Select which mapbox-gl-draw control buttons to add to the map.
        controls: {
            polygon: true,
            trash: true
        },
        // Set mapbox-gl-draw to draw by default.
        // The user does not have to click the polygon control button first.
        defaultMode: 'draw_polygon'
    });


// const drawGeoFence = new MapboxDraw({
//     displayControlsDefault: false,
//     modes: {
//         ...MapboxDraw.modes,
//         'draw_rectangle_drag': mapboxGLDrawRectangleDrag
//     }
// });

export default drawGeoFence;