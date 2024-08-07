FROM ubuntu:16.04
MAINTAINER Sheng Guo <sheng.guo@bom.gov.au>

RUN apt-get -y update

#install Apache2
RUN apt-get -y install apache2

#install mapserver
RUN apt-get -y install cgi-mapserver

#install python and libraries
RUN apt-get -y install python2.7
RUN apt-get -y install python-numpy
RUN apt-get -y install python-scipy
RUN apt-get -y install python-netcdf4

RUN apt-get -y install python-matplotlib
RUN apt-get -y install python-mpltoolkits.basemap

#install git
RUN apt-get -y install git

#install gdal and gdal python
RUN apt-get -y install gdal-bin
RUN apt-get -y install python-gdal

#install pngcrush
RUN apt-get -y install pngcrush

#install vim if required
RUN apt-get -y install vim

#data download
RUN apt-get -y install lftp
RUN apt-get -y install wget 
RUN apt-get -y install nco 
RUN apt-get -y install sendmail-bin 
RUN apt-get -y install cron 

#copy apache2 config to the container
COPY docker/map-portal-apache.conf /etc/apache2/conf-available/
RUN ln -s /etc/apache2/conf-available/map-portal-apache.conf /etc/apache2/conf-enabled/map-portal-apache.conf

#copy ocean portal source to the container
RUN mkdir -p /git
WORKDIR /git 
COPY ./ /git/

#create ocean portal deployment folder and output folders
RUN mkdir -p /srv/map-portal
RUN mkdir -p /srv/raster/cache
RUN mkdir -p /srv/raster/logs
RUN mkdir -p /srv/raster/maptiles
RUN chmod 777 /srv/raster/cache
RUN chmod 777 /srv/raster/logs
RUN chmod 777 /srv/raster/maptiles
RUN chmod 777 /srv/raster

#temporary for mapserver debugging
#RUN touch /srv/raster/ms_error.txt
#RUN chmod 777 /srv/raster/ms_error.txt

#deploy the Ocean Portal in the container
RUN python setup.py build --compress install --root=/srv/map-portal/

#post deployment updates
COPY portal-lib /srv/map-portal/usr/local/share/portal-lib
COPY js/comp/dragdealer.js /srv/map-portal/usr/local/share/portal/js/comp/
COPY js/comp/Ocean.js /srv/map-portal/usr/local/share/portal/js/comp/
COPY portal /srv/map-portal/usr/local/share/portal

COPY crontab /etc/cron.d/crontab

#enable cgi in Apache
RUN a2enmod cgi

#listen to port 80
EXPOSE 80

#start Apache
#ENTRYPOINT /usr/sbin/apache2ctl -D FOREGROUND
CMD service apache2 start && \
    service cron start && \
    tail -F -n0 /etc/hosts
