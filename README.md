# Webpack Setup Guide

### Init node

```bash
npm init -y
```

If you see `"type": "module"` or `"type": "commonjs"` in `package.json`, remove it. Webpack works best when the module system is left unspecified to avoid conflicts.

### Development and Production

While we will separate the production and development specific bits out, note that we'll still maintain a "common" configuration to keep things DRY.

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server webpack-merge
```

This will install:

- `webpack` & `webpack-cli`: core bundler

- `webpack-dev-server`: for local development

- `webpack-merge`: to split and merge config files cleanly

The `--save-dev` flag (use `-D` as a shortcut) tells npm to record packages as development dependencies.

Create 3 new files:

- `webpack.common.js`
- `webpack.dev.js`
- `webpack.prod.js`

Create a `src` directory to store: `index.js`, `template.html` and `styles.css`.

#### webpack.common.js

```js
const path = require('path');

module.exports = {
	entry: './src/js/index.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
};
```

All the plugins will also be configured here.

#### webpack.dev.js

`webpack-dev-server` bundles the code behind the scenes, but without saving the files to `dist`.

After installing it, set `eval-source-map` as a `devtool` option so that error messages will match up to the correct files and line numbers.

By default, `webpack-dev-server` will only auto-restart when it detects changes on the files imported at the JavaScript bundle, so the HTML template will be ignored! Add the `template.html` to the dev server's array of watched files.

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'eval-source-map',
	devServer: {
		static: './dist',
		watchFiles: ['./src/template.html'],
	},
});
```

#### webpack.prod.js

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
});
```

## HTML

For HTML, use `HtmlWebpackPlugin`:

```bash
npm install --save-dev html-webpack-plugin
```

No need to put a script tag in this file! `HtmlWebpackPlugin` will automatically add the output bundle as a script tag.

Inside `webpack.common.js`, add:

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");

plugins: [
  new HtmlWebpackPlugin({
    template: "./src/template.html",
  }),
],
```

## CSS

For CSS, we need two packages:

```bash
npm install --save-dev style-loader css-loader
```

Back in `webpack.common.js`, we need to add these loaders. Since these aren't plugins, they go in a separate section under `plugins`:

```js
module: {
  rules: [
    {
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    },
  ],
},
```

Now import your CSS file into `src/index.js`:

```js
import './styles.css';
```

And bundle:

```bash
npx webpack
```

## Tailwind CSS

To add Tailwind CSS v4 via PostCSS, install these packages:

```bash
npm install --save-dev tailwindcss @tailwindcss/postcss postcss postcss-loader
```

### Configure PostCSS

Create a `postcss.config.mjs` file in your project root:

```js
export default {
	plugins: {
		'@tailwindcss/postcss': {},
	},
};
```

### Update CSS Configuration

Update your CSS rule in `webpack.common.js` to include PostCSS loader:

```js
module: {
  rules: [
    {
      test: /\.css$/i,
      use: ["style-loader", "css-loader", "postcss-loader"],
    },
  ],
},
```

### Import Tailwind CSS

At `src/styles.css` add:

```css
@import 'tailwindcss';
```

This single import includes all of Tailwind's base, components, and utilities.

Webpack will automatically process the CSS through PostCSS and generate only the Tailwind styles that are actually used.

## Images

There are three different ways you could be dealing with local image files:

### 1. Image files used in CSS inside `url()`

`css-loader` already handles this.

### 2. Image files referenced in HTML template

For example, as the src of an `<img>`:

```bash
npm install --save-dev html-loader
```

This will detect image file paths. Add the following object to the `module.rules` array within `webpack.common.js`:

```js
{
  test: /\.html$/i,
  loader: "html-loader",
}
```

### 3. Images used in JavaScript

Where we will need to import the files:

Since images aren't JavaScript, we tell Webpack that these files will be assets by adding an `asset/resource` rule. Inside the `module.rules` array within `webpack.common.js`:

```js
{
  test: /\.(png|svg|jpg|jpeg|gif)$/i,
  type: "asset/resource",
}
```

Then, in whatever JavaScript module we want to use that image in, we just have to default import it. Example:

```js
// src/index.js
import webpackLogo from './img/webpack-logo.svg';

const image = document.createElement('img');
image.src = webpackLogo;
document.body.append(image);
```

## npm scripts at package.json

- `npm run build`: would be the same as running `npx webpack` in production.
- `npm run dev` would be the same as `npx webpack serve` in development.
- `npm run deploy` to set the deploy commands.

```js
{
  "scripts": {
    "build": "webpack --config webpack.prod.js",
		"dev": "webpack serve --open --config webpack.dev.js"
    "deploy": "<specific to the project configuration>"
  },
}
```

**Note:** If you change the webpack config files while the dev server is running, it will not reflect those config changes.
