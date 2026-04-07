const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const r = await mongoose.connection.collection('restaurants').findOne({});
    const t = await mongoose.connection.collection('tables').findOne({ restaurant_id: r._id });

    console.log(`\nURL: http://localhost:5173/?r=${r._id.toString()}&t=${t._id.toString()}\n`);
    process.exit(0);
}

run().catch(console.error);
