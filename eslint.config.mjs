import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["app.js", "mega-menu.js", "house.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ["studio/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: js.configs.recommended.rules,
  },
];
