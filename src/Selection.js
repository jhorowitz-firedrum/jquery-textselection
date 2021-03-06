define( [],
/**
 *
 */
function() {
    var Selection = ( function() {
        var hasRange = (
            typeof document.selection !== "undefined" &&
            typeof document.selection.createRange !== "undefined"
        );

        return {

            /**
             *
             */
            getSelectionRange: function( el ) {
                var start, end, range, rangeLength, duplicateRange, textRange;

                el.focus();

                if ( typeof el.selectionStart !== "undefined" ) {

                    // Mozilla / Safari
                    start = el.selectionStart;
                    end = el.selectionEnd;

                } else if ( hasRange ) {

                    // IE
                    range = document.selection.createRange();
                    rangeLength = range.text.length;

                    if( range.parentElement() !== el ) {
                        throw( "Unable to get selection range." );
                    }

                    if ( el.type === "textarea" ) {

                        // Textarea
                        duplicateRange = range.duplicate();
                        duplicateRange.moveToElementText(el);
                        duplicateRange.setEndPoint('EndToEnd', range);

                        start = duplicateRange.text.length - rangeLength;

                    } else {

                        // Text Input
                        textRange = el.createTextRange();
                        textRange.setEndPoint("EndToStart", range);

                        start = textRange.text.length;
                    }

                    end = start + rangeLength;

                } else {

                    // Unsupported type
                    throw( "Unable to get selection range." );
                }

                return {
                    start: start,
                    end:   end
                };
            },

            /**
             *
             */
            getSelectionStart: function( el ) {
                return this.getSelectionRange( el ).start;
            },

            /**
             *
             */
            getSelectionEnd: function( el ) {
                return this.getSelectionRange( el ).end;
            },

            /**
             *
             */
            setSelectionRange: function( el, start, end ) {

                var value, range;

                el.focus();

                if ( typeof end === "undefined" ) {
                    end = start;
                }

                if ( typeof el.selectionStart !== "undefined" ) {

                    // Mozilla / Safari
                    el.setSelectionRange( start, end );

                } else if ( hasRange ) {

                    // IE
                    value = el.value;
                    range = el.createTextRange();
                    end -= start + value.slice( start + 1, end ).split( "\n" ).length - 1;
                    start -= value.slice( 0, start ).split( "\n" ).length - 1;
                    range.move( "character", start );
                    range.moveEnd( "character", end );
                    range.select();

                } else {

                    // Unsupported
                    throw( "Unable to set selection range." );
                }
            },

            /**
             *
             */
            getSelectedText: function( el ) {
                var selection = this.getSelectionRange( el );
                return el.value.substring( selection.start, selection.end );
            },

            /**
             *
             */
            insertText: function( el, text, start, end, selectText ) {

                end = end || start;

                var textLength = text.length,
                selectionEnd = start + textLength,
                beforeText = el.value.substring( 0, start ),
                afterText = el.value.substr( end );

                el.value = beforeText + text + afterText;

                if ( selectText === true ) {
                    this.setSelectionRange( el, start, selectionEnd );
                } else {
                    this.setSelectionRange( el, selectionEnd );
                }
            },

            /**
             *
             */
            replaceSelectedText: function( el, text, selectText ) {
                try {
                    var selection = this.getSelectionRange( el );
                    this.insertText( el, text, selection.start, selection.end, selectText );
                } catch( e ) {
                    if ( window.getSelection ) {
                        var range;
                        var sel = window.getSelection();
                        if ( sel.getRangeAt && sel.rangeCount ) {
                            range = sel.getRangeAt( 0 );
                            range.deleteContents();
                            var el = document.createElement( "div" );
                            el.innerHTML = text;
                            var frag = document.createDocumentFragment(), node, lastNode;
                            while ( ( node = el.firstChild ) ) {
                                lastNode = frag.appendChild( node );
                            }
                            range.insertNode( frag );
                            
                            if ( lastNode ) {
                                if ( selectText === true ) {
                                    range.setEndAfter( lastNode );
                                } else {
                                    range = range.cloneRange();
                                    range.setStartAfter( lastNode );
                                    range.collapse( true );
                                    sel.removeAllRanges();
                                    sel.addRange( range );
                                }
                            }
                        }
                    } else if ( document.selection && document.selection.type != "Control" ) {
                        document.selection.createRange().pasteHTML( text );
                    } else {
                        throw( e );
                    }
                }
            },

            /**
             *
             */
            wrapSelectedText: function( el, beforeText, afterText, selectText ) {
                var text = beforeText + this.getSelectedText( el ) + afterText;
                this.replaceSelectedText( el, text, selectText );
            }

        };
    } )();
} );