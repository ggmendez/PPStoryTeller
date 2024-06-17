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
    let width = window.innerWidth;
    console.log("width: " + width);

    let height = window.innerHeight;
    // Animation duration
    let animationDuration = 0.85;

    // making all this global
    let movedRectData, svgRects, svgCategoryGroups, categoryStartPositions, packedRectData;

    let rectData = [];


    var actorIconScale = 0.35;

    // arrow animations
    let arrow = document.querySelector('.arrow');
    let arrowRight = document.querySelector('.arrow-right');
    let actorsTimeline;

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





    // Fetch the Excel file and process it
    fetch('allNodes.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            entities = XLSX.utils.sheet_to_json(worksheet); // Save the entities globally

            svg.attr('width', '100%').attr('height', '100%');

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
                    actorCategory = removeSpaces(actorCategory.toUpperCase());

                    if (!actorDataMap[actorCategory]) {
                        actorDataMap[actorCategory] = {};
                    }

                    // console.log("dataName: " + dataName);
                    let dataCategory = dataEntities.find(d => d.label === dataName)?.category;
                    if (!dataCategory) {
                        console.error(`Data category for ${dataCategory} not found.`);
                        return;
                    }
                    dataCategory = removeSpaces(dataCategory.toUpperCase());


                    if (!actorDataMap[actorCategory][dataCategory]) {
                        actorDataMap[actorCategory][dataCategory] = [];
                    }
                    // actorDataMap[actorCategory][dataCategory].push(dataName);
                    actorDataMap[actorCategory][dataCategory].push({
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

        const svgbb = svg.node().getBoundingClientRect();
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;
        const dimension = Math.min(width, height) / 3;
        const angleStep = (2 * Math.PI) / actorCategories.length;

        // Shuffle the categories randomly
        const shuffledCategories = actorCategories.sort(() => 0.5 - Math.random());

        let svgPromises = shuffledCategories.map((category, index) => {  // Use map instead of forEach to return an array of promises

            const angle = index * angleStep;
            const x = width / 2 + dimension * Math.cos(angle);
            const y = height / 2 + dimension * Math.sin(angle);
            const nameNoSpaces = category.replace(/\s+/g, '');

            return d3.xml(`./icons/actors/${nameNoSpaces}.svg`).then(data => {
                const importedNode = document.importNode(data.documentElement, true);

                d3.select(importedNode).attr('class', 'actorIcon');

                var tempG = svg.append('g')
                    .attr('opacity', 0)
                    .append(() => importedNode);

                const bbox = importedNode.getBBox();
                const iconWidth = bbox.width + 2 * Math.abs(bbox.x);
                const iconHeight = bbox.height + 2 * Math.abs(bbox.y);
                tempG.remove();

                const group = svg.append('g')
                    .style('transform-origin', `${iconWidth * actorIconScale / 2}px ${iconHeight * actorIconScale / 2}px`)
                    .attr('transform', `translate(${x},${y})`)
                    .attr('class', 'actorGroup')
                    .attr('opacity', 0);

                console.log("group.style('transform-origin')");
                console.log(group.style('transform-origin'));

                const g = group.append('g')
                    .attr('transform', `translate(${-iconWidth * actorIconScale / 2},${-iconHeight * actorIconScale / 2}) scale(${actorIconScale})`);
                g.node().appendChild(importedNode);

                const text = group.append('text')
                    .attr('class', 'categoryName actorCategoryName')
                    .attr('x', 0)
                    .attr('y', actorIconScale * (10 + iconHeight / 2))
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'hanging')
                    .text(category);

                return group; // This ensures that the Promise.all receives the full groups

            });
        });

        console.log("Almost done processing ACTORS");

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

        const svgElement = document.getElementById('circle-packing-svg');
        width = svgElement.clientWidth;
        height = svgElement.clientHeight;



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
        const xCenter = width / 2;
        const yCenter = height / 2;

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
        const cellWidth = width / gridCols;
        const cellHeight = height / gridRows;
        const xOffset = (width - cellWidth * gridCols) / 2;
        const yOffset = (height - cellHeight * gridRows) / 2;

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
            .attr('class', 'dataRect')  // Added class for selection
            .attr('x', d => d.x - (d.width / 2))
            .attr('y', d => d.y - (d.height / 2))
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('rx', d => d.width / 2)
            .attr('ry', d => d.height / 2)
            .attr('stroke', d => darkenColor(d.fill)) // Apply the darker border
            .attr('stroke-width', 1.5)
            .attr('opacity', 1)  // Set initial opacity to 1 for visibility
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

        const categoryRectSize = 6;
        svgCategoryGroups.append('rect')
            .attr('x', categoryRectSize / 2)
            .attr('y', 0)
            .attr('width', categoryRectSize)
            .attr('height', categoryRectSize)
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

        categoryStartPositions = new Array();

        svgCategoryGroups.each(function (d) {
            const bbox = this.getBBox();
            const centerX = categoryPositions[d].x - bbox.width / 2;
            const centerY = categoryPositions[d].y - bbox.height / 2 + cellHeight / 2 - 50;
            d3.select(this).attr('transform', `translate(${centerX}, ${centerY})`);
            categoryStartPositions.push({ x: centerX, y: centerY });
        });

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

        // svg.selectAll('.dataRect')
        //     .data(rectData, d => d.id)
        //     .join(
        //         enter => enter.append('rect')
        //             .attr('class', 'dataRect')
        //             .attr('x', d => d.x - ((d.width || 0) / 2))
        //             .attr('y', d => d.y - ((d.height || 0) / 2))
        //             .attr('width', d => Math.max(0, d.width || 0))
        //             .attr('height', d => Math.max(0, d.height || 0))
        //             .attr('rx', d => Math.max(0, d.rx || 0))
        //             .attr('ry', d => Math.max(0, d.ry || 0))
        //             .attr('fill', d => d.fill || 'none')
        //             .attr('opacity', d => d.opacity || 1.0)
        //             .attr('stroke', d => d.fill ? darkenColor(d.fill) : 'none'), // Safely update stroke color
        //         update => update
        //             .attr('x', d => d.x - ((d.width || 0) / 2))
        //             .attr('y', d => d.y - ((d.height || 0) / 2))
        //             .attr('width', d => Math.max(0, d.width || 0))
        //             .attr('height', d => Math.max(0, d.height || 0))
        //             .attr('rx', d => Math.max(0, d.rx || 0))
        //             .attr('ry', d => Math.max(0, d.ry || 0))
        //             .attr('fill', d => d.fill || 'none')
        //             .attr('opacity', d => d.opacity || 1.0)
        //             .attr('stroke', d => d.fill ? darkenColor(d.fill) : 'none'), // Safely update stroke
        //         exit => exit.remove()
        //     );

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
                ease: "back.out(1.4)",
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                },
                onComplete: () => {
                    mainTimeline.pause();
                }
            }, "packing");

        const targetSize = 10;
        const deltaX = 50;
        const deltaY = 220;
        const svgbb = svg.node().getBoundingClientRect();
        const svgWidth = svgbb.width;
        const svgHeight = svgbb.height;
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
            }, "categories")
            .fromTo(svgCategoryGroups.nodes(), {
                opacity: 0
            }, {
                opacity: 1,
                duration: animationDuration,
                stagger: { amount: animationDuration / 2 },
                onUpdate: () => {
                    svgCategoryGroups.attr("transform", (d, i) => {
                        return `translate(${categoryStartPositions[i].x}, ${categoryStartPositions[i].y})`;
                    });
                }
            }, "categories+=0.75");



        // ***** DATA SHARED *****
        mainTimeline.addLabel("dataShared")
            .to(rectData, {
                // x: (index) => splitRectData[index].targetX,
                // y: (index) => splitRectData[index].targetY,
                // x: width / 2,
                // y: height / 2,
                width: 0,
                height: 0,
                // width: targetSize * 2,
                // height: targetSize * 2,
                // rx: targetSize,
                // ry: targetSize,
                opacity: 0,
                duration: animationDuration,
                ease: "back.out(1.25)",
                stagger: { amount: animationDuration / 3 },
                onUpdate: () => {
                    drawRectsAndLabels(rectData);
                }
            }, "dataShared");

        // Extract nodes and sort them alphabetically by the text content
        const sortedNodes = svgCategoryGroups.nodes().sort((a, b) => {
            const textA = d3.select(a).select('text').text().toUpperCase();
            const textB = d3.select(b).select('text').text().toUpperCase();
            return textA.localeCompare(textB);
        });

        // Sort categoryStartPositions to match the sorted nodes
        const sortedCategoryStartPositions = sortedNodes.map(node => {
            const index = svgCategoryGroups.nodes().indexOf(node);
            return categoryStartPositions[index];
        });

        // Calculate the target positions for the sorted category labels
        const targetPositions = sortedNodes.map((node, i) => {
            const columns = Math.ceil(Math.sqrt(sortedNodes.length));
            const column = i % columns;
            const row = Math.floor(i / columns);
            const cellWidth = width / columns;
            const cellHeight = 30; // Adjust height as needed
            const x = column * cellWidth + cellWidth / 2;
            const y = height - (Math.ceil(sortedNodes.length / columns) * cellHeight) + row * cellHeight + cellHeight / 2;
            return { x, y };
        });

        // Apply the transformations to each sorted category label
        sortedNodes.forEach((node, i) => {
            const { x, y } = targetPositions[i];
            const { x: startX, y: startY } = sortedCategoryStartPositions[i];
            mainTimeline.fromTo(node, {
                transform: `translate(${startX}px, ${startY}px)`,
            }, {
                // important to position the labels at bottom of the canvas
                // transform: `translate(${x}px, ${y - 20}px) scale(0.9)`, 
                opacity: 0,
                duration: animationDuration,
                ease: "back.out(0.25)",
                stagger: { amount: animationDuration * 0.75 }
                // }, `dataShared+=${i * (animationDuration / targetPositions.length)}`);
            }, "dataShared");
        });

        // Bringing actors in
        const svgActorsGroups = svg.selectAll('.actorGroup');
        const actorNodes = svgActorsGroups.nodes();

        mainTimeline.fromTo(actorNodes, {
            opacity: 0,
            scale: 0,
        }, {
            opacity: 1,
            scale: 1,
            duration: animationDuration,
            ease: "back.inOut(4)",
            stagger: { amount: animationDuration * 0.75 },
        }, "dataShared");








        // ***** ACTORS *****


        function sanitizeId(id) {
            return id.replace(/[^a-zA-Z0-9-_]/g, '_');
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
























        function generateRectCopies_OLD(collectedData, actorIconCategory, commonX, offsetY) {
            const newRects = [];
            let rectIndex = 0;

            // Iterate through globally sorted data categories
            sortedGlobalDataCategories.forEach(dataCategory => {
                if (collectedData[dataCategory]) {
                    collectedData[dataCategory].forEach((dataName, innerIndex) => {
                        const dataRect = splitRectData.find(d => d.name === dataName);
                        if (dataRect) {
                            const uniqueId = sanitizeId(`${actorIconCategory}_${dataRect.id}_${rectIndex}_${innerIndex}`);
                            const dataRectCopy = { ...dataRect, id: uniqueId };

                            svg.append('rect')
                                .attr('id', uniqueId)
                                .attr('class', 'copyOfDataRect')
                                .attr('opacity', 0)
                                .attr('x', -targetSize)
                                .attr('y', -targetSize)
                                .attr('width', targetSize * 2)
                                .attr('height', targetSize * 2)
                                .attr('rx', targetSize)
                                .attr('ry', targetSize)
                                .attr('fill', dataRectCopy.fill)
                                .attr('stroke', dataRectCopy.stroke);

                            // Calculate and store positions for animation
                            dataRectCopy.targetX = commonX + rectIndex * (targetSize * 2 + padding);
                            dataRectCopy.targetY = offsetY;

                            newRects.push(dataRectCopy);
                            rectIndex++;
                        } else {
                            console.error("Could not find the rect associated to " + dataName);
                        }
                    });
                }
            });

            return newRects;
        }




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

                    console.log("+++ item:");
                    console.log(item);

                    const dataRect = splitRectData.find(d => d.name === item.name);
                    if (dataRect) {
                        const uniqueId = sanitizeId(`${actorIconCategory}_${dataRect.id}_${rectIndex}_${innerIndex}`);
                        const dataRectCopy = {
                            ...dataRect,
                            id: uniqueId,
                            name: item.name,
                            tooltipText: item.text  // Assuming 'text' is the property containing the tooltip text
                        };

                        // Here you would append your rectangle as you did, but ensure the data is bound
                        let theRect = svg.append('rect')
                            .data([dataRectCopy]) // Binding data here
                            .attr('id', uniqueId)
                            .attr('class', 'copyOfDataRect')
                            .attr('opacity', 0)
                            .attr('x', -targetSize)
                            .attr('y', -targetSize)
                            .attr('width', targetSize * 2)
                            .attr('height', targetSize * 2)
                            .attr('rx', targetSize)
                            .attr('ry', targetSize)
                            .attr('fill', dataRectCopy.fill)
                            .attr('stroke', dataRectCopy.stroke)
                            .on("mouseover", function (event, d) {
                                let lines = d.tooltipText.split('\n');
                                let uniqueLines = new Set();  // Create a set to track unique lines
                                let formattedTooltipText = lines
                                    .filter(line => {
                                        const trimmedLine = line.trim();
                                        if (trimmedLine !== '' && !uniqueLines.has(trimmedLine)) {
                                            uniqueLines.add(trimmedLine);  // Add to set if not already present
                                            return true;
                                        }
                                        return false;
                                    })
                                    .map((line, index) => `<b>${index + 1}.</b> ${line}`)  // Add bold to line numbers
                                    .join('<br>');
                            
                                // Wrap the tooltip text in a div and apply inline CSS for left text alignment
                                tooltip.style("visibility", "visible").html(`
                                    <div>
                                        <div style="font-size: 14px;"><b>${d.name + ' ( ' + dataCategory + ' )'}</b><br/></div>
                                        <div style="margin-top: 10px; padding-left: 20px; text-align: left;">${formattedTooltipText}</div>
                                    </div>
                                `);
                            })
                            .on("mousemove", function (event) {
                                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                            })
                            .on("mouseout", function () {
                                tooltip.style("visibility", "hidden");
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


































        console.log("!!!!!!!!!!!!!!!!!!! rectData[rectData.length - 1]");
        console.log(rectData[rectData.length - 1]);






        // ***** ACTORS COLUMNS *****
        const rightAlignX = 180;
        const startY = 50;
        const spacing = 80;
        const actorGroupScale = 0.55;
        const actorGroups = svg.selectAll('.actorGroup').nodes();

        let totalClones = 0;
        let currentClones = 0;

        mainTimeline.addLabel("actorsColumn");






        actorGroups.sort((a, b) => {

            const actorTypeA = removeSpaces(d3.select(a).select('text.categoryName').text().toUpperCase());
            const actorTypeB = removeSpaces(d3.select(b).select('text.categoryName').text().toUpperCase());

            const dataSizeA = Object.keys(actorDataMap[actorTypeA] || {}).reduce((sum, key) => sum + actorDataMap[actorTypeA][key].length, 0);
            const dataSizeB = Object.keys(actorDataMap[actorTypeB] || {}).reduce((sum, key) => sum + actorDataMap[actorTypeB][key].length, 0);

            return dataSizeB - dataSizeA; // Sort descending
        });






        actorGroups.forEach((actorGroup, index) => {
            const groupBBox = actorGroup.getBBox();
            const scaledWidth = groupBBox.width * actorGroupScale;
            const scaledHeight = groupBBox.height * actorGroupScale;
            const offsetX = rightAlignX;

            const groupStartTime = index * 0.1;
            const actorIcon = d3.select(actorGroup).select('.actorIcon');
            const label = d3.select(actorGroup).select('text.categoryName');

            const actorIconWidth = actorIcon.node().getBBox().width;
            const actorIconHeight = actorIcon.node().getBBox().height;

            const offsetY = startY + index * spacing;


            const labelBBox = label.node().getBBox();
            const labelWidth = labelBBox.width;
            const labelHeight = labelBBox.height;
            const labelScale = 1.5;


            mainTimeline.to(actorGroup, {
                transform: `translate(${rightAlignX}px, ${offsetY}px) scale(${actorGroupScale})`,
                duration: animationDuration,
                ease: "power1.inOut",
            }, "actorsColumn");





            let labelX = -(actorIconWidth * actorIconScale) / 2 - (labelWidth * labelScale) / 2 - (labelWidth / labelScale) / 2 - 5;
            let labelY = - (labelHeight * labelScale) / 2 + actorIconScale * labelHeight / 2 - (actorIconHeight * actorIconScale) / 2;
            labelX = parseFloat(labelX.toFixed(3));
            labelY = parseFloat(labelY.toFixed(3));

            mainTimeline.to(label.node(), {
                x: labelX,
                y: labelY,
                scale: labelScale,
                duration: animationDuration,
                ease: "power4.out"
            }, `actorsColumn+=${groupStartTime}`);


            let actorType = d3.select(actorGroup).select('text.categoryName').text();
            actorType = removeSpaces(actorType.toUpperCase());

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





            // Apply timeline modifications after data generation
            // newRects.forEach(({ id, targetX, targetY, dataRectCopy }, rectIndex) => {
            newRects.forEach((rect, rectIndex) => {

                currentClones++;

                console.log("+++++++++ " + currentClones);

                // console.log("!!!!!!!!!!!!!!!!!!! dataRectCopy");
                // console.log(dataRectCopy);

                // console.log("width / 2: " + width / 2);
                // console.log("height / 2: " + height / 2);

                // mainTimeline.to('.dataRect', {
                //     opacity: 0,
                //     duration: 0,
                // }, `actorsColumn+=${0.01}`);

                // mainTimeline.to(`#${rect.id}`, {
                //     opacity: 1,
                //     duration: 0,
                // }, `actorsColumn+=${0.01}`);

                mainTimeline.fromTo(`#${rect.id}`, {
                    // x: rect.targetX,
                    // y: rect.targetY,
                    x: width * 1.25,
                    y: getRandomBetween(-150, height + 150),
                }, {
                    // the number added to commonX should at some point be the largest icon
                    x: commonX + 80 + rectIndex * (targetSize * 2 + padding * 0.75),
                    y: offsetY + (actorIconScale * actorGroupScale * actorIconHeight / 2),
                    opacity: 1,
                    // rx: 0,
                    // ry: 0,
                    duration: animationDuration,
                    ease: "power1.inOut",
                    // onUpdate: (self) => {

                    //     const element = document.getElementById(rect.id);
                    //     // Get current computed style of the element
                    //     const computedStyle = window.getComputedStyle(element);
                    //     // Access the opacity value from the computed style
                    //     const currentOpacity = computedStyle.opacity;


                    //     console.log("currentOpacity:");
                    //     console.log(currentOpacity);

                    //     svg.selectAll('.dataRect').attr('opacity', 1 - currentOpacity);
                    // },
                }, `actorsColumn+=${groupStartTime + animationDuration + rectIndex * 0.01}`);

                // rectData.push(dataRectCopy);



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

            mainTimeline.to(d3.selectAll('.copyOfDataRect').nodes(), {
                rx: 0,
                ry: 0,
                duration: animationDuration,
            }, `actorsColumn+=${maxDelay + 0.01}`);


        }


        // drawRectAt(width / 2, height / 2, 10, 10, 'purple');























        // Initial conditions
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
            } else if (element.id === "divTotalActorCategories") {
                mainTimeline.tweenFromTo("actorsColumn", "actorsColumn");
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
            } else if (element.id === "divTotalActorCategories") {
                mainTimeline.tweenFromTo("actorsColumn", "actorsColumn");
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
        svg.attr('width', window.innerWidth / 2).attr('height', window.innerHeight);
        // Update width and height variables
        width = window.innerWidth / 2;
        height = window.innerHeight;
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


});


