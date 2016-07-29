// ==UserScript==
// @name           LinkISBN
// @namespace      http://diyd2.in/gmscripts
// @version        1.0
// @author         sudharsan.rangarajan @ gmail.com
// @description    Link ISBN like numbers on flipkart website to Amazon. Obviously, I rely on the reviews on AMZN more than Flipkart
// @include        http://*flipkart.com/*
// ==/UserScript==

(function () {
    var isbnRegex = /\b([0-9]{10,10})\b/ig;

    var allowedParents = [
        "abbr", "acronym", "address", "applet", "b", "bdo", "big", "blockquote", "body", 
        "caption", "center", "cite", "code", "dd", "del", "div", "dfn", "dt", "em", 
        "fieldset", "font", "form", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe",
        "ins", "kdb", "li", "object", "pre", "p", "q", "samp", "small", "span", "strike", 
        "s", "strong", "sub", "sup", "td", "th", "tt", "u", "var"
        ];
    
    var xpath = "//text()[(parent::" + allowedParents.join(" or parent::") + ")]";

//	alert(xpath);
    var candidates = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var amznPrefix = 'http://www.amazon.com/gp/search/ref=sr_adv_b/?field-isbn=';

    for (var cand = null, i = 0; (cand = candidates.snapshotItem(i)); i++) {
        if (isbnRegex.test(cand.nodeValue)) {
            var span = document.createElement("span");
            var source = cand.nodeValue;
            
            cand.parentNode.replaceChild(span, cand);

            isbnRegex.lastIndex = 0;
            for (var match = null, lastLastIndex = 0; (match = isbnRegex.exec(source)); ) {
                span.appendChild(document.createTextNode(source.substring(lastLastIndex, match.index)));
                
                var a = document.createElement("a");
                a.setAttribute("href", amznPrefix+match[0]);
                a.appendChild(document.createTextNode(match[0]));
                span.appendChild(a);

                lastLastIndex = isbnRegex.lastIndex;
            }

            span.appendChild(document.createTextNode(source.substring(lastLastIndex)));
            span.normalize();
        }
    }
})();
