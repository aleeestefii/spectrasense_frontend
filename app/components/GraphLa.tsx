"use client";
/*Funcitonality: Design and code from the graphs required for the analysis, where
is displayed the target pixel within a reference grid map of 3x3 pixels surrounding 
the target pixel, the Landsat scene metadata, the SR data in graphical form.*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

// To register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphLaProps {
  latitude: number;
  longitude: number;
}

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  console.log(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const GraphLa: React.FC<GraphLaProps> = ({ latitude, longitude }) => {
  const [tileColors, setTileColors] = useState<string[]>(Array(9).fill('#A8C686')); // Initial placeholder colors
  const [sceneData, setSceneData] = useState<any>(null); // To store scene metadata
  const [red, setRed] = useState<number>(0);
  const [green, setGreen] = useState<number>(0);
  const [blue, setBlue] = useState<number>(0);

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

        const rgbData = response.data;

        if (Array.isArray(rgbData) && rgbData.length === 9) {
          const colors = rgbData.map((tile: { rgb: string }) => {
            const [r, g, b] = tile.rgb.split(',').map(Number);
            setBlue(b + blue);
            setRed(r + red);
            setGreen(g + green);

            return rgbToHex(r, g, b);
          });
          setTileColors(colors);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching tile colors:', error);
      }
    };

    const fetchSceneData = async () => {
      try {
        const response = await axios.get('http://62.72.0.147:5010/landsat/scene', {
          params: {
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
          },
          timeout: 150000,
        });
        
        console.log(response)

        setSceneData(response.data);
      } catch (error) {
        console.error('Error fetching scene data:', error);
      }
    };

    fetchSceneData();
    fetchTileColors();
  }, [latitude, longitude]);

  // Sample random data for the chart
  const labels = ['Coastal Aerosol', 'Blue', 'Green', 'Red', 'NIR', 'SWIR 1', 'SWIR 2'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Surface Reflectance',
        data: [0.001, blue, green, red, 0.050, 0.025, 0.018],
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

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#2F4F2F', backgroundColor: '#FFFFFF' }}>
      {/* 3x3 Pixel Grid - Centralized for Swiss Design */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 100px)',
            gap: '5px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
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
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              {index === 4 ? 'Target Pixel' : `Pixel ${index + 1}`}
            </div>
          ))}
        </div>
      </div>

      {sceneData && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #4A5D23', borderRadius: '5px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ color: '#2F4F2F' }}>Data Acquired by Landsat 9</h3>
          <p><strong>Date Acquired:</strong> {sceneData.dateAcquired}</p>
          <p><strong>Acquisition Time:</strong> {sceneData.acquisitionTime} (need conversion from GMT)</p>
          <p><strong>Latitude:</strong> {latitude}</p>
          <p><strong>Longitude:</strong> {longitude}</p>
          <p><strong>WRS Path:</strong> {sceneData.wrsPath}</p>
          <p><strong>WRS Row:</strong> {sceneData.wrsRow}</p>
          <p><strong>Cloud Cover:</strong> {sceneData.cloudCover}%</p>
          <p><strong>Image Quality:</strong> {sceneData.imageQuality} (from 0-9)</p>
        </div>
      )}

      {/* Surface Reflectance Graph */}
      <div style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
        <h2 style={{ textAlign: 'center', color: '#2F4F2F' }}>Surface Reflectance Graph</h2>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default GraphLa;