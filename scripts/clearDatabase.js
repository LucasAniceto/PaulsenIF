require('dotenv').config();
const mongoose = require('mongoose');

const clearDatabase = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🗑️  Limpando todas as collections...');
    
    // Limpar todas as collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`   ✅ Collection '${collection.name}' removida`);
    }
    
    console.log('🎉 Banco de dados limpo com sucesso!');
    console.log('📝 Próximo cliente será: cus_001');
    console.log('📝 Próxima conta será: acc_001');
    console.log('📝 Próxima transação será: txn_001');
    
  } catch (error) {
    if (error.code === 26) {
      console.log('ℹ️  Banco já estava vazio');
    } else {
      console.error('❌ Erro ao limpar banco:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão fechada');
    process.exit(0);
  }
};

clearDatabase();