import { NextApiRequest, NextApiResponse } from 'next';
var ee = require('@google/earthengine'); //ya lo instalé y sigue con errores

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Autenticación de googleeartg
    ee.data.authenticateViaPrivateKey('/path/to/privatekey.json', () => {
      console.log('Authenticated');
    });

    // dsp de auth->peticiones
    const image = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_044034_20140318');
    const visParams = {min: 0, max: 3000, bands: ['B4', 'B3', 'B2']};
    const url = image.getThumbURL(visParams);
    
    res.status(200).json({ message: 'GEE API is working', url });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to GEE', error });
  }
}

  

