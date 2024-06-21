/* global d3, XLSX, gsap, ScrollTrigger, ScrollToPlugin */

document.addEventListener("DOMContentLoaded", (event) => {

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
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const padding = 2;
    const minLabelSize = 40; // Minimum size for a rectangle to have a label

    // Define entities globally
    let entities;

    const actorDataMap = {};

    window.actorDataMap = actorDataMap;

    // Fetch the Excel file and process it
    fetch('allNodes.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            entities = XLSX.utils.sheet_to_json(worksheet);
            processDataEntities(entities);
            return processActorEntities(entities);
        })
        .then(() => {
            console.log("Actor entities processed (and XML files loaded)");

            // Load and process edges.csv
            return d3.csv('edges.csv').then(edges => {
                edges.forEach(edge => {

                    let [actorName, dataName] = edge.name.split(' (-) ');

                    const actorsEntities = entities.filter(d => d.type === 'ACTOR');
                    const dataEntities = entities.filter(d => d.type === 'DATA');

                    let actorCategory = actorsEntities.find(d => d.label === actorName)?.category;

                    if (!actorCategory) {
                        console.error(`Actor category for ${actorName} not found.`);
                        return;
                    }
                    let cleanActorCategory = removeSpaces(actorCategory.toUpperCase());
                    originalNames[cleanActorCategory] = actorCategory;


                    if (!actorDataMap[cleanActorCategory]) {
                        actorDataMap[cleanActorCategory] = {};
                    }

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
                        text: edge.text
                    });
                });

                console.log("***************** actorDataMap *****************");
                console.log(actorDataMap);

            });
        })
        .then(() => {
            addScrollEvents(); // Only called once all SVGs are processed and actor entities are ready
        })
        .catch(error => console.error('Error processing entities:', error));

    function processActorEntities(entities) {

        // Actor entities
        const actorsEntities = entities.filter(d => d.type === 'ACTOR');

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

            return d3.xml(`./icons/actors/${nameNoSpaces}.svg`).then(data => {

                const importedNode = document.importNode(data.documentElement, true);

                let actorID = generateUniqueId('actorIcon');

                const iconElement = svg.append('g')
                    .attr('class', 'actorIcon icon-hover')
                    .attr('id', actorID)
                    .attr('opacity', '0');

                var tempG = svg.append('g')
                    .append(() => importedNode);

                const bbox = importedNode.getBBox();
                const iconWidth = bbox.width;
                const iconHeight = bbox.height;

                console.log("iconWidth: " + iconWidth);
                console.log("iconHeight: " + iconHeight);

                tempG.remove();

                originalTransformations[actorID] = { originalX: x - iconWidth / 2, originalY: y - iconHeight / 2, originalScale: actorIconScale, originX: iconWidth / 2, originY: iconHeight / 2 };


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

                // Add event listener to the actor icons
                iconElement.on('click', function (event) {
                    const cleanCategory = removeSpaces(category.toUpperCase());
                    const actorNames = entities.filter(d => d.type === 'ACTOR' && removeSpaces(d.category.toUpperCase()) === cleanCategory).map(d => d.label);

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

        const dataEntities = entities.filter(d => d.type === 'DATA');

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

        const colorScale = d3.scaleOrdinal(customSchemePaired).domain(uniqueCategories);

        // Define a scale for the rectangle sizes based on IncomingConnections
        const maxConnections = d3.max(dataEntities, d => d.Indegree);
        const sizeScaleMultiplier = 20;
        const sizeScale = d3.scaleSqrt()
            .domain([1, maxConnections])
            .range([1 * sizeScaleMultiplier, maxConnections * sizeScaleMultiplier]); // Adjust the range as needed

        // Starting data with IDs from the Excel file
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
            .data(rectData, d => d.id)
            .enter()
            .append('rect')
            .attr('class', 'dataRect')
            .attr('x', d => d.x - (d.width / 2))
            .attr('y', d => d.y - (d.height / 2))
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('rx', d => d.width / 2)
            .attr('ry', d => d.height / 2)
            .attr('stroke', d => darkenColor(d.fill))
            .attr('stroke-width', dataRectStrokeWidth)
            .attr('opacity', 0)
            .attr('fill', d => d.fill);

        // Add labels to the rects
        const svgRectLabels = svg.selectAll('.rect-label')
            .data(rectData.filter(d => Math.min(d.width, d.height) >= minLabelSize), d => d.id)
            .enter()
            .append('text')
            .attr('class', 'rect-label')
            .attr('opacity', 0)
            .attr('text-anchor', 'middle')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .style('font-size', d => `${Math.min(d.width / 3, 12)}px`) // Adjust font size
            .style('pointer-events', 'none') // Prevent labels from interfering with hover events
            .each(function (d) {
                const lines = splitText(d.name, Math.min(d.width, d.height));
                lines.forEach((line, i) => {
                    d3.select(this).append('tspan')
                        .attr('x', d.x)
                        .attr('dy', i === 0 ? `-${(lines.length - 1) / 2}em` : `${1.1}em`)
                        .text(line);
                });
            });



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
    function drawRectsAndLabel_OLD(rectData) {
        svg.selectAll('.dataRect')
            .data(rectData, d => d.id)
            .attr('x', function (d) {
                return d.x - (d.width / 2);
            })
            .attr('y', function (d) {
                return d.y - (d.height / 2);
            })
            .attr('width', function (d) {
                return Math.max(0, d.width);
            })
            .attr('height', function (d) {
                return Math.max(0, d.height);
            })
            .attr('rx', function (d) {
                return Math.max(0, d.rx);
            })
            .attr('ry', function (d) {
                return Math.max(0, d.ry);
            })
            .attr('fill', d => d.fill)
            .attr('opacity', d => d.opacity)
            .attr('stroke', d => darkenColor(d.fill)); // Update stroke color

        svg.selectAll('.rect-label')
            .data(rectData.filter(d => Math.min(d.width, d.height) >= minLabelSize), d => d.id)
            .join(
                enter => enter.append('text').attr('class', 'rect-label'),
                update => update,
                exit => exit.remove()
            )
            .attr('x', d => isNaN(d.x) ? 0 : d.x)
            .attr('y', d => isNaN(d.y) ? 0 : d.y)
            .attr('text-anchor', 'middle') // Center text horizontally
            .each(function (d) {
                const maxDimension = Math.min(d.width, d.height);
                const lines = splitText(d.name, maxDimension);
                const textSelection = d3.select(this);
                textSelection.selectAll('tspan').remove(); // Clear existing tspans
                lines.forEach((line, i) => {
                    textSelection.append('tspan')
                        .attr('x', d.x)
                        .attr('dy', i === 0 ? `-${(lines.length - 1) / 2}em` : `1.1em`)
                        .text(line);
                });
            })
            .attr('opacity', d => d.opacity)
            .style('font-size', d => {
                const maxDimension = Math.min(d.width, d.height);
                return `${Math.min(maxDimension / 6, 12)}px`;
            });

    }

    function drawRectsAndLabels(rectData) {

        svg.selectAll('.dataRect')
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

        svg.selectAll('.rect-label')
            .data(rectData.filter(d => Math.min(d.width, d.height) >= minLabelSize), d => d.id)
            .join(
                enter => enter.append('text').attr('class', 'rect-label'),
                update => update,
                exit => exit.remove()
            )
            .attr('x', d => isNaN(d.x) ? 0 : d.x)
            .attr('y', d => isNaN(d.y) ? 0 : d.y)
            .attr('text-anchor', 'middle') // Center text horizontally
            .each(function (d) {
                const maxDimension = Math.min(d.width, d.height);
                const lines = splitText(d.name, maxDimension);
                const textSelection = d3.select(this);
                textSelection.selectAll('tspan').remove(); // Clear existing tspans
                lines.forEach((line, i) => {
                    textSelection.append('tspan')
                        .attr('x', d.x)
                        .attr('dy', i === 0 ? `-${(lines.length - 1) / 2}em` : `1.1em`)
                        .text(line);
                });
            })
            .attr('opacity', d => d.opacity)
            .style('font-size', d => {
                const maxDimension = Math.min(d.width, d.height);
                return `${Math.min(maxDimension / 6, 12)}px`;
            });

    }

    function addScrollEvents() {

        console.log("adding scroll events");

        const rectLabels = svg.selectAll('.rect-label');

        gsap.to("#one", {
            ease: "none",
            scrollTrigger: {
                trigger: "#one",
                start: "top top",
                scrub: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    gsap.to('.scroll-down', {
                        opacity: 1 - progress
                    });
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
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                },
                onComplete: () => {
                    mainTimeline.pause();
                }
            }, "packing");


        const deltaX = 50;
        const deltaY = 220;

        const point1 = { x: deltaX, y: deltaY };
        const point2 = { x: svgWidth - deltaX, y: deltaY };
        const splitRectData = getPackedDataForSplitRects(point1, point2, svgHeight - (2 * deltaY), targetSize);

        // ***** CATEGORIES *****
        mainTimeline.addLabel("categories")
            .to(rectData, {
                x: (index) => movedRectData[index].x,
                y: (index) => movedRectData[index].y,
                fill: (index) => movedRectData[index].fill,
                duration: animationDuration,
                ease: "back.out(0.45)",
                stagger: { amount: animationDuration / 3 },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                }
            }, "categories");


        // console.log("%%% categoryStartPositions:");
        // console.log(categoryStartPositions);


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
        // sortedCategoryGroupNodes.map((node, i) => {
        //     const columns = Math.ceil(Math.sqrt(sortedCategoryGroupNodes.length));
        //     const column = i % columns;
        //     const row = Math.floor(i / columns);
        //     const cellWidth = svgWidth / columns;
        //     const cellHeight = 30; // Adjust height as needed
        //     const x = column * cellWidth + cellWidth / 2;
        //     const y = svgHeight - (Math.ceil(sortedCategoryGroupNodes.length / columns) * cellHeight) + row * cellHeight + cellHeight / 2;
        //     // drawRectAt(x, y, 20, 20, 'red')
        //     categoryTargetPositions[node.id] = { x: x, y: y - 20 };
        // });



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


        // mainTimeline.fromTo(actorNodes, {
        //     opacity: 0,
        //     // scale: 0,
        //     // transform: `translate(${}, ${}) scale(${actorIconScale})`
        // }, {
        //     opacity: 1,
        //     // scale: actorIconScale,
        //     duration: animationDuration,
        //     ease: "back.inOut(4)",
        //     stagger: { amount: animationDuration * 0.75 },
        // }, "dataShared");


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
            }, `dataShared+=${0.1 + (index * animationDuration * 0.075)}`);
        });

        // ***** ACTORS *****
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

        const sortedGlobalDataCategories = Object.entries(globalFrequencyMap)
            .sort((a, b) => b[1] - a[1])  // Sort descending by frequency
            .map(entry => entry[0]);       // Extract only the category names

        function generateRectCopies(collectedData, actorIconCategory, commonX, offsetY) {
            const newRects = [];
            let rectIndex = 0;

            // Iterate over the data categories
            Object.entries(collectedData).forEach(([dataCategory, items]) => {

                console.log("------ dataCategory:");
                console.log(dataCategory);

                console.log("items:");
                console.log(items);

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
                                // Prepare unique lines and formatted text

                                let uniqueLines = new Set();
                                let lines = item.text.split('\n')
                                    .filter(line => {
                                        const trimmedLine = line.trim();
                                        if (trimmedLine !== '' && !uniqueLines.has(trimmedLine)) {
                                            uniqueLines.add(trimmedLine);
                                            return true;
                                        }
                                        return false;
                                    });

                                let tooltipContent = generateInitialTooltipContent(item.name.charAt(0).toUpperCase() + item.name.slice(1), originalNames[dataCategory], lines);


                                // Assuming `d` and `lines` are already defined and accessible here

                                tippy(this, {
                                    theme: 'light-border',
                                    content: tooltipContent.header + tooltipContent.links + tooltipContent.content,
                                    allowHTML: true,
                                    trigger: 'click',
                                    interactive: true,
                                    delay: [100, 100],
                                    placement: 'right',
                                    appendTo: () => document.body,
                                    onShow(instance) {
                                        const linksContainer = instance.popper.querySelector('.tooltip-links');
                                        const contentContainer = instance.popper.querySelector('.tooltip-content');

                                        linksContainer.querySelectorAll('.tooltip-link').forEach((link, idx) => {
                                            link.addEventListener('click', function () {
                                                updateTooltipContent(contentContainer, tooltipContent.highlightedLines, idx + 1);
                                            });
                                        });
                                    }
                                });

















                            });


                        // .on("mouseover", function (event, d) {
                        //     let lines = d.tooltipText.split('\n');
                        //     let uniqueLines = new Set();  // Create a set to track unique lines
                        //     let formattedTooltipText = lines
                        //         .filter(line => {
                        //             const trimmedLine = line.trim();
                        //             if (trimmedLine !== '' && !uniqueLines.has(trimmedLine)) {
                        //                 uniqueLines.add(trimmedLine);  // Add to set if not already present
                        //                 return true;
                        //             }
                        //             return false;
                        //         })
                        //         .map((line, index) => `<b>${index + 1}.</b> ${line}`)  // Add bold to line numbers
                        //         .join('<br>');

                        //     // Wrap the tooltip text in a div and apply inline CSS for left text alignment
                        //     tooltip.style("visibility", "visible").html(`
                        //         <div>
                        //             <div style="font-size: 14px;"><b>${d.name + ' ( ' + originalNames[dataCategory] + ' )'}</b><br/></div>
                        //             <div style="margin-top: 10px; padding-left: 20px; text-align: left;">${formattedTooltipText}</div>
                        //         </div>
                        //     `);
                        // })


                        // .on("mousemove", function (event) {
                        //     tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                        // })
                        // .on("mouseout", function () {
                        //     tooltip.style("visibility", "hidden");
                        // })
                        // .on("click", function (event, d) {

                        //     let lines = d.tooltipText.split('\n');
                        //     let uniqueLines = new Set();
                        //     let formattedTooltipText = lines
                        //         .filter(line => {
                        //             const trimmedLine = line.trim();
                        //             if (trimmedLine !== '' && !uniqueLines.has(trimmedLine)) {
                        //                 uniqueLines.add(trimmedLine);  // Add to set if not already present
                        //                 return true;
                        //             }
                        //             return false;
                        //         });
                        //     let text = formattedTooltipText[0];
                        //     let url = "https://www.tiktok.com/legal/page/eea/privacy-policy/en";
                        //     let link = generateHighlightLink(url, text);
                        //     console.log("link:");
                        //     console.log(link);
                        // });




                        newRects.push(dataRectCopy);
                        rectIndex++;
                    } else {
                        console.error("Could not find the rect associated to " + item.name);
                    }
                });
            });

            return newRects;
        }

        console.log("!!!!!!!!!!!!!!!!!!! rectData[rectData.length - 1]");
        console.log(rectData[rectData.length - 1]);

        // ***** ACTORS COLUMNS *****
        const rightAlignX = 250;
        const startY = 175;
        const spacing = 65;
        const actorGroupScale = 0.55;
        const actorGroups = svg.selectAll('.actorIcon').nodes();
        // const actorGroups = svg.selectAll('.actorIcon, .actorCategoryName').nodes();

        window.actorGroups = actorGroups;

        console.log("actorGroups");
        console.log(actorGroups);

        let totalClones = 0;
        let currentClones = 0;

        mainTimeline.addLabel("actorsColumn");

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

        // console.log("SORTED actorGroups:");
        // console.log(actorGroups);

        actorGroups.forEach((actorGroup, index) => {

            const labelID = labelsOf[actorGroup.id];
            const actorLabelElement = d3.select("#" + labelID);
            const actorLabelText = actorLabelElement.text();

            console.log("*********************");
            console.log("actorLabelText: " + actorLabelText);

            const groupBBox = actorGroup.getBBox();
            // const scaledWidth = groupBBox.width * actorGroupScale;
            // const scaledHeight = groupBBox.height * actorGroupScale;
            // const offsetX = rightAlignX;

            const groupStartTime = index * 0.1;
            // const actorIcon = d3.select(actorGroup);
            // const label = d3.select(actorGroup.parentNode.parentNode).select('.actorCategoryName');
            const label = d3.select("#" + labelID);

            // const actorIconWidth = groupBBox.width;
            const actorIconHeight = groupBBox.height;

            const offsetY = startY + index * spacing;

            const labelBBox = label.node().getBBox();
            const labelWidth = labelBBox.width;
            // const labelHeight = labelBBox.height;
            // const labelScale = 1.5;

            // drawRectAt(rightAlignX, offsetY, 20, 20, 'purple')




            const bbox = actorGroup.getBBox();
            const iconWidth = bbox.width;
            const iconHeight = bbox.height;


            let x = rightAlignX - iconWidth / 2;
            let y = offsetY - iconHeight / 2;

            mainTimeline.to(actorGroup, {
                // transform: `translate(${rightAlignX}px, ${offsetY}px) scale(${actorGroupScale * actorIconScale})`,
                x: x,
                y: y,
                scale: actorGroupScale * actorIconScale,
                duration: animationDuration,
                ease: "power1.inOut",
            }, "actorsColumn");

            // let labelX = -(actorIconWidth * actorIconScale) / 2 - (labelWidth * labelScale) / 2 - (labelWidth / labelScale) / 2 - 5;
            // let labelY = - (labelHeight * labelScale) / 2 + actorIconScale * labelHeight / 2 - (actorIconHeight * actorIconScale) / 2;
            // labelX = parseFloat(labelX.toFixed(3));
            // labelY = parseFloat(labelY.toFixed(3));

            const theLabel = label.node();

            mainTimeline.to(theLabel, {
                attr: {
                    x: rightAlignX - labelWidth / 2 - actorGroupScale * actorIconScale * iconWidth / 2 - 10,
                    y: offsetY
                },
                duration: animationDuration,
                ease: "power1.inOut",
            }, "actorsColumn");

            // let actorType = d3.select(actorGroup.parentNode.parentNode).select('.actorCategoryName').text();
            actorType = removeSpaces(actorLabelText.toUpperCase());

            console.log("--- actorIconCategory: " + actorType);

            const collectedData = actorDataMap[actorType] || {};

            console.log("collectedData:");
            console.log(collectedData);

            const commonX = rightAlignX;

            // Generate rect copies first
            const newRects = generateRectCopies(collectedData, actorType, commonX, offsetY);

            console.log("newRects.length:");
            console.log(newRects.length);

            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            console.log("Actor type: " + actorType);
            console.log("newRects:");
            console.log(newRects);

            window.mainTimeline = mainTimeline;

            totalClones += newRects.length;

            newRects.forEach((rect, rectIndex) => {

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

                // gsap.to(node, {
                //     transform: `translate(${consistentX}px, ${startY}px)`,
                // });
                // console.log("node.id: " + node.id);

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
                    console.log(rectClasses);

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

        function calculateRectPositions(rect, data) {
            const columns = Math.floor(rect.width / (targetSize * 2 + padding));
            const rows = Math.floor(rect.height / (targetSize * 2 + padding));

            data.forEach((d, i) => {
                const col = i % columns;
                const row = Math.floor(i / columns);
                d.targetX = rect.x + col * (targetSize * 2 + padding) + targetSize + padding;
                d.targetY = rect.y + row * (targetSize * 2 + padding) + padding;
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

        const tl2 = gsap.timeline({
            scrollTrigger: {
                trigger: panel,
                start: "top top",
                end: endValue,
                pin: true,
                scrub: true,
                anticipatePin: 1,
            }
        });

        texts.forEach((text, index) => {
            gsap.fromTo(text, { opacity: 0, y: 100 }, {
                opacity: 1, y: 0, duration: 0.5,
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
        });

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


    function generateHighlightLink(url, text) {
        // Encode the text to handle special characters properly
        const encodedText = encodeURIComponent(text);

        // Construct the URL with the text fragment
        const highlightLink = `${url}#:~:text=${encodedText}`;

        return highlightLink;
    }





    function generateInitialTooltipContent(name, dataCategory, lines) {
        let links = [];
        // Highlight all lines initially and store them
        let highlightedLines = lines.map(line => highlightNameInText(line, name));
        let initialContent = highlightedLines[0]; // Start with the first line highlighted
        for (let i = 1; i <= lines.length; i++) {
            links.push(`<a href="javascript:void(0);" class="tooltip-link${i === 1 ? ' active' : ''}" data-index="${i}">${i}</a>`);
        }
        return {
            header: `<div style="font-size: 14px; text-align: center;"><b>${name}<br/>(${dataCategory})</b></div>
                     <div style="margin-top: 8px; border-top: 1px solid #eee;"></div>`,
            links: `<div class="tooltip-links">${links.join(', ')}</div>`,
            content: `<div class="tooltip-content">${initialContent}</div>`,
            highlightedLines: highlightedLines // store highlighted lines for later use
        };
    }

    function updateTooltipContent(contentContainer, allHighlightedLines, index) {
        // Directly use pre-highlighted lines for display
        contentContainer.innerHTML = allHighlightedLines[parseInt(index) - 1];
        const links = contentContainer.parentNode.querySelector('.tooltip-links').children;
        Array.from(links).forEach(link => {
            link.classList.remove('active');
        });
        links[index - 1].classList.add('active');
    }




    function highlightNameInText(text, name) {
        // Adjust the regular expression to match the name as a substring of words, without word boundaries
        const regex = new RegExp(`${name}`, 'gi'); // 'gi' for global and case-insensitive matching
        // Replace and wrap with a span for styling
        return text.replace(regex, match => `<span class="highlight">${match}</span>`);
    }







});
