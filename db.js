import mongoose from 'mongoose'

const Connection = async (URI) => {
    
    try {
        await mongoose.connect(URI)
        console.log('Db connected successfully');
    } catch (error) {
        console.log('Error while connecting to db:',error.message);
    }
}
export default Connection;
