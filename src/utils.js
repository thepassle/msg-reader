export function formatEmail(name, email) {
  return name ? `${name} [${email}]` : email;
}

export function parseHeaders(headers) {
  if (!headers) return {};

  let parsedHeaders = {};
  let headerRegEx = /(.*): (.*)/g;
  let match;
  while (match = headerRegEx.exec(headers)) {
    // Headers can be present multiple times (e.g. Received). Ignoring duplicates.
    if (parsedHeaders[match[1]]) continue;
    parsedHeaders[match[1]] = match[2];
  }
  return parsedHeaders;
}
