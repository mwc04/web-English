const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔄 Đang kết nối đến MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@')); // Ẩn mật khẩu
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối thành công!');
    
    // Hiển thị thông tin database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Số collections: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối');
  } catch (error) {
    console.error('❌ Kết nối thất bại:', error.message);
  }
};

testConnection();