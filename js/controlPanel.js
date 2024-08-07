/*
 * (c) 2012 Commonwealth of Australia
 * Australian Bureau of Meteorology, COSPPac COMP
 * All Rights Reserved
 */

var ocean=ocean||{};ocean.controls=['plottype','period','hour','date','month','year','tidalgauge','latitude','longitude','dataset','dshelp','hour-slider','reef','alertdial','marine','tunafishing'];ocean.compare={limit:24};ocean.processing=false;ocean.date=new Date(); var intersecIcon=L.icon({iconUrl:'lib/leaflet-0.7.3/images/marker-icon.png',shadowUrl:'lib/leaflet-0.7.3/images/cross.png',iconSize:[25,41],shadowSize:[36,36],iconAnchor:[12,41],shadowAnchor:[17,18]});var slider;$(function(){if(location.search=='')
ocean.config='pac';else
ocean.config=location.search.slice(1);hideControls();assignAppClass();updateApplicationTitle();updateHours();$("#date").datepick({dateFormat:'d MM yyyy',firstDay:1,renderer:$.datepick.themeRollerRenderer,changeMonth:true,showAnim:'clip',showSpeed:'fast',nextText:'M >',prevText:'< M',todayText:'dd M yy',commandsAsDateFormat:true,onSelect:dateSelection});slider=new Dragdealer('hour-slider',{slide:false});$('#submit').click(function(){updatePage();resetPointClick();return false;});$('#variable').change(function(){var currentApp=ocean.app.new;var varid=getValue('variable');if(varid=='--'){hideControls();ocean.variable=null;return;}
if(!(varid in ocean.variables)){return;}
updateVisibilities('variable',ocean.variable,varid);ocean.variable=varid;var plots=ocean.variables[varid].plots;filterOpts('plottype',plots);showControls('plottype');selectFirstIfRequired('plottype');selectMapLayer("Bathymetry");updateDatasets();ocean.dataset.onVariableChange();});$('#plottype').change(function(){var plottype=getValue('plottype');if(!(plottype in ocean.variables[ocean.variable].plots)){return;}
updateVisibilities('plottype',ocean.plottype,plottype);ocean.plottype=plottype;updatePeriods();switch(plottype){case'xsections':case'histogram':case'waverose':case'ts':if(ocean.variable=='gauge'){disableIntersecMarker();break;}
enableIntersecMarker();$('#latitude').change();break;default:disableIntersecMarker();break;}
selectMapLayer("Bathymetry");});$('#period').change(function(){var period=getValue('period');if(!(period in ocean.variables[ocean.variable].plots[ocean.plottype])){filterOpts('period',ocean.variables[ocean.variable].plots[ocean.plottype]);selectFirstIfRequired('period');return;}
updateVisibilities('period',ocean.period,period); updateDatepickerDisplay(period);ocean.period=period;showControls('dataset');if($('#year').is(':visible')){updateNonDailyDateBasedOnDataset();}else if($('#month').is(':visible')){updateMonthBasedOnDataset();updateOceanDate();}else if($('#date').is(':visible')){updateDailyDateBasedOnDataset();}else{updateDatasets();}});$('#year').change(function(){updateMonthBasedOnDataset();});$('#date, #month, #year').change(function(){if(!(ocean.variable in ocean.variables)||!(ocean.plottype in ocean.variables[ocean.variable].plots)||!(ocean.period in ocean.variables[ocean.variable].plots[ocean.plottype])){return;} 
var date_;switch(ocean.period){case'hourly':case'daily':case'weekly':date_=$('#date').datepick('getDate')[0];selectEntireWeek(date_);break;case'monthly':case'3monthly':case'6monthly':case'12monthly':case'yearly':var year=getValue('year')||0;var month=getValue('month')||0;date_=new Date(year,month,1);break;default:console.error("ERROR: should not be reached");break;}
if(!date_||isNaN(date_.getTime())){return;}
ocean.date=date_;var filter;if($('#date').is(':visible')||$('#year').is(':visible')){filter=function(dataset){var range=getDateRange(dataset,ocean.variable,ocean.period);if(!range)
return true;
return true;};}
updateDatasets(filter);});$('#dataset').change(function(){var datasetid=getValue('dataset');if(!datasetid||datasetid==ocean.datasetid){return;}
ocean.datasetid=datasetid;var backendid=getBackendId(datasetid);if(!(backendid in ocean.dsConf)){return;}
if(ocean.dataset&&ocean.dataset.onDeselect){ocean.dataset.onDeselect();}
ocean.dataset=ocean.dsConf[backendid];showControls('dshelp');$('#dshelp').attr('href',ocean.datasets[datasetid].help);$('#dshelp span').html(ocean.datasets[datasetid].name);if(["Reynolds","ERSST"].indexOf(ocean.datasets[ocean.datasetid].name)!=-1){$('#dshelp span').html("Ocean Temperature");}else if(["WaveWatch III"].indexOf(ocean.datasets[ocean.datasetid].name)!=-1){$('#dshelp span').html("Wave Hindcast");}
if($('#year').is(':visible')){updateNonDailyDateBasedOnDataset();}
selectMonthsForNearRealTimeDatasets();if(ocean.dataset.onSelect){ocean.dataset.onSelect();}});$('#tidalgauge').hover(function(){this.title=this.value;});$('#reef').change(function(){if(this.checked){ocean.reefLayer=L.tileLayer.wms("cgi/map.py?map=bathymetry",{layers:'reeflocations',format:'image/png',transparent:true,attribution:'<a href="http://www.reefbase.org/gis_maps/datasets.aspx" title="Reef Base">Reef Base</a>'}).addTo(ocean.mapObj);}
else{ocean.mapObj.removeLayer(ocean.reefLayer);}});$('#alertdial').change(function(){if(this.checked){ocean.alertDialLayer=L.tileLayer.wms("cgi/map.py?map=bathymetry",{layers:'alertdial',format:'image/png',transparent:true,attribution:'',continuousWorld:true}).addTo(ocean.mapObj);}
else{ocean.mapObj.removeLayer(ocean.alertDialLayer);}});$('#marine').change(function(){if(this.checked){ocean.marineLayer=L.tileLayer.wms("cgi/map.py?map=bathymetry",{layers:'marineparks',format:'image/png',transparent:true,attribution:'<a href="http://www.sprep.org/" title="Marine Park Areas">Marine Park Areas</a>'}).addTo(ocean.mapObj);}
else{ocean.mapObj.removeLayer(ocean.marineLayer);}});$('#latitude, #longitude').change(function(){moveIntersectionToNewLocation();});var groupings={};variableModel.getData();regionCountryModel.getData();});function dateSelection(){$('#date').change();};function getBackendId(datasetid,varid){var dataset=ocean.datasets[datasetid];if(varid){var variable=$.grep(dataset.variables,function(var_){return(var_.id==varid);});if(variable.length==1&&'bid'in variable[0]){return variable[0].bid;}else{return ocean.variables[varid].variable.id;}}else{if('bid'in dataset){return dataset.bid;}else{return dataset.id;}}}
function getDateRange(datasetid,varid,period)
{var dataset=ocean.datasets[datasetid];if(typeof(dataset)!='undefined'){var variable=$.grep(dataset.variables,function(var_){return(var_.id==varid);});var range;var month_delta=0;switch(period){case'3monthly':month_delta=2;break;case'6monthly':month_delta=5;break;case'12monthly':month_delta=11;break;}
if(variable.length==1&&'dateRange'in variable[0]){range=variable[0].dateRange;}else if('dateRange'in dataset){range=dataset.dateRange;}else{return null;}}else{return null;}
var mindate=$.datepick.determineDate(range.minDate,null,'yyyymmdd');var maxdate=$.datepick.determineDate(range.maxDate,null,'yyyymmdd');mindate.setMonth(mindate.getMonth()+month_delta);return{min:mindate,max:maxdate};}
function getCombinedDateRange(){var datasets=ocean.variables[ocean.variable].plots[ocean.plottype][ocean.period];var minDate=Number.MAX_VALUE;var maxDate=Number.MIN_VALUE;$.each(datasets,function(i,datasetid){var range=getDateRange(datasetid,ocean.variable,ocean.period);if(!range)
return;if(datasetid=="ww3"&&ocean.period=="hourly"&&ocean.plottype=="map"){range.max=new Date(2024,3,30);}
minDate=Math.min(minDate,range.min);maxDate=Math.max(maxDate,range.max);});return{min:new Date(minDate),max:new Date(maxDate)};}
function updateMonths(minMonth,maxMonth){var selectedyear=getValue('year')||0;var fmt;if(minMonth==null){minMonth=0;}
if(maxMonth==null){maxMonth=11;}
function _dateRange(year,range){range-=1;if($('#year').is(':visible')){return function(m){return $.datepick.formatDate('M y',new Date(selectedyear,m-range))+' &ndash; '+
$.datepick.formatDate('M y',new Date(selectedyear,m));}}else{return function(m){return $.datepick.formatDate('M',new Date(selectedyear,m-range))+' &ndash; '+
$.datepick.formatDate('M',new Date(selectedyear,m));}}}
switch(ocean.period){case'hourly':fmt=function(m){return $.datepick.formatDate('MM',new Date(selectedyear,m));};break;case'monthly':fmt=function(m){return $.datepick.formatDate('MM',new Date(selectedyear,m));};break;case'3monthly':fmt=_dateRange(selectedyear,3);break;case'6monthly':fmt=_dateRange(selectedyear,6);break;case'12monthly':fmt=_dateRange(selectedyear,12);break;case'yearly':return;default:console.error("ERROR: should not be reached");return;}
var month=$('#month');month.find('option').remove();for(m=minMonth;m<=maxMonth;m++){$('<option>',{value:m,html:fmt(m)}).appendTo(month);}
var selectedmonth=ocean.date.getMonth();if(selectedmonth<minMonth){selectFirstIfRequired('month');}else if(selectedmonth>maxMonth){month.find('option:last').attr('selected',true);month.change();}else{setValue('month',selectedmonth);}}
function updateDatasets(filter){if(!(ocean.period in ocean.variables[ocean.variable].plots[ocean.plottype])){ocean.period=ocean.variables[ocean.variable].variable['periods'][0];filterOpts('period',ocean.variables[ocean.variable].plots[ocean.plottype]);selectFirstIfRequired('period');}
var datasets=ocean.variables[ocean.variable].plots[ocean.plottype][ocean.period];if(filter){datasets=$.grep(datasets,filter);}
datasets.sort(function(a,b){var ar='rank'in ocean.datasets[a]?ocean.datasets[a].rank:0;var br='rank'in ocean.datasets[b]?ocean.datasets[b].rank:0;return br-ar;});var dataset=getValue('dataset');$('#dataset option').remove();$.each(datasets,function(i,dataset){$('<option>',{value:dataset,text:ocean.datasets[dataset].name}).appendTo('#dataset');});setValue('dataset',dataset);selectFirstIfRequired('dataset');}
function filterOpts(comboid,keys){var select=$('#'+comboid);if(!keys){console.warn("filterOpts was provided no keys for "+comboid);select.find('optgroup, option').show();return;}
select.find('optgroup').hide();select.find('option').each(function(){var opt=$(this);if(opt.val()in keys){opt.parent('optgroup').show();opt.show().attr('disabled',false);}else{opt.hide().attr('disabled',true);}});}
function getValue(comboid){return $('#'+comboid+' option:selected').val();}
function setValue(comboid,value){$('#'+comboid+' option[value='+value+']').attr('selected',true);$('#'+comboid).change();}
function addOption(comboid,newvalue,newtitle){$('#'+comboid).find('option').remove().end().append('<option value="'+newvalue+'">'+newtitle+'</option>').val(newvalue).attr('selected',true).change();}
function selectFirstIfRequired(comboid){var combo=$('#'+comboid);function _visible(){var e=$(this);return e.is(':visible')||e.css('display')!='none';}
if(combo.find('option:selected').filter(_visible).length==0){combo.find('option').filter(_visible).eq(0).attr('selected',true);combo.change();}}
function enablePointClick(){map.on('contextmenu',pointClick);createPointPopup();}
function disablePointClick(){map.off('contextmenu',pointClick);resetPointClick();}
function resetPointClick(){map.closePopup(map.pointPopup);ocean.dataset.clickLatLng=null;}
function createPointPopup(){if(typeof(map.pointPopup)=='undefined'||!map.pointPopup){map.pointPopup=L.popup();}}
function pointClick(e){ocean.dataset.clickLatLng=e.latlng;doPointClick();}
function doPointClick(){if(!ocean.dataset.clickLatLng){return;}
var params=$.extend(ocean.dataset.params(),{lat:ocean.dataset.clickLatLng.lat,lon:ocean.dataset.clickLatLng.lng,plot:'point'});$.ajax({url:'cgi/portal.py',data:params,dataType:'json',beforeSend:function(jqXHR,settings){ocean.processing=true;if(map.pointPopup._isOpen){map.pointPopup.setContent('<p>updating...</p>').setLatLng(ocean.dataset.clickLatLng).update();}
else{map.pointPopup.setLatLng(ocean.dataset.clickLatLng).setContent('<p>updating...</p>').openOn(map);}
paramscheck=ocean.dataset.beforeSend();if(!paramscheck){ocean.processing=false;map.closePopup(map.pointPopup);}
return paramscheck;},success:function(data,textStatus,jqXHR){if(data==null||$.isEmptyObject(data))
{map.pointPopup.setContent('<p>Failed to get point value</p>');map.pointPopup.update()}
else
{if(data.error){map.pointPopup.setContent('<p>'+data.error+'</p>');}else{map.pointPopup.setContent('<p>'+ocean.dataset.formatValue(data.value)+'</p>');}}},error:function(jqXHR,textStatus,errorThrown){},complete:function(jqXHR,textStatus){ocean.processing=false;}});}
function enableIntersecMarker(){map.on('click',setIntersection);if(map.intersecMarker){map.intersecMarker.setOpacity(1.0);}
}
function disableIntersecMarker(){map.off('click',setIntersection);if(map.intersecMarker){map.intersecMarker.setOpacity(0);}}
function createMarkerIfUndefined(){if(typeof(map.intersecMarker)=='undefined'||!map.intersecMarker){map.intersecMarker=L.marker([90.0,0],{icon:intersecIcon}).addTo(map);}}
function setIntersection(e){createMarkerIfUndefined();map.intersecMarker.setLatLng(e.latlng);$('#latitude').val(e.latlng.lat);$('#longitude').val(e.latlng.lng);if(map.intersecMarker){if(map.hasEventListeners('click')){ lat=$('#latitude').val();lon=$('#longitude').val();if(lat!=''&&lon!=''){ map.intersecMarker.setOpacity(1.0);}else{ map.intersecMarker.setOpacity(0);}}else{ map.intersecMarker.setOpacity(0);}}}
function moveIntersectionToNewLocation(){var lat=$('#latitude').val();var lon=$('#longitude').val();if(lat!=''&&lon!=''){createMarkerIfUndefined();if(map.intersecMarker){map.intersecMarker.setOpacity(1.0);}
map.intersecMarker.setLatLng(L.latLng(lat,lon));}else{ if(map.intersecMarker){map.intersecMarker.setOpacity(0);}}}
function _controlVarParent(control){return $('#'+control).parent('.controlvar');}
function showControls(){var controls=arguments;if(controls.length==0){controls=ocean.controls;}
$.each(controls,function(i,control){var parent=_controlVarParent(control);parent.show();parent.parent('.controlgroup').show();$('#'+control).change();});}
function updatSpanForControls(){var controls=arguments;if(controls.length==0){controls=ocean.controls;}
$.each(controls,function(i,control){var parent=_controlVarParent(control);var control_element=$('#'+control);var siblings=control_element.siblings();if(control_element.css('display')=='none'){siblings.hide();}else{siblings.show();}});}
function hideControls(){var controls=arguments;if(controls.length==0){controls=ocean.controls;}
$.each(controls,function(i,control){var parent=_controlVarParent(control);var group=parent.parent('.controlgroup');parent.hide();if(group.children('.controlvar:visible').length==0){group.hide();}});}
function assignAppClass(){if(ocean.app){if(ocean.app.old){$('.controlvar').removeClass(ocean.app.old);}
if(ocean.app.new){$('.controlvar').addClass(ocean.app.new);}}
else{ocean.app={"new":window.location.hash.split('#')[1]};}
$('.controlvar').addClass(ocean.app.new);}
function updateVisibilities(controlvar,old,new_){$('.controlvar').removeClass(controlvar+'-'+old).addClass(controlvar+'-'+new_);$('.controlgroup .controlvar .field').each(function(){var field=$(this);var id=this.id;if(field.css('display')!='none'){field.closest('.controlvar').show('fast',function(){if(id=='hour-slider'){slider.reflow();}});field.closest('.controlgroup').show();}else{field.closest('.controlvar').hide();}});$('.controlgroup').each(function(){var group=$(this);if(group.children('.controlvar:visible').length==0){group.hide();}}); updatSpanForControls();}
function updatePage(){if(!ocean.processing){resetMap();resetLegend();if((typeof(ocean.variable)=='undefined')||(!ocean.variable)){show_feedback("Please select a variable.","Missing Input:");return;}
if(!ocean.dataset)
return;function show_error(params,text)
{var url='cgi/portal.py?'+$.param(params);$('#error-dialog-status').html("<b>Error:</b>");$('#error-dialog-content').html(text);$('#error-dialog-request').prop('href',url);$('#error-dialog-report-back').show();$('#error-dialog').dialog('open');}
$.ajax({url:'cgi/portal.py',data:ocean.dataset.params(),dataType:'json',beforeSend:function(jqXHR,settings){ocean.processing=true;$('#loading-dialog').dialog('open');$('#error-dialog').dialog('close');paramscheck=ocean.dataset.beforeSend();if(!paramscheck){ocean.processing=false;$('#loading-dialog').dialog('close');}
return paramscheck;},success:function(data,textStatus,jqXHR){if(data==null||$.isEmptyObject(data))
{show_error(ocean.dataset.params(),"returned no data");}
else
{if(data.error){show_error(ocean.dataset.params(),data.error);}else{ocean.dataset.callback(data);}}},error:function(jqXHR,textStatus,errorThrown){if(textStatus=='parsererror'){show_error(ocean.dataset.params(),"Unable to parse server response.");}else{show_error(ocean.dataset.params(),errorThrown);}},complete:function(jqXHR,textStatus){ocean.processing=false;maybe_close_loading_dialog();}});}}
function stepForward(){slider.setStep(slider.getStep()[0]+1);}
function stepBackward(){slider.setStep(slider.getStep()[0]-1);}
function show_feedback(text,title){$('#error-dialog-status').html("<b>"+title+"</b>");$('#error-dialog-content').html(text);$('#error-dialog-report-back').hide();$('#error-dialog').dialog('open');}
$('.fotorama').on('fotorama:error',function(e,fotorama,extra){show_feedback("The image "+extra.src+" has not been generated.","");});function updateNonDailyDateBasedOnDataset(){updateYearBasedOnDataset();updateMonthBasedOnDataset();updateOceanDate();}
function updateOceanDate(){ var year=getValue('year');if(typeof(year)=='undefined'){year=(new Date()).getFullYear();}
ocean.date=new Date(year,getValue('month'),1);}
function updateYearBasedOnDataset(){if($('#year').is(':visible')){var range=getDateRange(ocean.datasetid,ocean.variable,ocean.period);if(range!=null){var year=$('#year');year.find('option').remove();for(y=range.min.getFullYear();y<=range.max.getFullYear();y++){$('<option>',{value:y,text:y}).appendTo(year);}
year.find('option:last').attr('selected',true);}}}
function updateMonthBasedOnDataset(){if($('#month').is(':visible')){var range=getDateRange(ocean.datasetid,ocean.variable,ocean.period);if(range!=null){var selectedYear=parseInt(getValue('year'));var minYear=range.min.getFullYear();var maxYear=range.max.getFullYear();var minMonth=range.min.getMonth();var maxMonth=range.max.getMonth();if(selectedYear!=minYear){minMonth=0;}
if(selectedYear!=maxYear){maxMonth=11;}
updateMonths(minMonth,maxMonth); selectMonthsForNearRealTimeDatasets();}}}
function updateDailyDateBasedOnDataset(){if($('#date').is(':visible')){var range=getCombinedDateRange();var date_=$('#date');updateDatepicker();ocean.date=range.max;date_.datepick('setDate',ocean.date).change();}}
function updateDatepicker(){var date_=$('#date');var range=getCombinedDateRange();date_.datepick('option',{minDate:range.min,maxDate:range.max,yearRange:range.min.getFullYear()+':'+range.max.getFullYear()});}
function selectMonthsForNearRealTimeDatasets(){var range=getDateRange(ocean.datasetid,ocean.variable,ocean.period);if(range!=null&&$('#month').is(':visible')){var var_list=new Array("meansst","sstanom","sstdec","sla");var dataset_list=new Array("reynolds","ersst","msla");if(var_list.indexOf(ocean.variable)!=-1&&dataset_list.indexOf(ocean.datasetid)!=-1){if(ocean.period!="daily"){ var minMonthInAYear=0;var maxMonthInAYear=11; var current_year=new Date().getFullYear(); var maxMonth=range.max.getMonth();var minMonth=range.min.getMonth();var minYear=range.min.getFullYear(); var selected_year=parseInt(getValue("year"));minMonthInAYear=minYear==selected_year?minMonth:minMonthInAYear;if(current_year==selected_year){maxMonth=_getUpdatedMonth();}else{ lastValueOfCombo=parseInt($('#year').find('option:last').val());if(lastValueOfCombo==selected_year){ maxMonth=_getUpdatedMonth();}else{ maxMonth=maxMonthInAYear;}} 
updateMonths(minMonthInAYear,maxMonth);$('#month').find('option:eq(  '+maxMonth+' )').attr('selected',true);}}else{length=$('#month').find('option:last').length;if(length==0){ updateMonths();}else{$('#month').find('option:last').attr('selected',true);}}}}
function _getUpdatedMonth(){var startDayOfSelection=3; var minMonthInAYear=0;var maxMonthInAYear=12;var current_date=new Date();var current_day=current_date.getDate();var current_month=current_date.getMonth();var current_year=current_date.getFullYear();var maxMonth=current_day>=startDayOfSelection?current_month-1:current_month-2; if(maxMonth<minMonthInAYear){maxMonth=maxMonthInAYear+maxMonth; lastValueOfCombo=parseInt($('#year').find('option:last').val());if(lastValueOfCombo==current_year){ $('#year').find('option:last').remove();setValue('year',current_year-1);}}
return maxMonth;}
function updateApplicationTitle(){base_name='Ocean Portal';$.getJSON("config/comp/app.json",function(data){app_name=window.location.hash.split('#')[1];if(typeof(app_name)!=='undefined'){app_title=data[app_name].title;if(typeof(app_title)!=='undefined'){$('#portal_title').text(function(i,oldText){return oldText===base_name?base_name+": "+app_title:base_name;});}}}).error(function(){$('#portal_title').text(function(i,oldText){return base_name;});});}
$('.glyphicon-step-forward').on('keypress',function(event){if(event.charCode||event.keyCode==13){stepForward();}});$('.glyphicon-step-backward').on('keypress',function(event){if(event.charCode||event.keyCode==13){stepBackward();}});function selectEntireWeek(date){if(typeof(date)!='undefined'){var weekNo=date.getWeek(); var week_items=$('a[title="Select the entire week"]');for(i=0;i<week_items.length;i++){if(parseInt(week_items[i].text)==weekNo){week_items[i].click();i=week_items.length;}}}}
function updateDatepickerDisplay(period){if(period=='weekly'){$('#date').datepick('option','rangeSelect',true);$('#date').datepick('option','onShow',$.datepick.selectWeek);$('#date').datepick('option','renderer',$.extend({},$.datepick.themeRollerWeekOfYearRenderer,{picker:$.datepick.themeRollerRenderer.picker.replace(/\{link:clear\}/,'').replace(/\{link:close\}/,'')}));}else{$('#date').datepick('option','rangeSelect',false);$('#date').datepick('option','onShow',null);$('#date').datepick('option','renderer',$.datepick.themeRollerRenderer);}}
function updateHours(){var hour=$('#hour');hour.find('option').remove();var time=":00 AM";for(m=0;m<=23;m++){if(m>=12){time=":00 PM";}
$('<option>',{value:m,html:m+time}).appendTo(hour);}
hour.find('option:first').attr('selected',true);}
function updatePeriods(){var periods;if(ocean.datasetid=='ww3'){if(ocean.plottype=='histogram'){periods={"monthly":ocean.variables[ocean.variable].plots[getValue('plottype')]['monthly']};}else if(ocean.plottype=='map'){periods={"hourly":ocean.variables[ocean.variable].plots[getValue('plottype')]['hourly']};}else if(ocean.plottype=='waverose'){periods={"monthly":ocean.variables[ocean.variable].plots[getValue('plottype')]['monthly']};}}else{periods=ocean.variables[ocean.variable].plots[ocean.plottype];}
filterOpts('period',periods);selectFirstIfRequired('period');showControls('period');}
Date.prototype.getWeek=function(){var date=new Date(this.getTime());date.setHours(0,0,0,0);date.setDate(date.getDate()+3-(date.getDay()+6)%7);var week1=new Date(date.getFullYear(),0,4);return 1+Math.round(((date.getTime()-week1.getTime())/86400000
-3+(week1.getDay()+6)%7)/7);}
