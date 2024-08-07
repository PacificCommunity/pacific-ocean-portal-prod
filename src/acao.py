#!/usr/bin/python
#
# (c) 2012 Commonwealth of Australia
#     Australian Bureau of Meteorology, COSPPac COMP
#     All Rights Reserved
#
# Authors: Sheng Guo<sheng.guo@bom.gov.au>

import os
import sys
import cgi
import json
import urllib

from ocean import util
from ocean.config import get_server_config

config = get_server_config()

#if config['debug']:
#    import cgitb
#    cgitb.enable()

import cgitb
cgitb.enable()
if 'PORTALPATH' in os.environ:
    os.environ['PATH'] = os.environ['PORTALPATH']

def __main__():
    form = cgi.FieldStorage()

    response = []

    try:
        url = form['url'].value
    except KeyError:
        url = None

    etag = '"%s"' % util.__version__

    try:
        if os.environ['HTTP_IF_NONE_MATCH'] == etag:
            print 'Status: 304 Not Modified'
            print 'X-Portal-Version: %s' % util.__version__
            print
            return
    except KeyError:
        pass

    response = urllib.urlopen(url)
    data = json.loads(response.read())

    print 'Status: 200 Ok'
    print 'Content-Type: application/json; charset=utf-8'
    print 'ETag: %s' % etag
    print 'Cache-Control: max-age=3600' # FIXME: value?
    print 'X-Portal-Version: %s' % util.__version__
    print

    json.dump(data, sys.stdout)

if __name__ == '__main__':
    __main__()
