const { createReadStream, createWriteStream } = require('fs');
const sharp = require('sharp');

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

(async function app() {
  const amt = new Array(100).fill(undefined);
  const generations = amt.map((_, idx) => createThumb(`/outputs/base-thumb-${idx}.jpg`));
  await Promise.all(generations);

  console.log('done');
})();