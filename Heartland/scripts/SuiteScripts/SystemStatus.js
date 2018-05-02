/*
This script displays NetSuite's System Status on Real Time
Hasan Yorukoglu Script#1
03/25/2013
*/
function SystemStatus(request, response) 
{ 
    portlet.setTitle('NetSuite Status');
	var height = column != 2 ? 800 : 650;
    var serverUrl = "https://status.netsuite.com";
    portlet.setHtml('<iframe src="'+serverUrl+'" width="100%" align="center"  height="'+(height+4)+'px" style="margin:0px; border:0px; padding:0px"></iframe>');
}
    