import mongoose from 'mongoose';
import { DB_NAME } from '../contants';

const connectToDb = async () => {
    try {
        console.log('Connecting to database...');
        const connection = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(`Database Connected Successfully: `, connection.connection.name);
        console.log(`DB Host: ${connection.connection.host}`);
    } catch (error) {
        console.error('Error connecting to database: ');
        console.error('Error: ', error);
        process.exit(1);
    }
};

export default connectToDb;
