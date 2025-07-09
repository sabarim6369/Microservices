
const mongoose=require('mongoose');
const connect=()=>{
    mongoose.connect('mongodb://localhost:27017/productservice');
    console.log('Connected to Product Service Database');
    mongoose.connection.on('error', (err) => {
        console.error('Database connection error:', err);
    });
}
export default connect