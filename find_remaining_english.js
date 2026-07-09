const fs = require('fs');

const englishWords = [
  "absence", "age", "ahead", "animals", "annually", "approximately", "attach", "become", "beginning", "below", "beneath", "beside", "bloom", "books", "boring", "bowl", "chicken", "class", "clock", "college", "composition", "contain", "cupfuls", "cylindrical", "die", "dinner", "direct", "dull", "duration", "employment", "essay", "every", "exactly", "exceed", "family", "fasten", "flu", "fly", "formal", "frequently", "future", "get", "glass", "grade", "halt", "height", "hold", "holiday", "hop", "immediately", "insignificant", "international", "invite", "job", "just", "lose", "machines", "mailbox", "monthly", "much", "name", "now", "occupation", "off", "page", "past", "paste", "position", "post", "previous", "problem", "recent", "shut", "side", "skillfully", "soba", "something", "somewhat", "stature", "stroll", "supper", "take", "thing", "things", "tie", "tighten", "too", "toward", "tumbler", "university", "vehicles", "watch", "way", "well", "which", "width", "yearly", "years"
];

const meanings = JSON.parse(fs.readFileSync('all_meanings.json', 'utf8'));

const suspicious = meanings.filter(m => {
  if (!m.mId) return false;
  const words = m.mId.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
  return words.some(w => englishWords.includes(w));
});

console.log(JSON.stringify(suspicious.map(m => ({ expr: m.expr, id: m.mId })), null, 2));
console.log('Total suspicious:', suspicious.length);
