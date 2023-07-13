# TV Show DOM Project

[Live Link](https://cyf-delroygayle-tv.netlify.app/)  

A starting point for CYF's TV show DOM project

The requirements for the project are here:

[https://github.com/CodeYourFuture/syllabus/tree/master/docs/js-core-3/tv-show-dom-project](https://github.com/CodeYourFuture/syllabus/tree/master/docs/js-core-3/tv-show-dom-project)

## Requirements

1. Works with the following API as documented here: [https://www.tvmaze.com/api#show-episode-list](https://www.tvmaze.com/api#show-episode-list)
2. For each episode, AT LEAST the following must be displayed:
* the episode's name
* the season number
* the episode number
* the episode's medium-sized image
* the episode's summary text

3. Your page should state somewhere that the data has (originally) come from TVMaze.com
* Moreover, it must link back to that site (or the specific episode on that site). 
4. Add a "live" search input
5. Add an Episode Selector
* The select input should list all episodes in the format: "S01E01 - Winter is Coming"
* When the user makes a selection, they should be taken directly to that episode in the list
6. Add a Show Selector
* This show select must list shows in alphabetical order, case-insensitive.
7. Add a shows list and search
8. When your app starts, present a listing of all shows
9. When a show name is clicked, your app should fetch and present episodes from that show 
*  For each show, you must display at least name, image, summary, genres, status, rating, and runtime.
10. Provide a free-text show search through show names, genres, and summary texts.
