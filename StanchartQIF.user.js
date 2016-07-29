// ==UserScript==
// @name           StanchartQIF
// @namespace      http://diyd2.in/gmscripts
// @description	   This script embeds a textarea when you are visiting the "Detailed Statement" page of your Standard Chartered account. It contains the QIF version of your acct details from the webpage.
// @version        2.0
// @require 	   http://code.jquery.com/jquery-latest.js
// @include 	   https://online-banking.standardchartered.co.in/cgi-bin/ibnkprdin/scb/account/list_txnhistory.jsp*
// @include	   https://ibank.standardchartered.co.in/nfs/ibank/account_history.htm*
// @author         sudharsan.rangarajan @ gmail.com
// ==/UserScript==

String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, ''); };

function sc_copy(text2copy) {
  if (window.clipboardData) {
    window.clipboardData.setData("Text",text2copy);
  } else {
    var flashcopier = 'flashcopier';
    if(!document.getElementById(flashcopier)) {
      var divholder = document.createElement('div');
      divholder.id = flashcopier;
      document.body.appendChild(divholder);
    }
    document.getElementById(flashcopier).innerHTML = '';
    var divinfo = '<embed src="_clipboard.swf" FlashVars="clipboard='+escape(text2copy)+'" width="0" height="0" type="application/x-shockwave-flash"></embed>';
    document.getElementById(flashcopier).innerHTML = divinfo;
    }
}


function sc_value(row, col) {
	var returnValue = "";
	var ncol = col - 1;
	var cells = document.evaluate("td", row, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	//alert(cells.snapshotLength);
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
	//alert(cells.snapshotLength);
	if( cells ) {
		var target = document.evaluate("div", cells.snapshotItem(ncol), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		//alert(target.snapshotItem(0).childNodes[0]);
		returnValue = target.snapshotItem(0).childNodes[0].nodeValue;
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
	return sc_value(row, 2);
}
function sc_deposit(row) {
	return sc_removecommas(sc_value2(row, 4));
}
function sc_withdrawal(row) {
	return sc_removecommas(sc_value2(row, 5));
}

function mozillaSaveFile(filePath,content)
{
	//if(window.Components) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filePath);
			if(!file.exists())
				file.create(0,0664);
			var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			out.init(file,0x20|0x02,00004,null);
			out.write(content,content.length);
			out.flush();
			out.close();
			return true;
		} catch(ex) {
			alert("Failed to save");
			return false;
		}
	//}
	return null;
}

function sc_write_to_file(content) {
    try
    {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    }
    catch (e)
    {
    alert("Permission to write to file was denied.");
    }


    //create proper path for xml file
    var theFile = "/tmp/testfile";
    //create component for file writing
    var file = Components.classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath( theFile );
    if(file.exists() == false) //check to see if file exists
    {
    alert("creating file...");
    file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
    }


    //create file output stream and use write/create/truncate mode
    //0x02 writing, 0x08 create file, 0x20 truncate length if exist
    var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
    .createInstance(Components.interfaces.nsIFileOutputStream);

    stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);

    //write data to file then close output stream
    stream.write(content, content.length);
    stream.close();

}

var body = document.evaluate("//body", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
var newdiv;
if( body.singleNodeValue ) {
//	var newnode = document.createElement("input");
//	newnode.type = "button";
//	newnode.value = "QIF";
//	newnode.name = "qif";
//	body.singleNodeValue.appendChild(newnode);
	newdiv = document.createElement("textarea");
	newdiv.id = "qif_div";
	newdiv.style.width = "100%";
}

//var rows = document.evaluate("//tbody//tbody//tbody/tr[td[@class = 'chdd']]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
var rows = document.evaluate("id('vAcctTrxnList')/x:tbody/x:tr", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
// id('vAcctTrxnList')/x:tbody/x:tr[2]/x:td[1] 
// 2nd row, 1st col 
newdiv.innerHTML = "x!Type:Bank\n";
for (var i = 0; i < rows.snapshotLength; i++) {
	//alert(rows.snapshotItem(i));
	// We should have only one item and we need to traverse all the remaining siblings from there-on..
	var row = rows.snapshotItem(i);
	var current = row.nextSibling;
	while( current ) {
		//alert(current.nodeName);
		if( current.nodeName == 'TR' ) {
			//alert("Date is " + sc_date(current));
			//alert("Value is " + sc_value2(current, 4));
			newdiv.innerHTML = newdiv.innerHTML + "D" + sc_date(current) + "\n";
			newdiv.innerHTML = newdiv.innerHTML + "P" + sc_desc(current) + "\n";
			if( sc_deposit(current) != "" ) {
				newdiv.innerHTML = newdiv.innerHTML + "T" + sc_deposit(current) + "\n";
			} else {
				newdiv.innerHTML = newdiv.innerHTML + "T-" + sc_withdrawal(current) + "\n";
			}
			newdiv.innerHTML = newdiv.innerHTML + "^\n";
		}
		current = current.nextSibling;
	}	
}

//
// Add in the end to avoid flicker ...
//
body.singleNodeValue.appendChild(newdiv);

//sc_write_to_file(newdiv.innerHTML);
//mozillaSaveFile("/tmp/testfile", newdiv.innerHTML);

// ==/UserScript==
