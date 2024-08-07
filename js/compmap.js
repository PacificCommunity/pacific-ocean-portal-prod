/*
 * (c) 2012 Commonwealth of Australia
 * Australian Bureau of Meteorology, COSPPac COMP
 * All Rights Reserved
 */

var ocean=ocean||{};var map;jQuery.cachedScript=function(url,options){options=$.extend(options||{},{dataType:"script",cache:true,url:url});return jQuery.ajax(options);};function fatal_error(msg)
{$('#error-dialog-content').html(msg);$('#error-dialog-request').hide();$('#error-dialog').dialog('option',{'modal':true,'dialogClass':'notitle','closeOnEscape':false});$('#error-dialog').dialog('open');}
function maybe_close_loading_dialog()
{if(ocean.mapLoading||ocean.outputsLoading>0)
return;$('#loading-dialog').dialog('close');}
window.onerror=function(msg,url,line){fatal_error("Javascript error: "+msg+" &mdash; please "+'<a href="javascript:location.reload()">'+"reload</a> your browser."+"<br/><small>"
+url+":"+line+"</small>");return false;}
$(function(){$('.dialog').dialog({autoOpen:false,resizable:false});$('#loading-dialog').dialog('option',{'modal':true,'dialogClass':'notitle','closeOnEscape':false,'height':60,'resizable':false});createMap();resetLegend();});function createMap(){var southWest=L.latLng(-100,110),northEast=L.latLng(90,290),bounds=L.latLngBounds(southWest,northEast);map=L.map('map',{maxBounds:bounds,minZoom:3,maxZoom:8,zoom:3,zoomAnimation:true,crs:L.CRS.EPSG4326});map.on('popupclose',function(e){if(ocean.dataset&&ocean.dataset.clickLatLng){ocean.dataset.clickLatLng=null;}});ocean.bathymetryLayer=L.tileLayer.wms("cgi/map.py?map=bathymetry",{layers:'bathymetry,land',format:'image/png',transparent:true,attribution:'<a href="http://www.naturalearthdata.com/about/" title="About Natural Earth">Made with Natural Earth</a>, <a href="http://www.marineregions.org/disclaimer.php" title="EEZ boundaries">Marineregions</a>'}).addTo(map);ocean.greylandLayer=L.tileLayer.wms("cgi/map.py?map=bathymetry",{layers:'greyland,greyland_n',format:'image/png',transparent:true,zIndex:1000,attribution:'<a href="http://www.naturalearthdata.com/about/" title="About Natural Earth">Made with Natural Earth</a>'}).addTo(map);ocean.greylandLayer.setOpacity(0.0);ocean.eezLayer=L.tileLayer.wms("cgi/map.py?map=bathymetry",{layers:'maritime,countries',format:'image/png',transparent:true,zIndex:1010,attribution:'<a href="http://www.naturalearthdata.com/about/" title="About Natural Earth">Made with Natural Earth</a>, <a href="http://www.marineregions.org/disclaimer.php" title="EEZ boundaries">Marineregions</a>'}).addTo(map);ocean.resultLayer=L.tileLayer.wms("cgi/map.py?map=result",{layers:'plot',format:'image/png',transparent:true,zIndex:900,continuousWorld:true});ocean.resultLayer.on('loading',function(e){$('#loading-dialog').dialog('open');});ocean.resultLayer.on('load',function(e){$('#loading-dialog').dialog('close');});ocean.resultOverlayLayer=L.tileLayer.wms("cgi/map.py?map=result",{layers:'plot',format:'image/png',transparent:true,zIndex:910,continuousWorld:true});ocean.frontOverlayLayer=L.tileLayer.wms("cgi/map.py?map=result",{layers:'plot',format:'image/png',transparent:true,zIndex:920});ocean.resultOverlay2Layer=L.tileLayer.wms("cgi/map.py?map=result",{layers:'plot',format:'image/png',transparent:true,zIndex:915,continuousWorld:true});L.control.scale({imperial:false}).addTo(map);var cursorLocation=L.Control.extend({options:{position:'topright'},onAdd:function(map){ var container=L.DomUtil.create('div','cursorLocation');return container;}});map.addControl(new cursorLocation());map.on('mousemove',function(e){$('.cursorLocation').html(e.latlng.lat.toPrecision(6)+', '+e.latlng.lng.toPrecision(6));});ocean.mapObj=map;ocean.overlayGroup=L.layerGroup().addTo(map);}
function _updateDisabled()
{window.setTimeout(function(){var disable=$('.outputgroup input[type=radio]').length<1;var radio=$('#mapControls .baseLayersDiv input[value="Output"]');radio.attr('disabled',disable);},5);}
function selectMapLayer(name)
{_updateDisabled();}
function updateMap(data,bounds){var imageUrl=data,imageBounds=[[-90,110],[90,290]]
if(bounds){imageBounds=bounds}
if(ocean.imageOverlay){ocean.overlayGroup.removeLayer(ocean.imageOverlay);}
ocean.imageOverlay=L.imageOverlay(imageUrl,imageBounds);$.ajax({url:data,success:function(data,textStatus,jqXHR){ocean.overlayGroup.addLayer(ocean.imageOverlay);ocean.imageOverlay.setOpacity(1.0);ocean.greylandLayer.setOpacity(1.0);ocean.bathymetryLayer.setOpacity(0.0);},error:function(jqXHR,textStatus,errorThrown){if(typeof(data)=="string"){show_error(data,jqXHR.statusText);resetMap();resetLegend();}}});}
function hasResultOverlay(){return ocean.overlayGroup.hasLayer(ocean.resultLayer);}
function updateMapTiles(mapname,mapimg,overlayimg,overlaymap){ocean.resultLayer.setUrl('cgi/map.py?map='+mapname+'&mapimg='+mapimg);ocean.overlayGroup.addLayer(ocean.resultLayer);if(overlayimg){if(overlaymap){ocean.frontOverlayLayer.setUrl('cgi/map.py?map='+overlaymap+'&mapimg='+overlayimg);ocean.overlayGroup.addLayer(ocean.frontOverlayLayer);}
else{ocean.resultOverlayLayer.setUrl('cgi/map.py?map=grey&mapimg='+overlayimg);ocean.overlayGroup.addLayer(ocean.resultOverlayLayer);}}
ocean.greylandLayer.setOpacity(1.0);ocean.bathymetryLayer.setOpacity(0.0);}
function updateMapTilesSst(mapname,mapimg,overlayimg,overlay2img){ocean.resultLayer.setUrl('cgi/map.py?map='+mapname+'&mapimg='+mapimg);ocean.overlayGroup.addLayer(ocean.resultLayer);if(overlayimg){ocean.resultOverlayLayer.setUrl('cgi/map.py?map=contour&mapimg='+overlayimg);ocean.overlayGroup.addLayer(ocean.resultOverlayLayer);}
if(overlay2img){ocean.resultOverlay2Layer.setUrl('cgi/map.py?map=normal&mapimg='+overlay2img);ocean.overlayGroup.addLayer(ocean.resultOverlay2Layer);}
ocean.greylandLayer.setOpacity(1.0);ocean.bathymetryLayer.setOpacity(0.0);}
function show_error(url,text)
{text="The image "+url+" is "+text.toLowerCase()+".";$('#error-dialog-status').html("<b>Error:</b>");$('#error-dialog-content').html(text);$('#error-dialog-request').prop('href',url);$('#error-dialog-report-back').show();$('#error-dialog').dialog('open');}
function resetMap(){ocean.overlayGroup.clearLayers();ocean.bathymetryLayer.setOpacity(1.0);ocean.greylandLayer.setOpacity(0.0);}
function resetLegend(){ ocean.map_scale='images/bathymetry_ver.png';$('#legendDiv').empty().append($('<img>',{src:ocean.map_scale,alt:'Legend'}));}
function setLegend(legendUrl){$('#legendDiv img').attr('src',legendUrl);}
function prependOutputSet()
{while($('#outputDiv div.outputgroup').length>=ocean.compare.limit){$('#outputDiv div.outputgroup:last').remove();}
var div=$('<div>',{'class':'outputgroup'}).prependTo($('#outputDiv'));$('<span>',{'class':'close-button ui-icon ui-icon-close',title:"Remove",click:function(){if(div.find(':checked').length>0){div.find(':checked').remove();$('.outputgroup input[type=radio]:first').attr('checked',true).change();}
div.fadeTo('fast',0);div.slideUp('fast',function(){div.remove();});}}).appendTo(div);$('<p>',{'class':'date',text:new Date().toLocaleTimeString()}).appendTo(div);$('#outputDiv').animate({scrollTop:0},75);}