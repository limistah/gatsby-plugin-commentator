# Gatsby PLUGIN Commentator

This plugin adds comment feature to a GatsbyJS website.

## Demo

[See it here](https://private-blog.netlify.app/)

## Installation

```bash
npm install gatsby-plugin-commentator
// or
yarn add gatsby-plugin-commentator
```

Include it among the plugins in the `gatsby-config.js` file of a GatsbyJS website project folder.

```js
module.exports = {
    plugins: [
        // ......
        {
            resolve: "gatsby-plugin-commentator",
            {website: "http://url-of-the-webiste.come"}
        }
    ]
}
```

Lastly, make a DOM element available at any component rendered with `id="commentContainer"`

```html
<!-- Single post listing page -->
<section id="commentContainer"></section>
```

That's all!

## NOTE.

To load fresh comments, the server has to be restarted.

<small>Built with 💕💕💕 by [Aleem Isiaka](https://aleemisiaka.com)</small>
