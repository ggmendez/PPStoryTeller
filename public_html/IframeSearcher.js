class IframeSearcher {
    constructor(iframeId) {
        this.iframe = document.getElementById(iframeId);
        this.iframeDocument = this.iframe.contentDocument || this.iframe.contentWindow.document;
        this.originalContent = this.iframeDocument.body.innerHTML;
        this.currentMatches = [];
        this.currentIndex = -1;
    }

    search(term) {
        // Clear previous highlights and reset content
        this.clearSearch();

        if (!term) return;

        const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
        let content = this.iframeDocument.body.innerHTML;
        let matchCount = 0;

        // Replace matching text with highlighted span
        content = content.replace(regex, (match, group1) => {
            matchCount++;
            return `<span class="highlight-search" data-search-index="${matchCount - 1}">${group1}</span>`;
        });

        this.iframeDocument.body.innerHTML = content;

        // Store the matched elements
        this.currentMatches = this.iframeDocument.querySelectorAll('.highlight-search');
        if (this.currentMatches.length > 0) {
            this.currentIndex = 0;
            this.scrollToCurrent();
        }
    }

    next() {
        if (this.currentMatches.length === 0) return;

        // Move to the next match
        this.currentIndex = (this.currentIndex + 1) % this.currentMatches.length;
        this.scrollToCurrent();
    }

    previous() {
        if (this.currentMatches.length === 0) return;

        // Move to the previous match
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
        // Escape special characters for RegExp
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
