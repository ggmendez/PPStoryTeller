/* global d3, XLSX, gsap, ScrollTrigger, ScrollToPlugin */

document.addEventListener("DOMContentLoaded", (event) => {

    let currentPermanentTooltip = null;
    let searcher = null;
    let tmpSearcher = null;
    let categoriesColorScale;
    let currentLinesArray = null;
    let currentLineIndex = null;
    let shouldShowDataCategories = false;
    let dataCategoryClicked = false;
    let progressColor = "gray";

    const scrollOffset = 1000;

    let pathLargestRect, pathSmallesRect;
    let label1, label2;
    let nonTargetLabels;

    let otherRectsIDs;
    let otherLabelsIDs;
    let pathString1, pathString2, endPath1, endPath2;
    let explaining = "packing";

    // Track whether the iframe container is compressed or expanded
    let isCompressed = false;

    document.getElementById('topButton').addEventListener('click', function () {

        var button = document.getElementById('topButton');
        var buttonText = document.getElementById('topButtonText');
        const toggleButton = document.getElementById('overlayToggleButton');

        const contextIframe = document.getElementById('contextIframe');
        const iframeContainer = document.getElementById('iframe-container');

        const diagonalArrowsIcon = document.getElementById('diagonalArrowsIcon');


        toggleButton.addEventListener('click', function () {

            if (isCompressed) {
                // Expand the iframe container
                gsap.to(contextIframe, {
                    height: '100%',  // Set to your expanded height
                    duration: duration,
                    ease: 'power2.out'
                });

                gsap.to(iframeContainer, {
                    height: '100%',  // Set to your compressed height
                    duration: duration,
                    ease: 'power2.out'
                });

                diagonalArrowsIcon.classList.remove('compressed'); // Remove rotation


                gsap.to('.popup', {
                    height: '96vh',  // Set to your compressed height
                    duration: duration,
                    ease: 'power2.out'
                });

            } else {


                // Compress the iframe container
                gsap.to(contextIframe, {
                    height: 0,
                    duration: duration,
                    ease: 'power2.out'
                });

                gsap.to(iframeContainer, {
                    height: 0,
                    duration: duration,
                    ease: 'power2.out'
                });

                gsap.to('.popup', {
                    height: 50,
                    duration: duration,
                    ease: 'power2.out'
                });

                // Compress action
                diagonalArrowsIcon.classList.add('compressed'); // Rotate 180 degrees

            }
            // Toggle the compressed state
            isCompressed = !isCompressed;
        });


        button.style.overflow = 'hidden';

        const duration = 0.8;

        const timeline = gsap.timeline();

        timeline.addLabel("button");

        timeline
            .to(button, {
                duration: duration,
                width: 0,
                height: 0,
                padding: 0,
                ease: "back.in(1.7)",
                onComplete: function () {
                    button.remove();
                }
            }, "button")
            .to(buttonText, {
                duration: duration * 0.75,
                opacity: 0,
                ease: "power1.out"
            }, "button")



            .to('#popup', {
                duration: duration * 0.75,
                width: '28%',
                height: window.innerHeight,
                top: '20px',
                transform: 'translateY(0%)',
                left: '1%',
                ease: "power4.out",
            }, "button+=" + duration)











    });






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
    if (!who || !formatedNames[who]) who = "tiktok";
    document.title = formatedNames[who] + "'s PP";









    // Add the popup structure to the body
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.className = 'popup';

    popup.innerHTML = `
    <div class="popup-content">
        <div id="overlay" class="overlay">



            <div class="left-content first-element">
                <div id="squareIndicator" class="square-indicator"></div>
                <div id="dataName" class="main-question">${formatedNames[who]}'s Privacy Policy</div>
            </div>


            <div id="pageNavigation" class="page-navigation other-element">
                <span id="pageInfo" class="page-info">0/0</span>
                <div class="navigation">
                    <button id="upButtonPreviousMention" class="nav-button up-button">
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </button>
                    <button id="downButtonNextMention" class="nav-button down-button">
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>                                        
                </div>
            </div>
            <div class"other-element" style="border-left: 1px solid black; padding-left: 5px; padding-right: 5px;">
                <button id="overlayToggleButton" class="nav-button overlay-toggle-button">
                    <svg id="diagonalArrowsIcon" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="6" y1="18" x2="18" y2="6" /> <!-- Diagonal line for first arrow -->
                        <polyline points="6 12 6 18 12 18" /> <!-- Arrowhead for the first arrow -->                    
                        <polyline points="18 12 18 6 12 6" /> <!-- Arrowhead for the second arrow -->
                    </svg>
                </button>
            </div>
        </div>
        <div id="iframe-container">
            <iframe id="contextIframe" src="" style="width: 100%; height: 100%; border: none;" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
        </div>
    </div>`;

    document.body.appendChild(popup);

    const url = "./htmls/" + who + ".html";

    fetch(url)
        .then(response => response.text())
        .then(html => {
            // Create a temporary DOM element to manipulate the HTML
            const parser = new DOMParser();

            const cleanHTML = html.replace(/&nbsp;/g, " ").replace(/[“”]/g, '"');

            // console.log("cleanHTML:");
            // console.log(cleanHTML);

            const doc = parser.parseFromString(cleanHTML, 'text/html');

            // Remove all links (a tags) and replace them with their text content
            const links = doc.querySelectorAll('a');
            links.forEach(link => {
                const textNode = document.createTextNode(link.textContent);
                link.parentNode.replaceChild(textNode, link);
            });

            // Serialize the modified HTML back to a string
            const modifiedHTML = new XMLSerializer().serializeToString(doc);

            // Create a Blob from the modified HTML string
            const blob = new Blob([modifiedHTML], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);

            // Set the iframe src to the Blob URL
            iframe.src = blobUrl;

            iframe.onload = () => {
                popup.style.display = 'block';
                // hidePopup();
            };
        })
        .catch(error => {
            alert('Error loading or modifying HTML:', error);
            console.error('Error loading or modifying HTML:', error);
        });



    // Add event listeners to the up and down buttons
    document.getElementById('upButtonPreviousMention').addEventListener('click', function () {
        currentLineIndex--; // Decrement the index

        // Check if the index is before the first item, and if so, circle back to the end
        if (currentLineIndex < 0) {
            currentLineIndex = currentLinesArray.length - 1; // Set to the last item in the array
        }

        const currentText = currentLinesArray[currentLineIndex];
        let normalizedText = normalizeText(healPunctuation(currentText));

        console.log("normalizedText:");
        console.log(normalizedText);

        searchTextInPP(normalizedText);

        // Perform the search or other logic here
        // searcher.search(normalizedText);

        // if (!searcher.currentMatches.length) {
        //     searcher.retry(normalizedText);
        // }

        // Update the page info display
        document.querySelector("#pageInfo").textContent = (currentLineIndex + 1) + "/" + currentLinesArray.length;
    });

    document.getElementById('downButtonNextMention').addEventListener('click', function () {

        currentLineIndex++; // Increment the index

        // Check if the index is beyond the last item, and if so, circle back to the start
        if (currentLineIndex >= currentLinesArray.length) {
            currentLineIndex = 0; // Reset to the first item
        }

        const currentText = currentLinesArray[currentLineIndex];
        let normalizedText = normalizeText(healPunctuation(currentText));

        console.log("normalizedText:");
        console.log(normalizedText);

        console.log("normalizedText:");
        console.log(normalizedText);

        searchTextInPP(normalizedText);

        // Perform the search or other logic here
        // searcher.search(normalizedText);

        // if no results, we will retry by considering parts of the string,
        // as it may contain colons
        // if (!searcher.currentMatches.length) {
        //     searcher.retry(normalizedText);
        // }

        // Update the page info display
        document.querySelector("#pageInfo").textContent = (currentLineIndex + 1) + "/" + currentLinesArray.length;
    });


    // document.getElementById('overlayCloseButton').addEventListener('click', function () {
    //     hidePopup();
    // });




    // Event listener for Escape key to close the popup
    const escKeyListener = (event) => {
        if (currentPermanentTooltip && !currentPermanentTooltip.popper.contains(event.target)) {
            currentPermanentTooltip.hide();
            currentPermanentTooltip = null;
        }
    };

    function hidePopup() {
        popup.style.visibility = 'hidden';
        popup.style.opacity = '0';
    }

    // Add event listener for the 'keydown' event inside the iframe
    const iframe = document.getElementById('contextIframe'); // Adjust this ID as needed
    iframe.addEventListener('load', function () {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        iframeDocument.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                hidePopup();
            }
        });
    });

    const scrollToAndHighlightInIframe = (currentText, highlightColor) => {

        if (!searcher) {
            searcher = new IframeSearcher('contextIframe');
        }

        let normalizedText = normalizeText(healPunctuation(currentText));

        console.log("normalizedText:");
        console.log(normalizedText);

        searcher.setHighlightColor(highlightColor);

        searchTextInPP(normalizedText);

    };


    function searchTextInPP(normalizedText) {

        searcher.search(normalizedText);

        if (!searcher.currentMatches.length) {
            searcher.retry(normalizedText);
        }

        return;


        if (normalizedText.includes(':')) {
            const tokens = normalizedText.trim().split(":").filter(str => str.trim() !== '');


            console.log("tokens:");
            console.log(tokens);


            if (tokens.length > 1) {

                console.log("1111111111111");


                for (let i = 0; i < tokens.length; i++) {
                    const token = tokens[i].trim();
                    if (i == 0) {
                        searcher.search(token, false, true);
                    } else if (i == tokens.length - 1) {
                        searcher.search(token, true, false);
                    } else {
                        searcher.search(token, false, false);
                    }
                }

            } else {

                console.log("22222222222");

                searcher.search(normalizedText);

            }


        } else {

            console.log("333333333333333333");

            searcher.search(normalizedText);

            // if (!searcher.currentMatches.length) {
            //     searcher.retry(normalizedText);
            // }

        }





    }


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
            .replace(/"\s+\)/g, "\")")
            .replace(/_, _/g, "_,_");
    }

    const recursiveConcatText = (node) => {
        let text = '';
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                text += recursiveConcatText(child);
            }
        });
        return text;
    };



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



    svgElement.addEventListener('click', (event) => {

        if (!event.target.classList.contains('copyOfDataRect')) {
            const rectangles = document.querySelectorAll('.copyOfDataRect');
            rectangles.forEach(rect => {
                rect.style.opacity = '1';
            });

            if (searcher) {
                searcher.clearSearch();
            }

            // gsap.to("#overlay", {
            //     duration: 0.5,
            //     height: 0,
            //     padding: '0px 0px',
            //     borderTopWidth: 0,
            //     borderBottomWidth: 0,
            //     ease: "power4.out",
            // });


        }

        // Ensure the click isn't on the currently active tooltip or its trigger element
        if (currentPermanentTooltip && !currentPermanentTooltip.popper.contains(event.target)) {
            currentPermanentTooltip.hide();
            currentPermanentTooltip = null;
        }


        if (mainTimeline.currentLabel() === "actorsColumn" || mainTimeline.currentLabel() === "dataShared") {
            if (shouldShowDataCategories || dataCategoryClicked) {
                d3.selectAll('.category-label')
                    .style('font-weight', 'normal')
                    .style('opacity', 1);
            }
        }







        dataCategoryClicked = false;

    }, true);



    let svgWidth = svgElement.clientWidth;
    let svgHeight = svgElement.clientHeight;



    const infoIcon = svg.append('g');
    const cursorIcon = svg.append('g');
    const logoIcon = svg.append('g');

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





    function computeInitialPackingData(dataEntities, centerIconWidth, centerIconHeight) {
        // Define a scale for the rectangle sizes based on IncomingConnections
        const maxConnections = d3.max(dataEntities, d => d.Indegree);
        const sizeScaleMultiplier = 22;
        const padding = 2; // Adjust padding as needed
        const extraPadding = 50; // Extra padding for the iconNode to prevent overlap
        const sizeScale = d3.scaleSqrt()
            .domain([1, maxConnections])
            .range([1 * sizeScaleMultiplier, maxConnections * sizeScaleMultiplier]); // Adjust the range as needed

        // Calculate half-diagonal for the iconNode
        const iconWidthWithPadding = centerIconWidth + 20;
        const iconHeightWithPadding = centerIconHeight + 20;
        const iconR = maxConnections * sizeScaleMultiplier;

        // Define the icon node with fixed position
        const iconNode = {
            id: 'centerIcon',
            width: iconWidthWithPadding,
            height: iconHeightWithPadding,
            x: svgWidth / 2,  // Center position
            y: svgHeight / 2,
            r: iconR,
            collisionRadius: iconR + extraPadding, // Set larger collision radius
            fx: svgWidth / 2, // Fix x-position
            fy: svgHeight / 2, // Fix y-position
            isIcon: true // Flag to identify the icon node
        };

        // Prepare the elements to pack
        let elementsToPack = dataEntities.map(d => {
            const nodeWidth = sizeScale(d.Indegree) + padding;
            const nodeHeight = sizeScale(d.Indegree) + padding;
            const nodeR = sizeScale(d.Indegree) / 2 + padding;
            return {
                id: makeID("" + d.id),
                width: nodeWidth,
                height: nodeHeight,
                r: nodeR, // Use half-diagonal as radius
                collisionRadius: nodeR + padding, // collision radius
                fill: '#cbcbcb',
                originalFill: '#cbcbcb',
                name: d.name,
                category: d.category,
                x: Math.random() * svgWidth, // Start at random positions
                y: Math.random() * svgHeight,
                isIcon: false // Flag to identify regular nodes
            };
        });

        // Combine the icon node and rectangle nodes
        let nodes = [iconNode, ...elementsToPack];

        // Create the simulation but prevent it from running automatically
        let simulation = d3.forceSimulation(nodes)
            .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
            .force('x', d3.forceX(svgWidth / 2).strength(0.05))
            .force('y', d3.forceY(svgHeight / 2).strength(0.025))
            // Use the collisionRadius in the collision force
            .force('collision', d3.forceCollide().radius(d => d.collisionRadius))
            .alphaDecay(0.06)
            .stop(); // Stop automatic ticking

        // Run the simulation manually
        const numIterations = 500; // Increase iterations if necessary
        for (let i = 0; i < numIterations; ++i) {
            simulation.tick();
        }
        // Now the nodes have their positions after the simulation

        // Return the rectangles without the icon node
        return nodes.filter(d => !d.isIcon).map(d => {
            return {
                ...d,
                x: d.x -= svgWidth / 2,
                y: d.y -= svgHeight / 2
            };
        });
    }





    let originalTransformations = {};
    let labelsOf = {};
    let dataRectStrokeWidth = 1.5;

    let categoryStartPositions = {};

    const targetSize = 8;

    // console.log("svgWidth: " + svgWidth);
    // console.log("svgHeight: " + svgHeight);

    // Animation duration
    let animationDuration = 0.85;

    // making all this global
    let movedRectData, svgRects, svgCategoryGroups, packedRectData;

    let rectData = [];

    let originalNames = {};

    var actorIconScale = 0.3;

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

    const dataInheritances = {};

    // window.actorDataMap = actorDataMap;

    document.querySelector("#who").textContent = formatedNames[who];
    document.querySelector("#they").textContent = formatedNames[who];
    document.querySelector("#they2").textContent = formatedNames[who];

    function getCategory(item, categorization) {

        if (item === "UNSPECIFIED_DATA") {
            return "General Data"
        }

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
        console.log(categorization);
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

            // console.log("combinedNodes");
            // console.log(combinedNodes);

            const nodes = Array.from(xmlDoc.querySelectorAll('node'))
                .filter(node => combinedNodes.has(node.getAttribute('id')))
                .map(node => ({
                    id: node.getAttribute('id') === "UNSPECIFIED_DATA" ? UNSPECIFIED_DATA_RENAME : node.getAttribute('id'),
                    label: node.getAttribute('id') === "UNSPECIFIED_DATA" ? UNSPECIFIED_DATA_RENAME : node.getAttribute('id'),
                    category: node.querySelector('data[key="d1"]')?.textContent === 'ACTOR' ? getCategory(node.getAttribute('id'), categories[who].actorCategories) : getCategory(node.getAttribute('id'), categories[who].dataCategories),
                    type: node.querySelector('data[key="d1"]')?.textContent,
                    name: capitalizeFirstLetter(node.querySelector('data[key="d0"]')?.textContent === "UNSPECIFIED_DATA" ? UNSPECIFIED_DATA_RENAME : node.querySelector('data[key="d0"]')?.textContent),
                    Indegree: 0,  // Initialize Indegree as 0, will be computed later
                }));

            // console.log("nodes");
            // console.log(nodes);

            entities = nodes;

            // console.log("Actor entities processed (and XML files loaded)");

            // Load and process edges from GraphML
            const edges = Array.from(xmlDoc.querySelectorAll('edge'))
                .filter(edge => edge.querySelector('data[key="d2"]')?.textContent === 'COLLECT')
                .map(edge => ({
                    source: edge.getAttribute('source') === "UNSPECIFIED_DATA" ? UNSPECIFIED_DATA_RENAME : edge.getAttribute('source'),
                    target: edge.getAttribute('target') === "UNSPECIFIED_DATA" ? UNSPECIFIED_DATA_RENAME : edge.getAttribute('target'),
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

            // console.log("Updated nodes with Indegree");
            // console.log(entities);
            // console.log("edges:");
            // console.log(edges);


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

                // console.log("dataName: " + dataName);
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
                    text: edge.text,
                    actor: actorName
                });
            });

            const subsums = Array.from(xmlDoc.querySelectorAll('edge'))
                .filter(edge => edge.querySelector('data[key="d2"]')?.textContent === 'SUBSUM')
                .map(edge => ({
                    source: edge.getAttribute('source') === "UNSPECIFIED_DATA" ? UNSPECIFIED_DATA_RENAME : edge.getAttribute('source'),
                    target: edge.getAttribute('target') === "UNSPECIFIED_DATA" ? UNSPECIFIED_DATA_RENAME : edge.getAttribute('target'),
                    text: edge.querySelector('data[key="d3"]')?.textContent || ''
                }));


            subsums.forEach(subsum => {
                const parentData = subsum.source;
                const childData = subsum.target;
                if (!dataInheritances[parentData]) {
                    dataInheritances[parentData] = new Array();
                }
                dataInheritances[parentData].push(childData);
            });

            // console.log("***************** dataInheritances *****************");
            // console.log(dataInheritances);
            // console.log("***************** actorDataMap *****************");
            // console.log(actorDataMap);

        })


        .then(() => {
            return processActorEntities(entities);
        })
        .then(() => {

            window.svgWidth = svgWidth;
            window.svgHeight = svgHeight;

            let logoIconWidth;
            let logoIconHeight;

            loadIconAt(logoIcon, './icons/logos/' + who + '.svg', svgWidth / 2, svgHeight / 2, 1, 1, true)
                .then(dimensions => {

                    // drawRectAt(svgWidth / 2, svgHeight / 2, 20, 20, 'red');

                    logoIconWidth = dimensions.width;
                    logoIconHeight = dimensions.height;


                    let dataEntities = entities.filter(d => d.type === 'DATA');

                    let initialPackingData = computeInitialPackingData(dataEntities, logoIconWidth, logoIconHeight);

                    // window.initialPackingData = initialPackingData;

                    return initialPackingData;

                })
                .then(initialPackingData => {
                    return processDataEntities(entities, initialPackingData);
                })
                .then(() => {
                    // Only called once all SVGs are processed and actor entities are ready
                    addScrollEvents(logoIconWidth, logoIconHeight);
                })
        });












    function processActorEntities(entities) {

        // Actor entities
        const actorsEntities = entities.filter(d => d.type === 'ACTOR').map(entity => {
            return {
                ...entity,
                id: sanitizeId(entity.id)
            };
        });

        window.actorsEntities = actorsEntities;

        const excludedCategoryName = formatedNames[who];  // Name of the category to exclude
        const actorCategories = [...new Set(actorsEntities.filter(d => d.category !== excludedCategoryName).map(d => d.category))];

        // const actorCategories = [...new Set(actorsEntities.map(d => d.category))];

        document.querySelector("#totalActorCategories").textContent = actorCategories.length;

        const dimension = Math.min(svgWidth, svgHeight) / 3;
        const angleStep = (2 * Math.PI) / actorCategories.length;

        // Shuffle the categories randomly
        const shuffledCategories = actorCategories.sort(() => 0.5 - Math.random());



        let svgPromises = shuffledCategories.map((category, index) => {  // Use map instead of forEach to return an array of promises


            const circlePoints = getPointsOnCircle(shuffledCategories.length, Math.min(svgWidth / 2, svgHeight / 2) - 80, svgWidth / 2, svgHeight / 2 - 10, -90, 90);

            // circlePoints.forEach(point => {
            //     drawRectAt(point.x, point.y, 20, 20, 'red')
            // });

            // const angle = index * angleStep;
            // const x = svgWidth / 2 + dimension * Math.cos(angle);
            // const y = svgHeight / 2 + dimension * Math.sin(angle);

            const x = circlePoints[index].x;
            const y = circlePoints[index].y;

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

                // console.log("iconWidth: " + iconWidth);
                // console.log("iconHeight: " + iconHeight);

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
                    // .style('transform-origin', '50% 50%')
                    // .attr('transform', `translate(${(x - iconWidth / 2)}, ${(y - iconHeight / 2)}) scale(${actorIconScale})`);
                    .attr('transform', `translate(${(x)}, ${(y)}) scale(${actorIconScale})`);

                const cleanCategory = removeSpaces(category.toUpperCase());
                const actorNames = entities.filter(d => d.type === 'ACTOR' && removeSpaces(d.category.toUpperCase()) === cleanCategory).map(d => d.label);
                const numberOfActors = actorNames.length;

                let allActors = "<ul>";
                actorNames.forEach((name, index) => {
                    if (name === 'UNSPECIFIED_ACTOR') {
                        allActors += `<li style="padding-right: 20px;">${capitalizeFirstLetter(UNSPECIFIED_ACTOR_RENAME)}</li>`;
                    } else {
                        allActors += `<li style="padding-right: 20px;">${capitalizeFirstLetter(name)}</li>`;
                    }

                });
                allActors += "</ul>";

                // Define the content of the tooltip                    
                const tooltipContent = `Including:<br/>${allActors}`;

                // Initialize Tippy.js on the iconElement
                const tooltipInstance = tippy(iconElement.node(), {
                    content: tooltipContent,
                    allowHTML: true,
                    placement: 'top', // Use the computed placement
                    theme: 'light-border',
                    animation: 'scale',
                    duration: [200, 200],
                    delay: [0, 0],
                    interactive: false,
                    trigger: 'manual' // We'll control show/hide manually
                });

                iconElement.on('mouseover', function (event) {
                    d3.select('#' + labelsOf[actorID]).style('font-weight', 'bolder');
                    tooltipInstance.show();
                });

                iconElement.on('mouseout', function (event) {
                    d3.select('#' + labelsOf[actorID]).style('font-weight', 'normal');
                    tooltipInstance.hide();
                });

                iconElement.attr('data-numberOfActors', numberOfActors);

                // drawRectAt(x, y, 20, 20, 'red')

                let labelID = generateUniqueId('actorLabel');

                // Append the text label
                const iconLabel = svg.append('text')
                    .attr('class', 'actorCategoryName')
                    .attr('id', labelID)
                    .attr('x', x)
                    .attr('y', y + (iconHeight * actorIconScale) / 2 + 5)
                    .attr('text-anchor', 'middle')
                    .attr('transform-origin', 'center')
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
    function processDataEntities(entities, initialPackingData) {

        let dataEntities = entities.filter(d => d.type === 'DATA');

        dataEntities = dataEntities.map(entity => {
            return {
                ...entity,
                id: sanitizeId(entity.id)
            };
        });

        // console.log("dataEntities:");
        // console.log(dataEntities);

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

        categoriesColorScale = d3.scaleOrdinal(customSchemePaired).domain([
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
        // rectData = d3.packSiblings(dataEntities.map(d => ({
        //     // id: "" + d.id,
        //     id: makeID("" + d.id),
        //     width: sizeScale(d.Indegree) + padding,
        //     height: sizeScale(d.Indegree) + padding,
        //     r: sizeScale(d.Indegree) / 2 + padding,
        //     fill: '#cbcbcb',
        //     originalFill: '#cbcbcb',
        //     name: d.name,
        //     category: d.category
        // })));

        rectData = initialPackingData;

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

        // console.log("packedRectData:");
        // console.log(packedRectData);

        const largestTopLeftRect = getLargestTopLeftRect(packedRectData);

        const smallestBottomRightRect = getSmallestBottomRightRect(packedRectData);

        const otherRects = packedRectData.filter(rect => rect !== largestTopLeftRect && rect !== smallestBottomRightRect);

        otherRectsIDs = otherRects.map(d => "dataRect_" + makeID(d.id));
        otherLabelsIDs = otherRects.map(d => "rectLabel_" + makeID(d.id));

        // console.log("smallestBottomRightRect:");
        // console.log(smallestBottomRightRect);

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




        // console.log("smallestBottomRightRect:");
        // console.log(smallestBottomRightRect);

        // console.log("largestTopLeftRect:");
        // console.log(largestTopLeftRect);

        // console.log("otherRects:");
        // console.log(otherRects);

        // console.log("otherRectsIDs:");
        // console.log(otherRectsIDs);

        // console.log("otherLabelsIDs:");
        // console.log(otherLabelsIDs);





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
                fill: categoriesColorScale(rect.category),
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
            .data(rectData, d => "dataRect_" + makeID(d.id))
            .enter()
            .append('rect')
            .attr('class', 'dataRect')
            .attr('id', d => "dataRect_" + makeID(d.id))
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

        // Create category labels with colored squares
        svgCategoryGroups = svg.selectAll('.category-label')
            .data(uniqueCategories)
            .enter()
            .append('g')
            .attr('class', 'category-label')
            .attr('opacity', 0)
            .attr('id', d => makeID(d)); // here i need an ID for the category, it should be the same id used in the tect 


        const categoryRectSize = targetSize;
        svgCategoryGroups.append('rect')
            .attr('x', -categoryRectSize)
            .attr('y', -categoryRectSize)
            .attr('width', categoryRectSize * 2)
            .attr('height', categoryRectSize * 2)
            .attr('fill', d => categoriesColorScale(d))
            .attr('stroke', d => darkenColor(categoriesColorScale(d)));

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
            d3.select(this)
                .attr('transform', `translate(${centerX}, ${centerY})`)
            categoryStartPositions[this.id] = { x: centerX, y: centerY };
        });

        window.addEventListener('resize', resizeSVG);
        resizeSVG();  // Initial resize to set SVG size

    }



    function drawRectsAndLabels(rectData) {

        // Create a map to store rectangles by their IDs
        const rectMap = {};

        const rects = svg.selectAll('.dataRect')
            .data(rectData, d => makeID(d.id))
            .join(
                enter => enter.append('rect')
                    .attr('class', 'dataRect')
                    .each(function (d) {

                        console.log("d.scale: " + d.scale);


                        rect.attr('x', d.scale === 0 ? d.x : (d.x - (d.width * (d.scale ?? 1) / 2)) / (d.scale ?? 1))
                            .attr('y', d.scale === 0 ? d.y : (d.y - (d.height * (d.scale ?? 1) / 2)) / (d.scale ?? 1))
                            .attr('width', Math.max(0, d.width))
                            .attr('height', Math.max(0, d.height))
                            .attr('rx', d.rx || 0)
                            .attr('ry', d.ry || 0)
                            .attr('fill', d.fill || 'transparent')
                            .attr('stroke', darkenColor(d.fill || '#000'))
                            .attr('opacity', d.opacity)
                            .style('opacity', d.opacity)
                            .style('scale', d.scale)
                        // Store the rectangle DOM node in the map
                        rectMap[makeID(d.id)] = this;
                    }),
                update => update
                    .each(function (d) {
                        const rect = d3.select(this);

                        let x, y;
                        if (isUndefined(d.scale) || d.scale === 0 || d.scale === '0') {
                            x = d.x - d.width / 2;
                        } else {
                            x = (d.x - (d.width * d.scale / 2)) / d.scale;
                        }

                        if (isUndefined(d.scale) || d.scale === 0 || d.scale === '0') {
                            y = d.y - d.height / 2;
                        } else {
                            y = (d.y - (d.height * d.scale / 2)) / d.scale;
                        }

                        // console.log("d.scale: " + d.scale);

                        rect.attr('x', x)
                            .attr('y', y)
                            .attr('width', Math.max(0, d.width))
                            .attr('height', Math.max(0, d.height))
                            .attr('rx', d.rx || 0)
                            .attr('ry', d.ry || 0)
                            .attr('fill', d.fill || 'transparent')
                            .attr('stroke', darkenColor(d.fill || '#000'))
                            .attr('opacity', d.opacity)
                            .style('opacity', d.opacity)
                            .style('scale', d.scale)
                        // Update the rectangle DOM node in the map
                        rectMap[makeID(d.id)] = this;
                    }),
                exit => exit.remove()
            );

        // Destroy existing Tippy.js instances on all rectangles
        rects.each(function () {
            if (this._tippy) {
                this._tippy.destroy();
            }
        });

        // Array to keep track of rectangles without labels
        const rectsWithoutLabels = [];

        const texts = svg.selectAll('.rectLabel')
            .data(rectData, d => makeID(d.id))
            .join(
                enter => enter.append('text')
                    .attr('class', 'rectLabel')
                    .attr('id', d => "rectLabel_" + makeID(d.id)),
                update => update,
                exit => exit.remove()
            )
            .each(function (d) {
                const text = d3.select(this);
                const rectWidth = d.width;
                const rectHeight = d.height;

                // Set initial fontSize proportional to rectangle size
                const initialFontSize = rectHeight * 0.5; // Adjust multiplier as needed
                const maxFontSize = 18; // Maximum font size cap
                const minFontSize = 12;  // Minimum readable font size

                let fontSize = Math.min(initialFontSize, maxFontSize);

                let fits = false;
                let lines = [];

                // Adjust font size until text fits or font size is below minimum
                while (fontSize >= minFontSize && !fits) {

                    // Split text into lines that fit within the rectangle's width
                    lines = splitTextToFit(d.name, rectWidth * 0.9, fontSize);

                    // Calculate total text height
                    let lineHeight = fontSize * 1.2; // Line height multiplier
                    let totalTextHeight = lines.length * lineHeight;

                    // Check if text fits within rectangle dimensions
                    if (totalTextHeight <= rectHeight * 0.9) {
                        // Check if each line fits within rectangle width
                        let allLinesFit = lines.every(line => getTextWidthEstimate(line, fontSize) <= rectWidth * 0.9);
                        if (allLinesFit) {
                            fits = true;
                        } else {
                            fontSize -= 1;
                        }
                    } else {
                        fontSize -= 1;
                    }
                }

                if (fontSize < minFontSize || !fits) {
                    // Hide text if it's too small or doesn't fit
                    text.style('display', 'none');
                    rectsWithoutLabels.push(rectMap[makeID(d.id)]);
                } else {
                    // Truncate lines with ellipsis if necessary
                    lines = lines.map(line => {
                        if (getTextWidthEstimate(line, fontSize) > rectWidth * 0.9) {
                            return addEllipsis(line, rectWidth * 0.9, fontSize);
                        }
                        return line;
                    });

                    // Display text
                    text.style('display', null)
                        .attr('x', d.x)
                        .attr('y', d.y)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('opacity', d.opacity)
                        .style('font-size', `${fontSize}px`)
                        .style('line-height', '1')
                        .text('');

                    text.selectAll('tspan').remove();

                    // Vertically center the text block
                    let lineHeight = fontSize * 1.2;
                    let totalTextHeight = lines.length * lineHeight;
                    let startDy = -((totalTextHeight - lineHeight) / 2);

                    lines.forEach((line, i) => {
                        text.append('tspan')
                            .attr('x', d.x)
                            .attr('dy', i === 0 ? `${startDy}` : `${lineHeight}`)
                            .text(line);
                    });
                }
            });

        // **Build a quadtree of rectangles for spatial queries**
        const rectQuadtree = d3.quadtree()
            .x(d => d.x)
            .y(d => d.y)
            .addAll(rectData);

        // **Add Tippy.js tooltips to rectangles without labels**
        /*rectsWithoutLabels.forEach(function (rectNode) {
            const d = d3.select(rectNode).datum();
            const content = `<b>${capitalizeFirstLetter(d.name)}</b>`;
            const placement = getTooltipPlacement(d, rectQuadtree, svgWidth);

            tippy(rectNode, {
                content: content,
                allowHTML: true,
                placement: placement, // Use the dynamically determined placement
                theme: 'light-border',
                animation: 'scale',
                duration: [200, 200],
                delay: [0, 0],
                interactive: false
            });
        });*/

        rectsWithoutLabels.forEach(function (rectNode) {
            const d = d3.select(rectNode).datum();
            const content = `<b>${capitalizeFirstLetter(d.name)}</b>`;
            const placement = getTooltipPlacement(d, rectQuadtree, svgWidth);

            tippy(rectNode, {
                content: content,
                allowHTML: true,
                placement: placement, // Use the dynamically determined placement
                theme: 'light-border',
                animation: 'scale',
                duration: [200, 200],
                delay: [0, 0],
                interactive: false,
                onShow(instance) {
                    // Get the current opacity of the rectangle
                    const opacity = window.getComputedStyle(rectNode).opacity;

                    // Prevent tooltip from showing if opacity is not 1
                    if (opacity !== "1") {
                        return false; // Prevents the tooltip from appearing
                    }
                }
            });
        });











    }


    function getTooltipPlacement(d, rectQuadtree, svgWidth) {
        // Estimate tooltip size based on content
        const content = `<b>${capitalizeFirstLetter(d.name)}</b>`;
        const { width: tooltipWidth, height: tooltipHeight } = estimateTooltipSize(content);

        const margin = 5; // Small margin around the tooltip area

        const rectLeft = d.x - d.width / 2;
        const rectRight = d.x + d.width / 2;
        const rectTop = d.y - d.height / 2;
        const rectBottom = d.y + d.height / 2;

        // Decide preferred placements based on rectangle's x-position
        let preferredPlacements;
        if (d.x < svgWidth / 2) {
            // Rectangle is on the left side; prefer 'left' placement
            preferredPlacements = ['left', 'right', 'top', 'bottom'];
        } else {
            // Rectangle is on the right side; prefer 'right' placement
            preferredPlacements = ['right', 'left', 'top', 'bottom'];
        }

        // Function to check if the area is free from other rectangles
        function isAreaFree(x0, y0, x1, y1) {
            let overlap = false;
            rectQuadtree.visit(function (node, xMin, yMin, xMax, yMax) {
                if (!node.data || makeID(node.data.id) === makeID(d.id)) return false; // Ignore current rectangle
                const nodeLeft = node.data.x - node.data.width / 2 - margin;
                const nodeRight = node.data.x + node.data.width / 2 + margin;
                const nodeTop = node.data.y - node.data.height / 2 - margin;
                const nodeBottom = node.data.y + node.data.height / 2 + margin;
                if (nodeRight > x0 && nodeLeft < x1 && nodeBottom > y0 && nodeTop < y1) {
                    overlap = true;
                    return true; // Stop searching
                }
                return xMin > x1 || xMax < x0 || yMin > y1 || yMax < y0;
            });
            return !overlap;
        }

        // Try each preferred placement and check for overlaps
        for (let i = 0; i < preferredPlacements.length; i++) {
            let placement = preferredPlacements[i];
            let x0, y0, x1, y1;

            if (placement === 'left') {
                x0 = rectLeft - tooltipWidth - margin;
                x1 = rectLeft - margin;
                y0 = d.y - tooltipHeight / 2;
                y1 = d.y + tooltipHeight / 2;
            } else if (placement === 'right') {
                x0 = rectRight + margin;
                x1 = rectRight + tooltipWidth + margin;
                y0 = d.y - tooltipHeight / 2;
                y1 = d.y + tooltipHeight / 2;
            } else if (placement === 'top') {
                x0 = d.x - tooltipWidth / 2;
                x1 = d.x + tooltipWidth / 2;
                y0 = rectTop - tooltipHeight - margin;
                y1 = rectTop - margin;
            } else if (placement === 'bottom') {
                x0 = d.x - tooltipWidth / 2;
                x1 = d.x + tooltipWidth / 2;
                y0 = rectBottom + margin;
                y1 = rectBottom + tooltipHeight + margin;
            }

            // Check if the area is free
            const areaIsFree = isAreaFree(x0, y0, x1, y1);

            if (areaIsFree) {
                return placement;
            }
        }

        // If none of the placements are free, default to 'right' or 'left' based on position
        return d.x < svgWidth / 2 ? 'left' : 'right';
    }

    function estimateTooltipSize(content) {
        // Create a temporary off-screen element
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.pointerEvents = 'none';
        tempDiv.style.width = 'auto';
        tempDiv.style.height = 'auto';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.padding = '8px'; // Adjust based on your tooltip's padding
        tempDiv.style.fontSize = '14px'; // Adjust based on your tooltip's font size
        tempDiv.style.fontFamily = 'sans-serif'; // Adjust based on your tooltip's font family
        tempDiv.innerHTML = content;

        document.body.appendChild(tempDiv);

        const width = tempDiv.offsetWidth;
        const height = tempDiv.offsetHeight;

        // Remove the temporary element
        document.body.removeChild(tempDiv);

        return { width, height };
    }


    // Helper function to split text into lines that fit within maxWidth
    function splitTextToFit(text, maxWidth, fontSize) {
        const words = text.split(/\s+/);
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
            let wordWidth = getTextWidthEstimate(word, fontSize);

            if (wordWidth > maxWidth) {
                // Break the word if it's too long
                const brokenWords = breakWord(word, maxWidth, fontSize);
                brokenWords.forEach(part => {
                    if (currentLine === '') {
                        currentLine = part;
                    } else {
                        lines.push(currentLine);
                        currentLine = part;
                    }
                });
            } else {
                const testLine = currentLine === '' ? word : currentLine + ' ' + word;
                const testLineWidth = getTextWidthEstimate(testLine, fontSize);

                if (testLineWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
        });

        if (currentLine !== '') {
            lines.push(currentLine);
        }

        return lines;
    }

    // Helper function to estimate text width based on font size
    function getTextWidthEstimate(text, fontSize) {
        // Average character width in pixels (adjust based on your font)
        const averageCharWidth = fontSize * 0.55;
        return text.length * averageCharWidth;
    }

    // Helper function to break a word into parts that fit within maxWidth
    function breakWord(word, maxWidth, fontSize) {
        let parts = [];
        let part = '';
        for (let i = 0; i < word.length; i++) {
            part += word[i];
            let partWidth = getTextWidthEstimate(part + '-', fontSize);
            if (partWidth > maxWidth) {
                if (part.length > 1) {
                    parts.push(part.slice(0, -1) + '-');
                    part = word[i];
                } else {
                    parts.push(part + '-');
                    part = '';
                }
            }
        }
        if (part !== '') {
            parts.push(part);
        }
        return parts;
    }

    // Helper function to add ellipsis to a line
    function addEllipsis(line, maxWidth, fontSize) {
        let ellipsis = '…';
        let trimmedLine = line;
        while (getTextWidthEstimate(trimmedLine + ellipsis, fontSize) > maxWidth && trimmedLine.length > 0) {
            trimmedLine = trimmedLine.slice(0, -1);
        }
        return trimmedLine + ellipsis;
    }
























    function addScrollEvents(logoIconWidth, logoIconHeight) {

        let progressElements = [];
        progressElements.push({ line: ".line-1", trigger: "#they", circle: "#circle-2" });
        progressElements.push({ line: ".line-2", trigger: "#divPiecesOfData", circle: "#circle-3" });
        progressElements.push({ line: ".line-3", trigger: "#divTotalCategories", circle: "#circle-4" });
        progressElements.push({ line: ".line-4", trigger: "#onlyTiktok", circle: "#circle-5" });
        progressElements.push({ line: ".line-5", trigger: "#sharedWithOthers", circle: "#circle-6" });
        progressElements.push({ line: ".line-6", trigger: "#divDataShared", circle: "#circle-7" });

        for (let index = 0; index < progressElements.length; index++) {

            const element = progressElements[index];

            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element.trigger,

                    // start: "top+=" + (scrollOffset * (index)) + " bottom",
                    // end: "top+=" + (scrollOffset * (index)) + " top",

                    // start: () => "top" + " bottom",
                    // end: () => "top" + " top",

                    start: () => "top+=" + (index * svgHeight) + " bottom",
                    end: () => "top+=" + (index * svgHeight) + " top",

                    scrub: 1, // Scrub the progress smoothly
                    // markers: true, // Debug markers for visualization
                }
            });

            // Add the fromTo animation to the timeline
            tl
                .fromTo(element.line,
                    {
                        scaleY: 0, // Start with scaleY at 0 (no height)
                        scaleX: 1,
                    },
                    {
                        scaleX: 1,
                        scaleY: 1, // ScaleY to 1 (full height)
                        ease: "none", // No easing for smooth linear progress
                    }
                )
                .to(element.circle,
                    {
                        backgroundColor: progressColor,
                        // ease: "none",
                        duration: 0

                    });


            // gsap.fromTo(element.line,
            //     {
            //         scaleY: 0, // Start with scaleY at 0 (no height)
            //         scaleX: 1,
            //     },
            //     {
            //         scaleX: 1,
            //         scaleY: 1, // ScaleY to 1 (full height)
            //         ease: "none", // No easing for smooth linear progress
            //         scrollTrigger: {
            //             trigger: element.trigger,
            //             start: "top bottom",
            //             end: "bottom top",
            //             scrub: 1, // Scrub the progress smoothly
            //             markers: true, // Debug markers for visualization

            //         }
            //     }
            // )


            // .to("#circle-2", { backgroundColor: progressColor, ease: "none", duration: 0 });


        }

        // gsap.fromTo(".line-1",
        //     {
        //         scaleY: 0, // Start with scaleY at 0 (no height)
        //         scaleX: 1,
        //     },
        //     {
        //         scaleX: 1,
        //         scaleY: 1, // ScaleY to 1 (full height)
        //         ease: "none", // No easing for smooth linear progress
        //         scrollTrigger: {
        //             trigger: "#they",
        //             start: "top bottom",
        //             end: "bottom top",
        //             scrub: 1, // Scrub the progress smoothly
        //             markers: true, // Debug markers for visualization
        //             onUpdate: (self) => {
        //                 console.log("Scroll Progress:", self.progress.toFixed(3)); // Print smooth progress
        //             }
        //         }
        //     }
        // );



        // gsap.to("#one", {
        //     ease: "none",
        //     scrollTrigger: {
        //         trigger: "#one",
        //         start: "top top",
        //         scrub: true,
        //         onUpdate: (self) => {

        //             restoreProgressCircles();

        //             const progress = self.progress;
        //             gsap.to('.scroll-down', {
        //                 opacity: 1 - progress
        //             });
        //             // gsap.to('.line-1', { scaleX: 1, scaleY: progress, duration: 0, ease: "none", backgroundColor: progressColor });
        //             if (progress > 0.99) {
        //                 gsap.to("#circle-2", { backgroundColor: progressColor, ease: "none", duration: 0 });
        //             } else {
        //                 gsap.to("#circle-2", { backgroundColor: "light" + progressColor, ease: "none", duration: 0 });
        //             }
        //         }
        //     }
        // });

        // console.log("++++ rectData ++++");
        // console.log(rectData);

        // Single GSAP Timeline with labels
        const mainTimeline = gsap.timeline({ paused: true });

        // ***** SHOWING THE LOGO *****        
        mainTimeline.addLabel("logo")
            .fromTo(logoIcon.node(),
                {
                    opacity: 0,
                    scale: 0,
                    transformOrigin: '50% 50%'
                },
                {
                    opacity: 1,
                    scale: 1,
                    transformOrigin: '50% 50%',
                    duration: animationDuration,
                    ease: "back.out(2.9)",
                }, "logo");

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

        // console.log("nonTargetLabels");
        // console.log(nonTargetLabels);

        // Check if elements with these IDs exist in the DOM
        // otherRectsIDs.forEach(id => {
        //     if (!document.getElementById(id)) {
        //         console.error(`Element with ID ${id} does not exist in the DOM`);
        //     }
        // });

        // otherLabelsIDs.forEach(id => {
        //     if (!document.getElementById(id)) {
        //         console.error(`Element with ID ${id} does not exist in the DOM`);
        //     }
        // });

        const deltaX = 50;
        const deltaY = 220;

        const point1 = { x: deltaX, y: deltaY };
        const point2 = { x: svgWidth - deltaX, y: deltaY };
        const splitRectData = getPackedDataForSplitRects(point1, point2, svgHeight - (2 * deltaY), targetSize);

        // ***** CATEGORIES *****
        mainTimeline.addLabel("categories")
            .to(logoIcon.node(),
                {
                    opacity: 0,
                    scale: 0,
                    transformOrigin: '50% 50%',
                    duration: animationDuration / 2,
                }, "categories")
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
        const p = 10;
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;
        const x1 = centerX - logoIconWidth / 2 - p;  // Left edge (minimum x)
        const y1 = centerY - logoIconHeight / 2 - p; // Top edge (minimum y)
        const y2 = centerY + logoIconHeight / 2 + p; // Bottom edge (maximum y)

        const points = arrangeRectanglesByWidth(x1 - p, y2 + p, logoIconWidth + p * 2 + 30, 10, 10, rectData.length, 15, 15);

        // console.log("points:");
        // console.log(points);

        const distance = 150;
        const delta = (x1 - distance);

        let chosenIndices = [];
        let firstData = [];
        let secondData = [];
        let thirdData = [];

        for (let index = 0; index < rectData.length; index++) {
            let n = getRandomBetween(0, 100, true);
            if (n % 2 == 0) {
                chosenIndices.push(n);
            }
        }

        for (let index = 0; index < rectData.length; index++) {
            if (chosenIndices.includes(index)) {
                firstData.push({ x: delta, y: y1 + logoIconHeight / 2 + 10, opacity: 0 });
            } else {
                firstData.push({ x: points[index].x - delta, y: points[index].y, opacity: 1 });
            }
        }

        for (let index = 0; index < rectData.length; index++) {
            if (!chosenIndices.includes(index)) {
                let value = getRandomProperty(originalTransformations).value;
                secondData.push({ x: value.originX + value.originalX, y: value.originY + value.originalY });
            } else {
                secondData.push({ x: delta, y: y1 + logoIconHeight / 2 });
            }
        }

        for (let index = 0; index < rectData.length; index++) {
            let value = getRandomProperty(originalTransformations).value;
            thirdData.push({ x: value.originX + value.originalX, y: value.originY + value.originalY });
        }


        // *************************************** //
        // Showing data accessed by the owner only //
        // *************************************** //

        // disappearing the packed circles
        mainTimeline.addLabel("accessedOnlyByTikTok")

            // disappearing data category names
            .to(svgCategoryGroups.nodes(), {
                duration: animationDuration,
                opacity: 0,
                ease: "back.out(1.25)",
                stagger: { amount: 0.1 }
            }, "accessedOnlyByTikTok")

            // the logo appears back
            .to(logoIcon.node(), {
                opacity: 1,
                scale: 1,
                transformOrigin: '50% 50%',
                duration: animationDuration / 2,
            }, "accessedOnlyByTikTok")


            // all the circles go to the logo
            .to(rectData, {
                width: 0,
                height: 0,
                // width: targetSize * 2,
                // height: targetSize * 2,
                // opacity: 0,
                x: svgWidth / 2,
                y: svgHeight / 2,
                duration: animationDuration,
                ease: "back.in",
                stagger: { amount: animationDuration * 2 },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                }
            }, "accessedOnlyByTikTok+=" + 0.5)




        // clustering the rects at the center and below the logo
        // .to(rectData, {
        //     width: targetSize * 2,
        //     height: targetSize * 2,
        //     x: (index) => points[index].x,
        //     y: (index) => points[index].y,
        //     duration: animationDuration,
        //     ease: "back.out(1.25)",
        //     stagger: { amount: animationDuration / 3 },
        //     onUpdate: () => {
        //         drawRectsAndLabels(rectData);
        //     }
        // }, "accessedOnlyByTikTok")            

        // // sending random pieces of data to the logo
        // .to(rectData, {
        //     // x: (i) => firstData[i].x,
        //     y: (i) => firstData[i].y,
        //     opacity: (i) => firstData[i].opacity, // only the ones that go to the logo will change their opacity
        //     duration: animationDuration,
        //     ease: "none",
        //     stagger: { amount: animationDuration },
        //     onUpdate: () => {
        //         drawRectsAndLabels(rectData);
        //     }
        // }, "accessedOnlyByTikTok+=" + (animationDuration + animationDuration / 3))
















        // ************************************* //
        // Showing data accessed by other actors //
        // ************************************* //

        mainTimeline.addLabel("accessedByOtherActors")

            // shifting things to the left
            .to(rectData, {
                x: '-=' + delta,
                duration: animationDuration,
                stagger: { amount: animationDuration / 20 },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                }
            }, "accessedByOtherActors")

            .to(logoIcon.node(), {
                x: '-=' + delta,
                duration: animationDuration,
            }, "accessedByOtherActors")


        // Bringing actors in
        const svgActorIcons = svg.selectAll('.actorIcon').filter(function () {
            return d3.select("#" + labelsOf[d3.select(this).node().id]).text() !== formatedNames[who]
        });

        // window.svgActorIcons = svgActorIcons;

        const actorNodes = svgActorIcons.nodes();

        // actor labels
        const svgActorIconLabels = svg.selectAll('.actorCategoryName').filter(function () {
            return d3.select(this).text() != formatedNames[who];
        });

        const actorLabelNodes = svgActorIconLabels.nodes();

        actorNodes.forEach((actorNode, index) => {

            let id = actorNode.id;
            let originals = originalTransformations[id];
            let x = originals.originalX;
            let y = originals.originalY;

            mainTimeline.fromTo(actorNode, {
                opacity: 0,
                x: x,
                y: y,
                scale: 0,
                transformOrigin: 'center',
            }, {
                opacity: 1,
                transformOrigin: 'center',
                x: x,
                y: y,
                scale: actorIconScale,
                duration: animationDuration,
                ease: "back.inOut(3)",
            }, "accessedByOtherActors+=" + (animationDuration * 0.5 + index * 0.1))

        });

        actorLabelNodes.forEach((actorLabelNode, index) => {
            mainTimeline.fromTo(actorLabelNode, {
                opacity: 0,
                scale: 0,
                transformOrigin: 'center',
            }, {
                opacity: 1,
                scale: 1,
                transformOrigin: 'center',
                ease: "back.inOut(3)",
                duration: animationDuration,
                onStart: () => {
                    explaining = "actors";
                },
                onComplete: () => {
                    if (index == actorLabelNodes.length - 1) {
                        blinkIcon(infoIcon);
                    }
                }
            }, "accessedByOtherActors+=" + (animationDuration * 0.5 + index * 0.1))
        });

        // sending random pieces of data to actors randomly
        mainTimeline.fromTo(rectData,
            {
                opacity: 1,
                width: 0,
                height: 0,
            },
            {
                x: (i) => thirdData[i].x,
                y: (i) => thirdData[i].y,
                width: targetSize * 2.5,
                height: targetSize * 2.5,
                opacity: 0,
                duration: animationDuration,
                ease: "none",
                stagger: { amount: animationDuration * 1.75 },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                }
            }, "accessedByOtherActors+=" + (animationDuration + animationDuration / 3))










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
            categoryTargetPositions[node.id] = { x: x, y: y - 20 };
        });

        // console.log("categorTargetPositions");
        // console.log(categoryTargetPositions);

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

        // console.log("globalFrequencyMap:");
        // console.log(globalFrequencyMap);
        // console.log("!!!!!!!!!!!!!!!!!!! rectData[rectData.length - 1]");
        // console.log(rectData[rectData.length - 1]);


        const rightAlignX = 250;
        const startY = 175;
        const spacing = 65;
        const actorGroupScale = 0.65;
        let totalClones = 0;
        let currentClones = 0;

        let actorGroups = svgActorIcons.nodes();

        // window.actorGroups = actorGroups;
        // console.log("actorGroups");
        // console.log(actorGroups);


        // This allows to sort author groups by the amount of data each collects
        // Thus, when the actors form a column, the one that collects more data appears on top
        actorGroups.sort((a, b) => {

            const labelA = labelsOf[a.id];
            const labelB = labelsOf[b.id];

            // console.log("labelA: " + labelA);
            // console.log("labelB: " + labelB);

            const actorTypeAElement = d3.select("#" + labelA);
            const actorTypeBElement = d3.select("#" + labelB);

            if (actorTypeAElement.empty() || actorTypeBElement.empty()) {
                console.error("actorCategoryName elements not found for actorGroups");
                return 0;
            }

            // console.log("actorTypeAElement: ");
            // console.log(actorTypeAElement);
            // console.log("actorTypeBElement: ");
            // console.log(actorTypeBElement);

            const actorTypeA = actorTypeAElement.text().toUpperCase();
            const actorTypeB = actorTypeBElement.text().toUpperCase();

            // console.log("actorTypeA: " + actorTypeA);
            // console.log("actorTypeB: " + actorTypeB);

            const dataSizeA = Object.keys(actorDataMap[removeSpaces(actorTypeA)] || {}).reduce((sum, key) => sum + actorDataMap[removeSpaces(actorTypeA)][key].length, 0);
            const dataSizeB = Object.keys(actorDataMap[removeSpaces(actorTypeB)] || {}).reduce((sum, key) => sum + actorDataMap[removeSpaces(actorTypeB)][key].length, 0);

            // console.log("dataSizeA: " + dataSizeA);
            // console.log("dataSizeB: " + dataSizeB);

            return dataSizeB - dataSizeA; // Sort descending
        });

        // console.log("SORTED actorGroups:");
        // console.log(actorGroups);

        window.actorGroups = actorGroups;
        window.labelsOf = labelsOf;

        actorGroups = actorGroups.filter(d => d3.select("#" + labelsOf[d.id]).text() !== formatedNames[who]);

        // drawRectAt(rightAlignX, 100, 10, 10, 'red')

        const logoIconScale = 0.55;

        // Dealing with the main logo
        mainTimeline.addLabel("actorsColumn")
            .to(logoIcon.node(), {
                x: rightAlignX + 10,
                y: startY - logoIconScale * logoIconHeight / 2 + 25,
                scale: logoIconScale,
                transformOrigin: '0% 50%',
                duration: animationDuration,
                ease: "power1.inOut"
            }, "actorsColumn");

        const actorType = removeSpaces(formatedNames[who].toUpperCase());

        const rectsOfLogo = generateRectCopies(actorDataMap[actorType], actorType, globalFrequencyMap, splitRectData);

        rectsOfLogo.forEach((rect, rectIndex) => {
            mainTimeline
                .fromTo(`#${rect.id}`, {
                    x: svgWidth * 1.25,
                    y: getRandomBetween(-100, svgHeight + 100),
                }, {
                    x: rightAlignX + 55 + rectIndex * (targetSize * 2 + padding * 0.75),
                    y: startY + targetSize / 2,
                    opacity: 1,
                    duration: animationDuration,
                    ease: "power1.inOut",
                }, `actorsColumn+=${rectIndex * 0.01}`)
                .to(`#${rect.id}`, {
                    rx: 0,
                    ry: 0,
                    duration: animationDuration,
                    ease: "none",
                }, `actorsColumn+=${3 + rectIndex * 0.01}`);
        });



        actorGroups.forEach((actorGroup, index) => {

            index++;

            const labelID = labelsOf[actorGroup.id];
            const actorLabelElement = d3.select("#" + labelID);
            const actorLabelText = actorLabelElement.text();

            // console.log("*********************");
            // console.log("actorLabelText: " + actorLabelText);

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

            const actorType = removeSpaces(actorLabelText.toUpperCase());

            // console.log("--- actorIconCategory: " + actorType);

            const collectedData = actorDataMap[actorType] || {};

            // console.log("collectedData:");
            // console.log(collectedData);

            const commonX = rightAlignX;

            // Generate rect copies first
            const rectCopies = generateRectCopies(collectedData, actorType, globalFrequencyMap, splitRectData);

            // console.log("newRects.length:");
            // console.log(rectCopies.length);

            // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            // console.log("Actor type: " + actorType);
            // console.log("the generated rect copies:");x
            // console.log(rectCopies);

            window.mainTimeline = mainTimeline;

            totalClones += rectCopies.length;

            rectCopies.forEach((rect, rectIndex) => {
                currentClones++;
                // console.log("+++++++++ " + currentClones);
                mainTimeline
                    .fromTo(`#${rect.id}`, {
                        x: svgWidth * 1.25,
                        y: getRandomBetween(-100, svgHeight + 100),
                    }, {
                        x: commonX + 55 + rectIndex * (targetSize * 2 + padding * 0.75),
                        y: offsetY + targetSize / 2,
                        opacity: 1,
                        duration: animationDuration,
                        ease: "power1.inOut",
                    }, `actorsColumn+=${groupStartTime + rectIndex * 0.01}`)
                    .to(`#${rect.id}`, {
                        rx: 0,
                        ry: 0,
                        duration: animationDuration,
                        ease: "none",

                        onUpdate: () => {
                            shouldShowDataCategories = false;
                        },
                        onComplete: () => {
                            shouldShowDataCategories = true;
                        },
                    }, `actorsColumn+=${3 + rectIndex * 0.01}`);
            });

        });




        if (currentClones == totalClones) {

            // console.log("*** currentClones:");
            // console.log(currentClones);

            // console.log("totalClones:");
            // console.log(totalClones);         

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
                    onUpdate: () => {
                        shouldShowDataCategories = false;
                    },
                    onComplete: () => {
                        shouldShowDataCategories = true;
                    },
                }, `actorsColumn+=${2 * animationDuration + 0.5}`);

                d3.select(node).on('mouseover', function (event) {

                    if (d3.select(node).attr('opacity') !== '1') {
                        return;
                    }

                    console.log("mainTimeline.currentLabel():");
                    console.log(mainTimeline.currentLabel());

                    console.log("shouldShowDataCategories: " + shouldShowDataCategories);

                    // console.log(d3.select(node).attr('opacity'));

                    if (d3.select(node).attr('opacity') === '1' && shouldShowDataCategories && !dataCategoryClicked) {

                        // Get the class that identifies the related rectangles
                        let cleanDataType = makeID(d3.select(this).text());
                        let rectClasses = '.copyOfDataRect.' + cleanDataType;

                        // Reduce the opacity of rects that do not have the specific class
                        svg.selectAll('.copyOfDataRect:not(' + rectClasses + ')')
                            .style('opacity', 0.15);

                        d3.selectAll('.category-label')
                            .style('font-weight', 'normal')
                            .style('opacity', 0.15);

                        d3.select(this)
                            .style('opacity', 1);

                        d3.selectAll('.category-label').on('mouseout', mouseOutLabelCategory);
                    }
                });

                function mouseOutLabelCategory(event) {

                    if (d3.select(node).attr('opacity') !== '1') {
                        return;
                    }

                    if (shouldShowDataCategories && !dataCategoryClicked) {

                        console.log("mouseOutLabelCategory");

                        d3.select(this).style('font-weight', 'normal');

                        // Restore opacity for all rects
                        svg.selectAll('.copyOfDataRect')
                            .style('opacity', 1);

                        d3.selectAll('.category-label')
                            .style('font-weight', 'normal')
                            .style('opacity', 1);
                    }
                }

                d3.select(node).on('mouseout', mouseOutLabelCategory);

                d3.select(node).on('click', function (event) {

                    if (d3.select(node).attr('opacity') !== '1') {
                        return;
                    }

                    if (shouldShowDataCategories && !dataCategoryClicked) {

                        // Prevent mouseout effect from restoring the original state
                        d3.selectAll('.category-label').on('mouseout', null);

                        d3.selectAll('.category-label')
                            .style('font-weight', 'normal')
                            .style('opacity', 0.15);

                        d3.select(this)
                            .style('font-weight', 'bolder')
                            .style('opacity', 1);

                        // Get the class that identifies the related rectangles
                        let cleanDataType = makeID(d3.select(this).text());
                        let rectClasses = '.copyOfDataRect.' + cleanDataType;

                        // Reduce the opacity of rects that do not have the specific class
                        svg.selectAll('.copyOfDataRect:not(' + rectClasses + ')')
                            .style('opacity', 0.15);

                        // Ensure that the selected rectangles remain at full opacity
                        svg.selectAll(rectClasses)
                            .style('opacity', 1);

                        dataCategoryClicked = true;
                    }
                });
            });

            mainTimeline.fromTo('#floatingSearchBar', {
                scaleX: 0,
            }, {
                duration: animationDuration,
                scaleX: 1,
                ease: 'elastic.out(1, 0.45)',
                onComplete: () => {
                    shouldShowDataCategories = true;
                },
                onUpdate: () => {
                    shouldShowDataCategories = false;
                },
            }, `actorsColumn+=${2 * animationDuration + 0.5} + 1`);

        }




        const panel = document.getElementById('test');
        const texts = document.querySelectorAll("#test .explanationText");


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
                    divID = "onlyTiktok";
                    break;
                case 'circle-5':
                    divID = "sharedWithOthers";
                    break;
                case 'circle-6':
                    divID = "divDataShared";
                    explaining = "actors";
                    break;
                default:
                    console.log('Unknown circle clicked');
            }

            // restoreProgressCircles();

            if (divID) {
                let linkST = scrollersForCircles[divID];
                gsap.to(window, {
                    duration: 0.5, scrollTo: linkST.start, overwrite: "auto"
                });
            }

        }

        // Select all circle elements
        const circles = document.querySelectorAll('.progressCircle');

        // Attach click event listener to each circle
        circles.forEach(circle => {
            circle.addEventListener('click', handleCircleClick);
        });

        // const pairs = [
        // { line: '.line-2', circle: '#circle-3' },
        // { line: '.line-3', circle: '#circle-4' },
        // { line: '.line-4', circle: '#circle-5' },
        // { line: '.line-5', circle: '#circle-6' }
        // ];


        let scrollersForCircles = {};

        // Function to handle the enter and leave events for the text elements
        function setupTextScrollTriggers() {

            texts.forEach((text, index) => {
                gsap.fromTo(text,
                    {
                        opacity: 0,
                        y: 100
                    }, {
                    opacity: 1, y: 0,
                    scrollTrigger: {
                        trigger: text,
                        start: () => "top bottom-=" + (scrollOffset * (index + 1)),
                        end: () => `center center+=${scrollOffset * (index + 1.5)}`,

                        scrub: true,

                        onUpdate: (self) => {
                            console.log("Scroll progress:", self.progress);
                        },
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

                // console.log("scrollOffset * (index + 1): ");
                // console.log(scrollOffset * (index + 1));



                linkST = ScrollTrigger.create({
                    trigger: text,
                    start: () => "top bottom-=" + ((scrollOffset * (index + 1)) - 550 - index * 80),
                });
                scrollersForCircles[text.id] = linkST;
            });
        }

        // Create the timeline for the lines and circles
        const tl2 = gsap.timeline({
            scrollTrigger: {
                trigger: panel,
                start: "top top",
                end: endValue,
                pin: true,
                scrub: true,
                anticipatePin: 1,
                // onUpdate: (self) => {
                //     const totalProgress = self.progress;
                //     const totalPairs = pairs.length;
                //     const segmentDuration = 1 / totalPairs;

                //     pairs.forEach((pair, index) => {
                //         const start = index * segmentDuration;
                //         const end = (index + 1) * segmentDuration;
                //         const progress = gsap.utils.clamp(0, 1, (totalProgress - start) / (end - start));



                //         // console.log("progress: " + progress);



                //         gsap.to(pair.line, { scaleX: 1, scaleY: progress, duration: 0, ease: "none", backgroundColor: progressColor });

                //         if (pair.circle) {
                //             if (progress < 0.99) {
                //                 gsap.to(pair.circle, { backgroundColor: "light" + progressColor, ease: "none", duration: 0 });
                //             } else {
                //                 gsap.to(pair.circle, { backgroundColor: progressColor, ease: "none", duration: 0 });
                //             }
                //         }

                //         if (progress < 0.99) {
                //             if (pair.line == ".line-5") {
                //                 gsap.to('.line-6', { scaleX: 1, scaleY: 0, duration: 0, ease: "none", backgroundColor: "light" + progressColor });
                //             }
                //         } else {
                //             if (pair.line == ".line-5") {
                //                 gsap.to('.line-6', { scaleX: 1, scaleY: 1, duration: 0.5, ease: "none", backgroundColor: progressColor });

                //             }
                //         }
                //     });
                // }
            }
        });




        // Initialize the text scroll triggers
        setupTextScrollTriggers();

        function onExplanationEnter(element, index) {
            shouldShowDataCategories = false;
            if (element.id === "they") {
                mainTimeline.tweenFromTo("logo", "packing");
            } else if (element.id === "divPiecesOfData") {
                mainTimeline.play("packing");
            } else if (element.id === "divTotalCategories") {
                mainTimeline.tweenFromTo("categories", "accessedOnlyByTikTok");
            } else if (element.id === "onlyTiktok") {
                mainTimeline.tweenFromTo("accessedOnlyByTikTok", "accessedByOtherActors");
            } else if (element.id === "sharedWithOthers") {
                mainTimeline.tweenFromTo("accessedByOtherActors", "actorsColumn");
            } else if (element.id === "divDataShared") {
                shouldShowDataCategories = true;
                mainTimeline.play("actorsColumn");
            }
        }

        function onExplanationLeave(element, index) {
            shouldShowDataCategories = false;
            if (element.id === "they") {
                mainTimeline.tweenFromTo("packing", "logo");
            } else if (element.id === "divPiecesOfData") {
                mainTimeline.tweenFromTo("categories", "packing");
            } else if (element.id === "divTotalCategories") {
                mainTimeline.tweenFromTo("accessedOnlyByTikTok", "categories");
            } else if (element.id === "onlyTiktok") {
                mainTimeline.tweenFromTo("accessedByOtherActors", "accessedOnlyByTikTok");
            } else if (element.id === "sharedWithOthers") {
                mainTimeline.tweenFromTo("actorsColumn", "accessedByOtherActors");
            } else if (element.id === "divDataShared") {
                shouldShowDataCategories = true;
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


    function generateInitialTooltipContent(name, dataCategory, lines, actor, inheritances, showFinalActor) {

        let highlightedLines = lines.map(line => highlightNameInText(line, name));

        let finalActor = actor;
        if (actor === 'UNSPECIFIED_ACTOR') {
            finalActor = 'Unspecified actor';
        } else if (actor === 'we') {
            finalActor = formatedNames[who];
        } else {
            finalActor = actor.charAt(0).toUpperCase() + actor.slice(1);
        }

        // let initialContent = '<span style="color: #a0a0a0; font-size: smaller; letter-spacing: 0.05em; font-family: \'Roboto\', sans-serif; font-weight: 100;">Collected by/shared with:</span><br/> ' + '<div style="text-align: center; margin-top: 5px;">' + finalActor + '</div>';

        let initialContent = '';

        if (showFinalActor) {
            initialContent = '<span style="padding-top: 8px; margin-top: 8px; color: #a0a0a0; font-size: smaller; letter-spacing: 0.05em; font-family: \'Roboto\', sans-serif; font-weight: 100;">Collected by/shared with:</span><br/> ' + '<div style="text-align: center; margin-top: 5px;">' + finalActor + '</div>';
        }



        let inheritanceElements = `<div class="inheritances" style = "${showFinalActor ? "border-bottom: 1px solid #eee;" : ""}"><ul>`;

        if (inheritances && inheritances.length) {
            inheritances.forEach((inheritance, index) => {
                inheritanceElements += '<li>' + inheritance + '</li>';
            });
        }

        inheritanceElements += '</ul></div>';

        return {
            header: `<div class="tooltip-header" style = "${showFinalActor ? "border-bottom: 1px solid #eee; padding-bottom: 8px;" : ""}"><b>${name}</div>`,
            inheritances: inheritanceElements,
            content: `<div class="tooltip-content">${initialContent}</div>`,
            button: `<div class="tooltip-button"><button id="contextButton">View in Policy</button></div>`,
            highlightedLines: highlightedLines,
            currentPage: 0,
            maxVisibleLinks: 10
        };
    }



    function highlightNameInText(text, name) {
        // Adjust the regular expression to match the name as a substring of words, without word boundaries
        const regex = new RegExp(`${name}`, 'gi'); // 'gi' for global and case-insensitive matching
        // Replace and wrap with a span for styling
        return text.replace(regex, match => `<span class="highlight">${match}</span>`);
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
            console.log("id: " + id);
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
    function loadIconAt(icon, svgPath, x, y, scale = 1, opacity = 0, animated = false) {
        return d3.xml(svgPath).then(data => {

            // Set initial opacity and scale for the icon
            icon.attr('opacity', opacity)
                .attr('transform', `translate(${x}, ${y}) scale(0)`);  // Start with scale 0

            // Import the SVG node
            const importedNode = document.importNode(data.documentElement, true);

            // Get bounding box dimensions
            var tempG = svg.append('g').append(() => importedNode);
            const bbox = importedNode.getBBox();
            const iconWidth = bbox.width;
            const iconHeight = bbox.height;
            tempG.remove();

            // Append the imported node to the icon group
            icon.append(() => importedNode);

            // Adjust translation to center the icon and set the correct transform
            const translateX = x - (iconWidth / 2) * scale;
            const translateY = y - (iconHeight / 2) * scale;

            if (animated) {
                // Animate opacity and scale if 'animated' is true
                icon.transition()
                    .duration(1000)  // Duration of the animation (1 second)
                    .attr('transform', `translate(${translateX}, ${translateY}) scale(${scale})`)
                    .attr('opacity', opacity);  // Fade in to full opacity
            } else {
                // Set final scale and opacity without animation
                icon.attr('transform', `translate(${translateX}, ${translateY}) scale(${scale})`)
                    .attr('opacity', opacity);  // Directly set to full opacity
            }

            // **Return the icon's dimensions**
            return { width: iconWidth * scale, height: iconHeight * scale };
        });
    }





    function blinkIcon(icon, repeat = 2) {

        gsap.fromTo(icon.node(),
            { opacity: 0, scale: 0, transformOrigin: "50% 50%", },
            {
                opacity: 1,
                scale: 1,
                transformOrigin: "50% 50%",
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

        // window.randomElement = randomElement;

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


        const initialLines = input.split('\n');

        const uniqueLines = [...new Set(initialLines)];

        // Replacing a line break (\n) followed by a colon (:) 
        // with just the colon (remove the line break)
        let text = uniqueLines.join("\n").replace(/(\r?\n|\r):/g, ":");

        text = text.replace(/_, _/g, "_,_").replace(/[“”]/g, '"');

        // Split the input string into lines
        let lines = text.split('\n');

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



    const searchInput = document.getElementById('searchInput');
    const searchResultsPanel = document.getElementById('searchResultsPanel');
    const clearSearchButton = document.getElementById('clearSearch');


    // Prevent scrolling on the panel from affecting the page
    searchResultsPanel.addEventListener('wheel', function (event) {
        event.stopPropagation();
    }, { passive: true });

    let selectedItem = null; // Track the currently selected item

    function performSearch() {

        const rectangles = document.querySelectorAll('.copyOfDataRect');
        const searchTerm = searchInput.value.toLowerCase();
        searchResultsPanel.innerHTML = ''; // Clear previous results
        selectedItem = null; // Reset the selected item when typing

        searchInput.placeholder = '';

        if (searchInput.value.length > 0) {
            clearSearchButton.style.display = 'block'; // Ensure this line executes
            searchInput.style.paddingRight = '40px';
        } else {
            clearSearchButton.style.display = 'none';
            searchInput.style.paddingRight = '10px';
        }

        const uniqueResults = new Set(); // To store unique results
        const ul = document.createElement('ul'); // Create a <ul> element

        rectangles.forEach(rect => {
            const name = rect.getAttribute('data-name').toLowerCase();
            const inheritances = dataInheritances[name];
            let foundInInheritances = false;

            if (inheritances && inheritances.length) {
                inheritances.forEach(inheritance => {
                    if (inheritance.includes(searchTerm)) {
                        foundInInheritances = true;
                    }
                });
            }

            if ((name.includes(searchTerm) || foundInInheritances) && !uniqueResults.has(name)) {
                uniqueResults.add(name); // Add name to the set to ensure uniqueness
            }
        });

        // Convert Set to Array and sort it alphabetically
        const sortedResults = Array.from(uniqueResults).sort();

        sortedResults.forEach(name => {
            const listItem = document.createElement('li');
            const rect = Array.from(rectangles).find(r => r.getAttribute('data-name').toLowerCase() === name);

            const dataCategory = rect.getAttribute('data-data-category');

            // Create the small rect element as a preview
            const smallRect = document.createElement('div');
            smallRect.style.width = '15px';
            smallRect.style.height = '15px';
            smallRect.style.backgroundColor = rect.getAttribute('fill');
            smallRect.style.border = `1px solid ${rect.getAttribute('stroke')}`;
            smallRect.style.marginRight = '8px';
            smallRect.style.display = 'inline-block';

            // Create a container div for the main text and subtitle
            const textContainer = document.createElement('div');
            textContainer.style.display = 'flex';
            textContainer.style.flexDirection = 'column';

            // Set up the main text and highlight matching parts
            const mainText = document.createElement('span');
            mainText.innerHTML = highlightText(name.charAt(0).toUpperCase() + name.slice(1), searchTerm); // Use innerHTML to apply highlighting
            textContainer.appendChild(mainText);

            const inheritances = dataInheritances[name];

            // Conditionally add a subtitle
            if (inheritances && inheritances.length) { // Check if dataCategory is present or matches your criteria
                const subtitleText = "(" + inheritances.join(', ') + ")";
                const subtitle = document.createElement('span');
                subtitle.innerHTML = highlightText(subtitleText, searchTerm); // Use innerHTML to apply highlighting
                subtitle.style.fontSize = '12px';
                subtitle.style.color = '#888';
                textContainer.appendChild(subtitle);
            }

            listItem.prepend(smallRect); // Add the small rect before the text container
            listItem.appendChild(textContainer); // Add the text container to the list item            

            // Hover effect to change the opacity of corresponding rectangles
            listItem.addEventListener('mouseenter', function () {
                const rectangles1 = document.querySelectorAll('.copyOfDataRect');
                if (!selectedItem) { // Only apply hover effects if no item is selected
                    rectangles1.forEach(rect => {
                        const rectName = rect.getAttribute('data-name').toLowerCase();
                        if (rectName === name) {
                            rect.style.opacity = '1'; // Highlight the corresponding rects
                        } else {
                            rect.style.opacity = '0.15'; // Dim others
                        }
                    });

                    changeDataCategoriesLabelsOpacity(dataCategory, 'normal');

                }
            });

            listItem.addEventListener('mouseleave', function () {
                const rectangles1 = document.querySelectorAll('.copyOfDataRect');
                if (!selectedItem) { // Only reset if no item is selected
                    rectangles1.forEach(rect => {
                        rect.style.opacity = '1'; // Reset opacity of all rectangles
                    });
                }
            });

            // Click event to persist selection and fade unrelated rectangles
            listItem.addEventListener('mouseup', function () {

                dataCategoryClicked = true;

                searchInput.value = name; // Set the clicked item's name in the search box

                if (currentPermanentTooltip && !currentPermanentTooltip.popper.contains(event.target)) {
                    currentPermanentTooltip.hide();
                    currentPermanentTooltip = null;
                }

                const rectangles1 = document.querySelectorAll('.copyOfDataRect');
                selectedItem = name; // Set the selected item
                rectangles1.forEach(rect => {
                    const rectName = rect.getAttribute('data-name').toLowerCase();
                    if (rectName === name) {
                        rect.style.opacity = '1'; // Keep the clicked result fully visible
                    } else {
                        rect.style.opacity = '0.15'; // Fade unrelated rectangles
                    }
                });
                searchResultsPanel.style.display = 'none'; // Hide panel after selection

                // Reducing the opacity of category labels that do not correspond to the clicked rectangle
                changeDataCategoriesLabelsOpacity(dataCategory, 'bold');

            }, true);

            ul.appendChild(listItem); // Append <li> to <ul>
        });


        if (sortedResults.length > 0) {
            searchResultsPanel.appendChild(ul); // Append the <ul> to the panel
            searchResultsPanel.style.display = 'block';
        } else {
            searchResultsPanel.style.display = 'none';
        }
    }

    // Trigger search on input event
    searchInput.addEventListener('input', performSearch);

    // Trigger search on focus event
    searchInput.addEventListener('focus', function () {
        searchInput.select();
        performSearch();
    });

    searchInput.addEventListener('keydown', function (event) {
        const rectangles = document.querySelectorAll('.copyOfDataRect');
        if (event.key === 'Escape') {
            searchInput.value = ''; // Clear the input field
            searchResultsPanel.style.display = 'none'; // Hide the panel
            selectedItem = null; // Clear the selected item
            rectangles.forEach(rect => {
                rect.style.opacity = '1'; // Reset opacity of all rectangles
            });
        }
    });

    searchInput.addEventListener('blur', function (event) {

        if (!searchInput.value || !searchInput.value.trim().length) {
            searchInput.placeholder = 'Search...';
        }

        const rectangles = document.querySelectorAll('.copyOfDataRect');
        const focusedElement = event.relatedTarget;

        // Defer the handling to allow the click event on the list item to be processed
        setTimeout(() => {
            if (!focusedElement || (!focusedElement.classList.contains('copyOfDataRect') && !searchResultsPanel.contains(focusedElement))) {
                searchResultsPanel.style.display = 'none'; // Hide panel when losing focus
                if (!selectedItem) { // Only reset if no item is selected
                    rectangles.forEach(rect => {
                        rect.style.opacity = '1';
                    });
                }
            }
        }, 250); // Delay to ensure click event is processed
    });

    clearSearchButton.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.focus();
    });


    function isHeader(text, checkStrong = false) {

        const iframe = document.getElementById('contextIframe'); // Adjust this ID as needed
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        if (who === 'tiktok') {

            const liElements = iframeDocument.querySelectorAll('li');

            for (let li of liElements) {
                if (li.textContent === text) {
                    return true;
                }
            }

            const h3Elements = iframeDocument.querySelectorAll('h3');
            for (let h3 of h3Elements) {
                if (h3.textContent === text) {
                    return true;
                }
            }

            return false;



            // Get all h2 elements
            const h2Elements = iframeDocument.querySelectorAll('h2');

            // Iterate over all h2 elements
            for (let h2 of h2Elements) {
                // Check if the text is within the h2 element
                if (h2.textContent.includes(text)) {
                    if (checkStrong) {
                        // Check if the text is also within a strong element inside the h2
                        const strongElements = h2.querySelectorAll('strong');
                        for (let strong of strongElements) {
                            if (strong.textContent.includes(text)) {
                                return true; // The text is in both h2 and strong
                            }
                        }
                    } else {
                        return true; // The text is in h2
                    }
                }
            }

            return false; // The text is not found in the desired elements

        }

        return false;
    }

    function highlightText(text, searchTerm) {
        const regex = new RegExp(`(${searchTerm})`, 'gi'); // Case-insensitive match
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    function changeDataCategoriesLabelsOpacity(categoryToKeep, keepingFontWeight) {

        // Reducing the opacity of category labels that do not correspond to the clicked rectangle
        d3.selectAll('.category-label').each(function () {

            const labelElement = d3.select(this);
            const labelId = labelElement.attr('id'); // Get the id of the label
            let fontWeight = 'normal';
            let opacity = 0.15;

            if (labelId == categoryToKeep) {
                fontWeight = keepingFontWeight;
                opacity = 1;
            }

            d3.select(this)
                .style('font-weight', fontWeight)
                .style('opacity', opacity);
        });

    }

    function restoreDataCategoriesLabelsOpacity() {

        console.log("restoreDataCategoriesLabelsOpacity");

        d3.selectAll('.category-label')
            .style('font-weight', 'normal')
            .style('opacity', 1);

    }


    function generateRectCopies(collectedData, actorIconCategory, globalFrequencyMap, splitRectData) {
        const newRects = [];
        let rectIndex = 0;

        // Get sorted categories based on global frequency
        const sortedCategories = Object.keys(collectedData).sort((a, b) => {
            return globalFrequencyMap[b] - globalFrequencyMap[a];
        });

        // Iterate over the sorted data categories
        sortedCategories.forEach(dataCategory => {
            const items = collectedData[dataCategory];

            // console.log("items: -------------------");
            // console.log(items);


            items.forEach((item, innerIndex) => {
                const dataRect = splitRectData.find(d => capitalizeFirstLetter(d.name) === capitalizeFirstLetter(item.name));
                if (dataRect) {
                    const uniqueId = sanitizeId(`${actorIconCategory}_${dataRect.id}_${rectIndex}_${innerIndex}`);
                    const dataRectCopy = {
                        ...dataRect,
                        id: uniqueId,
                        name: capitalizeFirstLetter(item.name),
                        tooltipText: item.text
                    };

                    if (!tmpSearcher) {
                        tmpSearcher = new IframeSearcher('contextIframe');

                        window.tmpSearcher = tmpSearcher;

                    }






                    let lines = processString(item.text)
                        .filter(text => !isHeader(text)) // to remove headers
                        .map(line => normalizeText(line));



                    // let textToFind = "Google collects your Gemini Apps conversations, related product usage information, info about your location, and your feedback";

                    // let textToFind = "Advertisers, measurement and other partners share information with us about you and the actions you have taken outside of the Platform, such as your activities on other websites and apps or in stores, including the products or services you purchased, online or in person";

                    // const containsText = lines.some(line => line.includes(textToFind));



                    // console.log("item.text:");
                    // console.log(item.text);
                    // window.text = item.text;
                    // console.log("lines:");
                    // console.log(lines);
                    // window.lines = lines;












                    const result = [];
                    let i = 0;

                    while (i < lines.length) {
                        let currentConcat = lines[i];
                        let successfulConcat = currentConcat;
                        let lastSuccessfulIndex = i;

                        // Attempt to concatenate with subsequent strings
                        for (let j = i + 1; j < lines.length; j++) {
                            currentConcat += ' ' + lines[j];

                            // Check if the concatenated string exists in the text
                            tmpSearcher.search(currentConcat, false);

                            if (tmpSearcher.currentMatches.length) {
                                // If found, update the last successful concatenation and index
                                successfulConcat = currentConcat;
                                lastSuccessfulIndex = j;
                            } else {
                                // If not found, break out of the loop as further concatenation won't help
                                break;
                            }
                        }

                        // Add the last successful concatenation to the result
                        result.push(successfulConcat);

                        // Move the index to the last successfully concatenated string
                        i = lastSuccessfulIndex + 1;
                    }

                    // Output the results
                    // console.log("Results of concatenations:");
                    // console.log(result);

                    window.result = result;


                    lines = result;

                    const itemName = capitalizeFirstLetter(item.name);

                    const sanitizedActorCategory = sanitizeId(actorIconCategory);
                    const sanitizedDataCategory = sanitizeId(dataCategory);

                    let theRect = svg.append('rect')
                        .data([dataRectCopy]) // Binding data here
                        .attr('id', uniqueId)
                        .attr('class', 'copyOfDataRect ' + sanitizedActorCategory + ' ' + sanitizedDataCategory)
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
                        .attr('data-name', itemName)
                        .attr('data-data-category', makeID(dataCategory))
                        .each(function (d) {

                            // console.log("this >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                            // console.log(this);
                            // console.log("*********************************");
                            // console.log("item.text");
                            // console.log(item.text);
                            // console.log("*********************************");
                            // console.log("Processed string:");
                            // console.log(processString(item.text));


                            // window.dataInheritances = dataInheritances;

                            // console.log(dataInheritances);


                            const inheritances = dataInheritances[itemName.toLowerCase()];

                            // console.log("inheritances for " + itemName);
                            // console.log(inheritances);

                            let actor = item.actor;

                            showFinalActor = actor.toLowerCase() !== 'we' && actor.toLowerCase() !== who;

                            let tooltipContent = generateInitialTooltipContent(itemName, originalNames[dataCategory], lines, actor, inheritances, showFinalActor);

                            const tooltipInstance = tippy(this, {
                                theme: 'light-border',
                                content: tooltipContent.header + (inheritances && inheritances.length ? tooltipContent.inheritances : '') + tooltipContent.content,
                                allowHTML: true,
                                trigger: 'manual',  // Changed from 'click' to 'mouseenter' for hover activation
                                hideOnClick: false,
                                interactive: true,      // Set to false to make the tooltip non-interactive
                                placement: 'top',        // Prefer placement at the top
                                fallbackPlacements: ['right', 'bottom', 'left'], // Fallback placements if 'top' doesn't fit
                                appendTo: () => document.body
                            });

                            this.addEventListener('mouseenter', () => {




                                const opacity = window.getComputedStyle(this).opacity;

                                console.log("opacity: " + opacity);
                                console.log(typeof opacity);

                                if (opacity !== "1") {
                                    return;
                                }

                                if (mainTimeline.currentLabel() !== "actorsColumn") {
                                    return;
                                }

                                // console.log("theRect.style('opacity'):");
                                // console.log(theRect.style('opacity'));

                                if (theRect.style('opacity') === '1') {
                                    tooltipInstance.show();
                                }

                                if (shouldShowDataCategories && !dataCategoryClicked) {

                                    changeDataCategoriesLabelsOpacity(sanitizedDataCategory, 'normal');
                                }
                            });

                            this.addEventListener('mouseleave', () => {

                                const opacity = window.getComputedStyle(this).opacity;

                                console.log("opacity: " + opacity);
                                console.log(typeof opacity);


                                if (opacity !== "1") {
                                    return;
                                }

                                if (currentPermanentTooltip !== tooltipInstance) {
                                    tooltipInstance.hide();
                                }
                                if (shouldShowDataCategories && !dataCategoryClicked) {
                                    restoreDataCategoriesLabelsOpacity();
                                }
                            });

                            // Make the tooltip permanent on click
                            this.addEventListener('click', () => {



                                const opacity = window.getComputedStyle(this).opacity;

                                console.log("opacity: " + opacity);
                                console.log(typeof opacity);

                                if (opacity !== "1") {
                                    return;
                                }

                                tooltipInstance.show();

                                dataCategoryClicked = true;

                                // Hide the currently permanent tooltip, if any
                                if (currentPermanentTooltip) {
                                    currentPermanentTooltip.hide();
                                }

                                // Set the clicked tooltip as the permanent one
                                currentPermanentTooltip = tooltipInstance;

                                const rectangles = document.querySelectorAll('.copyOfDataRect');

                                // reducing the opacity of the other rectangles
                                rectangles.forEach(rect => {
                                    const name = rect.getAttribute('data-name').toLowerCase();
                                    if (name === this.getAttribute('data-name').toLowerCase()) {
                                        rect.style.opacity = '1';
                                    } else {
                                        rect.style.opacity = '0.15';
                                    }
                                });

                                // console.log("sanitizedDataCategory: ");
                                // console.log(sanitizedDataCategory);

                                changeDataCategoriesLabelsOpacity(sanitizedDataCategory, 'bold');

                            });
                        });

                    // event to see the corresponding texts within the privacy policy
                    theRect.on('click', () => {

                        const opacity = window.getComputedStyle(theRect.node()).opacity;
                        if (opacity !== "1") {
                            return;
                        }

                        currentLinesArray = lines;
                        currentLineIndex = 0;

                        const currentText = currentLinesArray[currentLineIndex];
                        const highlightColor = categoriesColorScale(originalNames[dataCategory]);

                        document.querySelector("#dataName").textContent = itemName;
                        document.querySelector("#pageInfo").textContent = "1/" + lines.length;
                        document.querySelector("#squareIndicator").style.backgroundColor = highlightColor;
                        document.querySelector("#overlay").style.borderTopColor = highlightColor;
                        document.querySelector("#overlay").style.borderBottomColor = highlightColor;
                        document.querySelector("#pageNavigation").style.borderLeftColor = highlightColor;
                        document.querySelector("#overlay").style.backgroundColor = highlightColor + '05';

                        popup.style.visibility = 'visible';
                        popup.style.opacity = '1';

                        gsap.to("#overlay", {
                            duration: 0.25,
                            height: '50px',
                            padding: '10px 20px',
                            borderTop: '2px solid ' + highlightColor,
                            borderBottom: '3px solid ' + highlightColor,
                            ease: 'linear',
                            onComplete: () => {
                                scrollToAndHighlightInIframe(currentText, highlightColor + '61');
                            },
                        });

                        document.addEventListener('keydown', escKeyListener);
                        document.querySelector('.popup-content').addEventListener('keydown', escKeyListener);

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


});
