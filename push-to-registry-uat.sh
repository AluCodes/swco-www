docker build --platform linux/amd64 -t share-and-work -f Dockerfile.uat .
docker tag share-and-work asia-southeast1-docker.pkg.dev/pixelcollab/share-and-work/web-image-uat:latest
cat pixelcollab-registry-writer.json | docker login -u _json_key --password-stdin https://asia-southeast1-docker.pkg.dev
docker push asia-southeast1-docker.pkg.dev/pixelcollab/share-and-work/web-image-uat:latest