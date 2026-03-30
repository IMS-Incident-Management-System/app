cd /app
df -h
sudo docker info | grep -i "Docker Root Dir"
sudo docker-compose build --no-cache ims-backend 2>&1 | tee /tmp/build.log

tail -n 80 /tmp/build.log