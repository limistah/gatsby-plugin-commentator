require("./style.css");

// Creates element, set class, innerhtml then returns it;
const createEl = (name, className, html = null) => {
  const el = document.createElement(name);
  el.className = className;
  el.innerHTML = html;
  return el;
};

// Sets the class and text of the form feedback
const updateFeedback = (str = "", className) => {
  const feedback = document.querySelector(".feedback");
  feedback.className = `feedback ${className ? className : ""}`.trim();
  feedback.innerHTML = str;
  return feedback;
};

const createHTMLForm = () => {
  const form = createEl("form");
  form.className = "comment-form";
  const nameInput = createEl("input", "name-input", null);
  nameInput.type = "text";
  nameInput.placeholder = "Your Name";
  form.appendChild(nameInput);
  const commentInput = createEl("textarea", "comment-input", null);
  commentInput.placeholder = "Comment";
  form.appendChild(commentInput);
  const feedback = createEl("span", "feedback");
  form.appendChild(feedback);
  const button = createEl("button", "comment-btn", "Submit");
  button.type = "submit";
  form.appendChild(button);
  return form;
};

const getCommentListItem = (comment) => {
  const li = createEl("li");
  li.className = "comment-list-item";

  const nameCont = createEl("div");
  const name = createEl("strong", "comment-author", comment.name);
  const date = createEl(
    "span",
    "comment-date",
    new Date(comment.createdAt).toLocaleDateString()
  );
  // date.className="date"
  nameCont.append(name);
  nameCont.append(date);

  const commentCont = createEl("div", "comment-cont", comment.content);

  li.append(nameCont);
  li.append(commentCont);
  return li;
};

const getCommentsForPage = async (slug) => {
  const path = slug
    .split("/")
    .filter((s) => s)
    .join("/");
  const data = await fetch(`/comments/${path}.json`);
  return data.json();
};

exports.onRouteUpdate = async ({ location, prevLocation }, pluginOptions) => {
  const commentContainer = document.getElementById("commentContainer");
  if (commentContainer && location.path !== "/") {
    const header = createEl("h2");
    header.innerHTML = "Comments";
    commentContainer.appendChild(header);
    const commentListUl = createEl("ul");
    commentListUl.className = "comment-list";
    commentContainer.appendChild(commentListUl);
    commentContainer.appendChild(createHTMLForm());

    const comments = await getCommentsForPage(location.pathname);

    if (comments && comments.length) {
      comments.map((comment) => {
        const html = getCommentListItem(comment);
        commentListUl.append(html);
        return comment;
      });
    }
  }

  document
    .querySelector("body .comment-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      updateFeedback();
      const name = document.querySelector(".name-input").value;
      const comment = document.querySelector(".comment-input").value;
      if (!name) {
        return updateFeedback("Name is required");
      }
      if (!comment) {
        return updateFeedback("Comment is required");
      }
      updateFeedback("Saving comment", "info");
      const btn = document.querySelector(".comment-btn");
      btn.disabled = true;
      const data = {
        name,
        content: comment,
        slug: location.pathname,
        website: pluginOptions.website,
      };

      fetch(
        "https://cors-anywhere.herokuapp.com/gatsbyjs-comment-server.herokuapp.com/comments",
        {
          body: JSON.stringify(data),
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      ).then(async function (result) {
        const json = await result.json();
        btn.disabled = false;

        if (!result.ok) {
          updateFeedback(json.error.msg, "error");
        } else {
          document.querySelector(".name-input").value = "";
          document.querySelector(".comment-input").value = "";
          updateFeedback("Comment has been saved!", "success");
        }
      });
    });
};
