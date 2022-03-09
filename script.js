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

  const FETCHOK = 200;
  const BADURL = 404;
  const SERVER_ERROR = 500;

  const EPISODES_DISPLAYED = 0;
  const FILTERED_SHOWS_DISPLAYED = 1;
  const ALL_SHOWS_DISPLAYED = 2;

  let allShows;
  let allShowsTotal;
  let showNumber = 0;
  let padSize;
  let errorMessages = "";
  let saveAllEpisodes;
  let saveShowNumber;
  let globalCount = 0;
  let showsListFlag;     // Indicate if the Shows List is displayed
  let showsListFiltered; // Indicate if the Shows List is filtered

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

  // Commence Setup
  window.onload = setup;

function setup() {
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

    showAll(true); // display all episodes

    // Update error messages display
    update_footer_text();  

    showName[0].innerText = allShows[showNumber].name; // Display the name of the show
    episodesSearchBar.focus(); // Set focus here
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
     showsList[0].style.display = "block";  // Display the Shows List view
     showsListFlag = true;                  // Indicate this

}

function hideViews() {
     if (showsListFlag)
              return;

     // Hide the Show Selector view 
     showsList[0].style.display = "none";
     // Hide the Episodes List view
     episodesDisplay[0].style.display = "none";     
     sleep(100); // 0.1 seconds delay
}

function populateShowMenu() {

     for (let i=0;i<allShows.length;i++) {
              let option = document.createElement('option');
              option.value =  i // allShows[i].id; // EG id: 82 for 'Game of Thrones'
              option.text = allShows[i].name; // EG 'Game of Thrones'
              showSelectMenu.appendChild(option);
                                         };  
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
       let elem = displayMessage[0]; // xxx
       elem = document.querySelector('#homebutton');
       elem = displayMessage[0];
        elem = document.querySelector('#homebutton');
let rect = findPos(elem);
console.log("x: "+ rect[0]+window.scrollX);
console.log("y: "+ rect[1]+window.scrollY);

elem.style.left = (Number(94)) + "px";
}

function findPos(obj) {
	var curleft = curtop = 0;

  // Every time we find a new object, we add its offsetLeft and offsetTop to curleft and curtop.

	do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent); //  I use the = assignment operator to change the value of obj to obj.offsetParent.

// Finally, when the while loop has quit, we return an array with the calculated coordinates 
	return [curleft,curtop];
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
         showAll(false);
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
function showsSearchFunction(useThisValue) {
 
   showsSearchText = showsSearchBar.value.trim(); // this is the keyed-in value as the user types

   // showAllShows() // Do this to begin with //++
   //removeChildren(mainDisplayDiv); // remove previous display
   
   if (!showsSearchText) // empty input - all shows shown
   {
         return;
   };
  
   let lowerCase = showsSearchText.toLowerCase();

   // filter out matching shows
   performFilter(lowerCase);
return
   // filter out matching shows
   const searchResults = allshows.filter(element => element.name.toLowerCase().includes(lowerCase) ||
                                                       element.summary.toLowerCase().includes(lowerCase));
   
   if (!searchResults.length) // No match so ignore
            return;

  for (let i = 0; i < searchResults.length; i++)
         displaySearchResults(i,searchResults[i],lowerCase);

  // Display the number of shows found       
  displayMessage[0].innerText = `Displaying ${searchResults.length}/${allshowsTotal} episodes.`;
}

function hideShow(index) {
    let theEntry = document.getElementById("N" + index); // Each entry as an ID of the form Nnnn
    theEntry.style.display = "none";
}

/*
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
    let changes = [];
    let nameChanges = [];
    let showChanges = [];
  

   
    allShows.forEach( (element, index, theArray) => {
            if (! (element.name.toLowerCase().includes(searchText) || element.summary.toLowerCase().includes(searchText) ||
                                                                      element.genres.toLowerCase().includes(searchText)) ) {
                          hideShow(index);     
                          return;                                        
                                                                     }

            let theId = "N" + index;
            let theEntry = document.getElementById("N" + index); // Each entry as an ID of the form Nnnn                                                                     
            processHTML(theId,theEntry,searchText,element,changes,index)
    }
      
          
    );

}

  function processHTML(theId,theEntry,searchText,element,changes,index) {
/*
    Remove any possibility of the searchText being part of a HTML tag
    e.g. if the user types 'p' it ought NOT to match <p></p>

    Javascript does not support regex lookbehind assertions so what follows is
    a convoluted workaround using regex - you have been warned :)

    REGEX: <[^>]*(SEARCHTEXT).*?>
*/

let usingName = true, usingSummary = false, usingGenre = false;
let localChanges = [];
const SUMMARY = 0, NAME = 1, GENRES = 2;
let tagCount,textCount,newHTML,theText;

  // NESTED FUNCTION for Scoping reasons

      function replaceTags(match) {

 // EG 'p' Matches <img class="show-image" id="IM167" src="http://static.tvmaze.com/uploads/images/medium_portrait/0/2330.jpg">
 // as well as <p class="item"> <p> </p> ETC 

           ++tagCount; // Indicate that a change is to be made
          // replace with <@number> which is an illegal HTML entry

          // Record the match in order to restore later
          localChanges[tagCount] = match;
         
          return `<@${tagCount}>`;          
      }

      function putChangesBack() {
      // <@number> - number being 1 to tagCount, note: zero is EMPTY
      for (let i=tagCount; i>0; --i) {
                 newHTML = newHTML.replace(`<@${i}>`, localChanges[tagCount])
            }
      }

      // console.log(element.summary);
      // console.log(element.name);
      // console.log(element.genres);throw 12 /++

      let regex = new RegExp("<[^>]*" + searchText + ".*?>","gi"); //  REGEX: <[^>]*(SEARCHTEXT).*?>
   
      theIndex = String(index);

      tagCount = 0;
      theText = element.summary;
      if (theText.toLowerCase().includes(searchText))
      {
                newHTML = theText.replace(regex,replaceTags);
                if (newHTML.includes(searchText)) // Definitely exists in the text - amend the HTML
                {
                    // Keep a record of the original text to restore later
                    if (!(theIndex in changes)) 
                              changes[theIndex] = {}; 
                    }
                    changes[theIndex].summary = theText;
                    newHTML = newHTML.replaceAll(searchText,"<span class='blueText'>" + searchText + "</span>");

                    if (tagCount) 
                          putChangesBack();

                    let findElement = document.querySelector("#" + theId + " .show-summary"); // SPACE:  descendant combinator EG #N0 .show-summary
                    findElement = findElement.firstChild.firstChild;
                    console.log(changes)
                    console.log(findElement)
                    findElement.innerHTML = newHTML;                   
      }

 
      theText = element.name;
      if (theText.toLowerCase().includes(searchText)) // Definitely exists in the text - amend the HTML
      {
                // Keep a record of the original text to restore later
                if (!(theIndex in changes)) 
                              changes[theIndex] = {}; 
                
                changes[theIndex].name = theText;
                newHTML = theText.replaceAll(searchText,"<span class='blueText'>" + searchText + "</span>");

                let findElement = document.querySelector("#" + theId + " .list-show-name"); // SPACE:  descendant combinator EG #N0 .list-show-name
                    console.log(changes)
                    console.log(findElement)
                    findElement.innerHTML = newHTML;
          throw ("ebd")
                    
  
      }

  
      theText = element.genres;
      if (theText.toLowerCase().includes(searchText)) // Definitely exists in the text - amend the HTML
      {
                // Keep a record of the original text to restore later
                if (!(theIndex in changes)) 
                              changes[theIndex] = {}; 
                              console.log(theText)
                              
                
                changes[theIndex].genres = theText;
                newHTML = theText.replaceAll(searchText,"<span class='blueText'>" + searchText + "</span>");
                console.log(newHTML)
                // SPACE:  descendant combinator EG #N0 .summary-flex-container
                let findElement = document.querySelector("#" + theId + " .summary-flex-container");
                findElement = findElement.children;
                console.log(findElement)
                console.log(findElement[0]) 
                console.log(findElement[3]) 
                console.log(findElement[4]) 
                console.log(findElement[5]) 
                console.log(findElement[6])
                findElement[4].firstChild.innerHTML = newHTML;
                console.log(findElement[4]) 
                throw 12 
                    console.log(changes)
                    console.log(findElement)
                    console.log(newHTML)
                    // let el = findElement.find(':nth-child(' + '5' + ')');
                    console.log(el.innerHTML)
                    console.log(el)
                    throw 12
                  let children = findElement.children;
                    findElement = document.querySelector(".summary-flex-container: nth-child(6)"); 
                     console.log(findElement.innerHTML)
                    findElement.innerHTML = newHTML;
                    console.log(findElement.innerHTML)
          throw ("ebd")

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

    let delay = 3000; // see below

  // If search results are currently being displayed
  // reset display first by showing ALL episodes
    if (episodesSearchText !== "")
    {
       // reset these values
       episodesSearchText = "";
       episodesSearchBar.value = "";
       removeChildren(mainDisplayDiv); // remove previous display
       showAll(false); // show all episodes
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
                             let ok = createShowEntry(element,index);
                             if (!ok) {
                                         // Erroneous entry - record index
                                         errorArray.push(index);
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
        <figure>
          <img
            class="show-image"
            id="IM1"
            src="http://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg"
          />
        </figure>
        <div class="show-info">
          <h2 class="list-show-name" id="M1">Game of Thrones</h2>

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
          <div class="summary-flex-container">
            <p class="item">Official Website: movies.com</p>
            <p class="item">Premiered: 22nd February 1990</p>
            <p class="item">Rated: 8.5</p>
            <hr>
            <p class="item">Genres: abc | def | high</p>
            <p class="item">Status: running</p>
            <p class="item">Runtime: 60 minutes</p>
          </div>
        </div>
      </div>
*/

function createShowEntry(element, index) {
          
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

          let header = document.createElement("h2"); // SHOWNAME
          header.setAttribute("class", "list-show-name");
          header.setAttribute("id","M" + element.id); // I.E. the 'id' for the Show Name will be called for example, for Game of Thrones, M82
          header.innerHTML = element.name;
          header.addEventListener("click", getEpisodesPage); // Add a CLICK Listener

          let theDiv1 = document.createElement("div");
          theDiv1.setAttribute("class", "show-info");
          theDiv1.append(header);

          let paragraph = document.createElement("p"); // SHOW SUMMARY
          paragraph.innerHTML = element.summary;

          let theDiv2 = document.createElement("div");
          theDiv2.setAttribute("class", "show-summary");
          theDiv2.append(paragraph);          

          let addInfoDiv = document.createElement("div"); // ADDITIONAL: Website/Premiered/Rated/Genres/Status/Runtime
          addInfoDiv.setAttribute("class", "summary-flex-container");

          paragraph = document.createElement("p"); // OFFICIAL WEBSITE
          let boldText = document.createElement("strong");
          boldText.innerText = "Official Website: "
          paragraph.append(boldText)

          if (element.officialSite)
          {
              let theLink = create_link(element.officialSite,element.officialSite);
              paragraph.append(theLink);
          }
          addInfoDiv.append(paragraph);  

          paragraph = document.createElement("p"); // PREMIERED
          paragraph.setAttribute("class", "item");
          boldText = document.createElement("strong");
          boldText.innerText = "Premiered: "
          paragraph.append(boldText)

          let paragraph2 = document.createElement("p");
          if (element.premiered)
          {
              let theDate = convertFromYYYYMMDD(element.premiered)
              paragraph2.innerText = theDate;
              paragraph.append(paragraph2);
          }
          addInfoDiv.append(paragraph);  

          paragraph = document.createElement("p"); // RATED
          paragraph.setAttribute("class", "item");
          boldText = document.createElement("strong");
          boldText.innerText = "Rated: "
          paragraph.append(boldText)

          paragraph2 = document.createElement("p");
          if (element.rating.average)
          {
              paragraph2.innerText = String(element.rating.average);
              paragraph.append(paragraph2);
          }
          addInfoDiv.append(paragraph);  

          // FORCE A LINE BREAK USING <hr> - SEE https://stackoverflow.com/questions/29732575/how-to-specify-line-breaks-in-a-multi-line-flexbox-layout 

          let hr = document.createElement("hr");
          addInfoDiv.append(hr);

          paragraph = document.createElement("p"); // GENRES
          paragraph.setAttribute("class", "item");
          boldText = document.createElement("strong");
          boldText.innerText = "Genres: "
          paragraph.append(boldText)

          // If GENRES is null, use TYPE instead
          let genresArray = [];
          if (Array.isArray(element.genres) && element.genres.length > 0) {
                 genresArray = [...element.genres];
                 genresArray.sort(); // SORT THEM ALPHABETICALLY
          }

          else if (element.type !== "")
                  genresArray = [element.type];

          paragraph2 = document.createElement("p");
          // New field 'genres' added to allShows so that Search can be done by 'genre'
          paragraph2.innerText = allShows[index].genres = genresArray.join(" | ");
          paragraph.append(paragraph2);
          addInfoDiv.append(paragraph); 

          paragraph = document.createElement("p"); // STATUS
          paragraph.setAttribute("class", "item");
          boldText = document.createElement("strong");
          boldText.innerText = "Status: "
          paragraph.append(boldText)

          paragraph2 = document.createElement("p");
          if (element.status)
          {
              paragraph2.innerText = element.status;
              paragraph.append(paragraph2);
          }
          addInfoDiv.append(paragraph);  

          paragraph = document.createElement("p"); // RUNTIME
          paragraph.setAttribute("class", "item");
          boldText = document.createElement("strong");
          boldText.innerText = "Runtime: "
          paragraph.append(boldText)

          paragraph2 = document.createElement("p");
          if (element.runtime)
          {
              paragraph2.innerText = `${element.runtime} minutes`;
              paragraph.append(paragraph2);
          }
          addInfoDiv.append(paragraph);

          theDiv2.append(addInfoDiv);  
          theDiv1.append(theDiv2);

          let showEntryDiv = document.createElement("div");
          showEntryDiv.setAttribute("class", "show-entry");
          // the 'id' for the entire Show Entry will be called for example, N10.
          // The number being the index of the allShows array
          showEntryDiv.setAttribute("id","N" + index); 

          showEntryDiv.append(figure);
          showEntryDiv.append(header);
          showEntryDiv.append(theDiv1);
          if (globalCount > 1) // All but the top one, remove the top border
                  showEntryDiv.style.borderTop = "none";

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
