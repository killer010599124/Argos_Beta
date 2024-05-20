import {
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { LngLat, Map, Marker } from "mapbox-gl";
import { initMap } from "./initMap";
import { generateOneMarker } from "./createOneMarker";
import mapboxgl from "mapbox-gl";
import Geocoder from "./utils/Geocoder";
// import drawGeoFence from './drawGeoFence';
import drawGeoFence from "./utils/drawGeoFence";
import drawCircle from "./utils/drawCircle";
import drawRect from "./utils/drawRect";
import { Popup } from "mapbox-gl";
export const useMap = (
  container: React.RefObject<HTMLDivElement>,
  addDataLayerController: boolean,
  initialLoadingFlag: boolean,
  geoStyleName: string,
  layerName: string,
  currentLayerName: string,
  geodata: any,
  allGeodata: any,
  drawMode: string,
  layerVisible: any[]
) => {
  const mapInitRef = useRef<Map | null>(null);

  const [currentLayerGeoData, setCurrentLayerGeoData] = useState<any>();

  const [rect, setRect] = useState(false);
  const [circle, setCircle] = useState(false);
  const [polygon, setPolygon] = useState(false);

  useEffect(() => {
    if (container.current) {
      mapInitRef.current = initMap(
        container.current,
        [-100.2419063199852, 25.17901932031443],
        "mapbox://styles/mapbox/satellite-streets-v12"
      );
      mapInitRef.current.addControl(Geocoder);

    }
    return () => mapInitRef.current?.remove();
  }, []);

  const popUp = new Popup({ closeButton: false, anchor: "left" });

  useEffect(() => {
    //   alert(drawMode);

    if (drawMode === "Circle") {
      // mapInitRef.current?.removeControl(drawRect)
      // mapInitRef.current?.removeControl(drawCircle);
      if (rect) {
        mapInitRef.current?.removeControl(drawRect);
        setRect(false);
      }
      if (circle) {
        mapInitRef.current?.removeControl(drawCircle);
        setCircle(false);
      }
      if (polygon) {
        mapInitRef.current?.removeControl(drawGeoFence);
        setPolygon(false);
      }

      mapInitRef.current?.addControl(drawCircle);
      drawCircle.changeMode("draw_circle", { initialRadiusInKm: 5 });
      setCircle(true);
    } else if (drawMode === "RECT") {
      if (rect) {
        mapInitRef.current?.removeControl(drawRect);
        setRect(false);
      }
      if (circle) {
        mapInitRef.current?.removeControl(drawCircle);
        setCircle(false);
      }
      if (polygon) {
        mapInitRef.current?.removeControl(drawGeoFence);
        setPolygon(false);
      }

      mapInitRef.current?.addControl(drawRect);
      drawRect.changeMode("draw_rectangle_drag");

      setRect(true);
    } else if (drawMode === "Polygon") {
      if (rect) {
        mapInitRef.current?.removeControl(drawRect);
        setRect(false);
      }
      if (circle) {
        mapInitRef.current?.removeControl(drawCircle);
        setCircle(false);
      }
      if (polygon) {
        mapInitRef.current?.removeControl(drawGeoFence);
        setPolygon(false);
      }
      mapInitRef.current?.addControl(drawGeoFence);
      // drawRect.changeMode('draw_rectangle_drag');
      setPolygon(true);
    }
  }, [drawMode]);

  useEffect(() => {
    if (geodata) {
      console.log("4");
      setCurrentLayerGeoData(geodata);
      mapInitRef.current?.flyTo({
        center: geodata.features[0].geometry.coordinates,
        zoom: 5,
      });

      mapInitRef.current?.addSource(currentLayerName, {
        type: "geojson",
        data: geodata,
      });
      // Add a symbol layer

      mapInitRef.current?.addLayer({
        id: currentLayerName,
        type: "circle",
        source: currentLayerName,
        paint: {
          "circle-radius": 5,
          "circle-stroke-width": 2,
          "circle-color": "red",
          "circle-stroke-color": "white",
        },
        layout: {
          visibility: "visible",
        },
      });

      if (
        layerVisible.find((obj) => obj.layerName === currentLayerName).visible
      ) {
        mapInitRef.current?.setLayoutProperty(
          layerName,
          "visibility",
          "visible"
        );
      } else
        mapInitRef.current?.setLayoutProperty(
          currentLayerName,
          "visibility",
          "none"
        );
    }
  }, [addDataLayerController]);

  useEffect(() => {
    if (layerVisible) {
      layerVisible.map((obj) => {
        if (obj.visible)
          mapInitRef.current?.setLayoutProperty(
            obj.layerName,
            "visibility",
            "visible"
          );
        else
          mapInitRef.current?.setLayoutProperty(
            obj.layerName,
            "visibility",
            "none"
          );
      });
    }
  }, [layerVisible]);

  useEffect(() => {
    if (allGeodata.length != 0) {
      // console.log("1")
      setCurrentLayerGeoData(allGeodata[0].data);
      allGeodata.map((data: any, index: any) => {
        mapInitRef.current?.flyTo({
          center: data.data.features[0].geometry.coordinates,
          zoom: 20,
        });
        mapInitRef.current?.addSource(data.name, {
          type: "geojson",
          data: data.data,
        });
        // Add a symbol layer
        mapInitRef.current?.addLayer({
          id: data.name,
          type: "circle",
          source: data.name,
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "red",
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });
      });
    }
  }, [initialLoadingFlag]);

  useEffect(() => {
    if (currentLayerName && container.current) {
      allGeodata.map((data: any, index: any) => {
        if (data.name === currentLayerName) {
          // console.log(data.data)
          setCurrentLayerGeoData(data.data);
          mapInitRef.current!.flyTo({
            center: data.data.features[0].geometry.coordinates,
            zoom: 5,
          });
        }
      });
    }
  }, [currentLayerName]);

  useEffect(() => {
    if (currentLayerGeoData && currentLayerName) {
      mapInitRef.current?.on("click", currentLayerName, (e: any) => {
        if (mapInitRef.current)
          mapInitRef.current.getCanvas().style.cursor = "pointer";


        const elementsToRemove = document.querySelectorAll(".mapboxgl-popup");

        elementsToRemove.forEach((element) => {
          element.remove();
        });
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const values = e.features[0].properties;
        const cheader = Object.keys(values);
        let html = "";
        // const values = i.properties;

        html += `<div style="background:black; color : white; opacity : 0.75; padding: 10px; border-radius: 10px;">`;
        const obj = cheader.reduce((object: any, header, index) => {
          html += `<div style="width:100%; display:flex">
                             <label for="name" style="width:40%; text-align:right; padding-right: 5px;" >${header} :</label>
                             <input type="text" value = "${values[header]}" style="width:60%; border: 0.01em solid white;" class = "${header}">
                         </div>
                         `;
          object[header] = values[header];
          return object;
        }, {});
        html += `<div style="width:100%; display:flex">
                             <label for="name" style="width:40%; text-align:right; padding-right: 5px;" >Latitude :</label>
                             <input type="text" value = "${coordinates[1]}" style="width:60%; border: 0.01em solid white;" class = "latitude">
                         </div>`;
        html += `<div style="width:100%; display:flex">
                         <label for="name" style="width:40%; text-align:right; padding-right: 5px;" >Longtitude :</label>
                         <input type="text" value = "${coordinates[0]}" style="width:60%; border: 0.01em solid white;" class = "longtitude">
                     </div>`;
        html += `<div style = "display:flex; justify-content:space-around;">
                     <button class='savemarker' > save </button>
                     <button class='deletemarker' > delete </button>
                     <button class='cancelmarker' > cancel </button>
                   </div>`;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popUp.setLngLat(coordinates).setHTML(html).addTo(mapInitRef.current!);

      });
    }
  }, [currentLayerGeoData]);

  useEffect(() => {
    mapInitRef.current?.on("style.load", () => {
      if (currentLayerGeoData) {
        mapInitRef.current?.addSource(currentLayerName, {
          type: "geojson",
          data: currentLayerGeoData,
        });
        // Add a symbol layer

        mapInitRef.current?.addLayer({
          id: currentLayerName,
          type: "circle",
          source: currentLayerName,
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "red",
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
            // 'icon-image': layerName,

            // 'text-font': [
            //     'Open Sans Semibold',
            //     'Arial Unicode MS Bold'
            // ],
            // 'text-offset': [0, 1.25],
            // 'text-anchor': 'top'
          },
        });
      }
    });
  }, [currentLayerGeoData]);


  useEffect(() => {
    if (container.current) {
      console.log(currentLayerName);
      mapInitRef.current?.setStyle(geoStyleName);
    }
  }, [geoStyleName]);



};
