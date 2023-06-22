# Reproduction of issue

Run `./docker-dev.sh` or `npm run dev`. This will generate 100 thumbnails in the `outputs` directory.

In `index.js` you can choose to generate thumbs using `toFile` or using a processing pipeline and read/write streams. Both approaches seem to have different results.

In `Dockerfile` you can enable the `jemalloc` memory allocator as explained here: https://sharp.pixelplumbing.com/install#linux-memory-allocator.

You can also switch from `base-glibc` to `base-musl` to use musl-based Linux (which doesn't produce any artifacts).
