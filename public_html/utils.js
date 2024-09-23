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