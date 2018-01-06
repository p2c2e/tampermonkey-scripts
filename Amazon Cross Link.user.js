// ==UserScript==
// @name       Amazon Cross Link
// @namespace  http://www.diyd2.in/
// @version    1.0.0
// @description  Link Amazon India / US Sites
// @copyright  2017+ Sudharsan R.
// @match      http://www.amazon.com/*
// @match      https://www.amazon.com/*
// @match      http://www.amazon.in/*
// @match      https://www.amazon.in/*
// @require http://code.jquery.com/jquery-1.9.1.min.js
// ==/UserScript==

(function() {
function getLibraryUrl() {
    if ($("#storeID").attr('value') == "books") 
    {
        var title, author, isbn;
        try { 
            title = $('#productTitle').contents()[0].data;
        }
        catch(e) {
        }
        try { 
            author = $('.author > *:visible').first().text();
    	}
        catch(e) {
        }
        try {
        	isbn = $('b:contains("ISBN-10")').parent().contents().get(1).data;
		}
        catch(e) {
        }
        /*
        if (title) {
            debugger;
            title = title.replace(/\n/g, "");	// No CR
            title = title.replace(/\([^)]+\)/g, "");	// (Book 1) is removed
            title = title.replace(/[\?\!\;\)\(]/g, ""); // Remove punctuation
            title = title.replace(/ /g, "+"); // url sub
            var url = 'http://webcat.cityofpaloalto.org/ipac20/ipac.jsp?menu=search&ri=&index=.TW&term=' + title;
            return url;
        }
        isbn = isbn.match(/\d+/g)[0];
        if (isbn) {
            var url = "http://webcat.cityofpaloalto.org/ipac20/ipac.jsp?menu=search&profile=pacl&index=ISBNEX&term=" + isbn;
        	return url;
        }
        */
        var url = window.location.href;
        if( url.indexOf("amazon.com") != -1 ) {
            url = url.replace("amazon.com", "amazon.in");
            return url;
        } else if( url.indexOf("amazon.in") != -1 ) {
            url = url.replace("amazon.in", "amazon.com");
            return url;
        }
    }
    return null;
}

$(document).ready(function() {
    var libraryUrl = getLibraryUrl();
    //alert(libraryUrl);
    if (!libraryUrl) {
        console.log("not a book");
        return;
    }
	var b = $('<span id="paloAltoLibrary">Link to other site</span>');
    b.css({
  		color: '#ffffff',
  		fontSize: '12px',
  		padding: '4px 30px 3px 28px',
		borderRadius: '3px',
  		border: 'solid #d91c71 1px',
        width: '100%',
  		background: '-webkit-gradient(linear, 0 0, 0 100%, from(#D03865), to(#BF335C))',
        marginBottom: '8px',
        position: 'static',
        opacity: '1.0'
    })
    .addClass('a-button')
    .addClass('a-button-input');
    b.click(function(ev) {
        window.open(libraryUrl, "_blank");
        ev.preventDefault();
        ev.stopPropagation();
    });
    // figure out where to insert the button
    var addToCart = $('.a-button-stack');	// Page with 'AddToCart' button
    if (addToCart.length > 0)
	    addToCart.first().before(b);
    else { // 
        var bbox = $('.cBox.buyTopBox');
        b.css('marginLeft', 30);
        bbox.first().prepend(b);
    }
        
});
})();