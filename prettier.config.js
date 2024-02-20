/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  printWidth: 100,
};

export default config;
