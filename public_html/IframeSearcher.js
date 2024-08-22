class IframeSearcher {
    constructor(iframeId) {
        this.iframe = document.getElementById(iframeId);
        this.iframeDocument = this.iframe.contentDocument || this.iframe.contentWindow.document;
        this.originalContent = this.iframeDocument.body.innerHTML;
        this.currentMatches = [];
        this.currentIndex = -1;
        this.highlightColor = '#FFFF00';
    }

    normalizeText(text) {
        return text.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[\u2013\u2014]/g, '-');
    }

    setHighlightColor(highlightColor) {
        this.highlightColor = highlightColor;
    }


    // search(term, scroll = true) {

    //     this.clearSearch();

    //     if (!term) return;

    //     term = this.normalizeText(term);

    //     const walker = this.iframeDocument.createTreeWalker(this.iframeDocument.body, NodeFilter.SHOW_TEXT, null, false);
    //     let node;
    //     let textNodes = [];
    //     let textContent = '';

    //     // Collect text nodes and accumulate their content
    //     while (node = walker.nextNode()) {
    //         if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
    //             textNodes.push(node);
    //             textContent += this.normalizeText(node.nodeValue);
    //         }
    //     }

    //     const regex = new RegExp(this.escapeRegExp(term), 'gi');
    //     let match;

    //     // Process matches and apply highlighting across node boundaries
    //     while ((match = regex.exec(textContent)) !== null) {
    //         let matchStart = match.index;
    //         let matchEnd = regex.lastIndex;
    //         let accumulatedLength = 0;

    //         for (let i = 0; i < textNodes.length; i++) {
    //             const node = textNodes[i];
    //             const nodeText = this.normalizeText(node.nodeValue);
    //             const nodeLength = nodeText.length;

    //             if (accumulatedLength + nodeLength >= matchStart && accumulatedLength <= matchEnd) {
    //                 const highlightStart = Math.max(matchStart - accumulatedLength, 0);
    //                 const highlightEnd = Math.min(matchEnd - accumulatedLength, nodeLength);

    //                 // Split the text node into before, highlighted, and after parts
    //                 const beforeText = node.nodeValue.slice(0, highlightStart);
    //                 const highlightedText = node.nodeValue.slice(highlightStart, highlightEnd);
    //                 const afterText = node.nodeValue.slice(highlightEnd);

    //                 const span = this.iframeDocument.createElement('span');
    //                 span.className = 'highlight-search';
    //                 span.dataset.searchIndex = this.currentMatches.length;
    //                 span.textContent = highlightedText;






    //                 // const parentNode = node.parentNode;
    //                 // if (beforeText) {
    //                 //     parentNode.insertBefore(this.iframeDocument.createTextNode(beforeText), node);
    //                 // }
    //                 // parentNode.insertBefore(span, node);
    //                 // if (afterText) {
    //                 //     parentNode.insertBefore(this.iframeDocument.createTextNode(afterText), node);
    //                 //     textNodes[i] = parentNode.childNodes[parentNode.childNodes.length - 1];  // Update reference to the remaining text node
    //                 // } else {
    //                 //     textNodes.splice(i, 1);  // Remove the node from further processing
    //                 //     i--;
    //                 // }
    //                 // parentNode.removeChild(node);








    //                 const parentNode = node.parentNode;

    //                 if (parentNode) {
    //                     if (beforeText) {
    //                         parentNode.insertBefore(this.iframeDocument.createTextNode(beforeText), node);
    //                     }

    //                     parentNode.insertBefore(span, node);

    //                     if (afterText) {
    //                         parentNode.insertBefore(this.iframeDocument.createTextNode(afterText), node);
    //                         textNodes[i] = parentNode.childNodes[parentNode.childNodes.length - 1];  // Update reference to the remaining text node
    //                     } else {
    //                         textNodes.splice(i, 1);  // Remove the node from further processing
    //                         i--;
    //                     }

    //                     parentNode.removeChild(node);
    //                 }










    //                 this.currentMatches.push(span);
    //             }

    //             accumulatedLength += nodeLength;

    //             if (accumulatedLength >= matchEnd) {
    //                 break;
    //             }
    //         }
    //     }

    //     if (this.currentMatches.length > 0 && scroll) {
    //         this.currentIndex = 0;
    //         this.scrollToCurrent();
    //     }
    // }


    search(term, scroll = true) {
        this.clearSearch();

        if (!term) return;

        term = this.normalizeText(term);

        const walker = this.iframeDocument.createTreeWalker(this.iframeDocument.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let textNodes = [];
        let textContent = '';

        // Collect text nodes and accumulate their content
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
                textContent += this.normalizeText(node.nodeValue);
            }
        }

        const regex = new RegExp(this.escapeRegExp(term), 'gi');
        let match;

        // Process matches and apply highlighting across node boundaries
        while ((match = regex.exec(textContent)) !== null) {
            let matchStart = match.index;
            let matchEnd = regex.lastIndex;
            let accumulatedLength = 0;

            for (let i = 0; i < textNodes.length; i++) {
                const node = textNodes[i];
                const nodeText = this.normalizeText(node.nodeValue);
                const nodeLength = nodeText.length;

                if (accumulatedLength + nodeLength > matchStart && accumulatedLength < matchEnd) {
                    const highlightStart = Math.max(matchStart - accumulatedLength, 0);
                    const highlightEnd = Math.min(matchEnd - accumulatedLength, nodeLength);

                    // Split the text node into before, highlighted, and after parts
                    const beforeText = node.nodeValue.slice(0, highlightStart);
                    const highlightedText = node.nodeValue.slice(highlightStart, highlightEnd);
                    const afterText = node.nodeValue.slice(highlightEnd);

                    const span = this.iframeDocument.createElement('span');
                    span.className = 'highlight-search';
                    span.dataset.searchIndex = this.currentMatches.length;
                    span.textContent = highlightedText;

                    const parentNode = node.parentNode;

                    if (parentNode) {  // Ensure parentNode is not null before manipulating
                        if (beforeText) {
                            parentNode.insertBefore(this.iframeDocument.createTextNode(beforeText), node);
                        }
                        parentNode.insertBefore(span, node);
                        if (afterText) {
                            parentNode.insertBefore(this.iframeDocument.createTextNode(afterText), node);
                            textNodes[i] = parentNode.childNodes[parentNode.childNodes.length - 1];  // Update reference to the remaining text node
                        } else {
                            textNodes.splice(i, 1);  // Remove the node from further processing
                            i--;
                        }

                        parentNode.removeChild(node);
                        this.currentMatches.push(span);
                    }
                }

                accumulatedLength += nodeLength;

                if (accumulatedLength >= matchEnd) {
                    break;
                }
            }
        }

        if (this.currentMatches.length > 0 && scroll) {
            this.currentIndex = 0;
            this.scrollToCurrent();
        }
    }


    retry(text) {

        console.log("*************** Retrying search of ***************");
        console.log(text);

        const tokens = text.trim().split(":");
        let i = tokens.length - 1;
        let cummulativeText = "";
        let answer = "";

        do {
            let currentText = tokens[i].trim();

            console.log("------------ currentText:");
            console.log(currentText);


            if (i === tokens.length - 1) {
                cummulativeText = currentText;
            } else {
                cummulativeText = currentText.trim() + ": " + cummulativeText.trim();
            }

            console.log("------------ cummulativeText:");
            console.log(cummulativeText);

            this.search(cummulativeText, false);

            if (!this.currentMatches.length) {
                break;
            }

            if (i === tokens.length - 1) {
                answer = currentText;
            } else {
                answer = currentText.trim() + ": " + answer.trim();
            }

            console.log("------------ answer:");
            console.log(answer);

            i--;
        } while (i >= 0);

        console.log("Going to search: \n" + answer);

        this.search(answer);
    }

    next() {
        if (this.currentMatches.length === 0) return;

        this.currentIndex = (this.currentIndex + 1) % this.currentMatches.length;
        this.scrollToCurrent();
    }

    previous() {
        if (this.currentMatches.length === 0) return;

        this.currentIndex = (this.currentIndex - 1 + this.currentMatches.length) % this.currentMatches.length;
        this.scrollToCurrent();
    }

    findLargestSpan() {
        if (this.currentMatches.length === 0) return null;

        let largestSpan = null;
        let maxArea = 0;

        this.currentMatches.forEach((span) => {
            const rect = span.getBoundingClientRect();
            const area = rect.width * rect.height;

            if (area > maxArea) {
                maxArea = area;
                largestSpan = span;
            }
        });

        return largestSpan;
    }


    scrollToCurrent() {

        console.log("this.currentMatches:");
        console.log(this.currentMatches);


        // const currentMatch = this.currentMatches[this.currentIndex];
        // const currentMatch = this.findLargestSpan();

        this.currentMatches.forEach((currentMatch) => {


            let duration = 0.5 + (0.002 * currentMatch.textContent.length);

            // console.log("duration:");
            // console.log(duration);

            // Create an IntersectionObserver to detect when the scroll is complete
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    // Animate the highlight after the element is in view
                    gsap.fromTo(currentMatch,
                        { backgroundSize: '0% 100%' },  // Start with no background size
                        {
                            backgroundSize: '100% 100%',  // Animate to full background size
                            duration: duration,
                            ease: "none",
                            onStart: () => {
                                currentMatch.style.backgroundImage = `linear-gradient(to right, ${this.highlightColor}, ${this.highlightColor})`;
                                currentMatch.style.backgroundRepeat = 'no-repeat';
                                currentMatch.style.backgroundSize = '0% 100%';
                            }
                        }
                    );

                    // Disconnect the observer after the animation starts to prevent multiple triggers
                    observer.disconnect();
                }
            }, {
                threshold: 1.0  // The element is considered in view when 100% of it is visible
            });

            // Start observing the element
            observer.observe(currentMatch);


        });


        // Scroll the current match into view
        this.currentMatches[this.currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }




    clearSearch() {
        this.currentMatches = [];
        this.currentIndex = -1;
        this.iframeDocument.body.innerHTML = this.originalContent;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
