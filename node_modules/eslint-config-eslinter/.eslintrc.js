module.exports = {
	"extends": "eslint:recommended",	
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  },
  "env": {
    "browser": false,
    "node": true,
		"es6": true,
		"mocha": true
  },
  "rules": {
	  "indent": ["error", 2, { "SwitchCase": 1 }],
		"linebreak-style": ["error", "unix"],
		"semi": ["error", "always"],
		"max-len": ["error", { "code": 120, "ignoreComments": true }],
		"no-undef": 1,
    "no-console": 2,
		"prefer-const": 2,
		"no-var": 2,
		"eol-last": 2,
		"no-trailing-spaces": 2,
		"space-before-function-paren": [
			"error", 
			{
				"anonymous": "never",
				"named": "never",
				"asyncArrow": "always"
			}
		],
		"padding-line-between-statements": [
			"error",
			{ "blankLine": "always", "prev": "block-like", "next": "*"}
		],
		"no-multiple-empty-lines": [
			"error",
			{ "max": 1 }
		],
		"spaced-comment": "error",
		"no-restricted-imports": [
			"error",
			"loglevel",
			"log"
		],
		"brace-style": [
			"error",
			"1tbs"
		],
		"object-curly-spacing": [
			"error", 
			"always"
		],
		"space-before-blocks": "error",
		"key-spacing": "error",
		"no-multi-spaces": "error"
	},
	"overrides": [
    {
      "files": [
        "src/util/log.js"
      ],
			"rules": {
				"no-restricted-imports": [
					"off", 
					"loglevel"
				]
			}
	  },
		{
			"files": [
				"test/**/*"
			],
			"rules": {
				"max-len": "off"
			}
		}
	]
}
