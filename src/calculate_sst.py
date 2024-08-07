#!/usr/bin/python

import netCDF4 as nc
import datetime
"""
# TODO: remove hard coded paths...
anomaly_path = '/data/accesss/ssta/'  
climatology_path = '/data/reynolds/climatology/' 
anomaly_grid = anomaly_path + 'sst.forecast.anom.monthly.nc'

# Open the anomaly grid...
ds_anom = nc.Dataset(anomaly_grid, 'r+', format='NETCDF4')

times = ds_anom.variables["time"][:]
epoch = datetime.datetime(1970, 1, 1)

# SST Anomaly is called 'sst', so we will call the sst sstsst
if not 'sstsst' in ds_anom.variables:
    sstsst = ds_anom.createVariable('sstsst', 'float32', dimensions=('time', 'lat', 'lon'))
else:
    sstsst = ds_anom['sstsst']

for i, t in enumerate(times):
    month = (epoch + datetime.timedelta(int(t))).month
    clim_file = climatology_path + 'clim_rey_avhrr_v2_1990-2012.%02d.nc' % month
    ds_clim = nc.Dataset(clim_file)
    ds_anom['sstsst'][i,:,:] = ds_anom.variables['sst'][i,:,:] + \
        ds_clim.variables['sst'][0,:,:]

ds_anom.close()


"""


#import netCDF4 as nc
#import datetime

# TODO: remove hard coded paths...
anomaly_path = '/data/accesss/ssta/'  
climatology_path = '/data/reynolds/climatology/' 
anomaly_grid = anomaly_path + 'sst.forecast.anom.monthly.nc'

# Open the anomaly grid...
ds_anom = nc.Dataset(anomaly_grid, 'r+', format='NETCDF4')

times = ds_anom.variables["time"][:]
epoch = datetime.datetime(1970, 1, 1)

# SST Anomaly is called 'sst', so we will call the sst sstsst
if not 'sstsst' in ds_anom.variables:
    sstsst = ds_anom.createVariable('sstsst', 'float32', dimensions=('time', 'lat', 'lon'))
else:
    sstsst = ds_anom['sstsst']

for i, t in enumerate(times):
    month = (epoch + datetime.timedelta(int(t))).month
    clim_file = climatology_path + 'clim-oisst-avhrr-sst-v02r01_1982-2018.%02d.nc' % month
    ds_clim = nc.Dataset(clim_file)
    ds_anom['sstsst'][i,:,:] = ds_anom.variables['sst'][i,:,:] + \
        ds_clim.variables['sst'][0,:,:]

ds_anom.close()

