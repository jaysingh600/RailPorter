const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Station = require('./models/Station');
const Platform = require('./models/Platform');
const PickupPoint = require('./models/PickupPoint');

dotenv.config();

const demoStations = [
  { name: 'Patna Junction', code: 'PNBE', city: 'Patna', state: 'Bihar', numberOfPlatforms: 10 },
  { name: 'New Delhi', code: 'NDLS', city: 'New Delhi', state: 'Delhi', numberOfPlatforms: 16 },
  { name: 'Howrah Junction', code: 'HWH', city: 'Kolkata', state: 'West Bengal', numberOfPlatforms: 23 },
  { name: 'Mumbai Central', code: 'MMCT', city: 'Mumbai', state: 'Maharashtra', numberOfPlatforms: 9 },
  { name: 'Bengaluru City', code: 'SBC', city: 'Bengaluru', state: 'Karnataka', numberOfPlatforms: 10 },
  { name: 'Chennai Central', code: 'MAS', city: 'Chennai', state: 'Tamil Nadu', numberOfPlatforms: 17 }
];

const defaultPickupPoints = [
  { name: 'Gate A', description: 'Main entrance gate' },
  { name: 'Main Staircase', description: 'Central staircase leading to bridge' },
  { name: 'Lift', description: 'Elevator near center' },
  { name: 'Waiting Area', description: 'Passenger waiting hall' },
  { name: 'Ticket Counter', description: 'Near unreserved ticketing' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing
    await Station.deleteMany({});
    await Platform.deleteMany({});
    await PickupPoint.deleteMany({});
    console.log('Cleared existing location data');

    // Insert Stations
    const stations = await Station.insertMany(demoStations);
    console.log(`Inserted ${stations.length} stations`);

    // For each station, insert platforms and pickup points
    for (let station of stations) {
      const platformsToInsert = [];
      // Create random number of platforms up to numberOfPlatforms (min 3)
      const platCount = Math.min(station.numberOfPlatforms, 5); 
      
      for (let i = 1; i <= platCount; i++) {
        platformsToInsert.push({
          station: station._id,
          platformNumber: i.toString(),
          name: `Platform ${i}`
        });
      }

      const platforms = await Platform.insertMany(platformsToInsert);

      // Add pickup points to each platform
      for (let platform of platforms) {
        const pickupsToInsert = defaultPickupPoints.map(pt => ({
          station: station._id,
          platform: platform._id,
          name: pt.name,
          description: pt.description
        }));
        await PickupPoint.insertMany(pickupsToInsert);
      }
    }

    console.log('Inserted Platforms and Pickup Points successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error with data seeding:', error);
    process.exit(1);
  }
};

seedDB();
