// ==UserScript==
// @name           ICICIDirect Mutual Funds
// @namespace      http://diyd2.in/gmscripts
// @version        1.0
// @description	   This script embeds a textarea containing QIF data when you are visiting the "Mutual Funds  Statement" page of your ICICIDirect account.
// @include        http://tobereviewed.com/
// ==/UserScript==


String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, ''); };

function sc_value(row, col) {
	var returnValue = "";
	var ncol = col - 1;
	var cells = document.evaluate("td", row, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if( cells ) {
		// get all the text nodes and combine ...
		cells = document.evaluate("text()", cells.snapshotItem(ncol), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if( cells ) {
			returnValue = "";
			for(i=0;i<cells.snapshotLength;i++) {
				returnValue = returnValue + cells.snapshotItem(i).nodeValue;
			}
			returnValue = returnValue.trim();
		} 
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


// date is of form "02-06-2008 00:00:00"
function sc_date(row) {
	var rawdate = sc_value(row, 1);
	var out = rawdate.split(" ")[0];
	out = out.split("-");
	var year = out[2];
	var month = out[1];
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
	return sc_value2(row, 2)+" "+sc_value(row, 3) + " " + sc_value(row, 5); // append check info
}

function sc_txn(row) {
	if( sc_value(row, 3) == "DR" || sc_value(row, 3) == "P" ) {
		return "Buy";
	} else if( sc_value(row, 3) == "R" ) {
		return "Sell";
	}
}

function sc_order(row) {
	return sc_value2(row,2);
}

function sc_symbol(row) {
	return sc_value(row,4);
}

function sc_price(row) {
	return ( sc_removecommas(sc_value(row,6)) - 0.0 );
}

function sc_qty(row) {
	return sc_removecommas(sc_value(row,10));
}

function sc_amount(row) {
	// convert the strings to integers
	var p1 = sc_removecommas(sc_value(row,9)) - 0.0 ;
	if( sc_txn(row) == 'Buy' ) {
		return p1;
	} else {
		return p1; // "BAD DATA";
	}
/*
*/
//	return sc_removecommas(sc_value(row,6));
}


var rows = document.evaluate("//tbody//tbody//tbody//tbody/tr[td[. = 'Date']]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

//
// PREPARE A NEW DIV TO STORE THE QIF DATA
// 
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
	//alert(rows.snapshotLength);
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
			newdiv.innerHTML = newdiv.innerHTML + "O" + "0.0" + "\n";
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
