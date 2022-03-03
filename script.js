//You can edit ALL of the code here


// Level 400 Changes - Add a Show Selector

// Global Variables/Settings
  const mainDisplayDiv = document.querySelector(".gridDisplay");
  const tvMazeInfo = document.querySelector(".tvmaze-info"); // tvMaze info
  const searchBar = document.getElementById("movie-query"); // The Search Bar
  const displayMessage = document.getElementsByClassName("display-message");
  const episodeSelectMenu = document.getElementById("episode-select-menu"); // Episode Selector
  const showSelectMenu = document.getElementById("show-select-menu"); // Show Selector
  const errorMessagesElement = document.getElementsByClassName("error-messages");
  const showName = document.getElementsByClassName("showname");
  const DEFAULT_SHOWID = 82 // i.e. Game of Thrones 


  const FETCHOK = 200;
  const BADURL = 404;
  const SERVER_ERROR = 500;

  let allShows;
  let allShowsTotal;
  let showNumber = 0;
  let padSize;
  let errorMessages;
  let firstFetch = true;
  let fetchErrorOccurred = false;
  let saveAllEpisodes;
  let saveShowNumber;

// Event Listeners
  searchBar.addEventListener("keyup", searchFunction);
  episodeSelectMenu.addEventListener("change",jumpToEpisode);
  showSelectMenu.addEventListener("change",selectShow);

  let tvmInfoDiv;
  let allEpisodes;
  let allEpisodesTotal;
  let searchText = ""; // this variable needs to be global

  // Commence Setup
  window.onload = setup;

function setup() {
  // Retrieve all available shows   
  allShows = getAllShows();
  allShowsTotal = allShows.length;
  showNumber = 0;
  showNumber = allShows.findIndex(element => element.id === DEFAULT_SHOWID);
  errorMessages = "";

  fetchShowAndEpisodes();
}


function fetchShowAndEpisodes() {
      let currentShowID = allShows[showNumber].id; // Fetch Show ID from the array
      let fetchRequest = `https://api.tvmaze.com/shows/${currentShowID}/episodes`;
      fetchErrorOccurred = false;

      fetch(fetchRequest)
        .then(response => {
                let status = response.status;

                if (status === 200) // successful FETCH
                {
                    return response.json(); // CHAIN THE JSON DATA
                }

                else if (status === 500) {
                    alert("An Internal Server Error has occurred.\nPlease investigate your Server Application.");
                    fetchErrorOccurred = true;
                    throw new Error(`An Error Has Occurred. Error Code = ${status}`); // Terminate the program
                }

                else if (status === 404) {
                    alert(`It appears that An Incorrect Link Has Been Used.\nPlease Check This Link :"${currentShowID}"`);
                    errorMessages += `<p>404 Error Occurred wuth ${currentShowID}</p>`;
                    fetchErrorOccurred = true;
                    handleFetchError();
                }

                else {
                    let message = `An Error Has Occurred whilst loading "${currentShowID}". Error Code = ${status}`; 
                    alert(message);
                    errorMessages += `<p>${message}</p>`;
                    fetchErrorOccurred = true;
                    handleFetchError();
                };               
            })

        .then(data => {
                           // Retrieve all the episodes
                           allEpisodes = data;
                           allEpisodesTotal = allEpisodes.length;
                           padding_setup();
                           episodes_setup();
                           firstFetch = false;
                      })

        .catch(error => {
                           let message = `There is an issue regarding: ${fetchRequest} - Show: ${allShows[showNumber].name}`;
                           alert(message + `\nThe data structure of this show does not match the expected Data Structure of an Episode.`);
                           errorMessages += `<p>${message}</p>`;
                           fetchErrorOccurred = true;
                           handleFetchError();
                        });
}

function handleFetchError() {
         if (firstFetch) { // This happened at the very beginning of the program
                           // i.e. the first ever Fetch, so abort
                           alert("Catastrophic error has occurred - investigate 'shows.js' - it appears to be corrupted");
                           throw new Error(`Could not load shows.`); // Terminate the projsgram
                         };

         // Otherwise Restore Previous Show & Redisplay the Episodes
        allEpisodes = [...saveAllEpisodes];
        allEpisodesTotal = allEpisodes.length;
        showNumber = saveShowNumber;
        episodes_setup();
}

function padding_setup() {
        let len = String(allEpisodesTotal).length; // how many digits does the total number of shows have?
        if (len <= 2) 
              padSize = 2;
        else  
              padSize = len;
}

function episodes_setup() {     

  // remove previous display
    removeChildren(mainDisplayDiv); 
    removeChildren(episodeSelectMenu);
    removeChildren(showSelectMenu);
    removeChildren(tvmInfoDiv);
    removeChildren(tvMazeInfo);

// set up the table and dropdown menu for ALL episodes
    let option = document.createElement('option');
    option.value = "";
    option.text = "Select a show ..."; // Placeholder
    showSelectMenu.appendChild(option);
    populateShowMenu();

// set up the table and dropdown menu for ALL episodes
    option = document.createElement('option');
    option.value = "";
    option.text = "Select an episode ..."; // Placeholder
    episodeSelectMenu.appendChild(option);

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

    if (errorMessages != "") // There were issues regarding the Fetching of Shows - display error messages in the Footer
           errorMessagesElement[0].innerHTML = errorMessages;

    showName[0].innerText = allShows[showNumber].name; // Display the name of the show
    searchBar.focus(); // Set focus here      
}

function populateShowMenu() {
     // At the beginning of the program
     // Sort all the shows into alphabetical (case-insensitive) order
     if (firstFetch) {
         allShows.sort(function (show1, show2) {
                        let showX = show1.name.toLowerCase();
                        let showY = show2.name.toLowerCase();
                        return showX == showY ? 0 : showX > showY ? 1 : -1;
                      });
         showNumber = allShows.findIndex(element => element.id === DEFAULT_SHOWID);
         // Doubtful but just in case 'Game of Thrones' no longer exists
         if (showNumber < 0)
                  showNumber = 0;
                    };

     for (let i=0;i<allShows.length;i++) {
              let option = document.createElement('option');
              option.value =  i // allShows[i].id; // EG id: 82 for 'Game of Thrones'
              option.text = allShows[i].name; // EG 'Game of Thrones'
              showSelectMenu.appendChild(option);
                                         };  
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
                          episodeSelectMenu.appendChild(option);
                                }           
       };
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

    addImage(episodeDiv,source,episodeInfo);

    // Remove all <p></p> then add the text using <span>
    const summary = handle_paragraph(source.summary);
    episodeDiv.appendChild(summary); // add the summary

    // add to main content
    mainDisplayDiv.appendChild(episodeDiv); 
}

function addImage(episodeDiv,source,episodeInfo) {
    const imageDiv = document.createElement('div'); // div for an image
    imageDiv.classList.add('image'); // apply class for padding etc
     
    const img = document.createElement('img');
    img.src = source.image.medium;
    img.alt = episodeInfo;
    imageDiv.appendChild(img); // add the image
    episodeDiv.appendChild(imageDiv);
}

// EG Winter is Coming - S01E01
function fetchEpisodeSeason_Full(info) {
        return `${info.name} - S${String(info.season).padStart(padSize,"0")}E${String(info.number).padStart(padSize,"0")}`;
}

// EG 'S01E01'
function fetchEpisodeSeason_Suffix(info) {
        return `S${String(info.season).padStart(padSize,"0")}E${String(info.number).padStart(padSize,"0")}`;
}

function removeHTML(text) {
  // Remove any <p></p> <br></br>
  return text.replaceAll(/<\/?(p|br)>/ig,"");
}

// Instead of using innerHtml, remove the <p></p> and use innerText instead
function handle_paragraph(text) {
      text = removeHTML(text); // remove any <p> </p>
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
     if (!node)
            return; // currently undefined

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
    
    addImage(episodeDiv,source,episodeInfo);

    // change into <span> any occurrence of the search text found within the summary
    // in order to highlight

    text = removeHTML(source.summary); // remove any <p> </p>    
    processText(text,lowerCase,"",episodeDiv);
   
    mainDisplayDiv.appendChild(episodeDiv);
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
    episodeSelectMenu.selectedIndex = 0;
    episode.classList.toggle('blue-border');
    setInterval(function(episode) {episode.style.border = "none";},3000, episode);
}

function selectShow(event) {
       // reset these values
       searchText = "";
       searchBar.value = "";
       // Make a copy of the current Episodes details; just in case an error occurs
       saveAllEpisodes = [...allEpisodes];
       saveShowNumber = showNumber;
       showNumber = +event.target.value; // this is the selected show's details position in the allShows array
       fetchShowAndEpisodes() // Load the episodes
}