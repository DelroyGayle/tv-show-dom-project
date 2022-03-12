//You can edit ALL of the code here


// Level 500 Changes - Add Show List and Search

// Global Variables/Settings
  const mainDisplayDiv = document.querySelector(".gridDisplay");
  const tvMazeInfo = document.querySelector(".tvmaze-info"); // tvMaze info
  const episodesSearchBar = document.getElementById("movie-query"); // The Episodes Search Bar i.e. Level 400
  const displayMessage = document.getElementsByClassName("display-message");
  const episodeSelectMenu = document.getElementById("episode-select-menu"); // Episode Selector
  const showSelectMenu = document.getElementById("show-select-menu"); // Show Selector
  const errorMessagesElement = document.getElementsByClassName("error-messages");
  const showName = document.getElementsByClassName("showname");
  const episodesDisplay = document.getElementsByClassName("episodes-display");
  const showsList = document.getElementsByClassName("shows-list");
  const homeButton = document.getElementById("homebutton");
  const showsSearchBar = document.getElementById("shows-query"); // The Shows List Search Bar i.e. Level 500
  const showsSearchOption = document.getElementsByClassName("shows-searchbar-flexcontainer");
  const animation = document.getElementById("hideMeAfter15Seconds");

  const FETCHOK = 200;
  const BADURL = 404;
  const SERVER_ERROR = 500;

  let allShows;
  let allShowsTotal;
  let showNumber = 0;
  let padSize;
  let errorMessages = "";
  let saveAllEpisodes;
  let saveShowNumber;
  let globalCount = 0;
  let showsListFlag = true;     // Indicate if the Shows List is displayed
  let showsListFiltered = false; // Indicate if the Shows List is filtered

// Event Listeners
  episodesSearchBar.addEventListener("keyup", episodesSearchFunction);
  episodeSelectMenu.addEventListener("change",jumpToEpisode);
  showSelectMenu.addEventListener("change",selectShow);
  homeButton.addEventListener("click",displayShowsList);
  showsSearchBar.addEventListener("keyup", showsSearchFunction);

  let tvmInfoDiv;
  let allEpisodes;
  let allEpisodesTotal;
  let episodesSearchText = ""; // this variable needs to be global
  episodesSearchBar.value = "";
  let showsSearchText = ""; // this variable needs to be global
  showsSearchBar.value = "";
  let filterChanges; // Keep track of all changes when filtering the Shows List Display
  let rememberIdLoc = {}; // Keep tract of all the Nnnn IDs


  /*** 
  * THERE IS AN OBSCURE BUG WHICH I CANNOT FIGURE OUT TO DO WITH allShows[index].genres
  * FIRSTLY, SOMEWHERE, SOMEHOW, allShows[index].genres IS CHANGED FROM A STRING TO AN ARRAY!!
  * SECONDLY, ITS VALUE GETS CHANGED (AFTER IT HAS BEEN INITIALISED) SOMEHOW, SOMEWHERE?? I JUST CANNOT SEE WHERE!
  * SO I HAVE GOING TO USE A TOTALLY SEPARATE ARRAY TO HOLD 'genres'
  ***/

  const genresTable = [];

  // Commence Setup
  window.onload = setup;

  /* Align the Show Search Bar when instructions are being shown */

// THIS DIDN'T WORK!!
//   animation.addEventListener('animationstart', () => {
//       showsSearchBar.style.marginTop = "4em";
// })

  animation.addEventListener('animationend', () => {
      showsSearchBar.style.marginTop = "0em";
})

function setup() {

  showsSearchBar.style.marginTop = "4em"; // Align the Show Search Bar when instructions are being shown - WORKAROUND - SEE ABOVE
  // Retrieve all available shows   
  allShows = getAllShows();
  allShowsTotal = allShows.length;

  // Set Up the shows list
  shows_list_setup();
  footer_setup();
  showsSearchBar.focus(); // Set focus here
}

function getEpisodesPage(event) {
    // event.target.id will be either of the form IMnnnn for a clicked Show Image OR of the form Mnnnn for a clicked Show Name
    let theId = event.target.id;
    episodesSearchBar.value = "" // Ensure episodes SearchBox is cleared

    if (theId.startsWith('M'))
            theId = +theId.substr(1);
    else if (theId.startsWith('IM'))
            theId = +theId.substr(2);
    else {
                hideViews();
                alert("An Internal Error has occurred. Mnnn/IMnnn expected,\nInstead got " + theId +
                      "Please investigate - Application terminated");
                throw new Error(`An Error Has Occurred. ID = ${theId}`); // Terminate the program     
         };

    showNumber = allShows.findIndex(element => element.id === theId);
    // Doubtful but just in case if something went wrong
    if (showNumber < 0) {
                               hideViews();
                               alert(`An Internal Error has occurred. Could not find Show with this ID: ${theId}\nApplication terminated`);
                               throw new Error(`ID Error Has Occurred. ID = ${theId}`); // Terminate the program     
    };   


    // Handle Episodes Processing
    fetchShowAndEpisodes();
}

function fetchShowAndEpisodes() {
      let currentShowID = allShows[showNumber].id; // Fetch Show ID from the array
      let fetchRequest = `https://api.tvmaze.com/shows/${currentShowID}/episodes`;

      fetch(fetchRequest)
        .then(response => {
                let status = response.status;

                if (status === 200) // successful FETCH
                {
                    return response.json(); // CHAIN THE JSON DATA
                }

                else if (status === 500) {
                    hideViews();
                    alert("An Internal Server Error has occurred.\nPlease investigate your Server Application.");
                    throw new Error(`An Error Has Occurred. Error Code = ${status}`); // Terminate the program
                }

                else if (status === 404) {
                    errorMessages += `<p>404 Error Occurred wuth ${currentShowID}</p>`;
                    update_footer_text(); // Update Footer Text Error Messages
                    hideViews();
                    alert(`It appears that An Incorrect Link Has Been Used.\nPlease Check This Link :"${currentShowID}"`);
                    displayShowsList()
                }

                else {
                    errorMessages += `<p>${message}</p>`;
                    update_footer_text(); // Update Footer Text Error Messages
                    hideViews();
                    let message = `An Error Has Occurred whilst loading "${currentShowID}". Error Code = ${status}`; 
                    alert(message);
                    displayShowsList()
                };               
            })

        .then(data => {
                           // Retrieve all the episodes
                           allEpisodes = data;
                           allEpisodesTotal = allEpisodes.length;

                           padding_setup();
                           episodes_setup();
                      })

        .catch(error => {
                           let message = `There is an issue regarding: ${fetchRequest} - Show: ${allShows[showNumber].name}`;
                           let message2 = `${error.name}: ${error.message}`
                           errorMessages += `<p>${message} - ${message2}</p>`;
                           update_footer_text(); // Update Footer Text Error Messages
                           hideViews();
              alert(`${message}\nThe data structure of this show does not match the expected Data Structure of an Episode. Load Aborted.\n${message2}`);
                           displayShowsList()
                        });
}

function update_footer_text() {
          if (errorMessages != "")
                   errorMessagesElement[0].innerHTML = errorMessages;    
}

// Taken from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function padding_setup() {
        let len = String(allEpisodesTotal).length; // how many digits does the total number of shows have?
        if (len <= 2) 
              padSize = 2;
        else  
              padSize = len;
}

function episodes_setup() {     
    showsSearchOption[0].style.display = "none"; // Hide the Show Search Bar
    showsList[0].style.display = "none"; // Hide the Shows List view
    showsListFlag = false; // Indicate that no longer showing the Shows List
    episodesDisplay[0].style.display = "block"; // Display the Episodes List view

  // remove previous display
    removeChildren(mainDisplayDiv); 
    removeChildren(episodeSelectMenu);
    removeChildren(showSelectMenu);


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

    showAllEpisodes(true); // display all episodes

    // Update error messages display
    update_footer_text();  

    showName[0].innerText = allShows[showNumber].name; // Display the name of the show
    episodesSearchBar.focus(); // Set focus here
    // However scroll to the top of the page
     document.body.scrollTop = 0; // For Safari
     document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function footer_setup() {
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

    update_footer_text();  // If there were issues regarding the Fetching of Shows - display error messages in the Footer
}

function displayShowsList() {
      // Hide the Episodes List view
     episodesDisplay[0].style.display = "none";
     showsSearchOption[0].style.display = "flex"; // Display the Show Search Bar
     showsList[0].style.display = "block";        // Display the Shows List view
     showsListFlag = true;                        // Indicate this
   
     if (showsListFiltered) {
          reverseChanges() // Reverse all the Changes Made
          showAllEntries();
     }     

     showsSearchText = ""; // ensure BOTH blank
     showsSearchBar.value = "";
     showsSearchBar.style.marginTop = "4em"; // Align the Show Search Bar when instructions are being shown
     showsSearchBar.focus(); // Set focus here
}

function hideViews() {
     if (showsListFlag)
              return;

     // Hide the Show Selector view 
     showsList[0].style.display = "none";
     // Hide the Episodes List view
     episodesDisplay[0].style.display = "none";     
     // Hide the Show Search Bar
     showsSearchOption[0].style.display = "none";
     sleep(100); // 0.1 seconds delay
}

function populateShowMenu() {

     for (let i = 0;i < allShows.length; i++) {
              let option = document.createElement('option');
              option.value =  i // allShows[i].id; // EG id: 82 for 'Game of Thrones'
              option.text = allShows[i].name; // EG 'Game of Thrones'
              showSelectMenu.appendChild(option);
                                         };  
}

function showAllEpisodes(setup_options) {
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

    episodeDiv.setAttribute("id",fetchEpisodeSeason_Suffix(source)); // I.E. the 'id' will be called S01E01

    let episodeInfo = fetchEpisodeSeason_Full(source); // EG Winter is Coming - S01E01
    const text = document.createElement('h1');
    text.classList.add('episode-title');
    text.innerText = episodeInfo;
    episodeDiv.appendChild(text); // add the title

    addImage(episodeDiv,source,episodeInfo);

    
    // Show with ID# 3353 (Kyxhr) had a 'null' summary - cater for it
    if (!source.summary) // i.e. ensure it is a string
            source.summary = "";

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

// Instead of using innerHTML, remove the <p></p> and use innerText instead
function handle_paragraph(text) {
      text = removeHTML(text); // remove any <p> </p>
      let paragraph = document.createElement("p");
          paragraph.innerText = text;
          return paragraph;
}

// Perform a 'live' search regarding the Episodes
function episodesSearchFunction(useThisValue) {
 
   episodesSearchText = episodesSearchBar.value.trim(); // this is the keyed-in value as the user types
   removeChildren(mainDisplayDiv); // remove previous display
   if (!episodesSearchText) // empty input - show all episodes
   {
         showAllEpisodes(false);
         return;
   };
  
   let lowerCase = episodesSearchText.toLowerCase();

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

// Perform a 'live' search regarding the Shows List
function showsSearchFunction(keyedValue) {
 
   showsSearchText = showsSearchBar.value.trim(); // this is the keyed-in value as the user types
 
    if (showsListFiltered) {
          reverseChanges() // Reverse all the Changes Made
          showAllEntries();
    }

   if (!showsSearchText) // empty input - all shows shown
   {
         showsSearchBar.value = ""; // ensure blank
         return;
   };

   // IGNORE < OR >
   if (ignoredChars(keyedValue.keyCode)) {
         return;
   }
  
   let lowerCase = showsSearchText.toLowerCase();

   // filter out matching shows
   performFilter(lowerCase);
   return
}

// IGNORE < OR >  
function ignoredChars(keyCode) {
  const OPENANGLED = 188, CLOSEANGLED = 190;
  let theString;

      if (keyCode === OPENANGLED)
      {
          theString = "<"
      } 

      else if (keyCode === CLOSEANGLED)
      {
          theString = ">"
      }

      else
          return false;
      
      // REMOVE THE CHARACTER & UPDATE THE VALUE 
      showsSearchText = showsSearchText.replaceAll(theString,"");
      showsSearchBar.value = showsSearchText;
      return true;      
}

function fetch_N_ID(index) {
        let theIndex = String(index);
        if (theIndex in rememberIdLoc)
               return rememberIdLoc[theIndex];

        rememberIdLoc[theIndex] = document.getElementById("N" + theIndex);
        return rememberIdLoc[theIndex];
}

function hideShow(index) {
    let theEntry = fetch_N_ID(index); // Each entry as an ID of the form Nnnn
    theEntry.style.display = "none";
    showsListFiltered = true; // Indicate changes made
}

function unHideShow(index) {
    let theEntry = fetch_N_ID(index); // Each entry as an ID of the form Nnnn
    if (theEntry.style.display === "none")
          theEntry.style.display = "grid"; // Note: each entry is a CSS Grid
}

function showAllEntries() {
      showsListFiltered = false; // Filter removed
      allShows.forEach( (element, index) => unHideShow(index) );     
}


/*
    Filter out all matching shows :-
    The Algorithm Used:
    Begin with the full display of ALL the Shows
    Then for each entry
    Check whether there is a match?
    If there is no match - hide the display of that Show
    If there is a match then amend the HTML to show the search term as coloured text and display the entry
    Keep a record of every entry that as had its text coloured in order to restore back to no colour
    In the end, all that should be displayed are the Show Entries that smatch 'searchText'
*/
function performFilter(searchText) {
           
    filterChanges = {}; // reset

    allShows.forEach( (element, index) => {
            if (! (element.name.toLowerCase().includes(searchText) || element.summary.toLowerCase().includes(searchText) ||
                                                                      fetchGenres(index).toLowerCase().includes(searchText)) ) {
                          hideShow(index);     
                          return;                                        
                                                                     }

            let theId = "N" + index; // Each entry as an ID of the form Nnnn
            processHTML(theId,searchText,element,filterChanges,index)
            return
                                                    }
    );
}

  /*
  Convert each non alphanumeric character of a string so that it can be used in a regex without it having any special meaning
  For example, . has a special meaning in regular expressions so instead of using \. use \u002E instead
  Likewise ()^$? ETC - all REGEX METACHARACTERS so use the for \uHHHH instead

  \uhhhh	Matches a UTF-16 code-unit with the value hhhh (four hexadecimal digits).
  */

  function convertEachChar(string) {
            return string.split("").map(c => /[A-Za-z0-9]/.test(c) ? c : `\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`)
                                                          .join("")
  }

  function processHTML(theId,searchText,element,changes,index) {
/*
    Remove any possibility of the searchText being part of a HTML tag
    e.g. if the user types 'p' it ought NOT to match <p></p>

    JavaScript does not support regex lookbehind assertions so what follows isc
    a convoluted workaround using regex - you have been warned :)

    REGEX: <[^>]*(SEARCHTEXT).*?>
*/

  let localChanges = [];
  let tagCount,newHTML,theText;

  // NESTED FUNCTIONS for Scoping reasons

      function replaceTags(match) {

 // EG 'p' Matches <img class="show-image" id="IM167" src="http://static.tvmaze.com/uploads/images/medium_portrait/0/2330.jpg">
 // as well as <p class="item"> <p> </p> ETC 

           ++tagCount; // Indicate that a change is about to be made
          // replace with <number> which is a meaningless HTML tag

          // Record the match in order to restore it later
           localChanges[tagCount] = match;
         
           return `<${tagCount}>`;          
      }

      function putChangesBack() {
      // <number> - number being 1 to tagCount, note: zero is EMPTY
      // LIFO order
      for (let i = tagCount; i > 0; --i) {
                 newHTML = newHTML.replace(`<${i}>`, localChanges[i])
            }
      }


      // ******* function  processHTML() starts here *******

      let regex = new RegExp("<[^>]*" + convertEachChar(searchText) + ".*?>","gi"); //  REGEX: <[^>]*(SEARCHTEXT).*?> 
      // EG for '<p>' ==> REGEX: <[^>]*\u0070.*?>
   
      theIndex = String(index); // convert number to a string for usage in an Object

      tagCount = 0;
      theText = element.summary;
      if (theText.toLowerCase().includes(searchText))
      {
                newHTML = theText.replace(regex,replaceTags);
                
                if (newHTML.toLowerCase().includes(searchText)) // searchText Definitely exists in the text - amend the HTML
                {
                    // Keep a record of the original text to restore later
                    if (!(theIndex in changes)) 
                              changes[theIndex] = {}; 
                    
                    changes[theIndex].summary = theText;

                    // Convert 'plain text' into REGEX before matching 
                    regex = new RegExp(convertEachChar(searchText),"gi"); // global, case-insensitive 

                    // $&	Inserts the matched substring.
                    
                    newHTML = newHTML.replace(regex,"<span class='colouredtext'>$&</span>");
                    showsListFiltered = true; // Indicate changes made
                    
                    
                    // EG each e<span class='colouredtext'>p</span>isode 
                    // IE each episode

                    if (tagCount) 
                          putChangesBack(); // restore the HTML tags

                    let findElement = document.querySelector("#" + theId + " .show-summary"); // SPACE:  descendant combinator EG #N0 .show-summary

                    findElement = findElement.firstChild.firstChild;
                    changes[theIndex].summaryNode = findElement;
                    findElement.innerHTML = newHTML;       
                }                  
      }

 
      theText = element.name;
      if (theText.toLowerCase().includes(searchText)) // searchText Definitely exists in the text - amend the HTML
      {
                // Keep a record of the original text to restore later
                if (!(theIndex in changes)) 
                              changes[theIndex] = {}; 
                
                changes[theIndex].name = theText;
                // Convert 'plain text' into REGEX before matching 
                let regex = new RegExp(convertEachChar(searchText),"gi"); // global, case-insensitive 
                // EG for '2' ==> \u0032 ==> <span class='colouredtext'>2</span>

                // $&	Inserts the matched substring.
                newHTML = theText.replace(regex,"<span class='colouredtext'>$&</span>");
                showsListFiltered = true // Indicate changes made

                let findElement = document.querySelector("#" + theId + " .list-show-name"); // SPACE:  descendant combinator EG #N0 .list-show-name
                changes[theIndex].nameNode = findElement;
                findElement.innerHTML = newHTML;                  
      }

      tagCount = 0;

      theText = fetchGenres(index); 

      if (theText.toLowerCase().includes(searchText))
      {

 /* NEED TO HANDLE THE FOLLOWING TYPE OF HTML:
    <strong>Genres: </strong><p>Action | Drama | Supernatural</p>
    So firstly, locate the relevant string and fetch from the DOM
*/

         let k;
         // find the GENRES Child Node
         let findElement = document.querySelector("#" + theId + " .theshow-genres");

         let children = findElement.children;
                
         let found = false;

 /*        
   Search for Genres
   The Genres string is located in the sibling that follows the <strong>Genres: </strong>
   EG
   PARENT: <p class="theshow-genres"><
                  <strong>Genres: </strong>
                  <span>Action | Drama | Thriller</span></p>
 */

         for (k = 0; k < children.length; k++) {
              // Search for Genres
              if (children[k].innerText.startsWith("Genres"))
              {     ++k // k incremented to point to the Genres
                    found = true;                                                  
                    break
              }
         }

         if (!found) // doubtful but just in case!
             return;

         // the actual HTML of the Genres entry e.g.
         // <strong>Genres: </strong><p>Action | Drama | Supernatural</p>
         theText = children[k].innerHTML;

         let regex = new RegExp("<[^>]*" + convertEachChar(searchText) + ".*?>","gi"); //  REGEX: <[^>]*(SEARCHTEXT).*?> 
         // EG for '<p>' ==> REGEX: <[^>]*\u0070.*?>

         newHTML = theText.replace(regex,replaceTags);
          
         if (newHTML.toLowerCase().includes(searchText)) // searchText Definitely exists in the text - amend the HTML
         {

                // Keep a record of the original text to restore later
                if (!(theIndex in changes)) 
                              changes[theIndex] = {};

                changes[theIndex].genresNode = children[k];
                changes[theIndex].genres = children[k].innerHTML;


                // Convert 'plain text' into REGEX before matching 
                regex = new RegExp(convertEachChar(searchText),"gi"); // global, case-insensitive

                // $&	Inserts the matched substring.
                newHTML = newHTML.replace(regex,"<span class='colouredtext'>$&</span>");
                showsListFiltered = true // Indicate changes made

                if (tagCount) 
                        putChangesBack(); // restore the HTML tags

                // EG innerHTML: "Action | <span class=\"colouredtext\">D</span>rama | Thriller"
                // IE Action | Drama | Thriller

                children[k].innerHTML = newHTML;
          }    
      }     
 }

      /*** 
       * NOTE: THIS IS A WORKAROUND BECAUSE OF AN OBSCURE BUG WHICH I CANNOT FIGURE OUT
       * SOMEWHERE, SOMEHOW, allShows[index].genres IS CHANGED FROM A STRING TO AN ARRAY!!
      ***/

// the genres string hs been computed earlier and is kept in the genresTable array 
function fetchGenres(index) {

      return genresTable[index];
} 

function reverseChanges() { // Reverse all the Changes Made
       showsListFiltered = false;
       for (index in filterChanges)
       {
           if ("summary" in filterChanges[index]) {
                  filterChanges[index].summaryNode.innerHTML = filterChanges[index].summary;
           }

           if ("name" in filterChanges[index]) {
                  filterChanges[index].nameNode.innerText = filterChanges[index].name;
           }

           if ("genres" in filterChanges[index]) {
                  filterChanges[index].genresNode.innerHTML = filterChanges[index].genres;
           }
       }
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
            paragraph.classList.add('colouredtext');
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

    let delay = 3000; // see below

  // If search results are currently being displayed
  // reset display first by showing ALL episodes
    if (episodesSearchText !== "")
    {
       // reset these values
       episodesSearchText = "";
       episodesSearchBar.value = "";
       removeChildren(mainDisplayDiv); // remove previous display
       showAllEpisodes(false); // show all episodes
    }

/*
   Originally for the 'border effect :-
   I was using episode.classList.toggle('blue-border'); a constant delay of 3000 and setInterval
   However some inconsistencies appeared at Level 400 when the 'same' episode is selected more than once in a row!
   So I now use episode.classList.add('blue-border'); a variable 'delay' with an initial value of 3000
   and setTimeout
*/
    let episode = document.getElementById(event.target.value);

    if (episode.style.border != "") // bug fix for Level 400: necessary to display border properly ???
    {
             episode.style.border="";
             delay+=3000; // extend the delay
    }

    // set focus on the selected episode
    episode.setAttribute('tabindex', '-1'); 
    episode.focus();
    episode.removeAttribute('tabindex');

    // Scroll to the selected episode
    episode.scrollIntoView();


    // reset the dropdown menu
    episodeSelectMenu.selectedIndex = 0;

    // Border Functionality
    episode.classList.add('blue-border');
    setTimeout(function(episode) {episode.style.border = "none";},
                        3000, episode);
    if (delay>3000) { // bug fix for Level 400: need to REPEAT identical Timeout to display border properly
                    episode.classList.add('blue-border');
                    setTimeout(function(episode) {episode.style.border = "none";},
                                        delay, episode);
                    }   
}

function selectShow(event) {
       // reset these values
       episodesSearchText = "";
       episodesSearchBar.value = "";
       // Make a copy of the current Episodes details; just in case an error occurs
       saveAllEpisodes = [...allEpisodes];
       saveShowNumber = showNumber;
       showNumber = +event.target.value; // this is the selected show's details position in the allShows array
       fetchShowAndEpisodes(); // Load the episodes
}

function shows_list_setup() {

     let offset = 0; 
  // Hide the Episodes List view
     episodesDisplay[0].style.display = "none";

  // Sort all the shows into alphabetical (case-insensitive) order
     allShows.sort(function (show1, show2) {
                        let showX = show1.name.toLowerCase();
                        let showY = show2.name.toLowerCase();
                        return showX.localeCompare(showY);
                      });

     let errorArray = []; // Record & remove any erroneous entries
  // Populate the Shows List
     allShows.forEach((element,index) => {
                             globalCount++;
                             let ok = createShowEntry(element,index + offset);
                             if (!ok) {
                                         // Erroneous entry - record index
                                         errorArray.push(index);

     // If an entry is going to be removed, add offset to the current index i.e.
     // if entry 51 is going to be deleted, ensure that the next entry wll be given the index of 51
     // 1) by subtracting one from 'offset' = -1
     // 2) then add that to the current value of 'index'; so that index 52 + -1 = 51
                                         --offset;    
                                      }
                                          });

     if (errorArray.length > 0)
     {
        // remove any erroneous entries from allShows
        while (errorArray.length > 0)
        {
            let entry = errorArray.pop(); // highest entries at the back of the array - so start from the back
            allShows.splice(entry, 1); // remove entry 
        };

        allShowsTotal = allShows.length;

        if (allShowsTotal === 0) // very doubtful
        {
                    alert("Catastrophic error has occurred - no shows were loaded. The shows source appears empty.");
                    throw new Error(`Could not load shows.`); // Terminate the program
        };
    }
}

// CREATE A SHOW ENTRY

/* Create for example:

  <div class="show-entry">
      <div class="first-column">
          <figure>
            <img
              class="show-image"
              id="IM1"
              src="http://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg"
            />
          </figure>
          <h2 class="list-show-name" id="M1">Game of Thrones</h2>
      </div>
      <div class="show-summary">
            <p>Here is some text</p>
            <p>
              Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
              vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
              amet quam egestas semper. Aenean ultricies mi vitae est. Mauris
              placerat eleifend leo. Quisque sit amet est et sapien ullamcorper
              pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae,
              ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
              condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac
              dui.
            </p>
      </div>
      <p class="theshow-website">Official Website: movies.com</p>
      <p class="theshow-premiered">Premiered: 22nd February 1990</p>
      <p class="theshow-rated">Rated: 8.5</p>
      <p class="theshow-genres">Genres: abc | def | high</p>
      <p class="theshow-status">Status: running</p>
      <p class="theshow-runtime">Runtime: 60 minutes</p>        
    </div>

*/

function createShowEntry(element, index) {
          
          let theDiv0 = document.createElement("div");
          theDiv0.setAttribute("class", "first-column");

          let img = document.createElement("img"); // SHOW IMAGE
          img.setAttribute("class", "show-image");
          img.setAttribute("id","IM" + element.id); // I.E. the 'id' for this image will be called for example, for Game of Thrones, IM82
          // Discovered for example - Show: "Cosmos", ID:1127 has no image!!
          if (!element.image) {
                    let message = `The Show: ${element.name} - ID: ${element.id} has no image. Load Aborted.`; 
                    errorMessages += `<p>${message}</p>`;
                    return false; // Indicate that this entry was not successful
          }

          img.src = element.image.medium;
          img.addEventListener("click", getEpisodesPage); // Add a CLICK Listener

          const figure = document.createElement("figure");
          figure.append(img);

          theDiv0.append(figure);  

          let header = document.createElement("h2"); // SHOWNAME
          header.setAttribute("class", "list-show-name");
          header.setAttribute("id","M" + element.id); // I.E. the 'id' for the Show Name will be called for example, for Game of Thrones, M82
          header.innerHTML = element.name;
          header.addEventListener("click", getEpisodesPage); // Add a CLICK Listener          

          theDiv0.append(header);  

          let paragraph = document.createElement("p"); // SHOW SUMMARY
          paragraph.innerHTML = element.summary;

          let theDiv1 = document.createElement("div");
          theDiv1.setAttribute("class", "show-summary");
          theDiv1.append(paragraph);          

          let website_paragraph = document.createElement("p"); // OFFICIAL WEBSITE
          website_paragraph.setAttribute("class", "theshow-website");
          let boldText = document.createElement("strong");
          boldText.innerText = "Official Website: "
          website_paragraph.append(boldText)

          if (element.officialSite)
          {
              let theLink = create_link(element.officialSite,element.officialSite);
              website_paragraph.append(theLink);
          }

          let premiered_paragraph = document.createElement("p"); // PREMIERED
          premiered_paragraph.setAttribute("class", "theshow-premiered");
          boldText = document.createElement("strong");
          boldText.innerText = "Premiered: "
          premiered_paragraph.append(boldText)

          let paragraph2 = document.createElement("span");
          if (element.premiered)
          {
              let theDate = convertFromYYYYMMDD(element.premiered)
              paragraph2.innerText = theDate;
              premiered_paragraph.append(paragraph2);
          }

          let rated_paragraph = document.createElement("p"); // RATED
          rated_paragraph.setAttribute("class", "theshow-rated");
          boldText = document.createElement("strong");
          boldText.innerText = "Rated: "
          rated_paragraph.append(boldText)

          paragraph2 = document.createElement("span");
          if (element.rating.average)
          {
              paragraph2.innerText = String(element.rating.average);
              rated_paragraph.append(paragraph2);
          }

          let genres_paragraph = document.createElement("p"); // GENRES
          genres_paragraph.setAttribute("class", "theshow-genres");
          boldText = document.createElement("strong");
          boldText.innerText = "Genres: "
          genres_paragraph.append(boldText)

          // If GENRES is null, use TYPE instead
          let genresArray = [];
          
          if (Array.isArray(element.genres) && element.genres.length > 0) {
                 genresArray = [...element.genres];
                 genresArray.sort(); // SORT THEM ALPHABETICALLY
          }

          else if (element.type !== "")
                  genresArray = [element.type];

          paragraph2 = document.createElement("span");
          // New array 'genresTable' incorporated so that Search can be done by 'genre'
          paragraph2.innerText = genresTable[index] = genresArray.join(" | ");

          genres_paragraph.append(paragraph2);

          let status_paragraph = document.createElement("p"); // STATUS
          status_paragraph.setAttribute("class", "theshow-status");
          boldText = document.createElement("strong");
          boldText.innerText = "Status: "
          status_paragraph.append(boldText)

          paragraph2 = document.createElement("span");
          if (element.status)
          {
              paragraph2.innerText = element.status;
              status_paragraph.append(paragraph2);
          }

          let runtime_paragraph = document.createElement("p"); // RUNTIME
          runtime_paragraph.setAttribute("class", "theshow-runtime");
          boldText = document.createElement("strong");
          boldText.innerText = "Runtime: "
          runtime_paragraph.append(boldText)

          paragraph2 = document.createElement("span");
          if (element.runtime)
          {
              paragraph2.innerText = `${element.runtime} minutes`;
              runtime_paragraph.append(paragraph2);
          }

          let showEntryDiv = document.createElement("div");
          showEntryDiv.setAttribute("class", "show-entry");
          // the 'id' for the entire Show Entry will be called for example, N10.
          // The number being the index of the allShows array
          showEntryDiv.setAttribute("id","N" + index); 

          showEntryDiv.append(theDiv0);
          showEntryDiv.append(theDiv1);
          showEntryDiv.append(website_paragraph);
          showEntryDiv.append(premiered_paragraph);
          showEntryDiv.append(rated_paragraph);
          showEntryDiv.append(genres_paragraph);
          showEntryDiv.append(status_paragraph);
          showEntryDiv.append(runtime_paragraph);

//          if (globalCount > 1) // All but the top one, remove the top border
//                  showEntryDiv.style.borderTop = "none";

          // Append the new Show Entry
          showsList[0].append(showEntryDiv);
          return true; // Indicate Success
}

function create_link(text,url) {
    let theLink = document.createElement("a");
    theLink.href = url;        
    theLink.textContent = text;
    theLink.setAttribute('target', '_blank'); // Open in another tab
    return theLink;
}

function convertFromYYYYMMDD(inputDate) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

    //        0123456789
    // Fornat YYYY-MM-DD
    let newDate = new Date(+inputDate.substr(0,4), +inputDate.substr(5,2) - 1, +inputDate.substr(8,2))  
    return `${String(newDate.getDate())} ${monthNames[newDate.getMonth()]} ${String(newDate.getFullYear())}`
}
