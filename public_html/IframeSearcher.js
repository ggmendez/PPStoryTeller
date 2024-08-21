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

    search(term, scroll = true) {
        this.clearSearch();

        if (!term) return;

        term = this.normalizeText(term);

        this.iframeDocument.body.normalize();
        const walker = this.iframeDocument.createTreeWalker(this.iframeDocument.body, NodeFilter.SHOW_TEXT, null, false);
        let node, textContent = '', nodes = [];

        // while (node = walker.nextNode()) {
        //     const normalizedText = this.normalizeText(node.nodeValue);
        //     nodes.push({ node: node, startOffset: textContent.length });
        //     textContent += normalizedText;
        // }

        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                const normalizedText = this.normalizeText(node.textContent);
                nodes.push({ node: node, startOffset: textContent.length });
                textContent += normalizedText;
            }
        }

        const regex = new RegExp(this.escapeRegExp(term), 'gi');
        let match;

        while ((match = regex.exec(textContent)) !== null) {
            let start = match.index;
            let end = regex.lastIndex;

            for (let i = 0; i < nodes.length; i++) {
                const nodeObj = nodes[i];
                const nodeText = this.normalizeText(nodeObj.node.nodeValue);
                const nodeLength = nodeText.length;

                if (start < nodeObj.startOffset + nodeLength && end > nodeObj.startOffset) {
                    let nodeStartOffset = Math.max(start - nodeObj.startOffset, 0);
                    let nodeEndOffset = Math.min(end - nodeObj.startOffset, nodeLength);

                    let span = this.iframeDocument.createElement('span');
                    span.className = 'highlight-search';
                    span.dataset.searchIndex = this.currentMatches.length;

                    let highlightedText = nodeObj.node.nodeValue.substring(nodeStartOffset, nodeEndOffset);
                    let beforeText = nodeObj.node.nodeValue.substring(0, nodeStartOffset);
                    let afterText = nodeObj.node.nodeValue.substring(nodeEndOffset);

                    let parentNode = nodeObj.node.parentNode;

                    if (beforeText) parentNode.insertBefore(document.createTextNode(beforeText), nodeObj.node);
                    span.appendChild(document.createTextNode(highlightedText));
                    parentNode.insertBefore(span, nodeObj.node);
                    if (afterText) parentNode.insertBefore(document.createTextNode(afterText), nodeObj.node);

                    parentNode.removeChild(nodeObj.node);

                    this.currentMatches.push(span);
                }
            }
        }

        if (this.currentMatches.length > 0 && scroll) {
            this.currentIndex = 0;
            this.scrollToCurrent();
        }
    }



    retry(text) {

        const tokens = text.split(":");

        let i = tokens.length - 1;
        let cummulativeText = "";
        let answer = "";


        do {

            let currentText = tokens[i].trim();


            if (i === tokens.length - 1) {
                cummulativeText = currentText;
            } else {
                cummulativeText = currentText.trim() + ": " + cummulativeText.trim();
            }

            this.search(cummulativeText, false);

            if (!this.currentMatches.length) {
                break;
            }


            if (i === tokens.length - 1) {
                answer = currentText;
            } else {
                answer = currentText.trim() + ": " + answer.trim();
            }


            i--;





        } while (i >= 0);


        console.log("cummulativeText: ");
        console.log(cummulativeText);

        console.log("\n");
        

        console.log("answer: ");
        console.log(answer);

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

    scrollToCurrent() {

        const currentMatch = this.currentMatches[this.currentIndex];

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

        // Scroll the current match into view
        currentMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
