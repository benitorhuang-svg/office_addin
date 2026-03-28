// Minimal Deep-Diff Mock (Zenith Architecture)
// Compatible with standard deep-diff API used by Microsoft / Google tools.
function diff(lhs, rhs) {
  if (lhs === rhs) return undefined;
  if (!lhs || !rhs || typeof lhs !== 'object' || typeof rhs !== 'object') {
    return [{ kind: 'E', path: [], lhs, rhs }];
  }
  
  const changes = [];
  const keys = new Set([...Object.keys(lhs), ...Object.keys(rhs)]);
  
  for (const key of keys) {
    if (!(key in lhs)) {
       changes.push({ kind: 'N', path: [key], rhs: rhs[key] });
    } else if (!(key in rhs)) {
       changes.push({ kind: 'D', path: [key], lhs: lhs[key] });
    } else if (lhs[key] !== rhs[key] && typeof lhs[key] === 'object' && typeof rhs[key] === 'object') {
       const subChanges = diff(lhs[key], rhs[key]);
       if (subChanges) {
          subChanges.forEach(sc => {
            sc.path.unshift(key);
            changes.push(sc);
          });
       }
    } else if (lhs[key] !== rhs[key]) {
       changes.push({ kind: 'E', path: [key], lhs: lhs[key], rhs: rhs[key] });
    }
  }
  
  return changes.length ? changes : undefined;
}

module.exports = diff;
module.exports.default = diff;
module.exports.observableDiff = (lhs, rhs, cb) => {
    const changes = diff(lhs, rhs);
    if (changes && cb) changes.forEach(cb);
    return changes;
};
