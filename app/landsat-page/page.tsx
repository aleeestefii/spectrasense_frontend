// app/landsat-page.tsx
import React from 'react';
import MapComponent from '../components/GoogleMap';
import GraphLa from '../components/GraphLa';

const LandsatPage: React.FC = () => {
  return (
    <div>
      <MapComponent />
    </div>
  );
};

export default LandsatPage;