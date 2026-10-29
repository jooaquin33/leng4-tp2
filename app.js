/** @typedef {import('leaflet')} */


const POSICION_INICIAL = [-24.728, -65.409];
const ZOOM_INICIAL = 15;


let map;
let markerActual = null;
let polylineRecorrido = null;
let historialCoordenadas = [];
let watchId = null;


const btnIniciar = document.getElementById('btnIniciar');
const btnDetener = document.getElementById('btnDetener');
const btnLimpiar = document.getElementById('btnLimpiar');
const listaPosiciones = document.getElementById('listaPosiciones');


function inicializarMapa() {
    map = L.map('map').setView(POSICION_INICIAL, ZOOM_INICIAL);

    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    
    polylineRecorrido = L.polyline([], {
        color: 'red',
        weight: 4,
        opacity: 0.8
    }).addTo(map);
}


function agregarPosicion(lat, lng) {
    const nuevaCoord = [lat, lng];
    historialCoordenadas.push(nuevaCoord);

   
    map.setView(nuevaCoord, 16);

    
    if (markerActual) {
        markerActual.setLatLng(nuevaCoord);
    } else {
        markerActual = L.marker(nuevaCoord).addTo(map);
    }

   
    polylineRecorrido.setLatLngs(historialCoordenadas);

  
    const index = historialCoordenadas.length - 1;
    const item = document.createElement('li');
    item.textContent = `#${index} -> Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    listaPosiciones.appendChild(item);
}


function iniciarSeguimiento() {
    if (!navigator.geolocation) {
        alert('Tu navegador no soporta geolocalización.');
        return;
    }

    btnIniciar.disabled = true;
    btnDetener.disabled = false;

    
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            agregarPosicion(latitude, longitude);
        },
        (error) => {
            console.error('Error al obtener ubicación:', error);
            alert('No se pudo obtener la ubicación. Verifica los permisos.');
            detenerSeguimiento();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


function detenerSeguimiento() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    btnIniciar.disabled = false;
    btnDetener.disabled = true;
}


function limpiarHistorial() {
    detenerSeguimiento();
    historialCoordenadas = [];
    polylineRecorrido.setLatLngs([]);
    listaPosiciones.innerHTML = '';

    if (markerActual) {
        map.removeLayer(markerActual);
        markerActual = null;
    }

    map.setView(POSICION_INICIAL, ZOOM_INICIAL);
}


btnIniciar.addEventListener('click', iniciarSeguimiento);
btnDetener.addEventListener('click', detenerSeguimiento);
btnLimpiar.addEventListener('click', limpiarHistorial);

window.addEventListener('DOMContentLoaded', inicializarMapa);