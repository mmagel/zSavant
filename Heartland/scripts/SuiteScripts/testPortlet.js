function testPortlet(portlet, column) {
    portlet.setTitle('Report');
    var stContent = "<iframe src=https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=174&deploy=1&customwhence=%2Fapp%2Fsite%2Fhosting%2Fscriptlet.nl%3Fscript%3D174%26deploy%3D1%26action%3Dform%26cacheid%3D614&customwhencelabel=Return+to+Layout&action=runReport&search_id=614&whence='";
    stContent += " id='sampleFrame' name='sampleFrame' style='border: 0px none ; width: 500px; height: 500px;'>";
    stContent += "</iframe>";
    
    portlet.setHtml(stContent);
}
