const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    console.log('📍 URL:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@')); // Oculta senha
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const connection = mongoose.connection;
    console.log('✅ MongoDB conectado com sucesso!');
    console.log('🏠 Host:', connection.host);
    console.log('📊 Database:', connection.name);
    console.log('🔌 Ready state:', connection.readyState);
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;