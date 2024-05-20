import { Map } from 'mapbox-gl';


export const initMap = (container: HTMLDivElement, coords: [number, number], mapStyle : string) => {
    
    return new Map({
        container : container,
        style: mapStyle,
        center: coords,
        zoom: 2,
        accessToken: "pk.eyJ1Ijoib2FrdHJlZWFuYWx5dGljcyIsImEiOiJjbGhvdWFzOHQxemYwM2ZzNmQxOW1xZXdtIn0.JPcZgPfkVUutq8t8Z_BaHg",
        doubleClickZoom: false,
      
        
    });
    
}