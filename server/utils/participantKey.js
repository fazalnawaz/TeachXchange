function buildParticipantKey(userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join("_");
}

function sortedParticipants(userIdA, userIdB) {
  const ids = [userIdA, userIdB].map((id) => String(id));
  ids.sort();
  return ids;
}

module.exports = { buildParticipantKey, sortedParticipants };
