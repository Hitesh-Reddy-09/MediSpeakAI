const { QdrantClient } = require('@qdrant/js-client-rest');
const { pipeline } = require('@xenova/transformers');
const fs = require('fs');

// Initialize client
const qdrant = new QdrantClient({ url: 'https://your-qdrant-url', apiKey: 'YOUR_QDRANT_API_KEY' });

// Initialize embeddings
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Load chunks
const chunks = JSON.parse(fs.readFileSync('./data/chunks.json', 'utf-8'));

(async () => {
  // Create collection
  await qdrant.createCollection('gale_medicine', { vectors: { size: 384, distance: 'Cosine' } });

  // Embed and upload
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedder(chunks[i].pageContent, { pooling: 'mean', normalize: true });
    await qdrant.upsert('gale_medicine', {
      points: [{
        id: i,
        vector: embedding.data[0],
        payload: { text: chunks[i].pageContent },
      }],
    });
  }

  console.log('Uploaded to Qdrant.');
})();
