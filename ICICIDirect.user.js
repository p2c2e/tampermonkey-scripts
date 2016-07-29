// ==UserScript==
// @name           ICICIDirect QIF
// @namespace      http://diyd2.in/gmscripts
// @version        1.1
// @description    This script scrapes the ICICIDirect Trade book page and displays the QIF for importing the trades
// @author         sudharsan.rangarajan @ gmail.com
// @include        https://*.icicidirect.com/*/trading_trade_book.asp
// ==/UserScript==

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
		returnValue = cells.snapshotItem(ncol).childNodes[0].childNodes[0].nodeValue;
		returnValue = returnValue.trim();
	}	
	return returnValue;
}

function sc_removecommas(str) {
	return str.replace(/,/, '');
}


function sc_date(row) {
	var rawdate = sc_value(row, 1);
	var out = rawdate.split("-");
	var year = out[2];
	var month = monthno(out[1]);
	var day = out[0];
	return day+"/"+month+"/"+year;
}

function monthno(s) {
    if( s == "Jan" ) { return 1; }
    if( s == "Feb" ) { return 2; }
    if( s == "Mar" ) { return 3; }
    if( s == "Apr" ) { return 4; }
    if( s == "May" ) { return 5; }
    if( s == "Jun" ) { return 6; }
    if( s == "Jul" ) { return 7; }
    if( s == "Aug" ) { return 8; }
    if( s == "Sep" ) { return 9; }
    if( s == "Oct" ) { return 10; }
    if( s == "Nov" ) { return 11; }
    if( s == "Dec" ) { return 12; }
}

function sc_desc(row) {
	return sc_value(row, 2)+" "+sc_value(row, 3) + " " + sc_value(row, 4) +" "+sc_value2(row, 8); // append check info
}
function sc_deposit(row) {
	return sc_removecommas(sc_value(row, 7));
}
function sc_withdrawal(row) {
	return sc_removecommas(sc_value(row, 6));
}

function sc_txn(row) {
	return sc_value(row,3);
}

function sc_order(row) {
	return sc_value2(row,8);
}

function sc_symbol(row) {
	return sc_value(row,2);
}

function sc_price(row) {
	return sc_removecommas(sc_value(row,5));
}

function sc_qty(row) {
	return sc_removecommas(sc_value(row,4));
}

function sc_commission(row) {
	try {
	    return sc_removecommas(sc_value2(row,7));
	} catch(err) {
		return "0.0";
	}
}

function sc_amount(row) {
	// convert the strings to integers
	var p1 = sc_removecommas(sc_value(row,6))-0.0;
	var p2 = sc_commission(row) - 0.0;
	if( sc_txn(row) == 'Buy' ) {
		// commission paid above the price of stock
		return (p1 + p2);
	} else {
		// commission deducted from the amount realized from sale
		return (p1 - p2);
	}
/*
*/
//	return sc_removecommas(sc_value(row,6));
}


var rows = document.evaluate("//tbody//tbody//tbody//tbody/tr[td[. = 'Date']]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

var body = document.evaluate("//body", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
var newdiv;
if( body.singleNodeValue ) {
//	var newnode = document.createElement("input");
//	newnode.type = "button";
//	newnode.value = "QIF";
//	newnode.name = "qif";
//	body.singleNodeValue.appendChild(newnode);
	newdiv = document.createElement("textarea");
	newdiv.style.width = "100%";
	newdiv.id = "qif_div";
}

newdiv.innerHTML = "!Type:Invst\n";

for (var i = 0; i < rows.snapshotLength; i++) {
	//alert(rows.snapshotItem(i));
	// We should have only one item and we need to traverse all the remaining siblings from there-on..
	var row = rows.snapshotItem(i);
	var current = row.nextSibling;
	while( current ) {
		if( current.nodeName == 'TR' ) {
			if( sc_value(current, 1) == 'Total' ) break;
			//sc_value(current, 1);
			//alert("Date is " + sc_date(current));
			newdiv.innerHTML = newdiv.innerHTML + "D" + sc_date(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "P" + sc_desc(current) + "\n";
/*
			if( sc_deposit(current) != "" ) {
				newdiv.innerHTML = newdiv.innerHTML + "T" + sc_deposit(current) + "\n";
			} else {
				newdiv.innerHTML = newdiv.innerHTML + "T-" + sc_withdrawal(current) + "\n";
			}
*/
			newdiv.innerHTML = newdiv.innerHTML + "N" + sc_txn(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "LInvestments\n";
			newdiv.innerHTML = newdiv.innerHTML + "M" + sc_order(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "YAssets:Investments:ICICI Direct:Stock:" + sc_symbol(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "Q" + sc_qty(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "I" + sc_price(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "O" + sc_commission(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "T" + sc_amount(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "^\n";
		}
		current = current.nextSibling;
	}	
}

//
// Add in the end to avoid flicker ...
//
body.singleNodeValue.appendChild(newdiv);

// ==/UserScript==
