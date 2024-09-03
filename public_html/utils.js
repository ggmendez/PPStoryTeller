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