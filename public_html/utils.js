function escapeRegExp(string) {
  // Escape special characters for regex
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function subtractString(mainStr, subStr) {
  // Escape the substring to safely use in regex
  const escapedSubStr = escapeRegExp(subStr);

  // Create a regular expression to find all occurrences of escapedSubStr globally
  const regex = new RegExp(escapedSubStr, 'g');

  // Replace all occurrences of subStr with an empty string
  return mainStr.replace(regex, '');
}

function capitalizeFirstLetter(str) {
  if (!str) return str; // Return if string is empty or null
  return str.charAt(0).toUpperCase() + str.slice(1);
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


function removeSpaces(str) {
  return str.replace(/\s+/g, '');
}

// function getRandomBetween(a, b) {
//   const lower = Math.min(a, b);
//   const upper = Math.max(a, b);
//   return Math.random() * (upper - lower) + lower;
// }

function getRandomBetween(min, max, integerRequired = false) {
  if (integerRequired) return Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.random() * (max - min) + min;
}

function generateUniqueId(prefix = 'id') {
  // Create a random alphanumeric string with a prefix
  const randomString = Math.random().toString(36).substr(2, 9); // Generate a random string
  const timestamp = Date.now(); // Get the current timestamp
  return `${prefix}_${randomString}_${timestamp}`;
}

function makeID(str) {
  return sanitizeId(removeSpaces(str.toUpperCase()));
}

function isColliding(a, b) {
  return !(
    a.x + a.width / 2 < b.x - b.width / 2 ||
    a.x - a.width / 2 > b.x + b.width / 2 ||
    a.y + a.height / 2 < b.y - b.height / 2 ||
    a.y - a.height / 2 > b.y + b.height / 2
  );
}

function resolveCollision(a, b) {
  const xDist = (a.x - b.x) / (a.width / 2 + b.width / 2);
  const yDist = (a.y - b.y) / (a.height / 2 + b.height / 2);

  const overlapX = (a.width / 2 + b.width / 2) - Math.abs(a.x - b.x);
  const overlapY = (a.height / 2 + b.height / 2) - Math.abs(a.y - b.y);

  if (overlapX < overlapY) {
    const displacement = overlapX / 2;
    if (xDist > 0) {
      a.x += displacement;
      b.x -= displacement;
    } else {
      a.x -= displacement;
      b.x += displacement;
    }
  } else {
    const displacement = overlapY / 2;
    if (yDist > 0) {
      a.y += displacement;
      b.y -= displacement;
    } else {
      a.y -= displacement;
      b.y += displacement;
    }
  }
}















// Function to check if a point is inside an axis-aligned rectangle
function pointInRectangle(x, y, rect) {
  const xs = rect.map(p => p.x);
  const ys = rect.map(p => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

// Function to calculate the shortest distance from a point to an axis-aligned rectangle
function distanceToRectangle(px, py, minX, minY, maxX, maxY) {
  const dx = Math.max(minX - px, 0, px - maxX);
  const dy = Math.max(minY - py, 0, py - maxY);
  return Math.sqrt(dx * dx + dy * dy);
}

// Main function to generate point around rectangle
function generatePointAroundRectangle(rectangle, d) {
  const xs = rectangle.map(p => p.x);
  const ys = rectangle.map(p => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Expand bounding box
  const outerMinX = minX - d;
  const outerMaxX = maxX + d;
  const outerMinY = minY - d;
  const outerMaxY = maxY + d;

  let pointFound = false;
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000;

  while (!pointFound && attempts < maxAttempts) {
    attempts++;

    x = Math.random() * (outerMaxX - outerMinX) + outerMinX;
    y = Math.random() * (outerMaxY - outerMinY) + outerMinY;

    if (!pointInRectangle(x, y, rectangle)) {
      const distance = distanceToRectangle(x, y, minX, minY, maxX, maxY);
      if (distance <= d) {
        pointFound = true;
      }
    }
  }

  if (pointFound) {
    return { x: x, y: y };
  } else {
    console.error("Failed to generate point around rectangle within attempts");
    return null;
  }
}






function arrangeRectanglesByWidth(containerX, containerY, containerWidth, rectWidth, rectHeight, numRectangles, spacingX = 10, spacingY = 10) {
  const positions = [];
  let currentX = containerX;
  let currentY = containerY;

  for (let i = 0; i < numRectangles; i++) {
      // Check if the current rectangle fits in the current row
      if (currentX + rectWidth <= containerX + containerWidth) {
          // Place the rectangle at the current position
          positions.push({
              x: currentX,
              y: currentY,
              width: rectWidth,
              height: rectHeight
          });
          currentX += rectWidth + spacingX; // Move to the right
      } else {
          // Move to the next row
          currentX = containerX; // Reset x to container's left side
          currentY += rectHeight + spacingY; // Move down by the height of the row + vertical spacing

          // Place the rectangle in the new row
          positions.push({
              x: currentX,
              y: currentY,
              width: rectWidth,
              height: rectHeight
          });
          currentX += rectWidth + spacingX; // Move to the right
      }
  }

  return positions;
}



function getPointsOnCircle(n, r, centerX = 0, centerY = 0, startAngle = 0, endAngle = 360) {
  const points = [];
  const angleStep = ((endAngle - startAngle) * Math.PI / 180) / (n - 1); // Step between each angle, converted to radians
  const startAngleRad = startAngle * Math.PI / 180; // Convert start angle to radians

  for (let i = 0; i < n; i++) {
      const angle = startAngleRad + i * angleStep; // Calculate the angle for the current point
      const x = centerX + r * Math.cos(angle); // X coordinate adjusted by centerX
      const y = centerY + r * Math.sin(angle); // Y coordinate adjusted by centerY
      points.push({ x: x, y: y });
  }

  return points;
}




function getRandomElements(arr, n) {
  if (n > arr.length) {
      throw new Error("The number of elements requested exceeds the array size.");
  }
  
  const shuffled = arr.slice(); // Create a copy of the array
  for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  
  return shuffled.slice(0, n); // Return the first n elements from the shuffled array
}




function getRandomElementFromMap(map) {
  const entries = Array.from(map.entries()); // Convert the Map to an array of [key, value] pairs
  const randomIndex = Math.floor(Math.random() * entries.length); // Get a random index
  return entries[randomIndex]; // Return the random [key, value] pair
}

function getRandomProperty(obj) {
  const keys = Object.keys(obj); // Get all the keys of the object
  const randomIndex = Math.floor(Math.random() * keys.length); // Select a random index
  const randomKey = keys[randomIndex]; // Get the random key
  return { key: randomKey, value: obj[randomKey] }; // Return the key-value pair
}





function isUndefined(value) {
  return value === undefined;
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