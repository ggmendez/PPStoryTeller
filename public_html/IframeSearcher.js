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
        return text
            .replace(/[’‘]/g, "'")
            .replace(/[“”]/g, '"')
            .replace(/[\u2013\u2014]/g, '-');
    }

    setHighlightColor(highlightColor) {
        this.highlightColor = highlightColor;
    }


    search(term, scroll = true, clearPreviousResults = true) {
        
        if (clearPreviousResults) {
            this.clearSearch();
        }        

        if (!term) return;

        term = this.normalizeText(term);

        let textNodes = [];
        let textContent = '';
        let nodeMap = [];

        const walker = this.iframeDocument.createTreeWalker(this.iframeDocument.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);

        // Accumulate text nodes while keeping track of original nodes and flattening the text content
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
                textNodes.push(node);
                const startOffset = textContent.length;
                textContent += this.normalizeText(node.nodeValue);
                const endOffset = textContent.length;
                nodeMap.push({ node, startOffset, endOffset });
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                textContent += this.normalizeText(node.textContent || '');
            }
        }

        const regex = new RegExp(this.escapeRegExp(term), 'gi');
        let match;

        // Process matches based on the flattened text content
        while ((match = regex.exec(textContent)) !== null) {
            let matchStart = match.index;
            let matchEnd = regex.lastIndex;

            // Highlighting the matches back in the original document structure
            for (let i = 0; i < nodeMap.length; i++) {
                const { node, startOffset, endOffset } = nodeMap[i];
                if (startOffset < matchEnd && endOffset > matchStart) {
                    const localStart = Math.max(matchStart - startOffset, 0);
                    const localEnd = Math.min(matchEnd - startOffset, node.nodeValue.length);

                    const beforeText = node.nodeValue.slice(0, localStart);
                    const highlightedText = node.nodeValue.slice(localStart, localEnd);
                    const afterText = node.nodeValue.slice(localEnd);

                    const span = this.iframeDocument.createElement('span');
                    span.className = 'highlight-search';
                    span.dataset.searchIndex = this.currentMatches.length;
                    span.textContent = highlightedText;

                    const parentNode = node.parentNode;
                    if (parentNode) {
                        if (beforeText) {
                            parentNode.insertBefore(this.iframeDocument.createTextNode(beforeText), node);
                        }
                        parentNode.insertBefore(span, node);
                        if (afterText) {
                            const afterNode = this.iframeDocument.createTextNode(afterText);
                            parentNode.insertBefore(afterNode, node);
                            nodeMap[i].node = afterNode;  // Update the node reference to the afterText
                        } else {
                            nodeMap.splice(i, 1); // Remove the node from processing since it was fully replaced
                            i--;
                        }
                        parentNode.removeChild(node);
                        this.currentMatches.push(span);
                    }
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

        const tokens = text.trim().split(":").filter(str => str.trim() !== '');

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

        console.log("***************************************************");
        console.log("***************************************************");
        console.log("***************************************************");
        

        console.log("Original text: ");
        console.log(text);
        
        console.log("Going to search:");
        console.log(answer);
        
        const result = subtractString(text, answer.trim()).trim();

        console.log("This is what's left:");
        console.log(result);


        this.search(answer, false, true);

        this.search(result, true, false);

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


