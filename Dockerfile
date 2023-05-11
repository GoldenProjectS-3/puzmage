FROM ubuntu:latest

COPY . /home/app
WORKDIR /home/app

EXPOSE 3306
EXPOSE 3004

RUN chmod +x ./launch.sh
RUN apt-get update
RUN apt-get install -y --no-install-recommends nodejs npm mariadb-server 
CMD ["./launch.sh"]
