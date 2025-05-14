const fs = require('fs');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

(async () => {
  const rawText = fs.readFileSync('./data/gale_medicine.txt', 'utf-8');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.createDocuments([rawText]);

  fs.writeFileSync('./data/chunks.json', JSON.stringify(chunks, null, 2));
  console.log(`Chunks saved: ${chunks.length}`);
})();
