// ==UserScript==
// @name           ICICI Bank QIF
// @version        1.0
// @namespace      http://diyd2.in/gmscripts
// @description	   This script embeds a textarea when you are visiting the "Detailed Statement" page of your ICICI account. It contains the QIF version of your acct details from the webpage.
// @require http://code.jquery.com/jquery-latest.js
// @include        https://infinity.icicibank.co.in/BANKAWAY;jsessionid=.*
// @include 	   https://infinity.icicibank.com/corp/Finacle;jsessionid=*
// ==/UserScript==
//

String.prototype.trim = function() { return this.replace(/(?:\r\n|\r|\n)/g, '').replace(/^\s+/, '').replace(/\s+$/, ''); };
String.prototype.nocommas = function() { return this.replace(/,/g, ''); };

var body = $('body');
var newdiv;
if( $('#qif_div').length === 0 ) {
    body.append('<textarea id="qif_div" style="width:100%;height:200px;"></textarea>');
}
$('#qif_div').val(''); // $('#printContent tbody tr').text());
var tbody = $('#printContent tbody');
var rtn = "!Type:Bank\n";

//var tbl = $('table#txnHistoryList tr');

$('table#txnHistoryList tr').each(function() {
    /* */
    //rtn = "";
    var columns = $(this).find('td');
    //alert(columns.length);
    if ( columns.length > 1 ) { 
        
        var dt = columns[2].innerText;
        //alert(dt);
        if ( dt.trim() !== "" ) {
            //alert('Date#'+dt+'#');
            var desc = columns[4].innerText;
            //alert(desc);
            var amt = "";
            if ( columns[5].innerText.trim() !== "" ) {
                amt = "-"+columns[5].innerText;
            } else {
                amt = columns[6].innerText;
            }
            //window.alert(columns[0]);
            rtn = rtn + "D"+dt.trim()+"\nP"+desc.trim()+"\nT"+amt.trim().nocommas()+"\n^\n";
        }
    }
    console.log(rtn);
});
$('#qif_div').val(rtn);

// ==/UserScript==


