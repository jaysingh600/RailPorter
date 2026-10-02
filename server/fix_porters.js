const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/railporter').then(async () => {
  const db = mongoose.connection.collection('porterprofiles');
  const result = await db.updateMany(
    {}, 
    { $set: { verificationStatus: 'VERIFIED', availabilityStatus: 'AVAILABLE' } }
  );
  console.log('Updated porters:', result.modifiedCount);
  process.exit(0);
});
