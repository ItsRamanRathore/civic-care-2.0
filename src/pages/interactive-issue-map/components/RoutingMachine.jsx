import { createControlComponent } from "@react-leaflet/core";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

/**
 * Custom Leaflet Routing Machine component for React Leaflet v4
 */
const createRoutingMachineLayer = ({ waypoints }) => {
  if (!L.Routing || !L.Routing.control) {
    console.error('❌ Leaflet Routing Machine not found! L.Routing is missing.');
    return new L.Control();
  }

  const validWaypoints = (waypoints || []).filter(wp => wp && wp.lat && wp.lng);
  if (validWaypoints.length < 2) return null;

  const instance = L.Routing.control({
    waypoints: validWaypoints.map(wp => L.latLng(wp.lat, wp.lng)),
    lineOptions: {
      styles: [{ color: "#2563EB", weight: 6, opacity: 0.8 }]
    },
    show: false, // Don't show the default instructions panel on the map
    addWaypoints: false,
    routeWhileDragging: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    createMarker: () => null // We'll use our own markers
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;
