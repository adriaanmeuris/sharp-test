const { createReadStream, createWriteStream, writeFile } = require('fs/promises');
const { createHash } = require('node:crypto');
const sharp = require('sharp');

const simdEnabled = true;
sharp.simd(simdEnabled);

const EXPECTED_CHECKSUM = 'b2e6910051b05c7bcbb9ec1bacb62dfad77ed95c208500f66d7edfdff5056675';
const EXPECTED_CHECKSUM_NO_SIMD = '8543676fc6304ac7860a9c85a8a4a63fbca561681c57a4ae09fcbd67ca251576';

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function createThumbWithPipeline(outputPath) {
  const sharpOperations = sharp({
    failOn: 'none',
    limitInputPixels: false,
  });
  sharpOperations.flatten({ background: { r: 255, g: 255, b: 255 } });
  sharpOperations.resize({ width: 496, height: 702 });
  sharpOperations.jpeg({ quality: parseInt(80, 10) });

  await new Promise(((resolve, reject) => {
    let rs = createReadStream('./base.png')
    const ws = createWriteStream(outputPath, { encoding: 'binary' });
    rs.on('error', (err) => { reject(err); });
    ws.on('error', (err) => { reject(err); });
    ws.on('finish', () => { resolve(); });
    rs.pipe(sharpOperations).pipe(ws);
  }));

  console.log(`created thumb "${outputPath}"`);
}

async function createThumb(outputPath) {
  await sharp('./base.png', {
    failOn: 'none',
    limitInputPixels: false,
  })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: 496, height: 702 })
    .jpeg({ quality: parseInt(80, 10) })
    .toFile(outputPath);

  console.log(`created thumb "${outputPath}"`);
}

async function createThumbWithChecksum(outputPath) {
  // Generate thumb
  const buf = await sharp('./base.png', {
    failOn: 'none',
    limitInputPixels: false,
  })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: 496, height: 702 })
    .jpeg({ quality: parseInt(80, 10) })
    .toBuffer();

  // Write to disk if checksum doesn't match
  const checksum = simdEnabled ? EXPECTED_CHECKSUM : EXPECTED_CHECKSUM_NO_SIMD;
  if (sha256(buf) !== checksum) {
    console.log(`  ${outputPath}: issue with generation, saved to disk`);
    await writeFile(outputPath, buf);
  } else {
    console.log(`  ${outputPath}: generated correctly`);
  }
}

(async function app() {
  const amt = new Array(500).fill(undefined);
  const generations = amt.map((_, idx) => createThumbWithChecksum(`/outputs/base-thumb-${idx.toString().padStart(5, '0')}.jpg`));
  await Promise.all(generations);

  console.log('done');
})();