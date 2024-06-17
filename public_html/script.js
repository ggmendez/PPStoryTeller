/* global d3, XLSX, gsap, ScrollTrigger, ScrollToPlugin */

document.addEventListener("DOMContentLoaded", (event) => {

    const svg = d3.select('#circle-packing-svg');
    let width = window.innerWidth;
    console.log("width: " + width);

    let height = window.innerHeight;
    // Animation duration
    let animationDuration = 0.85;

    // making all this global
    let movedCirclesData, circlesData, svgCircles, svgCategoryGroups, packedCirclesData;

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
    const minLabelRadius = 20; // Minimum radius for a circle to have a label

    // Fetch the Excel file and process it
    fetch('allNodes.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            svg.attr('width', '100%').attr('height', '100%');

            processDataEntities(json);
            processActorEntities(json).then(() => {
                console.log("Actor entities processed (and XML files loaded)");
                addScrollEvents(); // Only called once all SVGs are processed and actor entities are ready
            }).catch(error => console.error('Error processing entities:', error));
        })
        .catch(error => console.error('Error fetching the Excel file:', error));






    function processActorEntities(entities) {

        // Actor entities
        const actorsEntities = entities.filter(d => d.type === 'ACTOR');

        const excludedCategoryName = "We";  // Name of the category to exclude
        const actorCategories = [...new Set(actorsEntities.filter(d => d.category !== excludedCategoryName).map(d => d.category))];
        document.querySelector("#totalActorCategories").textContent = actorCategories.length;

        const svgbb = svg.node().getBoundingClientRect();
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;
        const radius = Math.min(width, height) / 3;
        const angleStep = (2 * Math.PI) / actorCategories.length;

        // Shuffle the categories randomly
        const shuffledCategories = actorCategories.sort(() => 0.5 - Math.random());



        let svgPromises = shuffledCategories.map((category, index) => {  // Use map instead of forEach to return an array of promises

            const angle = index * angleStep;
            const x = width / 2 + radius * Math.cos(angle);
            const y = height / 2 + radius * Math.sin(angle);
            const nameNoSpaces = category.replace(/\s+/g, '');

            return d3.xml(`./icons/actors/${nameNoSpaces}.svg`).then(data => {
                const importedNode = document.importNode(data.documentElement, true);

                d3.select(importedNode).attr('class', 'actorIcon')

                var tempG = svg.append('g')
                    .attr('opacity', 0)
                    .append(() => importedNode);

                const bbox = importedNode.getBBox();
                const iconWidth = bbox.width + 2 * Math.abs(bbox.x);
                const iconHeight = bbox.height + 2 * Math.abs(bbox.y);
                tempG.remove();

                const group = svg.append('g')
                    .attr('transform', `translate(${x},${y})`)
                    .attr('class', 'actorGroup')
                    .attr('opacity', 0);


                // const svgActorsGroups = svg.selectAll('.actorGroup');
                // console.log("XXX svgActorsGroups:");
                // console.log(svgActorsGroups);
                // const actorNodes = svgActorsGroups.nodes();
                // console.log("XXX actorNodes:");
                // console.log(actorNodes);
                // console.log(actorNodes.length);


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

        // Define a scale for the circle radii based on IncomingConnections
        const maxConnections = d3.max(dataEntities, d => d.Indegree);
        const radiusScaleMultiplier = 10;
        const radiusScale = d3.scaleSqrt()
            .domain([1, maxConnections])
            .range([1 * radiusScaleMultiplier, maxConnections * radiusScaleMultiplier]); // Adjust the range as needed

        const svgElement = document.getElementById('circle-packing-svg');
        width = svgElement.clientWidth;
        height = svgElement.clientHeight;

        // Create a tooltip div that is hidden by default
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px");

        // Starting data with IDs from the Excel file
        circlesData = d3.packSiblings(dataEntities.map(d => ({
            id: d.id,
            r: radiusScale(d.Indegree) + padding,
            fill: '#cbcbcb',
            originalFill: '#cbcbcb',
            name: d.name,
            category: d.category
        })));

        // Center the initial positions
        const xCenter = width / 2;
        const yCenter = height / 2;

        circlesData.forEach(circle => {
            circle.x += xCenter;
            circle.y += yCenter;
        });

        packedCirclesData = circlesData.map(circle => {
            return {
                ...circle,
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

        // Calculate positions for each category's circles
        movedCirclesData = circlesData.map(circle => {
            const categoryCenter = categoryPositions[circle.category];
            return {
                ...circle,
                fill: colorScale(circle.category),
            };
        });

        // Pack circles for each category using d3.packSiblings
        uniqueCategories.forEach(category => {
            const categoryCircles = movedCirclesData.filter(circle => circle.category === category);
            const packedCategoryCircles = d3.packSiblings(categoryCircles);

            const categoryCenter = categoryPositions[category];

            const minX = d3.min(packedCategoryCircles, c => c.x - c.r);
            const maxX = d3.max(packedCategoryCircles, c => c.x + c.r);
            const offsetX = categoryCenter.x - (minX + (maxX - minX) / 2);

            const minY = d3.min(packedCategoryCircles, c => c.y - c.r);
            const maxY = d3.max(packedCategoryCircles, c => c.y + c.r);
            const offsetY = categoryCenter.y - maxY + cellHeight / 2 - 70;

            packedCategoryCircles.forEach(circle => {
                circle.x += offsetX;
                circle.y += offsetY;
            });
        });

        // Create initial SVG circles
        svgCircles = svg.selectAll('.dataCircle')
            .data(circlesData, d => d.id)
            .enter()
            .append('circle')
            .attr('class', 'dataCircle')  // Added class for selection
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r - padding)
            .attr('stroke', d => darkenColor(d.fill)) // Apply the darker border
            .attr('stroke-width', 1.5)
            .attr('opacity', 1)  // Set initial opacity to 1 for visibility
            .attr('fill', d => d.fill);

        // Add labels to the circles
        const svgCircleLabels = svg.selectAll('.circle-label')
            .data(circlesData.filter(d => d.r >= minLabelRadius), d => d.id)
            .enter()
            .append('text')
            .attr('class', 'circle-label')
            .attr('opacity', 0)
            .attr('text-anchor', 'middle')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .style('font-size', d => `${Math.min(d.r / 3, 12)}px`) // Adjust font size
            .style('pointer-events', 'none') // Prevent labels from interfering with hover events
            .each(function (d) {
                const lines = splitText(d.name, d.r);
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

        const categoryCircleRadius = 6;
        svgCategoryGroups.append('circle')
            .attr('cx', categoryCircleRadius / 2)
            .attr('cy', 0)
            .attr('r', categoryCircleRadius)
            .attr('fill', d => colorScale(d))
            .attr('stroke', d => darkenColor(colorScale(d)));

        svgCategoryGroups.append('text')
            .attr('text-anchor', 'start')
            .style('font-size', '16px')
            .style('fill', '#000')
            .text(d => d)
            .style('user-select', 'none')
            .attr('x', categoryCircleRadius + 8)
            .attr('y', 5);

        svgCategoryGroups.each(function (d) {
            const bbox = this.getBBox();
            const centerX = categoryPositions[d].x - bbox.width / 2;
            const centerY = categoryPositions[d].y - bbox.height / 2 + cellHeight / 2 - 50;
            d3.select(this).attr('transform', `translate(${centerX}, ${centerY})`);
        });

        // Update tooltip content on mouseover after animation
        svgCircles.on("mouseover", function (event, d) {
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
    function drawCirclesAndLabels(circlesData) {
        svg.selectAll('.dataCircle')
            .data(circlesData, d => d.id)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', function (d) {  // Using function keyword to access the current element with 'this'
                if ('r' in d && 'scale' in d) {  // Check if both 'r' and 'scale' properties exist
                    const radius = isNaN(d.r) ? 1 : d.r;
                    const scale = isNaN(d.scale) ? 1 : d.scale;
                    return Math.max(radius * scale - padding, 1); // Calculate and set the radius
                }
                return d3.select(this).attr('r'); // Return current value if condition not met
            })
            .attr('fill', d => d.fill)
            .attr('opacity', d => d.opacity)
            .attr('stroke', d => darkenColor(d.fill)); // Update stroke color

        svg.selectAll('.circle-label')
            .data(circlesData.filter(d => d.r * d.scale >= minLabelRadius), d => d.id)
            .join(
                enter => enter.append('text').attr('class', 'circle-label'),
                update => update,
                exit => exit.remove()
            )
            .attr('x', d => isNaN(d.x) ? 0 : d.x)
            .attr('y', d => isNaN(d.y) ? 0 : d.y)
            .attr('text-anchor', 'middle') // Center text horizontally
            .each(function (d) {
                const lines = splitText(d.name, d.r * d.scale);
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
            .style('font-size', d => `${Math.min(d.r / 3, 12) * d.scale}px`);
    }



    function addScrollEvents() {

        console.log("adding scroll events");


        const circleLabels = svg.selectAll('.circle-label');

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



        // Timelines
        const packingTimeline = gsap.timeline();
        packingTimeline.fromTo(circlesData, {
            scale: 0,
            opacity: 0,
        }, {
            x: (index) => packedCirclesData[index].x,
            y: (index) => packedCirclesData[index].y,
            scale: 1,
            opacity: 1,
            duration: animationDuration,
            ease: "back.out(1.4)",
            stagger: { amount: animationDuration / 2 },
            onUpdate: () => {
                drawCirclesAndLabels(circlesData);
            }
        }, 0);
        packingTimeline.pause();


        const categoriesDistributionTimeline = gsap.timeline();
        categoriesDistributionTimeline.to(circlesData, {
            x: (index) => movedCirclesData[index].x,
            y: (index) => movedCirclesData[index].y,
            fill: (index) => movedCirclesData[index].fill,
            duration: animationDuration,
            ease: "back.out(0.45)",
            stagger: { amount: animationDuration / 3 },
            onUpdate: () => {
                drawCirclesAndLabels(circlesData);
            }
        }, 0);
        categoriesDistributionTimeline.fromTo(svgCategoryGroups.nodes(),
            { opacity: 0, duration: 0 },
            {
                opacity: 1,
                duration: animationDuration,
            }, 0.75 * animationDuration);
        categoriesDistributionTimeline.pause();



        // timeline that splits the circles into two rectangular groups
        const dataSharedTimeline = gsap.timeline();

        var targetRadius = 10;
        var deltaX = 50;
        var deltaY = 220;
        var point1 = { x: deltaX, y: deltaY };
        const svgbb = svg.node().getBoundingClientRect();
        var svgWidth = svgbb.width;
        var svgHeight = svgbb.height;
        console.log("svgWidth: " + svgWidth);
        var point2 = { x: svgWidth - deltaX, y: deltaY };

        console.log("width: " + width);

        dataSharedTimeline.fromTo(svgCategoryGroups.nodes(), {
            opacity: 1,
            duration: 0,
        }, {
            opacity: 0,
            duration: animationDuration,
        }, 0);
        const splitCirclesData = getPackedDataForSplitCircles(point1, point2, svgHeight - (2 * deltaY), targetRadius);
        dataSharedTimeline.to(circlesData, {
            x: (index) => splitCirclesData[index].targetX,
            y: (index) => splitCirclesData[index].targetY,
            r: targetRadius,
            duration: animationDuration,
            ease: "back.out(1.4)",
            stagger: { amount: 2 / 3 },
            onUpdate: () => {
                drawCirclesAndLabels(circlesData);
            }
        }, 0);
        dataSharedTimeline.pause();


        const actorsTimeline = gsap.timeline({ paused: true });
        const svgActorsGroups = svg.selectAll('.actorGroup');
        const actorNodes = svgActorsGroups.nodes();

        actorsTimeline.fromTo(actorNodes, {
            opacity: 0,
            scale: 0,
        }, {
            opacity: 1,
            scale: 1,
            duration: animationDuration,
            ease: "back.inOut(4)",
            stagger: { amount: animationDuration * 0.75 },
            onUpdate: (self) => {
                gsap.to(svgCategoryGroups.nodes(), {
                    opacity: 0
                });
            }
        });










        // Assuming svgWidth and svgHeight are already defined appropriately
        const rightAlignX = svgWidth * 0.25;

        // Parameters for column layout
        const startY = svgHeight * 0.1; // Column starts at 20% of the SVG height
        const spacing = 80; // Vertical spacing of 80 pixels between groups
        const actorGroupScale = 0.55; // Desired scale for the group

        // Select all actor groups
        const actorGroups = svg.selectAll('.actorGroup').nodes();
        const actorsColumnTimeline = gsap.timeline({ paused: true });
        actorGroups.forEach((actorGroup, index) => {

            const groupBBox = actorGroup.getBBox();
            const scaledWidth = groupBBox.width * actorGroupScale;
            const scaledHeight = groupBBox.height * actorGroupScale;
            const offsetX = rightAlignX; // Align the right edge of all icons at rightAlignX
            const offsetY = startY + index * spacing;
            const groupStartTime = index * 0.1;

            // Animate each actor group to the calculated position and scale them
            actorsColumnTimeline.to(actorGroup, {
                transform: `translate(${rightAlignX}px, ${offsetY}px) scale(${actorGroupScale})`, // Apply calculated position and scale
                duration: animationDuration,
                ease: "power1.inOut"
            }, groupStartTime);




            const actorIcon = d3.select(actorGroup).select('.actorIcon');



            const label = d3.select(actorGroup).select('text.categoryName');

            const labelWidthScaled = label.node().getBBox().width * actorGroupScale; // Since the labels are scaled to 2

            console.log("labelWidthScaled: " + labelWidthScaled);


            const actorIconWidth = actorIcon.node().getBBox().width;
            const actorIconHeight = actorIcon.node().getBBox().height;

            console.log("actorIconWidth: " + actorIconWidth);
            console.log("actorIconHeight: " + actorIconHeight);

            console.log("actorIconWidth * actorIconScale: " + actorIconWidth * actorIconScale);
            console.log("actorIconWidth * actorIconScale * scale: " + actorIconWidth * actorIconScale * actorGroupScale);

            const labelBBox = label.node().getBBox();
            const labelWidth = labelBBox.width;
            const labelHeight = labelBBox.height;
            const labelScale = 1.5;

            let labelX = -(actorIconWidth * actorIconScale) / 2 - (labelWidth * labelScale) / 2 - (labelWidth / labelScale) / 2 - 5;
            let labelY = - (labelHeight * labelScale)/2 + actorIconScale * labelHeight / 2 - (actorIconHeight * actorIconScale) / 2;
            labelX = parseFloat(labelX.toFixed(3));
            labelY = parseFloat(labelY.toFixed(3));

            console.log("labelY: " + labelY);
            console.log(label.node());
            console.log("bbox.width*0.35: " + groupBBox.width * 0.35);
            console.log("bbox.width: " + groupBBox.width);

            actorsColumnTimeline.to(label.node(), {
                x: labelX,
                y: labelY,
                scale: labelScale,
                duration: animationDuration,
                ease: "power4.out"
            }, groupStartTime);









        });






        // initial conditions

        gsap.to(svgCategoryGroups.nodes(),
            { opacity: 0, duration: 0 }
        );




        // Calculate target positions for the rectangular layout
        function calculateRectPositions(rect, data) {
            var columns = Math.floor(rect.width / (targetRadius * 2 + padding));
            var rows = Math.floor(rect.height / (targetRadius * 2 + padding));

            data.forEach((d, i) => {
                var col = i % columns;
                var row = Math.floor(i / columns);
                d.targetX = rect.x + col * (targetRadius * 2 + padding) + targetRadius + padding;
                d.targetY = rect.y + row * (targetRadius * 2 + padding) + targetRadius + padding;
            });
        }

        function getPackedDataForSplitCircles(point1, point2, totalHeight, targetRadius) {
            var rectWidth1 = Math.abs(point2.x - point1.x);
            var rectWidth2 = rectWidth1; // Assuming the second rectangle has the same width as the first
            var rectHeight = totalHeight;

            // console.log("movedCirclesData: ");
            // console.log(movedCirclesData);

            var data = movedCirclesData.map((d, i) => ({
                id: d.id,
                r: d.r,
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

            var numCircles = data.length;
            var halfCircles = Math.floor(numCircles / 2);

            // Assigning half of the circles to each rectangle
            var rect1Data = data.slice(0, halfCircles);
            var rect2Data = data.slice(halfCircles);

            function calculateColumnMajorPositions2(rectData, startX, width, height, rightToLeft = false) {
                var padding = 3; // Maintain tight packing
                var optimalRows = Math.ceil(Math.sqrt(rectData.length * (height / width)));
                var optimalColumns = Math.ceil(rectData.length / optimalRows);

                // Calculate optimal circle diameter based on the available height and width
                var circleDiameter = 2 * targetRadius;

                var rows = Math.floor((height - padding) / (circleDiameter + padding));
                var columns = Math.ceil(rectData.length / rows);

                // Ensure that the total height is fully utilized
                if ((circleDiameter + padding) * rows < height) {
                    circleDiameter = (height - (rows + 1) * padding) / rows;
                }

                rectData.forEach((d, i) => {
                    var col = Math.floor(i / rows);
                    var row = i % rows;

                    if (rightToLeft) {
                        // Initially position as if left-to-right to calculate the translation needed
                        var initialX = startX + col * (circleDiameter + padding) + padding;
                        // Calculate the rightmost position (first circle position)
                        var rightmostX = startX + (columns - 1) * (circleDiameter + padding) + padding;
                        // Shift all positions so the rightmost circle aligns with point2.x
                        d.targetX = point2.x - (rightmostX - initialX);
                    } else {
                        d.targetX = startX + col * (circleDiameter + padding) + padding;
                    }
                    d.targetY = point1.y + row * (circleDiameter + padding) + padding;
                    d.r = targetRadius;
                });
            }

            function calculateColumnMajorPositions(rectData, startX, width, height, rightToLeft = false) {
                var padding = 3; // Maintain tight packing
                var optimalRows = Math.ceil(Math.sqrt(rectData.length * (height / width)));
                var optimalColumns = Math.ceil(rectData.length / optimalRows);

                // Calculate optimal circle diameter based on the available height and width
                var circleDiameter = 2 * targetRadius;

                var rows = Math.floor((height - padding) / (circleDiameter + padding));
                var columns = Math.ceil(rectData.length / rows);

                // Ensure that the total height is fully utilized
                if ((circleDiameter + padding) * rows < height) {
                    circleDiameter = (height - (rows + 1) * padding) / rows;
                }

                rectData.forEach((d, i) => {
                    var col = Math.floor(i / rows);
                    var row = i % rows;

                    if (rightToLeft) {
                        // Calculate the rightmost position (first circle position)
                        var rightmostX = startX - (columns - 1) * (circleDiameter + padding);

                        // Adjust the calculation of the X position to ensure filling from right to left
                        d.targetX = rightmostX + (columns - 1 - col) * (circleDiameter + padding);
                    } else {
                        d.targetX = startX + col * (circleDiameter + padding);
                    }
                    d.targetY = point1.y + row * (circleDiameter + padding);
                    d.r = targetRadius;
                });
            }


            // Calculate positions for each rectangle
            calculateColumnMajorPositions(rect1Data, point1.x, rectWidth1, rectHeight);

            // Calculate positions for the second rectangle, specifying right-to-left filling
            calculateColumnMajorPositions(rect2Data, point2.x, rectWidth2, rectHeight, true);

            // drawCircleAt(point1.x, point1.y, 5, "red");
            // drawCircleAt(point2.x, point2.y, 5, "blue");

            return rect1Data.concat(rect2Data);
        }













        const panel = document.getElementById('test');
        const texts = document.querySelectorAll("#test .explanationText");

        // Define how much extra scroll is needed before the next element starts
        const scrollOffset = 1000; // This number can be increased for more space

        // Calculate an extended 'end' value based on the number of text elements and the scroll offset
        const endValue = `+=${texts.length * scrollOffset}px`;

        gsap.registerPlugin(ScrollTrigger);

        // Main timeline to manage the pinning of the panel
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

        // Create individual animations and triggers for each text element with scrubbing
        texts.forEach((text, index) => {
            gsap.fromTo(text,
                { opacity: 0, y: 100 },
                {
                    opacity: 1, y: 0, duration: 0.5,
                    scrollTrigger: {
                        trigger: text,
                        start: () => "top bottom-=" + (scrollOffset * (index + 1)), // Each element needs more scroll to start
                        end: () => `center center+=${scrollOffset * (index + 1.5)}`, // End further down the scroll path
                        scrub: 1, // Ensures properties animate in reverse on scroll up
                        onEnter: (self) => {
                            if (self.direction === 1) {
                                onExplanationEnter(text, index)
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
                }
            );
        });

        function onExplanationEnter(element, index) {
            if (element.id === "divPiecesOfData") {
                packingTimeline.play();
            } else if (element.id === "divTotalCategories") {
                categoriesDistributionTimeline.play();
            } else if (element.id === "divDataShared") {
                dataSharedTimeline.play();
            } else if (element.id === "divTotalActorCategories") {
                actorsTimeline.play();
            } else if (element.id === "divDataPerActor") {
                actorsColumnTimeline.play();
            }
        }

        function onExplanationLeave(element, index) {
            if (element.id === "divPiecesOfData") {
                packingTimeline.reverse();
            } else if (element.id === "divTotalCategories") {
                categoriesDistributionTimeline.reverse();
            } else if (element.id === "divDataShared") {
                dataSharedTimeline.reverse();
            } else if (element.id === "divTotalActorCategories") {
                actorsTimeline.reverse();
            } else if (element.id === "divDataPerActor") {
                actorsColumnTimeline.reverse();
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

    // Function to split text into multiple lines based on circle radius
    function splitText(text, radius) {
        text = text.trim();
        text = text.charAt(0).toUpperCase() + text.slice(1);

        const words = text.trim().split(' ');
        if (words.length === 1)
            return [truncateText(text, radius)];

        const lines = [];
        let currentLine = words[0].trim();

        for (let i = 1; i < words.length; i++) {
            const word = words[i].trim();

            if (word.length === 1) {
                currentLine += ' ' + word;
            } else {
                if (currentLine.length + word.length + 1 <= radius / 3) {
                    currentLine += ' ' + word;
                } else {
                    lines.push(truncateText(currentLine, radius));
                    currentLine = word;
                }
            }
        }

        lines.push(truncateText(currentLine, radius));
        return lines;
    }

    // Function to truncate text based on circle radius
    function truncateText(text, radius) {
        const maxLength = Math.floor(radius / 3); // Adjust factor as needed
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

    function drawCircleAt(x, y, r, color) {
        svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', r)
            .attr('fill', color);
    }

    function removeSpaces(str) {
        return str.replace(/\s+/g, '');
    }

});
