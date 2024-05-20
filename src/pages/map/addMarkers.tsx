import { Popup, Marker, Map } from 'mapbox-gl';

export const addMarkers = (geodata: any, map: Map, handleLayerMarker: (marker: Marker) => void,
    updateMarkerCoordinates: (coord: any) => void, returnMarkerData: (data: any) => void, selectedMarkerImageFile: any,
    currentLayerName : string) => {

    const layerImage = ['gray', 'red', 'blue', 'green', 'black', 'yello', 'pink', 'purple']
    const randomNum = Math.floor(Math.random() * 7);
    // flyToStore(geodata.features[0]);
    const array = geodata.features.map((i: any, index: number) => {

        // let marker = new Marker;
        if (i) {
            const cheader = Object.keys(i.properties);
            let html = '';
            const values = i.properties;

            html += `<div style="background:black; color : white; opacity : 0.75; padding: 10px; border-radius: 10px;">`;
            const obj = cheader.reduce((object: any, header, index) => {
                html += `<div style="width:100%; display:flex">
                         <label for="name" style="width:40%; text-align:right; padding-right: 5px;" >${header} :</label>
                         <input type="text" value = "${values[header]}" style="width:60%; border: 0.01em solid white;" class = "${header}">
                     </div>
                     `
                object[header] = values[header];
                return object;
            }, {});
            html += `<div style="width:100%; display:flex">
                         <label for="name" style="width:40%; text-align:right; padding-right: 5px;" >Latitude :</label>
                         <input type="text" value = "${i.geometry.coordinates[1]}" style="width:60%; border: 0.01em solid white;" class = "latitude">
                     </div>`;
            html += `<div style="width:100%; display:flex">
                     <label for="name" style="width:40%; text-align:right; padding-right: 5px;" >Longtitude :</label>
                     <input type="text" value = "${i.geometry.coordinates[0]}" style="width:60%; border: 0.01em solid white;" class = "longtitude">
                 </div>`;
            html += `<div style = "display:flex; justify-content:space-around;">
            <button class='savemarker' > save </button>
            <button class='deletemarker' > delete </button>
            <button class='cancelmarker' > cancel </button>
          </div>`;

            const popUp = new Popup({ closeButton: false, anchor: 'left' })
                .setHTML(html);
            let valuelist: string[] = [];


            popUp.on('open', () => {
                for (let i = 0; i < cheader.length; i++) {
                    valuelist[i] = (document.getElementsByClassName(cheader[i])[0] as HTMLInputElement).getAttribute('value') as string;
                }
                valuelist[cheader.length] = (document.getElementsByClassName('latitude')[0] as HTMLInputElement).getAttribute('value') as string;
                valuelist[cheader.length + 1] = (document.getElementsByClassName('longtitude')[0] as HTMLInputElement).getAttribute('value') as string;
            });


            popUp.on('close', () => {
                setTimeout(() => {
                    if (!document.getElementsByClassName('mapboxgl-popup')[0]) {

                        marker.setLngLat([Number(valuelist[cheader.length + 1]), Number(valuelist[cheader.length])])
                    }
                }, 10);
            });

            const el = document.createElement('img');
            el.setAttribute('src', selectedMarkerImageFile);
            el.setAttribute('style', 'width:30px; height:30px; border-radius:5px');
            
            el.setAttribute('class' , `${currentLayerName}qwer`);
            // el.className = '    ';


            const marker = new Marker(el, { scale: 0.5 })

                .setDraggable(false)
                .setLngLat(i.geometry.coordinates)
                .setPopup(popUp)
                .addTo(map)
                .on('drag', (event: any) => {
                    // console.log(event.target._lngLat)
                    updateMarkerCoordinates(event.target._lngLat);
                })

            marker.getElement().addEventListener('mouseup', (e) => {
                marker.setDraggable(false);
                if (!document.getElementsByClassName('mapboxgl-popup')[0]) {
                    setTimeout(() => {
                        for (let i = 0; i < cheader.length; i++) {
                            (document.getElementsByClassName(cheader[i])[0] as HTMLInputElement).value = valuelist[i]
                        }
                        (document.getElementsByClassName('latitude')[0] as HTMLInputElement).value = valuelist[cheader.length];
                        (document.getElementsByClassName('longtitude')[0] as HTMLInputElement).value = valuelist[cheader.length + 1];
                    }, 10)
                }
            })

            marker.getElement().addEventListener('mousedown', (e) => {
                if (document.getElementsByClassName('mapboxgl-popup')[0]) {
                    marker.setDraggable(true);
                }
            })

            marker.getElement().addEventListener('click', (e) => {
                {
                    
                    handleLayerMarker(marker);

                    returnMarkerData({ data: obj, id: index });

                    map.flyTo({
                        center: marker.getLngLat(),
                        zoom: 24
                    });

                }
            }, false);
        }

    }

    );
    function deleteMarker() {
        alert('delete');
    }
    function flyToStore(currentFeature: any) {
        map.flyTo({
            center: currentFeature.geometry.coordinates,
            zoom: 18
        });
    }
}