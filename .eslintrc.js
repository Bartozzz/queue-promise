module.exports = {
    "parser": "babel-eslint",
    "extends": ["eslint:recommended", "google"],
    "plugins": ["flowtype", "import"],

    "env": {
        "es6": true,
        "node": true,
        "mocha": true,
        "browser": true,
        "shared-node-browser": true,
    },

    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
    },

    "rules": {
        "no-console": [1],
        "no-useless-escape": [0],
        "no-param-reassign": [1],

        "indent" : [2, 4],
        "quotes": [2, "double"],
        "space-in-parens": [2, "never"],

        "global-require": [0],
        "import/first": [0],
        "import/prefer-default-export": [0],
        "import/no-extraneous-dependencies": [0],
    }
};
