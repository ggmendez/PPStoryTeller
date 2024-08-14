class IframeSearcher {
    constructor(iframeId) {
        this.iframe = document.getElementById(iframeId);
        this.iframeDocument = this.iframe.contentDocument || this.iframe.contentWindow.document;
        this.originalContent = this.iframeDocument.body.innerHTML;
        this.currentMatches = [];
        this.currentIndex = -1;
    }

    normalizeText(text) {
        // Replace curly quotes with straight quotes and perform other normalizations if necessary
        return text.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[\u2013\u2014]/g, '-');
    }

    search(term) {
        this.clearSearch();

        if (!term) return;

        term = this.normalizeText(term);

        // Normalize the HTML content by removing tags and joining the text
        this.iframeDocument.body.normalize();
        const walker = this.iframeDocument.createTreeWalker(this.iframeDocument.body, NodeFilter.SHOW_TEXT, null, false);
        let node, textContent = '', nodes = [];

        while (node = walker.nextNode()) {
            // Normalize text within nodes to ensure correct matching
            const normalizedText = this.normalizeText(node.nodeValue);
            nodes.push({ node: node, startOffset: textContent.length });
            textContent += normalizedText;
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
                    span.style.backgroundColor = 'yellow';

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

        if (this.currentMatches.length > 0) {
            this.currentIndex = 0;
            this.scrollToCurrent();
        }
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
        this.currentMatches.forEach((match, index) => {
            match.style.backgroundColor = index === this.currentIndex ? 'orange' : 'yellow';
        });

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

