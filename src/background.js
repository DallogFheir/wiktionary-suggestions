function handleInput(input, suggest) {
  const url = "https://en.wiktionary.org/wiki/";
  let query, lang;

  // # -> language choice
  // if # in input, splits input into word query & language
  if (input.includes("#")) {
    let splitInput = input.split("#");

    query = splitInput[0];
    lang = splitInput[1];
  } else {
    // else word query = input
    query = input;
    lang = ""; // empty string so that if (langName.startsWith(lang)) works
  }

  // get list of available languages
  fetch(url + query)
    .then((res) => res.text())
    // suggest > passed an array of suggestions
    .then((res) => suggest(handleFetchedData(res, query, lang)))
    .catch((err) => console.error(err));
}
function handleFetchedData(htmlString, query, lang) {
  // parse response string to HTML
  let parser = new DOMParser();
  let html = parser.parseFromString(htmlString, "text/html");

  // #region HTML structure:
  // <div id="toc">
  //  <ul>
  //    <li class="toclevel-1">
  //      <a href="#{lang}">
  //        <span class="toctext">{lang}</span>
  //      </a>
  //    </li>
  //  </ul>
  // </div>
  // #endregion

  // find languages in Table of Contents
  let tocList = html.querySelectorAll("#toc > ul > li.toclevel-1");

  let sugArray = [];
  for (let li of tocList) {
    // gets language name
    let langName = li.querySelector(":scope > a > span.toctext").innerHTML;

    if (langName.toLowerCase().startsWith(lang.toLowerCase())) {
      // creates suggestion object
      let sugObj = {
        // link to Wiktionary page
        content:
          "https://en.wiktionary.org/wiki/" +
          // replaces space in query with _
          query.replaceAll(" ", "_") +
          "#" +
          // replaces space in language name with _
          langName.replaceAll(" ", "_"),

        description: langName,
      };

      sugArray.push(sugObj);
    }
  }

  return sugArray;
}
function handleEnter(url) {
  // handles default suggestion
  if (!url.startsWith("https://en.wiktionary.org/wiki/")) {
    // do nothing
  } else {
    // go to Wiktionary
    browser.tabs.update({ url });
  }
}

// omnibox
browser.omnibox.setDefaultSuggestion({
  description:
    "Type your query followed by # (hashtag), followed by language name.",
});
browser.omnibox.onInputChanged.addListener(handleInput);
browser.omnibox.onInputEntered.addListener(handleEnter);
