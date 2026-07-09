const fs = require('fs');
const meanings = JSON.parse(fs.readFileSync('all_meanings.json', 'utf8'));

const englishWords = [
  "best", "most", "first", "number", "painting", "picture", "drawing", 
  "uncle", "middle-aged", "toilet", "restroom", "bathroom", "lit.", 
  "place", "hands", "occurrences", "times", "lay", "inform", "instruct", 
  "male", "before", "last", "bath", "lunch", "aquela",
  "those", "this", "that", "these", "there", "where", "what", "who", 
  "when", "why", "how", "have", "has", "had", "will", "would", "shall", 
  "should", "can", "could", "may", "might", "must", "the", "and", "but", 
  "because", "although", "while", "since", "until", "unless", "with", 
  "about", "into", "like", "through", "after", "over", "between", "out", 
  "against", "during", "without", "under", "around", "among", "s)",
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "day", "month", "year", "time", "hour", "minute", "second", "week",
  "people", "person", "man", "woman", "boy", "girl", "child", "children",
  "good", "bad", "big", "small", "long", "short", "old", "new",
  "high", "low", "hot", "cold", "warm", "cool", "hard", "soft",
  "heavy", "light", "dark", "bright", "strong", "weak", "fast", "slow",
  "early", "late", "easy", "difficult", "near", "far",
  "to", "of", "in", "on", "at", "by", "for", "from", "as", "be", "is", "are", "am", "was", "were", "been", "being",
  "it", "he", "she", "they", "we", "you", "i", "me", "him", "her", "us", "them",
  "my", "your", "his", "their", "our", "its", "mine", "yours", "hers", "theirs", "ours"
];

const suspicious = meanings.filter(m => {
  const words = m.mId.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
  return words.some(w => englishWords.includes(w));
});

console.log(JSON.stringify(suspicious.map(m => ({ expr: m.expr, id: m.mId })), null, 2));
console.log('Total suspicious:', suspicious.length);
