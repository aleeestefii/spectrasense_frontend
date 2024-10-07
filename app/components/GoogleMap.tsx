"use client";
/* THIS ARE EXAMPLES OF COORDINATES YOU CAN TRY OUT(or maybe do drop the googleman of a random area),:
NEW YORK
Latitud: 40.7128
Longitud: -74.0060

PARIS
Latitud:48.8575
Longitud: 2.3514

POSITANO
Latitud:40.6295
Longitud: 14.4823 */
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const convertToGMT = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toUTCString();
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    if (isNaN(n) || n < 0 || n > 255) {
      return '00'; // Valor por defecto si n no es un número válido
    }
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  console.log(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
const getAdditionalInfo = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get('YOUR_API_ENDPOINT', {
      params: {
        latitude,
        longitude,
      },
    });
    console.log('Additional Info:', response.data);
    // Do something with the response data, e.g., update state
  } catch (error) {
    console.error('Error fetching additional info:', error);
  }
};

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [latitude, setLatitude] = useState<string>(''); 
  const [longitude, setLongitude] = useState<string>(''); 
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [tileColors, setTileColors] = useState<string[]>(Array(9).fill('#A8C686')); // Initial placeholder colors
  const [sceneData, setSceneData] = useState<any>(null); // To store scene metadata
  const [scenePixel, setScenePixel] = useState<any>(null);
  const [cloud, setCloud] = useState<number>(20);

  useEffect(() => {
    // Fetch RGB data from the API for the tiles whenever latitude or longitude changes
    const fetchTileColors = async () => {
      try {
        const response = await axios.get('http://62.72.0.147:5010/landsat/image', {
          params: {
            latitude,
            longitude,
          },
          timeout: 150000,
        });

        console.log(response.data)

        const rgbData = response.data;

        if (Array.isArray(rgbData) && rgbData.length === 9) {
          const colors = rgbData.map((tile: { rgb: string }) => {
            // Use a regex to extract all numeric values from the 'rgb(...)' string
            const rgbString = tile.rgb.match(/\d+/g);
          
            if (!rgbString || rgbString.length !== 3) {
              console.error('Invalid RGB format:', tile.rgb);
              return '#000000'; // Return a default color if the format is invalid
            }
          
            // Convert the extracted strings to numbers
            const [r, g, b] = rgbString.map(Number);
          
            console.log(r, g, b); // Check extracted values
            return rgbToHex(r, g, b); // Convert to hexadecimal
          });
          setTileColors(colors);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching tile colors:', error);
      }
    };

    const fetchScenePixel = async () => {
      try {
        const response = await axios.get('http://62.72.0.147:5010/landsat/bands', {
          params: {
            latitude,
            longitude,
            cloudCoverThreshold: cloud
          },
          timeout: 150000,
        });
        
        console.log(response.data)

        setScenePixel(response.data);
      } catch (error) {
        console.error('Error fetching scene data:', error);
      }
    };

    const fetchSceneData = async () => {
      try {
        const response = await axios.get('http://62.72.0.147:5010/landsat/scene', {
          params: {
            latitude,
            longitude,
          },
          timeout: 150000,
        });
        
        console.log(response)

        setSceneData(response.data);
      } catch (error) {
        console.error('Error fetching scene data:', error);
      }
    };

    
    fetchScenePixel();
    fetchSceneData();
    fetchTileColors();
  }, [latitude, longitude, cloud]);


  // Sample random data for the chart
  const labels = ['Coastal Aerosol', 'Blue', 'Green', 'Red', 'NIR', 'SWIR 1', 'SWIR 2'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Surface Reflectance',
        data: [
          scenePixel?.['Coastal Aerosol'] ?? 0,
          scenePixel?.Blue ?? 0,
          scenePixel?.Green ?? 0,
          scenePixel?.Red ?? 0,
          scenePixel?.NIR ?? 0,
          scenePixel?.['SWIR 1'] ?? 0,
          scenePixel?.['SWIR 2'] ?? 0
        ],
        borderColor: '#388E3C',
        backgroundColor: '#8A9A5B',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Surface Reflectance Graph',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Band Number',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Surface Reflectance',
        },
      },
    },
  };
  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyB2h0tql0Zsc2Q5f9vfytHLUt3O_nQFs5Q',
      version: 'weekly',
      libraries: ['places'],
    });
  
    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
          });
  
          // Add an event listener for clicks when the human thn¿ings slides and lands on a ranndom point
          newMap.addListener('click', (event) => {
            const clickedLat = event.latLng.lat();
            const clickedLng = event.latLng.lng();
  
            setLatitude(clickedLat.toString());
            setLongitude(clickedLng.toString());

            if (map) {
              new google.maps.Marker({
                position: { lat: clickedLat, lng: clickedLng },
                map: newMap,
              });
            }
  
            // Center the map on the clicked location
            newMap.panTo(event.latLng);
  
            // Query additional information using the coordinates
            getAdditionalInfo(clickedLat, clickedLng);
          });
  
          // Create a StreetView service
          const streetView = newMap.getStreetView();
  
          // Add an event listener to detect changes in the Street View position
          streetView.addListener('position_changed', () => {
            const streetViewPosition = streetView.getPosition();
            if (streetViewPosition) {
              const streetLat = streetViewPosition.lat();
              const streetLng = streetViewPosition.lng();
  
              setLatitude(streetLat.toString());
              setLongitude(streetLng.toString());
  
              // Log or use the coordinates as needed
              console.log('Street View Coordinates:', { lat: streetLat, lng: streetLng });
  
              // Optionally, you can call `getAdditionalInfo` with the new coordinates
              getAdditionalInfo(streetLat, streetLng);
            }
          });
  
          setMap(newMap);
        }
      })
      .catch((e) => {
        console.error('Error loading Google Maps: ', e);
      });
  }, []);
  const handleSearch = async () => {
    if (latitude === '' || longitude === '') {
      alert('Por favor, introduzca tanto la latitud como la longitud');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Por favor, introduzca valores numéricos válidos para la latitud y la longitud');
      return;
    }

    if (map) {
      map.setCenter({ lat, lng });
      map.setZoom(8);
    }

  };


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#2F4F2F' }}>
      <div style={{
        padding: '20px',
        backgroundColor: '#00008B',
        color: 'white',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <h1 style={{
          flexGrow: 1,
          textAlign: 'left',
          margin: '0 20px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
          Mapa Integrado con Google Maps API
        </h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="latitude" style={{ marginBottom: '5px' }}>Latitud:</label>
            <input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitud (ej: 35.6764)"
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                color: '#78866B',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="longitude" style={{ marginBottom: '5px' }}>Longitud:</label>
            <input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitud (ej: 139.6500)"
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                color: '#78866B',
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6F8FAF',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2E7D32')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#388E3C')}
          >
            Buscar
          </button>
        </div>
      </div>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '80vh',
          borderTop: '2px solid #4CAF50',
        }}
      />

<div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#2F4F2F', backgroundColor: '#FFFFFF' }}>
      {/* 3x3 Pixel Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '5px', marginBottom: '20px' }}>
        {tileColors.map((color, index) => (
          <div
            key={index}
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: color,
              border: '2px solid #4A5D23',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#2F4F2F',
            }}
          >
          </div>
        ))}
      </div>

      {sceneData && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #4A5D23', borderRadius: '5px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ color: '#2F4F2F' }}>Data Acquired by Landsat 9</h3>
          <p><strong>Acquisition Time:</strong> {convertToGMT(sceneData.acquisition_date)}</p>
          <p><strong>Latitude:</strong> {latitude}</p>
          <p><strong>Longitude:</strong> {longitude}</p>
          <p><strong>WRS Path:</strong> {sceneData.wrs_path}</p>
          <p><strong>WRS Row:</strong> {sceneData.wrs_row}</p>
          <p><strong>Cloud Cover:</strong> {sceneData.cloud_cover}%</p>
          <p><strong>Image Quality:</strong> {sceneData.imageQuality} (from 0-9)</p>
        </div>
      )}

      {/* Surface Reflectance Table */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #4A5D23', borderRadius: '5px', backgroundColor: '#FFFFFF' }}>
        <h3 style={{ color: '#2F4F2F' }}>Surface Reflectance Data</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#8A9A5B', color: 'white' }}>
              <th style={{ border: '1px solid #4A5D23', padding: '8px' }}>Band Number</th>
              <th style={{ border: '1px solid #4A5D23', padding: '8px' }}>Surface Reflectance</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #4A5D23', padding: '8px' }}>{label}</td>
                <td style={{ border: '1px solid #4A5D23', padding: '8px' }}>{data.datasets[0].data[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Surface Reflectance Graph */}
      <div style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
        <h2 style={{ textAlign: 'center', color: '#2F4F2F' }}>Gráfica de Reflectancia Superficial</h2>
        <Line data={data} options={options} />
      </div>
    </div>
    </div>
  );
};

export default MapComponent;