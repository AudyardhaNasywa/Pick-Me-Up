import Map from 'https://cdn.skypack.dev/ol/Map.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import { Icon, Style } from 'https://cdn.skypack.dev/ol/style.js';
import { fromLonLat } from 'https://cdn.skypack.dev/ol/proj.js'; // ✅ Impor yang benar

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
    ],
    view: new View({
        center: [0, 0],
        zoom: 2,
    }),
});

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
    source: vectorSource,
});
map.addLayer(vectorLayer);

export function getUserLocation() { // ✅ Ekspor fungsi agar bisa diakses dari index.html
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const coords = fromLonLat([longitude, latitude]); // ✅ Gunakan fromLonLat yang benar

                map.getView().setCenter(coords);
                map.getView().setZoom(15);

                const userLocation = new Feature({
                    geometry: new Point(coords),
                });

                userLocation.setStyle(
                    new Style({
                        image: new Icon({
                            src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                            scale: 0.05,
                        }),
                    })
                );

                vectorSource.clear();
                vectorSource.addFeature(userLocation);

                const locationInfo = await getLocationName(latitude, longitude);
                document.getElementById("location-info").innerText = locationInfo;
            },
            (error) => {
                console.error("Error mendapatkan lokasi:", error);
                document.getElementById("location-info").innerText =
                    "Gagal mendapatkan lokasi.";
            }
        );
    } else {
        document.getElementById("location-info").innerText =
            "Geolokasi tidak didukung pada perangkat ini.";
    }
}

async function getLocationName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await response.json();
        return data.display_name || "Lokasi tidak ditemukan";
    } catch (error) {
        console.error("Gagal mendapatkan nama lokasi:", error);
        return "Gagal mendapatkan nama lokasi";
    }
}
