// ==UserScript==
// @name           ICICI Credit Card QIF
// @namespace      http://diyd2.in/gmscripts
// @description    Converts the CC Statement page into a QIF format. It inserts a TextArea to the bottom the webpage.
// @author         sudharsan.rangarajan @ gmail.com
// @include        https://infinity.icicibank.co.in/web/cards/creditcard/jsp/CreditCardStub.jsp;jsessionid=*
// ==/UserScript==
//

String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, ''); };

function sc_value(row, col) {
	var returnValue = "";
	var ncol = col - 1;
	var cells = document.evaluate("td", row, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if( cells ) {
		returnValue = cells.snapshotItem(ncol).childNodes[0].nodeValue;
		returnValue = returnValue.trim();
	}	
	return returnValue;
}

function sc_value2(row, col) {
	var returnValue = "";
	var ncol = col - 1;
	var cells = document.evaluate("td", row, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if( cells ) {
		cells = document.evaluate("span", cells.snapshotItem(ncol), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		returnValue = cells.snapshotItem(0).childNodes[0].nodeValue;
		returnValue = returnValue.trim();
	}	
	return returnValue;
}

function sc_removecommas(str) {
	return str.replace(/,/, '');
}


function sc_date(row) {
	return sc_value(row, 1);
}
function sc_desc(row) {
	return sc_value(row, 3);
	//return sc_value(row, 3)+" "+sc_value(row, 2); // append check info
}

function sc_checkinfo(row) {
	return sc_value(row, 2);
}

function sc_txn_amount(row) {
	var value = sc_removecommas(sc_value(row, 4));
	value = value.replace(/Rs\.\s+/, "");
	value2 = sc_value2(row, 4);
	if( value2.match(new RegExp("CR"))) {
		value = value.replace("(CR)","");
	} else {
		value = "-" + value.replace("(DR)", "");
	}
	return value;
}

var rows = document.evaluate("//tbody//tbody//tbody//tbody/tr[td[. = 'Date']]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

var body = document.evaluate("//body", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
var newdiv;
if( body.singleNodeValue ) {
	newdiv = document.createElement("textarea");
	newdiv.style.width = "100%";
	newdiv.id = "qif_div";
}

newdiv.innerHTML = "!Type:CCard\n";

for (var i = 0; i < rows.snapshotLength; i++) {
	// We should have only one item and we need to traverse all the remaining siblings from there-on..
	var row = rows.snapshotItem(i);
	var current = row.nextSibling;
	while( current ) {
		if( current.nodeName == 'TR') {
			if( sc_date(current) != "" ) {
				//sc_value(current, 1);
				//alert("Date is " + sc_date(current));
				newdiv.innerHTML = newdiv.innerHTML + "D" + sc_date(current) + "\n";
				newdiv.innerHTML = newdiv.innerHTML + "P" + sc_desc(current) + "\n";
				newdiv.innerHTML = newdiv.innerHTML + "N" + sc_checkinfo(current) + "\n";
				newdiv.innerHTML = newdiv.innerHTML + "T" + sc_txn_amount(current) + "\n";
				newdiv.innerHTML = newdiv.innerHTML + "^\n";
			}
		}
		current = current.nextSibling;
	}	
}

//
// Add in the end to avoid flicker ...
//
body.singleNodeValue.appendChild(newdiv);

// ==/UserScript==
