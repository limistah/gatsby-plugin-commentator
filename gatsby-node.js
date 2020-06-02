const axios = require("axios");
const fs = require("fs");
const pathResolve = require("path").resolve;

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createTypes } = actions;
  const typeDefs = `
    type CommentServer implements Node {
      _id: String
      name: String
      string: String
      website: String
      content: String
      slug: String
      createdAt: Date
      updatedAt: Date
    }
  `;
  createTypes(typeDefs);

  const { createNode } = actions;
  const { limit, website } = pluginOptions;
  const _limit = parseInt(limit || 10000); // FETCH ALL COMMENTS
  const _website = website || "";

  const result = await axios({
    url: `https://gatsbyjs-comment-server.herokuapp.com/comments?website=${_website}`,
  });

  const comments = result.data;

  function convertCommentToNode(comment, { createContentDigest, createNode }) {
    const nodeContent = JSON.stringify(comment);

    const nodeMeta = {
      id: createNodeId(`comments-${comment._id}`),
      parent: null,
      children: [],
      internal: {
        type: `CommentServer`,
        mediaType: `text/html`,
        content: nodeContent,
        contentDigest: createContentDigest(comment),
      },
    };

    const node = Object.assign({}, comment, nodeMeta);
    createNode(node);
  }

  for (let i = 0; i < comments.data.length; i++) {
    const comment = comments.data[i];
    convertCommentToNode(comment, { createNode, createContentDigest });
  }
};

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    MarkdownRemark: {
      comments: {
        type: ["CommentServer"],
        resolve(source, args, context, info) {
          return context.nodeModel.runQuery({
            query: {
              filter: {
                slug: { eq: source.fields.slug },
              },
            },
            type: "CommentServer",
            firstOnly: false,
          });
        },
      },
    },
  };
  createResolvers(resolvers);
};

exports.createPagesStatefully = async ({ graphql }) => {
  const comments = await graphql(
    `
      {
        allCommentServer(limit: 1000) {
          edges {
            node {
              name
              slug
              _id
              createdAt
              content
            }
          }
        }
      }
    `
  );

  if (comments.errors) {
    throw comments.errors;
  }

  const markdownPosts = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `
  );

  const posts = markdownPosts.data.allMarkdownRemark.edges;
  const _comments = comments.data.allCommentServer.edges;

  const commentsPublicPath = pathResolve(process.cwd(), "public/comments");

  var exists = fs.existsSync(commentsPublicPath); //create destination directory if it doesn't exist

  if (!exists) {
    fs.mkdirSync(commentsPublicPath);
  }

  posts.forEach((post, index) => {
    const path = post.node.fields.slug;
    const commentsForPost = _comments
      .filter((comment) => {
        return comment.node.slug === path;
      })
      .map((comment) => comment.node);

    const strippedPath = path
      .split("/")
      .filter((s) => s)
      .join("/");
    const _commentPath = pathResolve(
      process.cwd(),
      "public/comments",
      `${strippedPath}.json`
    );
    fs.writeFileSync(_commentPath, JSON.stringify(commentsForPost));
  });
};
