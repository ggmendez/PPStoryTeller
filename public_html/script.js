/* global d3, XLSX, gsap, ScrollTrigger, ScrollToPlugin */

document.addEventListener("DOMContentLoaded", (event) => {

    let searcher = null;

    let pathLargestRect, pathSmallesRect;
    let label1, label2;
    let nonTargetLabels;

    let otherRectsIDs;
    let otherLabelsIDs;
    let pathString1, pathString2, endPath1, endPath2;
    let explaining = "packing";


    // Function to get the value of a query parameter
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    let formatedNames = {};
    formatedNames.tiktok = "TikTok"
    formatedNames.openai = "OpenAI"
    formatedNames.amazon = "Amazon"
    formatedNames.bixby = "Bixby"
    formatedNames.gemini = "Gemini"
    // formatedNames.siri = "Siri"

    // Extract the value of "who" from the URL
    let who = getQueryParam('who');
    if (!who) who = "tiktok";
    document.title = formatedNames[who] + "'s PP";









    // Add the popup structure to the body
    const popup = document.createElement('div');
    popup.className = 'popup';
    // popup.innerHTML = `
    // <div class="popup-content">
    //     <div id="iframe-container">
    //         <iframe id="contextIframe" src="" style="width: 100%; height: 100%; border: none;"></iframe>
    //     </div>
    // </div>
    // <span class="popup-close">&times;</span>`;


    popup.innerHTML = `
    <div class="popup-content">
        <div class="overlay">
            <div class="left-content">
                <div class="square-indicator"></div>
                <div class="main-question">Same or different person?</div>
            </div>
            <div class="page-navigation">
                <span class="page-info">0/0</span>
                <div class="navigation">
                    <button class="nav-button up-button">
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </button>
                    <button class="nav-button down-button">
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <button class="overlay-close-button">
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div id="iframe-container">
            <iframe id="contextIframe" src="" style="width: 100%; height: 100%; border: none;"></iframe>
        </div>
    </div>`;
  

  


















    document.body.appendChild(popup);

    const popupContent = popup.querySelector('.popup-content');
    const popupClose = popup.querySelector('.popup-close');

    if (popupClose) {
        popupClose.addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }


    // Event listener for Escape key to close the popup
    const escKeyListener = (event) => {
        if (event.key === 'Escape') {
            popup.style.display = 'none';
            document.removeEventListener('keydown', escKeyListener);
        }
    };

    // const normalizeText = (text) => {
    //     return text.replace(/\s+([,.;])/g, '$1')
    //         .replace(/\s+/g, ' ')
    //         .replace(/"\s*(.*?)\s*"/g, '"$1"')
    //         .trim();
    // };

    // Function to normalize and concatenate text content, ignoring HTML tags
    // const recursiveConcatText = (node) => {
    //     let text = '';
    //     node.childNodes.forEach(child => {
    //         if (child.nodeType === Node.TEXT_NODE) {
    //             text += child.textContent;
    //         } else if (child.nodeType === Node.ELEMENT_NODE) {
    //             text += recursiveConcatText(child);
    //         }
    //     });
    //     return text;
    // };


    // const findTextNodeContaining = (element, searchText) => {
    //     const searchNormalizedText = normalizeText(searchText);

    //     const findMatchingElements = (node) => {
    //         const matches = [];
    //         const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, null, false);

    //         while (walker.nextNode()) {
    //             const currentNode = walker.currentNode;
    //             const concatenatedText = normalizeText(recursiveConcatText(currentNode));

    //             if (concatenatedText.includes(searchNormalizedText)) {
    //                 matches.push(currentNode);
    //             }
    //         }

    //         return matches;
    //     };

    //     return findMatchingElements(element);
    // };






    const scrollToAndHighlightInIframe = (currentText) => {

        if (!searcher) {
            searcher = new IframeSearcher('contextIframe');
        }

        let normalizedText = normalizeText(healPunctuation(currentText));

        console.log("normalizedText:");
        console.log(normalizedText);

        searcher.search(normalizedText);

        console.log("searcher.currentMatches:");
        console.log(searcher.currentMatches);

        if (!searcher.currentMatches.length) {
            const lastColonIndex = normalizedText.lastIndexOf(':');
            if (lastColonIndex !== -1) {
                const secondLastColonIndex = normalizedText.lastIndexOf(':', lastColonIndex - 1);
                if (secondLastColonIndex !== -1) {
                    normalizedText = normalizedText.substring(secondLastColonIndex + 1).trim();

                    console.log("normalizedText 1");
                    console.log(normalizedText);

                } else {
                    // If there's only one colon, fallback to using the last one
                    normalizedText = normalizedText.substring(lastColonIndex + 1).trim();

                    console.log("normalizedText 2");
                    console.log(normalizedText);

                }




                searcher.search(normalizedText);
            }
        }










        return;


        const iframe = document.getElementById('contextIframe');
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        removeHighlightInIframe(); // Remove existing highlights


        if (document.querySelector('.popup').style.display === 'block') {
            highlightTextInIframe(iframe, normalizedText);
        } else {
            // Display the popup and set up the onload event
            document.querySelector('.popup').style.display = 'block';
        }

    };












    // const highlightTextInIframe = (iframe, searchText) => {
    //     const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    //     // Normalize the search text by removing excess whitespace and special characters
    //     const searchNormalizedText = normalizeText(searchText);

    //     const recursiveConcatTextWithNodes = (node, text = '', nodes = []) => {
    //         node.childNodes.forEach(child => {
    //             if (child.nodeType === Node.TEXT_NODE) {
    //                 const normalizedText = normalizeText(addSpaceAfterPunctuation(child.textContent));
    //                 text += normalizedText;
    //                 nodes.push({ node: child, length: normalizedText.length });
    //             } else if (child.nodeType === Node.ELEMENT_NODE) {
    //                 text = recursiveConcatTextWithNodes(child, text, nodes);
    //                 // Add a space after the text enclosed by an h2 tag
    //                 if (child.tagName === 'H2') {
    //                     text += ' ';
    //                 }
    //                 nodes.push({ node: child, length: 0 }); // Ensure we capture element nodes to maintain context
    //             }
    //         });
    //         return text;
    //     };


    //     // Get the iframe body content and the associated nodes
    //     const nodes = [];

    //     const iframeText = normalizeText(addSpaceAfterPunctuation(recursiveConcatTextWithNodes(iframeDocument.body, '', nodes)));

    //     // Find the start index of the search text considering HTML tags
    //     const startIndex = iframeText.indexOf(searchNormalizedText);

    //     console.log("iframeText:");
    //     console.log(iframeText);

    //     console.log("startIndex:");
    //     console.log(startIndex);

    //     console.log("searchNormalizedText:");
    //     console.log(searchNormalizedText);


    //     if (startIndex === -1) {
    //         console.warn('No matching text found.');
    //         return;
    //     }

    //     // Calculate the end index of the search text
    //     const endIndex = startIndex + searchNormalizedText.length;

    //     // Highlight text by wrapping the corresponding nodes in <span> tags
    //     let charCount = 0;
    //     let remainingLength = searchNormalizedText.length;
    //     let highlighting = false;
    //     let highlightSpan = null;

    //     for (const { node, length } of nodes) {
    //         const nodeStartIndex = charCount;
    //         const nodeEndIndex = charCount + length;

    //         if (nodeStartIndex <= startIndex && nodeEndIndex > startIndex) {
    //             // Start highlighting
    //             const span = iframeDocument.createElement('span');
    //             span.style.backgroundColor = 'rgba(255, 255, 0, 0.75)';

    //             const startOffset = Math.max(0, startIndex - nodeStartIndex);
    //             const endOffset = Math.min(length, startOffset + remainingLength);

    //             // Validate offsets before applying them to the range
    //             if (endOffset >= startOffset && endOffset <= length) {
    //                 const range = iframeDocument.createRange();
    //                 range.setStart(node, startOffset);
    //                 range.setEnd(node, endOffset);
    //                 range.surroundContents(span);

    //                 remainingLength -= (endOffset - startOffset);
    //                 highlightSpan = span;
    //                 highlighting = true;
    //             } else {
    //                 console.error('Invalid range offsets:', { startOffset, endOffset, nodeLength: length });
    //                 break; // Stop processing if offsets are invalid
    //             }
    //         } else if (highlighting) {
    //             // Continue highlighting (across multiple nodes)
    //             const span = iframeDocument.createElement('span');
    //             span.style.backgroundColor = 'rgba(255, 255, 0, 0.75)';

    //             const startOffset = 0;
    //             const endOffset = Math.min(length, remainingLength);

    //             // Validate offsets before applying them to the range
    //             if (endOffset >= startOffset && endOffset <= length) {
    //                 const range = iframeDocument.createRange();
    //                 range.setStart(node, startOffset);
    //                 range.setEnd(node, endOffset);
    //                 range.surroundContents(span);

    //                 remainingLength -= (endOffset - startOffset);
    //                 highlightSpan = span;

    //                 if (remainingLength <= 0) {
    //                     break; // Stop if the entire search text has been highlighted
    //                 }
    //             } else {
    //                 console.error('Invalid range offsets:', { startOffset, endOffset, nodeLength: length });
    //                 break; // Stop processing if offsets are invalid
    //             }
    //         }

    //         charCount += length;
    //     }

    //     if (highlightSpan) {
    //         highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //         setTimeout(() => {
    //             iframe.scrollBy(0, -50); // Adjust the number of pixels as needed
    //         }, 500); // Adjust the timeout if necessary
    //     }
    // };



    // const highlightTextInIframe = (iframe, searchText) => {

    //     const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    //     // Normalize the search text by removing excess whitespace and special characters
    //     const searchNormalizedText = normalizeText(searchText);

    //     const recursiveConcatTextWithNodes = (node, text = '', nodes = [], originalLengths = []) => {
    //         node.childNodes.forEach(child => {
    //             if (child.nodeType === Node.TEXT_NODE) {
    //                 const originalText = child.textContent;
    //                 const normalizedText = normalizeText(addSpaceAfterPunctuation(originalText));
    //                 text += normalizedText;
    //                 nodes.push({ node: child, length: normalizedText.length });
    //                 originalLengths.push({ length: originalText.length, node });
    //             } else if (child.nodeType === Node.ELEMENT_NODE) {
    //                 // Inline elements like <strong> should not introduce breaks in the text
    //                 if (child.tagName === 'STRONG' || child.tagName === 'EM' || child.tagName === 'SPAN') {
    //                     text = recursiveConcatTextWithNodes(child, text, nodes, originalLengths);
    //                 } else {
    //                     text = recursiveConcatTextWithNodes(child, text, nodes, originalLengths);
    //                     if (child.tagName === 'H2') {
    //                         text += ' ';
    //                         nodes.push({ node: child, length: 1 }); // Account for the added space
    //                         originalLengths.push({ length: 0, node }); // This node adds space but has no original length
    //                     } else {
    //                         nodes.push({ node: child, length: 0 });
    //                         originalLengths.push({ length: 0, node });
    //                     }
    //                 }
    //             }
    //         });
    //         return text;
    //     };

    //     // Get the iframe body content and the associated nodes
    //     const nodes = [];
    //     const originalLengths = [];
    //     const iframeText = recursiveConcatTextWithNodes(iframeDocument.body, '', nodes, originalLengths);

    //     // Find the start index of the search text considering HTML tags
    //     const startIndex = iframeText.indexOf(searchNormalizedText);

    //     console.log("iframeText:");
    //     console.log(iframeText);

    //     console.log("startIndex:");
    //     console.log(startIndex);

    //     console.log("searchNormalizedText:");
    //     console.log(searchNormalizedText);

    //     if (startIndex === -1) {
    //         console.warn('No matching text found.');
    //         return;
    //     }

    //     // Calculate the end index of the search text
    //     const endIndex = startIndex + searchNormalizedText.length;

    //     // Highlight text by wrapping the corresponding nodes in <span> tags
    //     let charCount = 0;
    //     let remainingLength = searchNormalizedText.length;
    //     let highlighting = false;
    //     let highlightSpan = null;

    //     for (let i = 0; i < nodes.length; i++) {
    //         const { node, length } = nodes[i];
    //         const { length: originalLength } = originalLengths[i];

    //         const nodeStartIndex = charCount;
    //         const nodeEndIndex = charCount + length;

    //         if (nodeStartIndex <= startIndex && nodeEndIndex > startIndex) {
    //             // Start highlighting
    //             const span = iframeDocument.createElement('span');
    //             span.style.backgroundColor = 'rgba(255, 255, 0, 0.75)';

    //             const startOffset = Math.max(0, startIndex - nodeStartIndex);
    //             const endOffset = Math.min(length, startOffset + remainingLength);

    //             // Adjust offsets to match the original content length
    //             const adjustedStartOffset = originalLength ? (originalLength / length) * startOffset : startOffset;
    //             const adjustedEndOffset = originalLength ? (originalLength / length) * endOffset : endOffset;

    //             const range = iframeDocument.createRange();
    //             range.setStart(node, adjustedStartOffset);
    //             range.setEnd(node, adjustedEndOffset);
    //             range.surroundContents(span);

    //             remainingLength -= (endOffset - startOffset);
    //             highlightSpan = span;
    //             highlighting = true;
    //         } else if (highlighting) {
    //             const span = iframeDocument.createElement('span');
    //             span.style.backgroundColor = 'rgba(255, 255, 0, 0.75)';

    //             const startOffset = 0;
    //             const endOffset = Math.min(length, remainingLength);

    //             const adjustedEndOffset = originalLength ? (originalLength / length) * endOffset : endOffset;

    //             const range = iframeDocument.createRange();
    //             range.setStart(node, startOffset);
    //             range.setEnd(node, adjustedEndOffset);
    //             range.surroundContents(span);

    //             remainingLength -= (endOffset - startOffset);
    //             highlightSpan = span;

    //             if (remainingLength <= 0) {
    //                 break;
    //             }
    //         }

    //         charCount += length;
    //     }

    //     if (highlightSpan) {
    //         highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //         setTimeout(() => {
    //             iframe.scrollBy(0, -50); // Adjust the number of pixels as needed
    //         }, 500);
    //     }
    // };









    const highlightTextInIframe = (iframe, searchText) => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Normalize the search text by removing excess whitespace and special characters
        const searchNormalizedText = normalizeText(searchText);

        const recursiveConcatTextWithNodes = (node, text = '', nodes = [], originalLengths = []) => {
            node.childNodes.forEach((child, index) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const originalText = child.textContent;
                    const normalizedText = normalizeText(healPunctuation(originalText));

                    // Ensure space is added where necessary, particularly between text nodes and inline elements
                    if (text.length > 0 && node.childNodes[index - 1] && node.childNodes[index - 1].nodeType !== Node.TEXT_NODE) {


                        // console.log("ÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇÇ");
                        // console.log(text);
                        // console.log(node);
                        // console.log(node.childNodes[index - 1]);



                        // text += ' ';
                    }

                    text += normalizedText;
                    nodes.push({ node: child, length: normalizedText.length });
                    originalLengths.push({ length: originalText.length, node });
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    text = recursiveConcatTextWithNodes(child, text, nodes, originalLengths);
                    if (child.tagName.toUpperCase() === 'H2' || child.tagName.toUpperCase() === 'STRONG') {
                        text += ' ';
                        nodes.push({ node: child, length: 1 }); // Account for the added space
                        originalLengths.push({ length: 0, node }); // This node adds space but has no original length
                    } else {
                        nodes.push({ node: child, length: 0 });
                        originalLengths.push({ length: 0, node });
                    }
                }
            });
            return text;
        };

        // Get the iframe body content and the associated nodes
        const nodes = [];
        const originalLengths = [];
        const iframeText = recursiveConcatTextWithNodes(iframeDocument.body, '', nodes, originalLengths);



        // Find the start index of the search text considering HTML tags
        const startIndex = iframeText.indexOf(searchNormalizedText);

        if (startIndex === -1) {
            console.warn('No matching text found.');

            console.log("iframeText:");
            console.log(iframeText);



            return;
        }

        // Calculate the end index of the search text
        const endIndex = startIndex + searchNormalizedText.length;

        // Highlight text by wrapping the corresponding nodes in <span> tags
        let charCount = 0;
        let remainingLength = searchNormalizedText.length;
        let highlighting = false;
        let highlightSpan = null;

        for (let i = 0; i < nodes.length; i++) {
            const { node, length } = nodes[i];
            const { length: originalLength } = originalLengths[i];

            const nodeStartIndex = charCount;
            const nodeEndIndex = charCount + length;

            if (nodeStartIndex <= startIndex && nodeEndIndex > startIndex) {
                // Start highlighting
                const span = iframeDocument.createElement('span');
                span.style.backgroundColor = 'rgba(255, 255, 0, 0.75)';

                const startOffset = Math.max(0, startIndex - nodeStartIndex);
                const endOffset = Math.min(length, startOffset + remainingLength);

                const range = iframeDocument.createRange();
                range.setStart(node, startOffset);
                range.setEnd(node, endOffset);
                range.surroundContents(span);

                remainingLength -= (endOffset - startOffset);
                highlightSpan = span;
                highlighting = true;
            } else if (highlighting) {
                const span = iframeDocument.createElement('span');
                span.style.backgroundColor = 'rgba(255, 255, 0, 0.75)';

                const startOffset = 0;
                const endOffset = Math.min(length, remainingLength);

                const range = iframeDocument.createRange();
                range.setStart(node, startOffset);
                range.setEnd(node, endOffset);
                range.surroundContents(span);

                remainingLength -= (endOffset - startOffset);
                highlightSpan = span;

                if (remainingLength <= 0) {
                    break;
                }
            }

            charCount += length;
        }

        if (highlightSpan) {
            highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                iframe.scrollBy(0, -50); // Adjust the number of pixels as needed
            }, 500);
        }
    };

    const normalizeText = (text) => {
        return text.replace(/\s+([,.;])/g, '$1')
            .replace(/\s+/g, ' ')
            .replace(/"\s*(.*?)\s*"/g, '"$1"')
            .trim();
    };

    function healPunctuation(text) {
        return text.replace(/([,:;!?])(?=\S)/g, '$1 ')
            .replace(/(\.)(?!\s|$)/g, '. ')
            .replace(/\be\. g\./g, 'e.g.')
            .replace(/"(\S)/g, '" $1')
            .replace(/\s+:/g, ":")
            .replace(/"\s+\)/g, "\")");
    }

















    // const normalizeText = (text) => {
    //     return text.replace(/\s+([,.;])/g, '$1')
    //         .replace(/\s+/g, ' ')
    //         .replace(/"\s*(.*?)\s*"/g, '"$1"')
    //         .trim();
    // };

    // function addSpaceAfterPunctuation(text) {
    //     // Regular expression to add a space after punctuation marks, but not inside abbreviations
    //     return text.replace(/([,:;!?])(?=\S)/g, '$1 ')
    //         .replace(/(\.)(?!\s|$)/g, '. ')
    //         .replace(/\be\. g\./g, 'e.g.');
    // }



    // const normalizeText = (text) => {
    //     return text.replace(/\s+([,.;])/g, '$1')
    //         .replace(/\s+/g, ' ')
    //         .replace(/"\s*(.*?)\s*"/g, '"$1"')
    //         .trim();
    // };

    // function addSpaceAfterPunctuation(text) {
    //     // Regular expression to add a space after punctuation marks, but not inside abbreviations
    //     return text.replace(/([,:;!?])(?=\S)/g, '$1 ')
    //         .replace(/(\.)(?!\s|$)/g, '. ')
    //         .replace(/\be\. g\./g, 'e.g.');
    // }




















    const removeHighlightInIframe = () => {
        const iframe = document.getElementById('contextIframe');
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Select all span elements that were used for highlighting
        const highlightedElements = iframeDocument.querySelectorAll('span[style*="background-color"]');

        highlightedElements.forEach(el => {
            const parent = el.parentNode;

            // Move all child nodes of the span (which should be text nodes) back to the parent
            while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
            }

            // Remove the now-empty span element
            parent.removeChild(el);

            // Normalize the parent to merge adjacent text nodes
            parent.normalize();
        });
    };



    /********************************************************/



    // const normalizeText = (text) => {
    //     // return text.replace(/\s+([,.])/g, '$1').replace(/\s+/g, ' ').replace(/(\s*)"(.*?)"(\s*)/g, '$1"$2"$3').trim();

    //     return text.replace(/\s+([,.;])/g, '$1')
    //         .replace(/\s+/g, ' ')
    //         .replace(/"\s*(.*?)\s*"/g, '"$1"')
    //         .trim();

    // };

    const recursiveConcatText = (node) => {
        let text = '';
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                text += recursiveConcatText(child);
            }
        });
        // console.log("-------------- text:");
        // console.log(text);
        return text;
    };

    const findTextNodeContaining = (element, searchText) => {

        const searchNormalizedText = normalizeText(searchText);

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null, false);
        const nodes = [];

        while (walker.nextNode()) {
            const currentNode = walker.currentNode;
            const concatenatedText = normalizeText(recursiveConcatText(currentNode));

            if (concatenatedText.includes(searchNormalizedText)) {
                nodes.push(currentNode);
            }
        }

        return nodes;
    };




    /********************************************************/

    // Event listener for context button
    document.addEventListener('click', function (event) {
        if (event.target.id === 'contextButton') {
            const iframe = document.getElementById('contextIframe');
            
            const currentText = document.querySelector('.tooltip-content').textContent;

            // console.log("currentText:");
            // console.log(currentText);

            if (popup.style.display === 'block') {
                scrollToAndHighlightInIframe(currentText);
            } else {

                popup.style.display = 'block';

                const iframe = document.getElementById('contextIframe');
                const url = "./htmls/" + who + ".html";

                // Fetch the HTML content
                fetch(url)
                    .then(response => response.text())
                    .then(html => {
                        // Create a temporary DOM element to manipulate the HTML
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');

                        // Remove all links (a tags) and replace them with their text content
                        const links = doc.querySelectorAll('a');
                        links.forEach(link => {
                            const textNode = document.createTextNode(link.textContent);
                            link.parentNode.replaceChild(textNode, link);
                        });

                        doc.body.innerHTML = doc.body.innerHTML.replace(/[“”]/g, '"');

                        // Serialize the modified HTML back to a string
                        const modifiedHTML = new XMLSerializer().serializeToString(doc);

                        // Create a Blob from the modified HTML string
                        const blob = new Blob([modifiedHTML], { type: 'text/html' });
                        const blobUrl = URL.createObjectURL(blob);

                        // Set the iframe src to the Blob URL
                        iframe.src = blobUrl;

                        iframe.onload = () => {

                            // highlightTextInIframe(iframe, currentText);

                            scrollToAndHighlightInIframe(currentText);



                        };
                    })
                    .catch(error => {
                        alert('Error loading or modifying HTML:', error);
                        console.error('Error loading or modifying HTML:', error);
                    });

                document.addEventListener('keydown', escKeyListener);
            }



        }
    });

































    // Create a tooltip div that is hidden by default
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px");


    const svg = d3.select('#circle-packing-svg');
    const svgElement = document.getElementById('circle-packing-svg');
    let svgWidth = svgElement.clientWidth;
    let svgHeight = svgElement.clientHeight;



    const infoIcon = svg.append('g');
    const cursorIcon = svg.append('g');

    loadIconAt(infoIcon, './icons/info.svg', svgWidth - 40, 40)
        .then(data => {
            infoIcon.on('click', () => {
                if (explaining == "packing") {
                    explainPacking();
                } else if (explaining == "actors") {
                    explainActors();
                } else if (explaining == "dataPerActor") {
                    explainDataPerActor();
                }
            });
        });


    loadIconAt(cursorIcon, './icons/cursor.svg', svgWidth / 2, svgHeight / 2);

    let originalTransformations = {};
    let labelsOf = {};
    let dataRectStrokeWidth = 1.5;

    let categoryStartPositions = {};

    const targetSize = 8;

    console.log("svgWidth: " + svgWidth);
    console.log("svgHeight: " + svgHeight);

    // Animation duration
    let animationDuration = 0.85;

    // making all this global
    let movedRectData, svgRects, svgCategoryGroups, packedRectData;

    let rectData = [];

    let originalNames = {};

    var actorIconScale = 0.35;

    // arrow animations
    let arrow = document.querySelector('.arrow');
    let arrowRight = document.querySelector('.arrow-right');
    let actorsTimeline;

    // Create the centerText element at the beginning
    let centerText = svg.append('text')
        .attr('class', 'centerText')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('x', svgWidth / 2)
        .attr('y', svgHeight / 2)
        .style('font-size', '16px')
        .style('fill', '#333')
        .style('opacity', 0)
        .style('transform-origin', 'center')  // Set transform-origin to center


    if (arrow) {
        gsap.to(arrow, { y: 12, ease: "power1.inOut", repeat: -1, yoyo: true });
    }

    if (arrowRight) {
        gsap.to(arrowRight, { x: -12, ease: "power1.inOut", repeat: -1, yoyo: true });
    }

    // plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MotionPathPlugin);


    const padding = 2;
    const minLabelSize = 40; // Minimum size for a rectangle to have a label

    // Define entities globally
    let entities;

    const actorDataMap = {};

    window.actorDataMap = actorDataMap;

    document.querySelector("#who").textContent = formatedNames[who];
    document.querySelector("#they").textContent = formatedNames[who];


    function getCategory(item, categorization) {
        const normalizedItem = item.toLowerCase().trim();


        for (const category in categorization) {
            for (const entry of categorization[category]) {
                if (entry.toLowerCase().trim() == normalizedItem) {
                    // console.log(" --- " + entry.toLowerCase().trim());
                    if (category == "We")
                        return formatedNames[who];
                    return category;
                }
            }
        }
        console.log(" $$$$$$$$$$$$$$$$$$$$$$$$$ item");
        console.log(item);
        console.log(normalizedItem);
        return "Unknown Category";
    }

    fetch('graphmls/' + who + '.graphml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'application/xml');

            // Step 1: Identify collected data nodes and the actors that collect them
            const collectedNodes = new Set();
            const actorsCollectingData = new Set();

            Array.from(xmlDoc.querySelectorAll('edge')).forEach(edge => {
                const action = edge.querySelector('data[key="d2"]')?.textContent;
                if (action === 'COLLECT') {
                    collectedNodes.add(edge.getAttribute('target'));
                    actorsCollectingData.add(edge.getAttribute('source'));
                }
            });

            // Step 2: Create a combined set of actors that collect data and the collected data nodes
            const combinedNodes = new Set();
            Array.from(xmlDoc.querySelectorAll('node')).forEach(node => {
                const nodeId = node.getAttribute('id');
                const nodeType = node.querySelector('data[key="d1"]')?.textContent;
                if (nodeType === 'ACTOR' && actorsCollectingData.has(nodeId)) {
                    combinedNodes.add(nodeId);
                } else if (collectedNodes.has(nodeId)) {
                    combinedNodes.add(nodeId);
                }
            });

            console.log("combinedNodes");
            console.log(combinedNodes);

            const nodes = Array.from(xmlDoc.querySelectorAll('node'))
                .filter(node => combinedNodes.has(node.getAttribute('id')))
                .map(node => ({
                    id: node.getAttribute('id'),
                    label: node.getAttribute('id'),
                    category: node.querySelector('data[key="d1"]')?.textContent === 'ACTOR' ? getCategory(node.getAttribute('id'), categories[who].actorCategories) : getCategory(node.getAttribute('id'), categories[who].dataCategories),
                    type: node.querySelector('data[key="d1"]')?.textContent,
                    name: node.querySelector('data[key="d0"]')?.textContent,
                    Indegree: 0  // Initialize Indegree as 0, will be computed later
                }));

            console.log("nodes");
            console.log(nodes);

            entities = nodes;

            console.log("Actor entities processed (and XML files loaded)");

            // Load and process edges from GraphML
            const edges = Array.from(xmlDoc.querySelectorAll('edge'))
                .filter(edge => edge.querySelector('data[key="d2"]')?.textContent === 'COLLECT')
                .map(edge => ({
                    source: edge.getAttribute('source'),
                    target: edge.getAttribute('target'),
                    text: edge.querySelector('data[key="d3"]')?.textContent || '',
                    category: getCategory(edge.getAttribute('source'), categories[who].actorCategories),
                }));

            // Compute Indegree for each node
            edges.forEach(edge => {
                const targetNode = entities.find(node => node.id === edge.target);
                if (targetNode) {
                    targetNode.Indegree += 1;
                }
            });

            console.log("Updated nodes with Indegree");
            console.log(entities);

            edges.forEach(edge => {
                const actorName = edge.source;
                const dataName = edge.target;

                let actorCategory = edge.category;

                if (!actorCategory) {
                    console.error(`Actor category for ${actorName} not found.`);
                    return;
                }
                let cleanActorCategory = removeSpaces(actorCategory.toUpperCase());
                originalNames[cleanActorCategory] = actorCategory;

                if (!actorDataMap[cleanActorCategory]) {
                    actorDataMap[cleanActorCategory] = {};
                }

                const dataEntities = entities.filter(d => d.type === 'DATA');
                // console.log("dataEntities:");
                // console.log(dataEntities);

                console.log("dataName: " + dataName);
                let dataCategory = dataEntities.find(d => d.label === dataName)?.category;
                if (!dataCategory) {
                    console.error(`Data category for ${dataCategory} not found.`);
                    return;
                }

                let cleanDataCategory = removeSpaces(dataCategory.toUpperCase());
                originalNames[cleanDataCategory] = dataCategory;

                if (!actorDataMap[cleanActorCategory][cleanDataCategory]) {
                    actorDataMap[cleanActorCategory][cleanDataCategory] = [];
                }

                actorDataMap[cleanActorCategory][cleanDataCategory].push({
                    name: dataName,
                    text: edge.text
                });
            });

            console.log("***************** actorDataMap *****************");
            console.log(actorDataMap);



        })
        .then(() => {
            return processActorEntities(entities);
        })
        .then(() => {
            return processDataEntities(entities);
        })

        .then(() => {
            addScrollEvents(); // Only called once all SVGs are processed and actor entities are ready
        })










    function processActorEntities(entities) {

        // Actor entities
        const actorsEntities = entities.filter(d => d.type === 'ACTOR').map(entity => {
            return {
                ...entity,
                id: sanitizeId(entity.id)
            };
        });

        const excludedCategoryName = "WeXXXX";  // Name of the category to exclude
        const actorCategories = [...new Set(actorsEntities.filter(d => d.category !== excludedCategoryName).map(d => d.category))];

        document.querySelector("#totalActorCategories").textContent = actorCategories.length;

        const dimension = Math.min(svgWidth, svgHeight) / 3;
        const angleStep = (2 * Math.PI) / actorCategories.length;

        // Shuffle the categories randomly
        const shuffledCategories = actorCategories.sort(() => 0.5 - Math.random());

        let svgPromises = shuffledCategories.map((category, index) => {  // Use map instead of forEach to return an array of promises

            const angle = index * angleStep;
            const x = svgWidth / 2 + dimension * Math.cos(angle);
            const y = svgHeight / 2 + dimension * Math.sin(angle);
            const nameNoSpaces = category.replace(/\s+/g, '');

            let iconFile = `./icons/actors/${nameNoSpaces}.svg`;

            if (category == formatedNames[who]) {
                iconFile = `./icons/actors/We.svg`;
            }

            return d3.xml(iconFile).then(data => {

                const importedNode = document.importNode(data.documentElement, true);

                let actorID = generateUniqueId('actorIcon');

                const iconElement = svg.append('g')
                    .attr('class', 'actorIcon icon-hover')
                    .attr('id', actorID)
                    .attr('opacity', '0');

                var tempG = svg.append('g').append(() => importedNode);

                const bbox = importedNode.getBBox();
                const iconWidth = bbox.width;
                const iconHeight = bbox.height;

                console.log("iconWidth: " + iconWidth);
                console.log("iconHeight: " + iconHeight);

                tempG.remove();

                originalTransformations[actorID] = {
                    originalX: x - iconWidth / 2,
                    originalY: y - iconHeight / 2,
                    originalScale: actorIconScale,
                    originX: iconWidth / 2,
                    originY: iconHeight / 2
                };


                iconElement.append(() => importedNode);

                iconElement
                    .style('transform-origin', `${iconWidth / 2}px ${iconHeight / 2}px`)
                    .attr('transform', `translate(${(x - iconWidth / 2)}, ${(y - iconHeight / 2)}) scale(${actorIconScale})`);


                // Define a GSAP timeline for the animations
                let timeline = gsap.timeline({ paused: true });

                iconElement.on('mouseover', function (event) {
                    d3.select('#' + labelsOf[actorID]).style('font-weight', 'bolder');
                });
                iconElement.on('mouseout', function (event) {
                    d3.select('#' + labelsOf[actorID]).style('font-weight', 'normal');
                });

                const cleanCategory = removeSpaces(category.toUpperCase());
                const actorNames = entities.filter(d => d.type === 'ACTOR' && removeSpaces(d.category.toUpperCase()) === cleanCategory).map(d => d.label);
                const numberOfActors = actorNames.length;

                iconElement.attr('data-numberOfActors', numberOfActors);

                // Add event listener to the actor icons
                iconElement.on('click', function (event) {

                    // Clear existing content
                    centerText.selectAll('tspan').remove();

                    // Add the category name part with bold style
                    centerText.append('tspan')
                        .attr('x', svgWidth / 2)
                        .attr('dy', '0em')
                        .style('font-weight', 'bold')
                        .text(category + ':\n'); // category

                    // Create a spacing after the category
                    centerText.append('tspan')
                        .attr('x', svgWidth / 2)
                        .attr('dy', '1em') // Move down one line height from the last line
                        .text('\u00A0'); // Non-breaking space as content for spacing

                    // Add each actor name as a new line
                    actorNames.forEach((name, index) => {
                        centerText.append('tspan')
                            .attr('x', svgWidth / 2)
                            .attr('dy', '1.2em')
                            .style('font-weight', 'normal')
                            .text(`${index + 1}. ${name.charAt(0).toUpperCase() + name.slice(1)}`);
                    });


                    // Reset the disappearance timer
                    gsap.killTweensOf(centerText.node());

                    // Clear the previous timeline animations
                    timeline.clear();

                    // Animate the text appearance with GSAP
                    timeline.fromTo(centerText.node(),
                        {
                            opacity: 0,
                            y: "+=25",
                            transformOrigin: '50% 50%'
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: animationDuration,
                            ease: 'back.out(1.7)'
                        }
                    );

                    gsap.fromTo(centerText.node(),
                        {
                            transformOrigin: '50% 50%',
                        },
                        {
                            opacity: 0,
                            duration: animationDuration,
                            ease: 'back.in(1.7)',
                            delay: 3
                        }
                    );

                    // Play the timeline
                    timeline.play();
                });











                // drawRectAt(x, y, 20, 20, 'red')

                let labelID = generateUniqueId('actorLabel');

                // Append the text label
                const iconLabel = svg.append('text')
                    .attr('class', 'actorCategoryName')
                    .attr('id', labelID)
                    .attr('x', x)
                    .attr('y', y + (iconHeight * actorIconScale) / 2 + 10)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'hanging')
                    .attr('opacity', '0')
                    .text(category);

                labelsOf[actorID] = labelID;

                return { icon: iconElement, text: iconLabel };
            });

        });

        return Promise.all(svgPromises);
    }









    // Process entities and visualize
    function processDataEntities(entities) {

        let dataEntities = entities.filter(d => d.type === 'DATA');


        dataEntities = dataEntities.map(entity => {
            return {
                ...entity,
                // name: entity.name === "UNSPECIFIED_DATA" ? "Pepe" : entity.name, TMP
                id: sanitizeId(entity.id)
            };
        });


        console.log("dataEntities:");
        console.log(dataEntities);

        document.querySelector("#piecesOfData").textContent = dataEntities.length;

        const uniqueCategories = [...new Set(dataEntities.map(d => d.category))];
        document.querySelector("#totalCategories").textContent = uniqueCategories.length;

        const customSchemePaired = d3.schemePaired.map((color, index) => {
            if (index === 5) {
                return '#ED5952'; // Golden color
            }
            if (index === 9) {
                return '#768cff'; // Golden color
            }
            if (index === 10) {
                return '#fe8dc8'; // Pink
            } else {
                return color;
            }
        });

        uniqueCategories.sort();

        const colorScale = d3.scaleOrdinal(customSchemePaired).domain([
            "Identifiers",
            "General Data",
            "Aggregated & Inferred Data",
            "Metadata",
            "Media Content",
            "Personal Information",
            "Behavioral Data",
            "Location Data",
            "Tracking",
            "Message Data",
            "Technical Data",
            "Financial Data"
        ]);

        // Define a scale for the rectangle sizes based on IncomingConnections
        const maxConnections = d3.max(dataEntities, d => d.Indegree);
        const sizeScaleMultiplier = 20;
        const sizeScale = d3.scaleSqrt()
            .domain([1, maxConnections])
            .range([1 * sizeScaleMultiplier, maxConnections * sizeScaleMultiplier]); // Adjust the range as needed

        // Starting data with IDs 
        rectData = d3.packSiblings(dataEntities.map(d => ({
            id: "" + d.id,
            width: sizeScale(d.Indegree) + padding,
            height: sizeScale(d.Indegree) + padding,
            r: sizeScale(d.Indegree) / 2 + padding,
            fill: '#cbcbcb',
            originalFill: '#cbcbcb',
            name: d.name,
            category: d.category
        })));

        // Center the initial positions
        const xCenter = svgWidth / 2;
        const yCenter = svgHeight / 2;

        rectData.forEach(rect => {
            rect.x += xCenter;
            rect.y += yCenter;
        });

        packedRectData = rectData.map(rect => {
            return {
                ...rect,
            };
        });





        // we need to find the biggest and smallest rect

        console.log("packedRectData:");
        console.log(packedRectData);


        const largestTopLeftRect = getLargestTopLeftRect(packedRectData);

        const smallestBottomRightRect = getSmallestBottomRightRect(packedRectData);

        const otherRects = packedRectData.filter(rect => rect !== largestTopLeftRect && rect !== smallestBottomRightRect);

        otherRectsIDs = otherRects.map(d => "dataRect_" + d.id);
        otherLabelsIDs = otherRects.map(d => "rectLabel_" + d.id);

        console.log("smallestBottomRightRect:");
        console.log(smallestBottomRightRect);

        const startPath1 = { x: smallestBottomRightRect.x, y: smallestBottomRightRect.y + smallestBottomRightRect.height / 2 };
        const midPath1 = { x: smallestBottomRightRect.x + 20, y: smallestBottomRightRect.y + 20 + smallestBottomRightRect.height / 2 };
        endPath1 = { x: smallestBottomRightRect.x + 20 + largestTopLeftRect.width / 2 + 40, y: smallestBottomRightRect.y + 20 + smallestBottomRightRect.height / 2 };
        pathString1 = `M${startPath1.x},${startPath1.y + 3} L${midPath1.x},${midPath1.y + 3} L${endPath1.x},${endPath1.y + 3}`;

        const startPath2 = { x: largestTopLeftRect.x, y: largestTopLeftRect.y - largestTopLeftRect.height / 2 };
        const midPath2 = { x: largestTopLeftRect.x - 20, y: largestTopLeftRect.y - 20 - largestTopLeftRect.height / 2 };
        endPath2 = { x: largestTopLeftRect.x - 40 - largestTopLeftRect.width / 2, y: largestTopLeftRect.y - 20 - largestTopLeftRect.height / 2 };
        pathString2 = `M${startPath2.x},${startPath2.y - 3} L${midPath2.x},${midPath2.y - 3} L${endPath2.x},${endPath2.y - 3}`;


        // Create SVG path elements
        pathSmallesRect = d3.select("svg").append("path")
            .attr("d", pathString1)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("fill", "none")
            .attr("opacity", "0")
            .node();

        pathLargestRect = d3.select("svg").append("path")
            .attr("d", pathString2)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("fill", "none")
            .attr("opacity", "0")
            .node();

        // Add text labels with initial opacity 0
        label1 = d3.select("svg").append("text")
            .attr("x", endPath1.x + 5)
            .attr("y", endPath1.y + 3)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .attr("opacity", 0)
            .text("Least collected");

        label2 = d3.select("svg").append("text")
            .attr("x", endPath2.x - 5)
            .attr("y", endPath2.y - 2)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .attr("opacity", 0)
            .text("Frequently collected");




        console.log("smallestBottomRightRect:");
        console.log(smallestBottomRightRect);

        console.log("largestTopLeftRect:");
        console.log(largestTopLeftRect);

        console.log("otherRects:");
        console.log(otherRects);

        console.log("otherRectsIDs:");
        console.log(otherRectsIDs);

        console.log("otherLabelsIDs:");
        console.log(otherLabelsIDs);





        // Calculate positions for categories in a grid
        const gridCols = Math.ceil(Math.sqrt(uniqueCategories.length));
        const gridRows = Math.ceil(uniqueCategories.length / gridCols);
        const cellWidth = svgWidth / gridCols;
        const cellHeight = svgHeight / gridRows;
        const xOffset = (svgWidth - cellWidth * gridCols) / 2;
        const yOffset = (svgHeight - cellHeight * gridRows) / 2;

        const categoryPositions = {};
        uniqueCategories.forEach((category, index) => {
            const col = index % gridCols;
            const row = Math.floor(index / gridCols);
            categoryPositions[category] = {
                x: xOffset + col * cellWidth + cellWidth / 2,
                y: yOffset + row * cellHeight + cellHeight / 2
            };
        });

        // Calculate positions for each category's rectangles
        movedRectData = rectData.map(rect => {
            const categoryCenter = categoryPositions[rect.category];
            return {
                ...rect,
                fill: colorScale(rect.category),
            };
        });

        // Pack rectangles for each category using d3.packSiblings
        uniqueCategories.forEach(category => {
            const categoryRects = movedRectData.filter(rect => rect.category === category);

            const packedCategoryRects = d3.packSiblings(categoryRects);

            const categoryCenter = categoryPositions[category];

            const minX = d3.min(packedCategoryRects, c => c.x - c.width / 2);
            const maxX = d3.max(packedCategoryRects, c => c.x + c.width / 2);
            const offsetX = categoryCenter.x - (minX + (maxX - minX) / 2);

            const minY = d3.min(packedCategoryRects, c => c.y - c.height / 2);
            const maxY = d3.max(packedCategoryRects, c => c.y + c.height / 2);
            const offsetY = categoryCenter.y - maxY + cellHeight / 2 - 70;

            packedCategoryRects.forEach(rect => {
                rect.x += offsetX;
                rect.y += offsetY;
            });
        });

        // Create initial SVG rects
        svgRects = svg.selectAll('.dataRect')
            .data(rectData, d => "dataRect_" + d.id)
            .enter()
            .append('rect')
            .attr('class', 'dataRect')
            .attr('id', d => "dataRect_" + d.id)
            .attr('x', d => d.x - (d.width / 2))
            .attr('y', d => d.y - (d.height / 2))
            .attr('width', d => Math.max(d.width, 0))
            .attr('height', d => Math.max(d.height, 0))
            .attr('rx', d => Math.max(d.width, 0) / 2)
            .attr('ry', d => Math.max(d.height, 0) / 2)
            .attr('stroke', d => darkenColor(d.fill))
            .attr('stroke-width', dataRectStrokeWidth)
            .attr('opacity', 0)
            .attr('fill', d => d.fill);

        // Add labels to the rects
        // const svgRectLabels = svg.selectAll('.rectLabel')
        //     .data(rectData.filter(d => Math.min(d.width, d.height) >= minLabelSize), d => "rectLabel" + sanitizeId(d.id))
        //     // .data(rectData.filter(d => Math.min(d.width, d.height) >= minLabelSize), d => d.id)
        //     .enter()
        //     .append('text')
        //     .attr('class', 'rectLabel')
        //     .attr('id', d => "rectLabel" + sanitizeId(d.id))
        //     .attr('opacity', 0)
        //     .attr('text-anchor', 'middle')
        //     .attr('x', d => d.x)
        //     .attr('y', d => d.y)
        //     .style('font-size', d => `${Math.min(d.width / 3, 12)}px`) // Adjust font size
        //     .style('pointer-events', 'none') // Prevent labels from interfering with hover events
        //     .each(function (d) {
        //         const lines = splitText(d.name, Math.min(d.width, d.height));
        //         lines.forEach((line, i) => {
        //             d3.select(this).append('tspan')
        //                 .attr('x', d.x)
        //                 .attr('dy', i === 0 ? `-${(lines.length - 1) / 2}em` : `${1.1}em`)
        //                 .text(line);
        //         });
        //     });



        // Create category labels with colored squares
        svgCategoryGroups = svg.selectAll('.category-label')
            .data(uniqueCategories)
            .enter()
            .append('g')
            .attr('class', 'category-label')
            .attr('opacity', 0);

        const categoryRectSize = targetSize;
        svgCategoryGroups.append('rect')
            .attr('x', -categoryRectSize)
            .attr('y', -categoryRectSize)
            .attr('width', categoryRectSize * 2)
            .attr('height', categoryRectSize * 2)
            .attr('fill', d => colorScale(d))
            .attr('stroke', d => darkenColor(colorScale(d)));

        svgCategoryGroups.append('text')
            .attr('text-anchor', 'start')
            .style('font-size', '16px')
            .style('fill', '#000')
            .text(d => d)
            .style('user-select', 'none')
            .attr('x', categoryRectSize + 8)
            .attr('y', 5);

        svgCategoryGroups.each(function (d) {
            const bbox = this.getBBox();
            const centerX = categoryPositions[d].x - bbox.width / 2;
            const centerY = categoryPositions[d].y - bbox.height / 2 + cellHeight / 2 - 40;
            let id = generateUniqueId('categoryGroup');
            d3.select(this)
                .attr('transform', `translate(${centerX}, ${centerY})`)
                .attr('id', id);
            console.log("id: " + id);
            categoryStartPositions[id] = { x: centerX, y: centerY };
        });

        // console.log("$$$ categoryStartPositions:");
        // console.log(categoryStartPositions);

        // Update tooltip content on mouseover after animation
        svgRects.on("mouseover", function (event, d) {
            const text = d.name.charAt(0).toUpperCase() + d.name.slice(1);
            tooltip.style("visibility", "visible").html("<b>" + text + "</b><br/>" + d.category);
        })
            .on("mousemove", function (event) {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });

        window.addEventListener('resize', resizeSVG);
        resizeSVG();  // Initial resize to set SVG size

    }

    // This is what happens on update of the gsap animation
    function drawRectsAndLabels(rectData) {

        const rects = svg.selectAll('.dataRect')
            .data(rectData, d => d.id)
            .join(
                enter => enter.append('rect')
                    .attr('class', 'dataRect')
                    .each(function (d) {
                        const rect = d3.select(this);
                        if (d.x !== undefined && d.width !== undefined) {
                            rect.attr('x', d.x - (d.width / 2));
                        }
                        if (d.y !== undefined && d.height !== undefined) {
                            rect.attr('y', d.y - (d.height / 2));
                        }
                        if (d.width !== undefined) {
                            rect.attr('width', Math.max(0, d.width));
                        }
                        if (d.height !== undefined) {
                            rect.attr('height', Math.max(0, d.height));
                        }
                        if (d.rx !== undefined) {
                            rect.attr('rx', Math.max(0, d.rx));
                        }
                        if (d.ry !== undefined) {
                            rect.attr('ry', Math.max(0, d.ry));
                        }
                        if (d.fill !== undefined) {
                            rect.attr('fill', d.fill);
                            rect.attr('stroke', darkenColor(d.fill));  // Assume darkenColor handles undefined
                        }
                        if (d.opacity !== undefined) {
                            rect.attr('opacity', d.opacity);
                        }
                    }),
                update => update
                    .each(function (d) {
                        const rect = d3.select(this);
                        if (d.x !== undefined && d.width !== undefined) {
                            rect.attr('x', d.x - (d.width / 2));
                        }
                        if (d.y !== undefined && d.height !== undefined) {
                            rect.attr('y', d.y - (d.height / 2));
                        }
                        if (d.width !== undefined) {
                            rect.attr('width', Math.max(0, d.width));
                        }
                        if (d.height !== undefined) {
                            rect.attr('height', Math.max(0, d.height));
                        }
                        if (d.rx !== undefined) {
                            rect.attr('rx', Math.max(0, d.rx));
                        }
                        if (d.ry !== undefined) {
                            rect.attr('ry', Math.max(0, d.ry));
                        }
                        if (d.fill !== undefined) {
                            rect.attr('fill', d.fill);
                            rect.attr('stroke', darkenColor(d.fill));  // Assume darkenColor handles undefined
                        }
                        if (d.opacity !== undefined) {
                            rect.attr('opacity', d.opacity);
                        }
                    }),
                exit => exit.remove()
            );

        const texts = svg.selectAll('.rectLabel')
            .data(rectData, d => d.id)
            .join(
                enter => enter.append('text'),
                update => update,
                exit => exit.remove()
            )
            .attr('class', 'rectLabel')
            .attr('id', d => "rectLabel_" + d.id)
            .attr('x', d => isNaN(d.x) ? 0 : d.x)
            .attr('y', d => isNaN(d.y) ? 0 : d.y)
            .each(function (d) {
                const text = d3.select(this);
                text.attr('text-anchor', 'middle');
                text.attr('opacity', d => d.opacity);
                const maxDimension = Math.min(d.width, d.height);
                const lines = splitText(d.name, maxDimension);
                const textSelection = d3.select(this);
                textSelection.selectAll('tspan').remove();
                lines.forEach((line, i) => {
                    textSelection.append('tspan')
                        .attr('x', d.x)
                        .attr('dy', i === 0 ? `-${(lines.length - 1) / 2}em` : `1.1em`)
                        .text(line);
                });
            })
            .style('font-size', d => {
                const maxDimension = Math.min(d.width, d.height);
                return `${Math.min(maxDimension / 6, 12)}px`;
            });






        // const labels = svg.selectAll('.rectLabel')
        //     .data(rectData.filter(d => Math.min(d.width, d.height) >= minLabelSize), d => d.id)
        //     .join(
        //         enter => enter.append('text')
        //             .attr('class', 'rectLabel')
        //             .attr('id', d => "rectLabel_" + d.id),
        //         update => update,
        //         exit => exit.remove()
        //     )
        //     // .attr('id', d => "rectLabel_" + d.id)
        //     .attr('x', d => isNaN(d.x) ? 0 : d.x)
        //     .attr('y', d => isNaN(d.y) ? 0 : d.y)
        //     .attr('text-anchor', 'middle') // Center text horizontally
        //     .each(function (d) {
        // const maxDimension = Math.min(d.width, d.height);
        // const lines = splitText(d.name, maxDimension);
        // const textSelection = d3.select(this);
        // textSelection.selectAll('tspan').remove(); // Clear existing tspans
        // lines.forEach((line, i) => {
        //     textSelection.append('tspan')
        //         .attr('x', d.x)
        //         .attr('dy', i === 0 ? `-${(lines.length - 1) / 2}em` : `1.1em`)
        //         .text(line);
        // });
        //     })
        //     .attr('opacity', d => d.opacity)
        //     .style('font-size', d => {
        //         const maxDimension = Math.min(d.width, d.height);
        //         return `${Math.min(maxDimension / 6, 12)}px`;
        //     });



    }

    function addScrollEvents() {

        let progressColor = "gray";
        // let progressBorderColor = "#444444";

        gsap.to("#one", {
            ease: "none",
            scrollTrigger: {
                trigger: "#one",
                start: "top top",
                scrub: true,
                onUpdate: (self) => {

                    restoreProgressCircles();

                    const progress = self.progress;
                    gsap.to('.scroll-down', {
                        opacity: 1 - progress
                    });
                    gsap.to('.line-1', { scaleX: 1, scaleY: progress, duration: 0, ease: "none", backgroundColor: progressColor });
                    if (progress > 0.99) {
                        gsap.to("#circle-2", { backgroundColor: progressColor, ease: "none", duration: 0 });
                    } else {
                        gsap.to("#circle-2", { backgroundColor: "light" + progressColor, ease: "none", duration: 0 });
                    }
                }
            }
        });

        console.log("++++ rectData ++++");
        console.log(rectData);

        // Single GSAP Timeline with labels
        const mainTimeline = gsap.timeline({ paused: true });


        // ***** INITIAL PACKING *****

        mainTimeline.addLabel("packing")
            .fromTo(rectData, {
                scale: 0,
                opacity: 0,
                width: 0,
                height: 0,
                rx: 0,
                ry: 0
            }, {
                x: (index) => packedRectData[index].x,
                y: (index) => packedRectData[index].y,
                width: (index) => packedRectData[index].width,
                height: (index) => packedRectData[index].height,
                rx: (index) => parseFloat(packedRectData[index].width / 2),
                ry: (index) => parseFloat(packedRectData[index].height / 2),
                scale: 1,
                opacity: 1,
                duration: animationDuration,
                ease: "back.out(1.7)",
                stagger: { amount: 0.5 * animationDuration },
                onStart: () => {
                    explaining = "packing";
                },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                },
                onComplete: () => {
                    mainTimeline.pause();
                    blinkIcon(infoIcon, 1);
                }
            }, "packing");












        console.log("nonTargetLabels");
        console.log(nonTargetLabels);

        // Check if elements with these IDs exist in the DOM
        otherRectsIDs.forEach(id => {
            if (!document.getElementById(id)) {
                console.error(`Element with ID ${id} does not exist in the DOM`);
            }
        });

        otherLabelsIDs.forEach(id => {
            if (!document.getElementById(id)) {
                console.error(`Element with ID ${id} does not exist in the DOM`);
            }
        });
























        const deltaX = 50;
        const deltaY = 220;

        const point1 = { x: deltaX, y: deltaY };
        const point2 = { x: svgWidth - deltaX, y: deltaY };
        const splitRectData = getPackedDataForSplitRects(point1, point2, svgHeight - (2 * deltaY), targetSize);

        let initial = rectData[0].x;
        let final = movedRectData[0].x;

        // ***** CATEGORIES *****
        mainTimeline.addLabel("categories")
            .to(rectData, {
                x: (index) => movedRectData[index].x,
                y: (index) => movedRectData[index].y,
                fill: (index) => movedRectData[index].fill,
                opacity: 1,
                duration: animationDuration,
                ease: "back.out(0.45)",
                stagger: { amount: animationDuration / 3 },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                }
            }, "categories");



        svgCategoryGroups.nodes().forEach((svgCategoryGroup, index) => {
            let id = svgCategoryGroup.id;
            let position = categoryStartPositions[id];
            mainTimeline.fromTo(svgCategoryGroup, {
                opacity: 0,
                transform: `translate(${position.x}px, ${position.y}px)`,
            }, {
                opacity: 1,
                transform: `translate(${position.x}px, ${position.y}px)`,
                duration: animationDuration,
                stagger: { amount: animationDuration / 2 },
            }, "categories+=0.75");
        });







        // ***** DATA SHARED *****
        mainTimeline.addLabel("dataShared")
            .to(rectData, {
                width: 0,
                height: 0,
                opacity: 0,
                duration: animationDuration,
                ease: "back.out(1.25)",
                stagger: { amount: animationDuration / 3 },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                }
            }, "dataShared");

        mainTimeline.to(svgCategoryGroups.nodes(), {
            duration: animationDuration,
            opacity: 0,
            ease: "back.out(1.25)",
            stagger: { amount: 0.1 }  // Stagger if needed for visual effect
        }, "dataShared");

        // Extract nodes and sort them alphabetically by the text content
        const sortedCategoryGroupNodes = svgCategoryGroups.nodes().sort((a, b) => {
            const textA = d3.select(a).select('text').text().toUpperCase();
            const textB = d3.select(b).select('text').text().toUpperCase();
            return textA.localeCompare(textB);
        });

        // Calculating the target positions for the sorted category labels
        const categoryTargetPositions = {};

        sortedCategoryGroupNodes.map((node, i) => {
            const columns = Math.ceil(Math.sqrt(sortedCategoryGroupNodes.length));
            const rows = Math.ceil(sortedCategoryGroupNodes.length / columns);
            const column = Math.floor(i / rows); // Change: Compute column based on rows
            const row = i % rows; // Change: Fill columns first
            const cellWidth = (svgWidth / columns) - 10;
            const cellHeight = 30; // Adjust height as needed
            const x = column * cellWidth + cellWidth / 2;
            const y = svgHeight - (rows * cellHeight) + row * cellHeight + cellHeight / 2;
            // drawRectAt(x, y, 20, 20, 'red')
            categoryTargetPositions[node.id] = { x: x, y: y - 20 };
        });

        console.log("categorTargetPositions");
        console.log(categoryTargetPositions);

        // Vertical spacing between labels
        const verticalSpacing = 5;  // You can adjust this value as needed

        // Calculate starting positions
        let maxWidth = 0;
        let totalHeight = 0;
        sortedCategoryGroupNodes.forEach(node => {
            const bbox = node.getBBox();
            maxWidth = Math.max(maxWidth, bbox.width);  // Find the widest label
            totalHeight += bbox.height + verticalSpacing;  // Accumulate total height
        });

        // Calculate the starting y position to place all labels stacked at the bottom
        let currentY = svgHeight - totalHeight;



        // Bringing actors in
        const svgActorIcons = svg.selectAll('.actorIcon');
        const actorNodes = svgActorIcons.nodes();

        actorNodes.forEach((actorNode, index) => {

            let id = actorNode.id;
            let originals = originalTransformations[id];
            let x = originals.originalX;
            let y = originals.originalY;

            // drawRectAt(x + originals.originX, y + originals.originX, 10, 10, "green")

            mainTimeline.fromTo(actorNode, {
                opacity: 0,
                x: x,
                y: y,
                scale: 0
            }, {
                opacity: 1,
                x: x,
                y: y,
                scale: actorIconScale,
                duration: animationDuration,
                ease: "back.inOut(3)",
                stagger: { amount: animationDuration * 0.75 },
            }, `dataShared+=${0.1 + (index * animationDuration * 0.075)}`);

        });

        const svgActorIconLabels = svg.selectAll('.actorCategoryName');
        const actorLabelNodes = svgActorIconLabels.nodes();
        actorLabelNodes.forEach((actorLabelNode, index) => {
            mainTimeline.fromTo(actorLabelNode, {
                opacity: 0,
                scale: 0,
            }, {
                opacity: 1,
                scale: 1,
                ease: "back.inOut(3)",
                duration: animationDuration,
                stagger: { amount: animationDuration * 0.75 },

                onStart: () => {
                    explaining = "actors";
                },
                onComplete: () => {
                    if (index == actorLabelNodes.length - 1) {
                        blinkIcon(infoIcon);
                    }
                }

            }, `dataShared+=${0.1 + (index * animationDuration * 0.075)}`);
        });

        // ***** ACTORS *****

        const globalFrequencyMap = {};

        // Compute the frequency of each data category globally
        Object.values(actorDataMap).forEach(actorData => {
            Object.entries(actorData).forEach(([dataCategory, dataNames]) => {
                if (!globalFrequencyMap[dataCategory]) {
                    globalFrequencyMap[dataCategory] = 0;
                }
                globalFrequencyMap[dataCategory] += dataNames.length;
            });
        });


        console.log("globalFrequencyMap:");
        console.log(globalFrequencyMap);


        function generateRectCopies(collectedData, actorIconCategory, commonX, offsetY) {
            const newRects = [];
            let rectIndex = 0;

            // Get sorted categories based on global frequency
            const sortedCategories = Object.keys(collectedData).sort((a, b) => {
                return globalFrequencyMap[b] - globalFrequencyMap[a];
            });

            // Iterate over the sorted data categories
            sortedCategories.forEach(dataCategory => {
                const items = collectedData[dataCategory];
                items.forEach((item, innerIndex) => {
                    const dataRect = splitRectData.find(d => d.name === item.name);
                    if (dataRect) {
                        const uniqueId = sanitizeId(`${actorIconCategory}_${dataRect.id}_${rectIndex}_${innerIndex}`);
                        const dataRectCopy = {
                            ...dataRect,
                            id: uniqueId,
                            name: item.name,
                            tooltipText: item.text
                        };

                        let theRect = svg.append('rect')
                            .data([dataRectCopy]) // Binding data here
                            .attr('id', uniqueId)
                            .attr('class', 'copyOfDataRect ' + sanitizeId(actorIconCategory) + ' ' + sanitizeId(dataCategory))
                            .attr('opacity', 0)
                            .attr('x', -targetSize)
                            .attr('y', -targetSize)
                            .attr('width', targetSize * 2)
                            .attr('height', targetSize * 2)
                            .attr('rx', targetSize)
                            .attr('ry', targetSize)
                            .attr('fill', dataRectCopy.fill)
                            .attr('stroke-width', 0)
                            .attr('stroke', darkenColor(dataRectCopy.fill))
                            .each(function (d) {

                                // console.log("*********************************");
                                // console.log("item.text");
                                // console.log(item.text);
                                // console.log("*********************************");

                                // console.log("Processed string:");
                                // console.log(processString(item.text));

                                const lines = processString(item.text)
                                    .map(line => normalizeText(line));

                                let tooltipContent = generateInitialTooltipContent(item.name.charAt(0).toUpperCase() + item.name.slice(1), originalNames[dataCategory], lines);

                                tippy(this, {
                                    theme: 'light-border',
                                    content: tooltipContent.header,
                                    allowHTML: true,
                                    trigger: 'mouseenter',  // Changed from 'click' to 'mouseenter' for hover activation
                                    interactive: false,      // Set to false to make the tooltip non-interactive
                                    placement: 'top',        // Prefer placement at the top
                                    fallbackPlacements: ['right', 'bottom', 'left'], // Fallback placements if 'top' doesn't fit
                                    appendTo: () => document.body
                                });
                                



                                // tippy(this, {
                                //     theme: 'light-border',
                                //     content: tooltipContent.header + tooltipContent.links + tooltipContent.content + tooltipContent.button,
                                //     allowHTML: true,
                                //     trigger: 'click',
                                //     interactive: true,
                                //     delay: [100, 100],
                                //     placement: 'right',
                                //     fallbackPlacements: ['top', 'bottom', 'left'],
                                //     appendTo: () => document.body,
                                //     onShow(instance) {
                                //         const contentContainer = instance.popper.querySelector('.tooltip-content');
                                //         const paginator = instance.popper.querySelector('.page-number-display');

                                //         let currentIndex = 0;
                                //         const totalLinks = tooltipContent.highlightedLines.length;

                                //         updatePagination(paginator, currentIndex, totalLinks);

                                //         instance.popper.querySelectorAll('.tooltip-nav').forEach(nav => {
                                //             nav.addEventListener('click', function () {
                                //                 const direction = nav.getAttribute('data-nav');
                                //                 currentIndex = handleTooltipNavigation(contentContainer, tooltipContent.highlightedLines, currentIndex, direction, totalLinks, paginator);

                                //                 // const currentText = normalizeText(contentContainer.textContent);
                                //                 const currentText = contentContainer.textContent;

                                //                 if (popup.style.display === 'block') {
                                //                     scrollToAndHighlightInIframe(currentText);
                                //                 }
                                //             });
                                //         });

                                //         // Add event listener for Escape key to close the tooltip
                                //         const escKeyListener = (event) => {
                                //             if (event.key === 'Escape') {
                                //                 instance.hide();
                                //                 document.removeEventListener('keydown', escKeyListener);
                                //             }
                                //         };
                                //         document.addEventListener('keydown', escKeyListener);
                                //     }
                                // });















                                

                            });

                        newRects.push(dataRectCopy);
                        rectIndex++;
                    } else {
                        console.error("Could not find the rect associated to " + item.name);
                    }
                });
            });

            return newRects;
        }

        // console.log("!!!!!!!!!!!!!!!!!!! rectData[rectData.length - 1]");
        // console.log(rectData[rectData.length - 1]);

        // ***** ACTORS COLUMNS *****
        const rightAlignX = 250;
        const startY = 175;
        const spacing = 65;
        const actorGroupScale = 0.55;
        const actorGroups = svg.selectAll('.actorIcon').nodes();

        window.actorGroups = actorGroups;

        console.log("actorGroups");
        console.log(actorGroups);

        let totalClones = 0;
        let currentClones = 0;

        mainTimeline.addLabel("actorsColumn");

        // This allows to sort author groups by the amount of data each collects
        // Thus, when the actors form a column, the one that collects more data appears on top
        actorGroups.sort((a, b) => {

            const labelA = labelsOf[a.id];
            const labelB = labelsOf[b.id];

            console.log("labelA: " + labelA);
            console.log("labelB: " + labelB);

            const actorTypeAElement = d3.select("#" + labelA);
            const actorTypeBElement = d3.select("#" + labelB);

            if (actorTypeAElement.empty() || actorTypeBElement.empty()) {
                console.error("actorCategoryName elements not found for actorGroups");
                return 0;
            }

            console.log("actorTypeAElement: ");
            console.log(actorTypeAElement);
            console.log("actorTypeBElement: ");
            console.log(actorTypeBElement);

            const actorTypeA = actorTypeAElement.text().toUpperCase();
            const actorTypeB = actorTypeBElement.text().toUpperCase();

            console.log("actorTypeA: " + actorTypeA);
            console.log("actorTypeB: " + actorTypeB);

            const dataSizeA = Object.keys(actorDataMap[removeSpaces(actorTypeA)] || {}).reduce((sum, key) => sum + actorDataMap[removeSpaces(actorTypeA)][key].length, 0);
            const dataSizeB = Object.keys(actorDataMap[removeSpaces(actorTypeB)] || {}).reduce((sum, key) => sum + actorDataMap[removeSpaces(actorTypeB)][key].length, 0);

            console.log("dataSizeA: " + dataSizeA);
            console.log("dataSizeB: " + dataSizeB);

            return dataSizeB - dataSizeA; // Sort descending
        });

        console.log("SORTED actorGroups:");
        console.log(actorGroups);

        actorGroups.forEach((actorGroup, index) => {

            const labelID = labelsOf[actorGroup.id];
            const actorLabelElement = d3.select("#" + labelID);
            const actorLabelText = actorLabelElement.text();

            console.log("*********************");
            console.log("actorLabelText: " + actorLabelText);

            const groupBBox = actorGroup.getBBox();
            const groupStartTime = index * 0.1;
            const label = d3.select("#" + labelID);
            const actorIconHeight = groupBBox.height;
            const offsetY = startY + index * spacing;
            const labelBBox = label.node().getBBox();
            const labelWidth = labelBBox.width;
            const bbox = actorGroup.getBBox();
            const iconWidth = bbox.width;
            const iconHeight = bbox.height;
            let x = rightAlignX - iconWidth / 2;
            let y = offsetY - iconHeight / 2;

            mainTimeline.to(actorGroup, {
                x: x,
                y: y,
                scale: actorGroupScale * actorIconScale,
                duration: animationDuration,
                ease: "power1.inOut",
                onStart: () => {
                    explaining = "dataPerActor";
                }
            }, "actorsColumn");

            const theLabel = label.node();

            mainTimeline.to(theLabel, {
                attr: {
                    x: rightAlignX - labelWidth / 2 - actorGroupScale * actorIconScale * iconWidth / 2 - 10,
                    y: offsetY
                },
                duration: animationDuration,
                ease: "power1.inOut",
            }, "actorsColumn");

            actorType = removeSpaces(actorLabelText.toUpperCase());

            console.log("--- actorIconCategory: " + actorType);

            const collectedData = actorDataMap[actorType] || {};

            console.log("collectedData:");
            console.log(collectedData);

            const commonX = rightAlignX;

            // Generate rect copies first
            const rectCopies = generateRectCopies(collectedData, actorType, commonX, offsetY);

            console.log("newRects.length:");
            console.log(rectCopies.length);

            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            console.log("Actor type: " + actorType);
            console.log("the generated rect copies:");
            console.log(rectCopies);

            window.mainTimeline = mainTimeline;

            totalClones += rectCopies.length;

            rectCopies.forEach((rect, rectIndex) => {

                currentClones++;

                console.log("+++++++++ " + currentClones);

                mainTimeline.fromTo(`#${rect.id}`, {
                    x: svgWidth * 1.25,
                    y: getRandomBetween(-100, svgHeight + 100),
                }, {
                    x: commonX + 55 + rectIndex * (targetSize * 2 + padding * 0.75),
                    y: offsetY + targetSize / 2,
                    opacity: 1,
                    rx: 0,
                    ry: 0,
                    duration: animationDuration,
                    ease: "power1.inOut",
                }, `actorsColumn+=${groupStartTime + rectIndex * 0.01}`);
            });

        });




        if (currentClones == totalClones) {

            console.log("*** currentClones:");
            console.log(currentClones);

            console.log("totalClones:");
            console.log(totalClones);

            const maxDelay = 1.5 * animationDuration + 2 * (totalClones - 1) * 0.01;

            console.log("maxDelay:");
            console.log(maxDelay);

            sortedCategoryGroupNodes.forEach((node, index) => {

                const bbox = node.getBBox();

                // Calculate consistent x-coordinate based on the maximum width to align left
                const consistentX = svgWidth - maxWidth - 15;  // All labels aligned left at this x-coordinate

                // Calculate the y position for each label
                const startY = currentY;

                // Update currentY for the next label
                currentY += bbox.height + verticalSpacing;

                let position = categoryStartPositions[node.id];
                let targetPosition = categoryTargetPositions[node.id];
                // let targetPosition = {x: consistentX, y: startY};

                mainTimeline.fromTo(node, {
                    transform: `translate(${position.x}px, ${position.y}px)`,
                }, {
                    transform: `translate(${targetPosition.x}px, ${targetPosition.y}px)`,
                    duration: 0.1,
                }, "actorsColumn+=0.1");

                mainTimeline.to(node, {
                    duration: animationDuration,
                    opacity: 1,
                }, `actorsColumn+=${2 * animationDuration + 0.5}`);

                d3.select(node).on('mouseover', function (event) {
                    d3.select(this).style('font-weight', 'bolder');

                    // Get the class that identifies the related rectangles
                    let cleanDataType = sanitizeId(removeSpaces(d3.select(this).text()).toUpperCase());
                    let rectClasses = '.copyOfDataRect.' + cleanDataType;
                    // console.log(rectClasses);

                    // First, ensure all rects are reset to full opacity
                    svg.selectAll('.copyOfDataRect')
                        .transition()
                        .duration(200)
                        .attr('stroke-width', 1)
                        .style('opacity', 1);

                    // Reduce the opacity of rects that do not have the specific class
                    svg.selectAll('.copyOfDataRect:not(' + rectClasses + ')')
                        .transition()
                        .duration(200)
                        .style('opacity', 0.2);
                });

                d3.select(node).on('mouseout', function (event) {
                    d3.select(this).style('font-weight', 'normal');
                    svg.selectAll('.copyOfDataRect')
                        .transition()
                        .duration(200)
                        .attr('stroke-width', 0)
                        .style('opacity', 1); // Restore opacity for all rects
                });



            });

        }


        function getPackedDataForSplitRects(point1, point2, totalHeight, targetSize) {
            const rectWidth1 = Math.abs(point2.x - point1.x);
            const rectWidth2 = rectWidth1;
            const rectHeight = totalHeight;

            const data = movedRectData.map((d, i) => ({
                id: d.id,
                width: d.width,
                height: d.height,
                x: d.x,
                y: d.y,
                scale: d.scale,
                fill: d.fill,
                initialX: d.x,
                initialY: d.y,
                targetX: 0,
                targetY: 0,
                name: d.name
            }));

            const numRects = data.length;
            const halfRects = Math.floor(numRects / 2);

            const rect1Data = data.slice(0, halfRects);
            const rect2Data = data.slice(halfRects);

            function calculateColumnMajorPositions(rectData, startX, width, height, rightToLeft = false) {
                const padding = 3;
                const optimalRows = Math.ceil(Math.sqrt(rectData.length * (height / width)));
                const optimalColumns = Math.ceil(rectData.length / optimalRows);
                let rectDiameter = 2 * targetSize;
                const rows = Math.floor((height - padding) / (rectDiameter + padding));
                const columns = Math.ceil(rectData.length / rows);

                if ((rectDiameter + padding) * rows < height) {
                    rectDiameter = (height - (rows + 1) * padding) / rows;
                }

                rectData.forEach((d, i) => {
                    const col = Math.floor(i / rows);
                    const row = i % rows;

                    if (rightToLeft) {
                        const rightmostX = startX - (columns - 1) * (rectDiameter + padding);
                        d.targetX = rightmostX + (columns - 1 - col) * (rectDiameter + padding);
                    } else {
                        d.targetX = startX + col * (rectDiameter + padding);
                    }
                    d.targetY = point1.y + row * (rectDiameter + padding);
                });
            }

            calculateColumnMajorPositions(rect1Data, point1.x, rectWidth1, rectHeight);
            calculateColumnMajorPositions(rect2Data, point2.x, rectWidth2, rectHeight, true);

            return rect1Data.concat(rect2Data);
        }

        const panel = document.getElementById('test');
        const texts = document.querySelectorAll("#test .explanationText");

        const scrollOffset = 1000;
        const endValue = `+=${texts.length * scrollOffset}px`;

        gsap.registerPlugin(ScrollTrigger);

        let lastClickedCircleId = null;

        function handleCircleClick(event) {

            const circleId = event.target.id;
            console.log(`Circle clicked: ${circleId}`);

            const currentIdNum = parseInt(circleId.split('-')[1]);

            let isBigger = null;
            if (lastClickedCircleId) {
                const lastIdNum = parseInt(lastClickedCircleId.split('-')[1]);
                isBigger = currentIdNum > lastIdNum;
                console.log(`Current circle ID is ${isBigger ? 'bigger' : 'smaller'} than the last clicked circle ID.`);
            }

            if (lastClickedCircleId == circleId) {
                return;
            }

            // Update last clicked circle ID
            lastClickedCircleId = circleId;

            let divID = null;

            // I need to consider the direction here!!!
            switch (circleId) {
                case 'circle-1':
                    // window.scrollTo({ top: 0, behavior: 'smooth' });
                    gsap.to(window, { duration: 0.5, scrollTo: { y: 0 }, overwrite: "auto" });
                    break;
                case 'circle-2':
                    divID = "divPiecesOfData";
                    break;
                case 'circle-3':
                    divID = "divTotalCategories";
                    explaining = "packing";
                    break;
                case 'circle-4':
                    divID = "divDataShared";
                    break;
                case 'circle-5':
                    divID = "divDataPerActor";
                    explaining = "actors";
                    break;
                case 'circle-6':
                    divID = "divDataPerActor";
                    break;
                default:
                    console.log('Unknown circle clicked');
            }

            restoreProgressCircles();
            // gsap.to("#" + circleId, { borderColor: progressBorderColor, duration: 0.5 });

            if (divID) {
                let linkST = scrollersForCircles[divID];
                gsap.to(window, {
                    duration: 0.5, scrollTo: linkST.start, overwrite: "auto", onComplete: () => {
                        if (circleId == 'circle-6') {
                            mainTimeline.play("actorsColumn");
                            gsap.to(window, { duration: 0.5, scrollTo: { y: document.body.scrollHeight }, overwrite: "auto" });
                        }
                    }
                });
            }

        }

        // Select all circle elements
        const circles = document.querySelectorAll('.progressCircle');

        // Attach click event listener to each circle
        circles.forEach(circle => {
            circle.addEventListener('click', handleCircleClick);
        });

        const pairs = [
            { line: '.line-2', circle: '#circle-3' },
            { line: '.line-3', circle: '#circle-4' },
            { line: '.line-4', circle: '#circle-5' },
            { line: '.line-5', circle: '#circle-6' }
        ];


        let scrollersForCircles = {};

        // Function to handle the enter and leave events for the text elements
        function setupTextScrollTriggers() {

            texts.forEach((text, index) => {
                gsap.fromTo(text, { opacity: 0, y: 100 }, {
                    opacity: 1, y: 0,
                    scrollTrigger: {
                        trigger: text,
                        start: () => "top bottom-=" + (scrollOffset * (index + 1)),
                        end: () => `center center+=${scrollOffset * (index + 1.5)}`,
                        scrub: 1,
                        onEnter: (self) => {
                            if (self.direction === 1) {
                                onExplanationEnter(text, index);
                            }
                        },
                        onEnterBack: (self) => {
                            if (self.direction === 1) {
                                onExplanationEnter(text, index);
                            }
                        },
                        onLeave: (self) => {
                            if (self.direction === -1) {
                                onExplanationLeave(text, index);
                            }
                        },
                        onLeaveBack: (self) => {
                            if (self.direction === -1) {
                                onExplanationLeave(text, index);
                            }
                        },
                    }
                });

                console.log("scrollOffset * (index + 1): ");
                console.log(scrollOffset * (index + 1));



                linkST = ScrollTrigger.create({
                    trigger: text,
                    start: () => "top bottom-=" + ((scrollOffset * (index + 1)) - 550 - index * 80),
                });
                scrollersForCircles[text.id] = linkST;
            });
        }

        // Create the main timeline for the lines and circles
        const tl2 = gsap.timeline({
            scrollTrigger: {
                trigger: panel,
                start: "top top",
                end: endValue,
                pin: true,
                scrub: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                    const totalProgress = self.progress;
                    const totalPairs = pairs.length;
                    const segmentDuration = 1 / totalPairs;

                    pairs.forEach((pair, index) => {
                        const start = index * segmentDuration;
                        const end = (index + 1) * segmentDuration;
                        const progress = gsap.utils.clamp(0, 1, (totalProgress - start) / (end - start));

                        gsap.to(pair.line, { scaleX: 1, scaleY: progress, duration: 0, ease: "none", backgroundColor: progressColor });

                        if (pair.circle) {
                            if (progress < 0.99) {
                                gsap.to(pair.circle, { backgroundColor: "light" + progressColor, ease: "none", duration: 0 });
                            } else {
                                gsap.to(pair.circle, { backgroundColor: progressColor, ease: "none", duration: 0 });
                            }
                        }

                        if (progress < 0.99) {
                            if (pair.line == ".line-5") {
                                gsap.to('.line-6', { scaleX: 1, scaleY: 0, duration: 0, ease: "none", backgroundColor: "light" + progressColor });
                            }
                        } else {
                            if (pair.line == ".line-5") {
                                gsap.to('.line-6', { scaleX: 1, scaleY: 1, duration: 0.5, ease: "none", backgroundColor: progressColor });

                            }
                        }
                    });
                }
            }
        });

        // Initialize the text scroll triggers
        setupTextScrollTriggers();

        function onExplanationEnter(element, index) {
            if (element.id === "divPiecesOfData") {
                mainTimeline.play("packing");
            } else if (element.id === "divTotalCategories") {
                mainTimeline.tweenFromTo("categories", "dataShared");
            } else if (element.id === "divDataShared") {
                mainTimeline.tweenFromTo("dataShared", "actorsColumn");
            } else if (element.id === "divDataPerActor") {
                mainTimeline.play("actorsColumn");
            }
        }

        function onExplanationLeave(element, index) {
            if (element.id === "divPiecesOfData") {
                mainTimeline.tweenFromTo("categories", "packing");
            } else if (element.id === "divTotalCategories") {
                mainTimeline.tweenFromTo("dataShared", "categories");
            } else if (element.id === "divDataShared") {
                mainTimeline.tweenFromTo("actorsColumn", "dataShared");
            } else if (element.id === "divDataPerActor") {
                mainTimeline.tweenFromTo(mainTimeline.nextLabel(), "actorsColumn");
            }
        }


        // TMP
        // mainTimeline.tweenFromTo("actorsColumn");


    }

    // Function to darken a color
    function darkenColor(color, factor = 0.2) {
        const colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range([d3.rgb(color).darker(factor), d3.rgb(color)]);
        return colorScale(0);
    }

    // Function to split text into multiple lines based on rectangle dimension
    function splitText(text, maxDimension) {

        // console.log("*** text " + text);

        text = text.trim();
        text = text.charAt(0).toUpperCase() + text.slice(1);

        const words = text.trim().split(' ');
        if (words.length === 1)
            return [truncateText(text, maxDimension)];

        const lines = [];
        let currentLine = words[0].trim();

        for (let i = 1; i < words.length; i++) {
            const word = words[i].trim();

            if (word.length === 1) {
                currentLine += ' ' + word;
            } else {
                if (currentLine.length + word.length + 1 <= maxDimension / 3) {
                    currentLine += ' ' + word;
                } else {
                    lines.push(truncateText(currentLine, maxDimension));
                    currentLine = word;
                }
            }
        }

        lines.push(truncateText(currentLine, maxDimension));
        return lines;
    }

    // Function to truncate text based on rectangle dimension
    function truncateText(text, maxDimension) {
        const maxLength = Math.floor(maxDimension / 3); // Adjust factor as needed
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    // Resize handler
    function resizeSVG() {
        svg.attr('width', '100%').attr('height', '100vh');
        const svgElement = document.getElementById('circle-packing-svg');
        svgWidth = svgElement.clientWidth;
        svgHeight = svgElement.clientHeight;
    }

    function drawRectAt(x, y, width, height, color) {
        svg.append('rect')
            .attr('x', x - width / 2)
            .attr('y', y - height / 2)
            .attr('width', width)
            .attr('height', height)
            .attr('rx', width / 2)
            .attr('ry', height / 2)
            .attr('fill', color);
    }

    function removeSpaces(str) {
        return str.replace(/\s+/g, '');
    }

    function getRandomBetween(a, b) {
        const lower = Math.min(a, b);
        const upper = Math.max(a, b);
        return Math.random() * (upper - lower) + lower;
    }

    function generateUniqueId(prefix = 'id') {
        // Create a random alphanumeric string with a prefix
        const randomString = Math.random().toString(36).substr(2, 9); // Generate a random string
        const timestamp = Date.now(); // Get the current timestamp
        return `${prefix}_${randomString}_${timestamp}`;
    }
















    function generateInitialTooltipContent(name, dataCategory, lines) {
        let highlightedLines = lines.map(line => highlightNameInText(line, name));
        let initialContent = highlightedLines[0];

        let navContainer = '<div class="nav-container">';

        if (lines.length > 1) {
            navContainer += '<a href="javascript:void(0);" class="tooltip-nav navButton" data-nav="previous">&#9664;</a>';
        }

        navContainer += `<div class="page-number-display">1/${lines.length}</div>`;

        if (lines.length > 1) {
            navContainer += '<a href="javascript:void(0);" class="tooltip-nav navButton" data-nav="next">&#9654;</a>';
        }

        navContainer += "</div>";

        return {
            // header: `<div style="font-size: 14px; text-align: center;"><b>${name}<br/>(${dataCategory})</b></div>`,
            header: `<div style="font-size: 14px; text-align: center;"><b>${name}</div>`,
            links: navContainer,
            content: `<div class="tooltip-content">${initialContent}</div>`,
            button: `<div class="tooltip-button"><button id="contextButton">View in Policy</button></div>`,
            highlightedLines: highlightedLines,
            currentPage: 0,
            maxVisibleLinks: 10
        };
    }








    function updatePagination(paginator, currentLinkIndex, totalLinks, maxVisibleLinks) {
        paginator.textContent = `${currentLinkIndex + 1}/${totalLinks}`;

        const numberedLinks = paginator.parentElement.querySelectorAll('.tooltip-link');
        const halfVisible = Math.floor(maxVisibleLinks / 2);

        let start = currentLinkIndex - halfVisible;
        let end = currentLinkIndex + halfVisible + 1;

        if (start < 0) {
            start = 0;
            end = Math.min(totalLinks, maxVisibleLinks);
        }

        if (end > totalLinks) {
            end = totalLinks;
            start = Math.max(0, totalLinks - maxVisibleLinks);
        }

        numberedLinks.forEach((link, idx) => {
            if (idx >= start && idx < end) {
                link.style.display = 'inline-block';
            } else {
                link.style.display = 'none';
            }
        });
    }










    function handleTooltipNavigation(contentContainer, highlightedLines, currentIndex, direction, totalLinks, paginator) {
        let newIndex;
        if (direction === 'previous') {
            newIndex = (currentIndex - 1 + highlightedLines.length) % highlightedLines.length;
        } else if (direction === 'next') {
            newIndex = (currentIndex + 1) % highlightedLines.length;
        }

        contentContainer.innerHTML = highlightedLines[newIndex];
        updatePagination(paginator, newIndex, highlightedLines.length);

        // const currentText = normalizeText(contentContainer.textContent);

        const currentText = contentContainer.textContent;

        if (popup.style.display === 'block') {


            // const iframe = document.getElementById('contextIframe');
            // highlightRects = highlightAllOccurrences(iframe, currentText);
            // currentHighlightIndex = -1;
            // findNext(iframe);

            scrollToAndHighlightInIframe(currentText);


        }

        return newIndex;
    }


    function updateTooltipContent(contentContainer, highlightedLines, idx, linksContainer) {
        contentContainer.innerHTML = highlightedLines[idx];
        Array.from(linksContainer.querySelector('.numbered-links').children).forEach(link => {
            link.classList.remove('active');
        });
        linksContainer.querySelector('.numbered-links').children[idx].classList.add('active');
    }

























    function highlightNameInText(text, name) {
        // Adjust the regular expression to match the name as a substring of words, without word boundaries
        const regex = new RegExp(`${name}`, 'gi'); // 'gi' for global and case-insensitive matching
        // Replace and wrap with a span for styling
        return text.replace(regex, match => `<span class="highlight">${match}</span>`);
    }

    function sanitizeId(inputString) {
        // Replace any invalid character with an underscore
        let sanitized = inputString.replace(/[^a-zA-Z0-9-_]/g, '_');

        // Ensure the ID does not start with a digit, two hyphens, or a hyphen followed by a digit
        if (/^[0-9]/.test(sanitized)) {
            sanitized = '_' + sanitized;  // Prefix with an underscore if the string starts with a digit
        } else if (/^--/.test(sanitized) || /^-\d/.test(sanitized)) {
            sanitized = '_' + sanitized;  // Prefix with an underscore if the string starts with two hyphens or a hyphen followed by a digit
        }

        return sanitized;
    }



    function restoreProgressCircles() {
        const circles = document.querySelectorAll('.progressCircle');
        circles.forEach(circle => {
            gsap.to(circle, { borderColor: "white", duration: 0 });
        });
    }

    function getLargestTopLeftRect(packedRectData) {
        // Compute the size of each rectangle
        packedRectData.forEach(d => {
            d.size = d.width * d.height;
        });

        // Find the largest size
        const largestSize = Math.max(...packedRectData.map(d => d.size));

        // Filter the rectangles that have the largest size
        const largestRects = packedRectData.filter(d => d.size === largestSize);

        // Find the rectangle closest to the top-left corner
        const largestTopLeftRect = largestRects.reduce((closest, rect) => {
            const distance = rect.x + rect.y;
            const closestDistance = closest.x + closest.y;
            return distance < closestDistance ? rect : closest;
        }, largestRects[0]);

        return largestTopLeftRect;
    }


    function getSmallestBottomRightRect(packedRectData) {
        // Compute the size of each rectangle
        packedRectData.forEach(d => {
            d.size = d.width * d.height;
        });

        // Find the smallest size
        const smallestSize = Math.min(...packedRectData.map(d => d.size));

        // Filter the rectangles that have the smallest size
        const smallestRects = packedRectData.filter(d => d.size === smallestSize);

        // Compute the bounding box of all rectangles to determine the bottom-right corner
        const boundingBox = packedRectData.reduce((box, rect) => {
            box.minX = Math.min(box.minX, rect.x);
            box.minY = Math.min(box.minY, rect.y);
            box.maxX = Math.max(box.maxX, rect.x + rect.width);
            box.maxY = Math.max(box.maxY, rect.y + rect.height);
            return box;
        }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

        const containerWidth = boundingBox.maxX;
        const containerHeight = boundingBox.maxY;

        // Find the rectangle closest to the bottom-right corner
        const smallestBottomRightRect = smallestRects.reduce((closest, rect) => {
            const distance = (containerWidth - (rect.x + rect.width)) + (containerHeight - (rect.y + rect.height));
            const closestDistance = (containerWidth - (closest.x + closest.width)) + (containerHeight - (closest.y + closest.height));
            return distance < closestDistance ? rect : closest;
        }, smallestRects[0]);

        return smallestBottomRightRect;
    }


    function explainPacking() {
        const pathLength1 = pathSmallesRect.getTotalLength();
        pathSmallesRect.style.strokeDasharray = pathLength1;
        pathSmallesRect.style.strokeDashoffset = pathLength1;

        const pathLength2 = pathLargestRect.getTotalLength();
        pathLargestRect.style.strokeDasharray = pathLength2;
        pathLargestRect.style.strokeDashoffset = pathLength2;

        d3.select(pathSmallesRect).attr('opacity', 1);
        d3.select(pathLargestRect).attr('opacity', 1);

        const tl = gsap.timeline();

        otherRectsIDs.forEach((id, index) => {
            tl.to(`#${id}`, { opacity: 0.05, duration: 1 }, "init");
        });
        otherLabelsIDs.forEach((id, index) => {
            tl.to(`#${id}`, { opacity: 0.05, duration: 1 }, "init");
        });

        tl
            .to(pathSmallesRect, {
                strokeDashoffset: 0, duration: 0.5
            })
            .to(label1.node(), {
                opacity: 1, duration: 0.5
            }, "-=0.3")

            .to(pathLargestRect, {
                strokeDashoffset: 0, duration: 0.5
            })
            .to(label2.node(), {
                opacity: 1, duration: 0.5
            }, "-=0.3")

            .to(label1.node(), {
                opacity: 0, delay: 2, duration: 0.5
            })
            .to(label2.node(), {
                opacity: 0, duration: 0.5
            }, "-=0.5")

            .to(pathSmallesRect, {
                strokeDashoffset: pathLength1, duration: 0.5
            }, "-=0.5")
            .to(pathLargestRect, {
                strokeDashoffset: pathLength2, duration: 0.5,
                onComplete: () => {
                    d3.select(pathSmallesRect).attr('opacity', 0);
                    d3.select(pathLargestRect).attr('opacity', 0);
                }
            }, "-=0.5")

        otherRectsIDs.forEach((id, index) => {
            tl.to(`#${id}`, { opacity: 1, duration: 1 }, "init+=5");
        });

        otherLabelsIDs.forEach((id, index) => {
            tl.to(`#${id}`, {
                opacity: 1,
                duration: 1,
                onComplete: () => {
                    if (index == otherLabelsIDs.length - 1) {
                        tl.pause();
                    }
                }
            }, "init+=5");
        });

    }

    function getCenterOfSvgGroup(groupId) {
        // Select the SVG group element by its ID
        const groupElement = d3.select(`#${groupId}`).node();

        // Get the bounding box of the group element
        const bbox = groupElement.getBBox();

        // drawRectAt(bbox.x, bbox.y, 10, 10, 'green');
        // drawRectAt(bbox.x + bbox.width, bbox.y, 10, 10, 'green');
        // drawRectAt(bbox.x, bbox.y + bbox.height, 10, 10, 'green');
        // drawRectAt(bbox.x + bbox.width, bbox.y + bbox.height, 10, 10, 'green');

        // Calculate the center of the bounding box
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        return { x: centerX, y: centerY };
    }


    function explainActors() {

        // const maxActorElementId = getElementWithHighestNumberOfActors();


        const elements = d3.selectAll('.actorIcon').nodes();
        const randomIndex = Math.floor(Math.random() * elements.length);
        const randomElement = elements[randomIndex];
        const maxActorElementId = randomElement.id;

        console.log("Element with the highest number of actors:", maxActorElementId);

        const tl = gsap.timeline();

        const cursor = cursorIcon.node();

        let originals = originalTransformations[maxActorElementId];
        let x = originals.originalX + originals.originX;
        let y = originals.originalY + originals.originX;

        // drawRectAt(center.x, center.y, 20, 20, 'red');
        // drawRectAt(svgWidth / 2, svgHeight / 2, 30, 30, "blue")
        // drawRectAt(x, y, 30, 30, "red")
        // drawRectAt(xCenter, yCenter, 50, 50, 'red');
        // drawRectAt(x, y, 10, 10, 'purple');
        // drawRectAt(x / 0.35, y / 0.35, 100, 100, 'pink');

        bringToFront(cursor);


        tl.fromTo(cursor,
            { opacity: 0, scale: 0 },
            {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'expo.out'
            })
            .to(cursor, {
                duration: 0.75, // Adjust duration as needed
                motionPath: {
                    path: [
                        { x: svgWidth / 2, y: svgHeight / 2 }, // Start at the center of the SVG
                        { x: (svgWidth / 2 + x) / 2, y: (svgHeight / 2 + y) / 2 - 50 }, // Control point 1
                        { x: x, y: y } // End at target position
                    ],
                    curviness: 1.5 // Adjust curviness as needed
                },
                ease: "power1.inOut",
                onComplete: function () {
                    d3.select(`#${maxActorElementId}`).style('filter', 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.5))');
                }
            })
            .to(cursor, {
                scale: 1.3, duration: 0.5
            })
            .to(cursor, {
                scale: 1, duration: 0.5, onComplete: () => {
                    const element = d3.select(`#${maxActorElementId}`);
                    element.dispatch('click');
                    gsap.to(cursor, {
                        opacity: 0, scale: 0, delay: 3 + animationDuration, duration: 0,
                        onComplete: () => {
                            d3.select(`#${maxActorElementId}`).style('filter', '');
                        }
                    })
                }
            })

    }






    function bringToFront(element) {
        element.parentNode.appendChild(element);
    }

    // Function to load, insert, and animate the SVG "info" icon
    function loadIconAt(icon, svgPath, x, y, scale = 1, opacity = 0) {

        return d3.xml(svgPath).then(data => {

            icon.attr('opacity', '0');

            const importedNode = document.importNode(data.documentElement, true);
            var tempG = svg.append('g').append(() => importedNode);
            const bbox = importedNode.getBBox();
            const iconWidth = bbox.width;
            const iconHeight = bbox.height;
            tempG.remove();

            icon.append(() => importedNode);

            icon
                .style('transform-origin', `${iconWidth / 2}px ${iconHeight / 2}px`)
                .attr('transform', `translate(${(x - iconWidth / 2)}, ${(y - iconHeight / 2)}) scale(${scale})`);

        });
    }

    function blinkIcon(icon, repeat = 2) {

        gsap.fromTo(icon.node(),
            { opacity: 0, scale: 0 },
            {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'elastic.out(1, 0.3)',
                repeat: repeat,
                repeatDelay: 2
            });

    }


    function getElementWithHighestNumberOfActors() {
        // Select all elements with the class 'actorIcon'
        const elements = d3.selectAll('.actorIcon');

        // Initialize variables to keep track of the element with the highest value
        let maxElement = null;
        let maxValue = -Infinity;

        // Iterate over each element to find the one with the highest data-numberOfActors value
        elements.each(function () {
            const element = d3.select(this);
            const value = +element.attr('data-numberOfActors'); // Convert attribute value to number

            if (value > maxValue) {
                maxValue = value;
                maxElement = element;
            }
        });

        // Return the id of the element with the highest value
        return maxElement ? maxElement.attr('id') : null;

    }





    function explainDataPerActor() {

        const elements = d3.selectAll('.copyOfDataRect').nodes();
        const randomIndex = Math.floor(Math.random() * elements.length);
        const randomElement = elements[randomIndex];
        const randomElementtId = randomElement.id;

        window.randomElement = randomElement;

        const bbox = randomElement.getBBox();

        console.log("bbox:");
        console.log(bbox);



        let xPosition = parseFloat(randomElement.getAttribute('x'));
        let yPosition = parseFloat(randomElement.getAttribute('y'));

        const transform = randomElement.transform.baseVal.consolidate();
        if (transform) {
            const matrix = transform.matrix;
            xPosition += matrix.e;  // matrix.e represents the translation on the x-axis
            yPosition += matrix.f;  // matrix.e represents the translation on the x-axis
        }

        // drawRectAt(xPosition, yPosition, 10, 10, 'blue');

        // console.log("xPosition:");
        // console.log(xPosition);
        // drawRectAt(center.x, center.y, 50, 50, 'black');

        const tl = gsap.timeline();

        const cursor = cursorIcon.node();

        let x = xPosition + bbox.width / 2;
        let y = yPosition + bbox.height / 2;

        bringToFront(cursor);

        tl.fromTo(cursor,
            { opacity: 0, scale: 0 },
            {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'expo.out'
            })
            .to(cursor, {
                duration: 0.75,
                motionPath: {
                    path: [
                        { x: svgWidth / 2, y: svgHeight / 2 },
                        { x: (svgWidth / 2 + x) / 2, y: (svgHeight / 2 + y) / 2 - 50 },
                        { x: x, y: y }
                    ],
                    curviness: 1.5
                },
                ease: "power1.inOut",
                onComplete: function () {
                    d3.select(`#${randomElementtId}`).style('filter', 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.5))');
                }
            })
            .to(cursor, {
                scale: 1.3, duration: 0.5
            })
            .to(cursor, {
                scale: 1, duration: 0.5, onComplete: () => {
                    const element = d3.select(`#${randomElementtId}`);
                    element.dispatch('click');
                    gsap.to(cursor, {
                        opacity: 0, scale: 0, delay: 3 + animationDuration, duration: 0,
                        onComplete: () => {
                            d3.select(`#${randomElementtId}`).style('filter', '');
                        }
                    })
                }
            })

    }





    function processString(input) {
        // Split the input string into lines
        let lines = input.split('\n');

        // Initialize an array to store the processed lines
        let result = [];

        // Initialize a variable to keep track of the last processed line
        let lastLine = '';

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            // Skip lines that are followed by more than one line break
            if (line !== '' && i + 1 < lines.length && lines[i + 1].trim() === '') {
                let j = i + 1;
                while (j < lines.length && lines[j].trim() === '') {
                    j++;
                }
                if (j - i > 1) {
                    // Skip this line because it's followed by more than one line break
                    continue;
                }
            }

            // If the line is not a duplicate of the last processed line, add it to the result
            if (line !== '' && line !== lastLine) {
                result.push(line);
                lastLine = line;
            }
        }

        // Return the processed lines joined back into a single string
        return result;
    }





});
