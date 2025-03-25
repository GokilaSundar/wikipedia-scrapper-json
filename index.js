import axios from "axios";
import { writeFile } from "fs/promises";
import { parse } from "node-html-parser";

import { urls } from "./urls.js";

async function getPost(url) {
  const response = await axios.get(url, {
    responseType: "text",
  });

  const html = response.data;

  const document = parse(html);

  const titleElement = document.querySelector("span.mw-page-title-main");
  const contentElements = document.querySelectorAll("#mw-content-text p");

  if (!titleElement || !contentElements || !contentElements.length) {
    throw new Error("Failed to parse post");
  }

  const title = titleElement.innerText;
  const content = contentElements.map((element) => element.innerText).join("\n");

  return { title, content, url };
}

async function main() {
  const posts = [];

  for (let i = 0; i < urls.length; i++) {
    console.log(`Fetching post ${i + 1} of ${urls.length}`);
    try {
      const post = await getPost(urls[i]);

      posts.push(post);

      console.log("Success");
    } catch (error) {
      console.error("Failed to fetch post", error);
    }
  }

  console.log("All posts fetched");

  await writeFile("posts.json", JSON.stringify(posts, null, 2));

  console.log("Posts written to posts.json");

  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to fetch posts", error);
  process.exit(1);
});
