// Regex patterns for tracking page routes. Include paths that differ only in search parameters as well.
// Additional patterns to capture dynamic routes and query parameters where applicable.
const ROUTE_PATTERNS = [
	{ pattern: /^\/home$/, group: "tdd", pageKey: "Home" },
];

export default ROUTE_PATTERNS;
