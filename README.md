#### JS

Init node:

`npm init -y`

If you see `"type": "module"` or `"type": "commonjs` in `package.json`, remove it. Webpack works best when the module system is left unspecified to avoid conflicts.

`npm install --save-dev webpack webpack-cli`

the `--save-dev` flag (use -D as a shortcut), which tells npm to record packages as development dependencies.

Create a `src` directory with the JavaScript files (`src/index.js`, and others) inside it.

Outside of `src`, create a `webpack.config.js`:

```js
const path = require('path');
module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
};
```

To bundle, run:

`npx webpack`

#### HTML

For HTML, use `HtmlWebpackPlugin`:

`npm install --save-dev html-webpack-plugin`

Create a `template.html` inside `src`. No need to put a script tag in this file! `HtmlWebpackPlugin` will automatically add the output bundle as a script tag.

Inside `webpack.config.js`, add:

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
    }),
  ],
```

Run `npx webpack` again.

#### CSS

For for CSS, we need two packages:
`npm install --save-dev style-loader css-loader`

Back in `webpack.config.js`, we need to add these loaders. Since these aren’t plugins, they go in a separate section under `plugins`:

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

Now import your CSS file into `src/index.js`.
`import "./styles.css";`
and bundle: `npx webpack`

#### IMAGES

There are three different ways you could be dealing with local image files:

- Image files used in our CSS inside `url()`:
  `css-loader` already handles this.
- Image files we reference in our HTML template, e.g. as the src of an <img>:
  `npm install --save-dev html-loader` which will detect image file paths. Add the following object to the `module.rules` array within `webpack.config.js`:

```js
{
  test: /\.html$/i,
  loader: "html-loader",
}
```

- Images we use in our JavaScript, where we will need to import the files:
  Since images aren’t JavaScript, we tell Webpack that these files will be assets by adding an `asset/resource` rule. Inside the `module.rules` array within `webpack.config.js`:

```js
{
  test: /\.(png|svg|jpg|jpeg|gif)$/i,
  type: "asset/resource",
}
```

Then, in whatever JavaScript module we want to use that image in, we just have to default import it. Example:

```js
// src/index.js
import sonicImg from './img/sonic.png';

const image = document.createElement('img');
image.src = sonicImg;

document.body.appendChild(image);
```

#### Auto-restart the page with webpack-dev-server

It works by bundling the code behind the scenes, but without saving the files to `dist`.

`npm install --save-dev webpack-dev-server`

After installing it, set `eval-source-map` as a `devtool` option. So that error messages will match up to the correct files and line numbers.

By default, `webpack-dev-server` will only auto-restart when it detects changes on the files imported at the JavaScript bundle, so the HTML template will be ignored! Add the `template.html` to the dev server’s array of watched files. On `webpack.config.js`:

```js
devtool: "eval-source-map",
devServer: {
  watchFiles: ["./src/template.html"],
},
```

Finally run `npx webpack serve`

**_ Note: If you change the webpack config file while the dev server is running, it will not reflect those config changes. _**
