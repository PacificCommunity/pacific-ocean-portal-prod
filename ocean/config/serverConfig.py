#
# (c) 2012 Commonwealth of Australia
#     Australian Bureau of Meteorology, COSPPac COMP
#     All Rights Reserved
#
# Author: Sheng Guo <s.guo@bom.gov.au>
#         Danielle Madeley <d.madeley@bom.gov.au>

"""
Store the server specific configurations

Don't import config directly, use ocean.config.get_server_config()
"""

from ocean.config import BaseConfig

class default(BaseConfig):
    """
    Default server config. Inherit this class to set per-server config.
    """

    # path on web server
    baseURL = '/portal/'

    # relative path to rasters
    rasterURL = 'raster/'

    # path on disk to output rasters/caches
    outputDir = '/data/comp/raster/'

    # relative path to caches (relative to rasterURL) (obsolete?)
    cacheDir = {
        'reynolds': 'cache/reynolds/',
        'ersst': 'cache/ersst/',
    }

    dataDir = {}

    mapservPath = '/usr/libexec/mapserv'
    debug = False
    profile = False

class localhost(default):
    debug = True
    mapservPath = '/usr/libexec/mapserver'
    dataDir = {
        'bran': '/data/blue_link/data/',
        'ersst': '/data/sst/ersst/data/',
        'reynolds': '/data/sst/reynolds/',
        'sealevel': '/data/sea_level/',
        'msla': '/data/sea_level/',
        'ww3': '/data/wavewatch3/',
        'coral':'/data/coral/',
        'poamasla':'/data/poama/',
	'accesssssta': '/data/accesss/',
        'oceanmaps':'/data/oceanmaps/',
        'chloro':'/data/chloro/',
        'currents':'/data/currents/',
        'ww3forecast':'/data/wavewatch3/forecast/',
        'mur':'/data/sst/mur/'
    }

class tucson(default):
    debug = True 
    mapservPath = '/usr/lib/cgi-bin/mapserv'
    outputDir = '/srv/raster/'
    dataDir = {
        'bran': '/data/bran/',
        'ersst': '/data/ersst/',
        'reynolds': '/data/reynolds/',
        'sealevel': '/data/sea_level/',
        'msla': '/data/sea_level/',
        'ww3': '/data/wavewatch3/',
        'coral':'/data/coral/',
        'coral_ol':'/data/coral/',
        'poamasla':'/data/poama/',
	'accesssssta': '/data/accesss/',
        'oceanmaps':'/data/oceanmaps/',
        'chloro':'/data/chloro/',
        'currents':'/data/currents/',
        'ww3forecast':'/data/wavewatch3/forecast/',
	'mur':'/data/mur/'
    }

__version__ = '1.0.2-7-g9c14b4b-modified'
