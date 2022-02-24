//You can edit ALL of the code here

// Global Variables/Settings
  const mainDisplayDiv = document.querySelector(".gridDisplay");
  const tvMazeInfo = document.querySelector(".tvmaze-info"); // tvMaze info
  const searchBar = document.getElementById("movie-query"); // The Search Bar
  const displayMessage = document.getElementsByClassName("display-message");
  const selectMenu = document.getElementById("select-menu");

// Event Listeners
  searchBar.addEventListener("keyup", searchFunction);
  selectMenu.addEventListener("change",jumpToEpisode);

  let tvmInfoDiv;
  let allEpisodes;
  let allEpisodesTotal;
  let searchText = ""; // this variable needs to be global

  // Commence Setup
  window.onload = setup;

function setup() {
  allEpisodes = getAllEpisodes();
  allEpisodesTotal = allEpisodes.length;

// set up the table and dropdown menu for ALL episodes
  let option = document.createElement('option');
  option.value = "";
  option.text = "Select an episode ..."; // Placeholder
  selectMenu.appendChild(option);
  showAll(true); // display all episodes

       
 // Info regarding TVMaze.com
 // EG <a href="www.tvmaze.com">The movies displayed on this site have been sourced from TVMaze.com</a>
   
  tvmInfoDiv = document.createElement('div');
  let paragraph = document.createElement('span');
  paragraph.innerText = "Please note: The movies displayed on this site have been sourced from ";
  tvmInfoDiv.appendChild(paragraph); 
  let theLink = document.createElement("a");
  theLink.href = "https://www.tvmaze.com/";        
  theLink.textContent = "TVMaze.com";
  theLink.setAttribute('target', '_blank'); // Open in another tab
  
  // Recommended setting: https://www.freecodecamp.org/news/how-to-use-html-to-open-link-in-new-tab/
  theLink.setAttribute('rel', 'noreferrer noopener');
  
  tvmInfoDiv.appendChild(theLink);
  tvMazeInfo.appendChild(tvmInfoDiv);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

function showAll(setup_options) {
       for (let i = 0; i < allEpisodes.length; i++)
       {
              createAllEpisodes(i);
              // at the same time set up the dropdown option menu
              if (setup_options) { 
                          let option = document.createElement('option');
                          option.value = fetchEpisodeSeason_Suffix(allEpisodes[i]); // EG 'S01E01'
                          option.text = fetchEpisodeSeason_Full(allEpisodes[i]); // EG Winter is Coming - S01E01
                          selectMenu.appendChild(option);
                                }           
       }
       displayMessage[0].innerText = `Displaying ${allEpisodesTotal}/${allEpisodesTotal} episodes.`;
}

function createAllEpisodes(index) {
    const episodeDiv = document.createElement('div'); // main 'div' to append to
    const source = allEpisodes[index]; // Entire Episode Entry
    episodeDiv.setAttribute("id",fetchEpisodeSeason_Suffix(source)); // EG S01E01

    let episodeInfo = fetchEpisodeSeason_Full(source); // EG Winter is Coming - S01E01
    const text = document.createElement('h1');
    text.classList.add('episode-title');
    text.innerText = episodeInfo;
    episodeDiv.appendChild(text); // add the title

    const imageDiv = document.createElement('div'); // div for an image
    imageDiv.classList.add('image');
    episodeDiv.appendChild(imageDiv);

    const img = document.createElement('img');
    img.src = source.image.medium;
    img.alt = episodeInfo;
    episodeDiv.appendChild(img); // add the image

    // Remove all <p></p> then add the text using <span>
    const summary = handle_paragraph(source.summary);
    episodeDiv.appendChild(summary); // add the summary

    // add to main content
    mainDisplayDiv.appendChild(episodeDiv); 

    if ((index+1) % 3 === 0) // MAKE THE 4TH COLUMN A GAP BY CREATING AN EMPTY DIV
    {
           const blankColumn = document.createElement('div'); // main 'div' to append to
           mainDisplayDiv.appendChild(blankColumn);
    }

}

// EG Winter is Coming - S01E01
function fetchEpisodeSeason_Full(info) {
        return `${info.name} - S${String(info.season).padStart(2,"0")}E${String(info.number).padStart(2,"0")}`;
}

// EG 'S01E01'
function fetchEpisodeSeason_Suffix(info) {
        return `S${String(info.season).padStart(2,"0")}E${String(info.number).padStart(2,"0")}`;
}


// Instead of using innerHtml, remove the <p></p> and use innerText instead
function handle_paragraph(text) {
      text = text.replace(/<\/?p>/ig,""); // remove any <p> </p>
      let paragraph = document.createElement("p");
          paragraph.innerText = text;
          return paragraph;
}

// Perform a 'live' search
function searchFunction(useThisValue) {
 
   searchText = searchBar.value.trim(); // this is the keyed-in value as the user types
   removeChildren(mainDisplayDiv); // remove previous display
   if (!searchText) // empty input - show all episodes
   {
         showAll(false);
         return;
   }
  
   let lowerCase = searchText.toLowerCase();

   // filter out matching episodes
   const searchResults = allEpisodes.filter(element => element.name.toLowerCase().includes(lowerCase) ||
                                                       element.summary.toLowerCase().includes(lowerCase));
   
   if (!searchResults.length) // No match so ignore
            return;

  for (let i = 0; i < searchResults.length; i++)
         displaySearchResults(i,searchResults[i],lowerCase);
  // Display the number of episodes found       
  displayMessage[0].innerText = `Displaying ${searchResults.length}/${allEpisodesTotal} episodes.`;
}

// remove HTML nodes
function removeChildren(node) {
     while( node.firstChild )
              node.removeChild( node.firstChild );
}

function displaySearchResults(index,source,lowerCase) {
    const episodeDiv = document.createElement('div'); // main 'div' to append to

    let episodeInfo = " - " + fetchEpisodeSeason_Suffix(source); // EG 'S01E01'
    
    // change into <span> any occurrence of the search text found within the title
    // in order to highlight
    
    let h1Element = document.createElement('h1');
    processText(source.name,lowerCase,episodeInfo,h1Element);
    
    h1Element.classList.add('episode-title');
    episodeDiv.appendChild(h1Element);

    const imageDiv = document.createElement('div'); // div for an image
    imageDiv.classList.add('image');
    episodeDiv.appendChild(imageDiv);

    const img = document.createElement('img');
    img.src = source.image.medium;
    img.alt = episodeInfo;
    episodeDiv.appendChild(img)

    // change into <span> any occurrence of the search text found within the summary
    // in order to highlight

    text = source.summary.replace(/<\/?p>/ig,""); // remove any <p> </p>
    processText(text,lowerCase,"",episodeDiv);
   
    mainDisplayDiv.appendChild(episodeDiv);

    if ((index+1) % 3 === 0) // MAKE THE 4TH COLUMN A GAP BY CREATING AN EMPTY DIV
    {
           const blankColumn = document.createElement('div'); // main 'div' to append to
           mainDisplayDiv.appendChild(blankColumn);
    }
}

// NOTE: has to be <span> because <p> will place the new text on to the next line
function processText(text,lowerCase,extraText,result) {

      let lowerText = text.toLowerCase();

      if (!lowerText.includes(lowerCase)) {
      // No occurrence of the search text present so return <p>...</p>
           let paragraph = document.createElement("p");
           paragraph.innerText = text + extraText;
           result.appendChild(paragraph); // add to <div>
           return;
      }

      let paragraph,aString;
      let len = lowerCase.length;

      // Add a <p></p> to create a space underneath the image
      paragraph = document.createElement("p");
      result.appendChild(paragraph); // add to element     
      // Thereafter use <span>

      while (true) {
            let p = lowerText.indexOf(lowerCase);
            if (p < 0)
                 break;

            if (p > 0) { // handle the prefix text first
                          aString = text.substring(0,p); // extract it and append it
                          paragraph = document.createElement("span");
                          paragraph.innerText=aString;
                          result.appendChild(paragraph); // add to element
                          text = text.substr(p); // remove prefix
                          lowerText = lowerText.substr(p);
                          p = 0;
                       }
               
            aString = text.substring(p,p+len); // extract the string to be processed
            text = text.substr(p+len); // remove it from 'text'
            lowerText = lowerText.substr(p+len);
            paragraph = document.createElement("span");
            paragraph.innerText=aString;
            paragraph.classList.add('blueText');
            result.appendChild(paragraph); // add to element
              }     

// Any text left over?
      text += extraText;
      if (text.length !== 0) {
          let paragraph = document.createElement("span");
          paragraph.innerText = text;
          result.appendChild(paragraph); // add to <div>
                              }
}

function jumpToEpisode(event) {

  // If search results are currently being displayed
  // reset display first by showing ALL episodes
    if (searchText !== "")
    {
       // reset these values
       searchText = "";
       searchBar.value = "";
       removeChildren(mainDisplayDiv); // remove previous display
       showAll(false) // show all episodes
    }

    let episode = document.getElementById(event.target.value);
    // set focus on the selected episode
    episode.setAttribute('tabindex', '-1'); 
    episode.focus();
    episode.removeAttribute('tabindex')
    // reset the dropdown menu
    selectMenu.selectedIndex = 0;
    episode.classList.toggle('blue-border');
    setInterval(function(episode) {episode.style.border = "none";},3000, episode);
}