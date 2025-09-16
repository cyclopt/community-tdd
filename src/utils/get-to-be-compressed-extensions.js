const EXTENSIONS = {
	csharp: [".cs", ".csproj", ".sln", ".config", "cyclopt.yaml"],
	javascript: [".js", ".json", ".mjs", "vue", ".lock", ".cjs", ".jsx", ".config", "cyclopt.yaml", "cobertura-coverage.xml", "clover.xml", "lcov.info"],
	typescript: [".ts", ".json", ".mts", "vue", ".min.ts", ".lock", ".tsx", ".config", "cyclopt.yaml", "cobertura-coverage.xml", "clover.xml", "lcov.info"],
	java: [".java", "pom.xml", "jacoco.xml", ".config", "cyclopt.yaml"],
	python: [".py", ".json", ".xml", ".txt", ".toml", ".config", "cyclopt.yaml"],
	php: [".php", ".json", ".config", "cyclopt.yaml"],
	dart: [".dart", ".json", ".config", "cyclopt.yaml"],
};

const toBeCompressed = (fileName, language) => {
	if (!language) {
		// Flatten all extensions and check
		const allExts = Object.values(EXTENSIONS).flat();
		return allExts.some((el) => fileName.endsWith(el));
	}

	switch (language) {
	case "c#":
	case "csharp": {
		return EXTENSIONS.csharp.some((el) => fileName.endsWith(el));
	}
	case "javascript": {
		return EXTENSIONS.javascript.some((el) => fileName.endsWith(el));
	}
	case "typescript": {
		return EXTENSIONS.typescript.some((el) => fileName.endsWith(el));
	}
	case "java": {
		return EXTENSIONS.java.some((el) => fileName.endsWith(el));
	}
	case "python": {
		return EXTENSIONS.python.some((el) => fileName.endsWith(el));
	}
	case "php": {
		return EXTENSIONS.php.some((el) => fileName.endsWith(el));
	}
	case "dart": {
		return EXTENSIONS.dart.some((el) => fileName.endsWith(el));
	}
	default: {
		return true;
	}
	}
};

export default toBeCompressed;