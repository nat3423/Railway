
/**
 * Author: Nathaniel Welch
 *
 * This file builds a graph out of a defined-railway network then traverses the graph to find all paths from one
 * station to another, sorted by least stops.
 **/

/* Here we import railway.js into a variable named railway so we can call its methods */
var railway = require("./railway.js");

/**
 * Holds data for a station. On a graph this will represent the nodes of the graph.
 * Each station hold an array of links to other stations (these represent the edges 
 * of a graph).
 *@param stationID {number} The id number of the station (each station has a unique ID).
 * @param stationName {string} The name of the station.
 **/
function Station(stationID, stationName){

    this.stationName = stationName;
    this.stationID = stationID;
    this.links = [];
	
 }
 
/**
*This function adds a link to a station.
*@param {object} link The link object representing a link to another station.
**/
Station.prototype.addLink = function(link){
        this.links.push(link);
}


/**
 * Forms the links between one station and the next. This object is what allows 
 * the stations to become nodes on a graph. Essentially in graph theory  the
 * stations are the nodes and the Link objects are the edges.
 **/
function Link(routeName, station, distance){
     this.routeName = routeName;
     this.distance = distance;
     this.station = station;
     this.linkName = station.stationName;
}

/**
 * Creates a journey object with default values for all params.
 * A journey object is used to keep track of each graph traversal.
 */
function Journey(){
        this.stations = [];     // An empty array that will eventually hold all stations passed through in this journey
        this.distance = 0;      // Sets distance to 0 so it will increment correctly
        this.text = "";         // Sets the text string to an empty string
        this.success = false;   // Success defaults to false because the journey has not been completed
        this.changes = -1;      // Sets changes to -1. This isn't set to 0 because it makes a later step easier.
}

/**
 * Adds the passed in station into the journey's stations array
 * @param {Station} station the station to push onto the array
 */
Journey.prototype.addStation = function(station){
        this.stations.push(station);
}

/**
 * Copies the current journey object and returns a copy
 * @returns {Journey} the copy of the journey object
 */
Journey.prototype.copy = function(){
        let tempJourn = new Journey();
        tempJourn.stations = [...this.stations];
        tempJourn.distance = this.distance;
        tempJourn.text = this.text;
        tempJourn.success = this.success;
        tempJourn.changes = this.changes;
        return tempJourn;
}

/**
 * Increments the journey object's distance param by the amount passed in. Prints an error message if amt is not suitable
 * @param {Number} amt the amount to increment by
 */
Journey.prototype.incDistance = function(amt){
        if(typeof(amt) === "number" && amt >= 0){
                this.distance += amt;
        } else {
                console.log("The argument provided is not a number or not positive. Not incrementing distance.");
        }
}

/**
 * Finalizes and prints the journey's text field
 */
Journey.prototype.report = function(){
        this.text += "Total distance: " + this.distance + "\nChanges: " + this.changes + "\nPassing through: ";
        for(station of this.stations){
                this.text += station.stationName + ", ";
        }
        this.text += "\n\n";
        console.log(this.text);

}

/**
 * This function creates a graph object based off a passed in json file
 * @param {string} fileName the path to the json file to build the graph from
 * @returns {Graph} returns the graph created
 */
function network(fileName){
        railwayNetwork = railway.loadData(fileName);
        let graph = new Graph();
        let prevStation = null;
        let disNext = null;
        let currentStation = null;
        // Traverses every station on every route
        for(route of railwayNetwork.routes){
                for(station of route.stops){
                        // If the graph already contains the station
                        if(graph.stations.some(findStation, station.stationID)){
                                // Then find it and save it to currentStation
                                currentStation = graph.stations.find(findStation, station.stationID);
                        // If it is not in the graph
                        } else {
                                // Make a new station and save it to currentStation
                                currentStation = new Station(station.stationID, station.stationName);
                                // Then push it onto the graph
                                graph.stations.push(currentStation);
                                
                        }
                        // If this isn't the first station of the route
                        if(prevStation !== null){
                                // If the stations are not the same
                                if(currentStation.stationID != prevStation.stationID){
                                        // Adds a link from currentStation to prevStation
                                        currentStation.addLink(new Link(route.name, prevStation, disNext));
                                        // Adds a link from prevStation to CurrentStation
                                        prevStation.addLink(new Link(route.name, currentStation, disNext));
                                        // Links both ways are required at each step ^^^^
                                }
                        }
                        // Sets prevStation equal to the currentStation so we can continue down the route
                        prevStation = currentStation;
                        // Takes the distance of the next soon-to-be link
                        disNext = station.distanceToNext;
                }
                // Reset prevStation back to null everytime we go to a new route
                prevStation = null;
        }
        // Returns the graph object created
        return graph;
}
/**
 * This is a helper function for network that tests to see if a station is present in the graph
 * @param {Station} station the station to check for (if used correctly, this will be supplied by the function this is called inside of)
 */
function findStation(station){
        return station.stationID == this;
}

/**
 * Performs setup for doGetBestRoute
 * @param {Graph} graph the populated graph made by network()
 * @param {String} origin the origin station read in from the command line
 * @param {String} destination the destination station read in from the command line
 * @param {Number} max_results the max_results read in from the command line
 */
function getBestRoute(graph, origin, destination, max_results){
        let originStation = null;
        let destinationStation = null;
        // For each station in the graph
        for(station of graph.stations){
                // If the name is equal to the string passed in
                if(station.stationName === origin){
                        // Get the actual station object
                        originStation = station;
                } else if(station.stationName === destination){
                        destinationStation = station;
                }
        }
        if(originStation == null || destinationStation == null){
                console.log("One or more station cannot be found on this network.");
                process.exit(1);
        }
        let routesArray = [];
        let journey = new Journey();
        journey.stations.push(originStation);
        doGetBestRoutes(graph, originStation, destinationStation, journey, routesArray, undefined);
        routesArray = routesArray.sort(sortRoutes);
        routesArray = routesArray.slice(0, Number(max_results));
        return routesArray;
}

/**
 * Recursive algorithim for finding all paths
 * @param {Graph} graph the populated graph object
 * @param {Station} origin the starting station
 * @param {Station} destination the ending station
 * @param {Journey} journey the current Journey object
 * @param {Journey[]} routesFound the routesFound array (Same every call)
 * @param {String} routeName current route
 */
function doGetBestRoutes(graph, origin, destination, journey, routesFound, routeName){
        if(origin === destination){
                journey.success = true;
                journey.text = journey.text + "Arrive at " + destination.stationName + "\n\n\n";
                routesFound.push(journey);
        }
        // If we haven't gone through every station in the graph and journey.success is false
        if(journey.stations.length != graph.stations.length && !(journey.success)){
                // for every link at the station
                for(link of origin.links){
                        // If we haven't already been through this station
                        if(!(journey.stations.includes(link.station))){
                                // Copy the journey passed in
                                let tempJourney = journey.copy();
                                // Push the station onto the newly copied journey
                                tempJourney.stations.push(link.station);
                                // Incrememnt distance to the station
                                tempJourney.incDistance(link.distance);
                                // If the routeName has changed (triggers everytime the on the first call)
                                if(link.routeName != routeName){
                                        // if we aren't at the end
                                        if(origin.stationName !== destination){
                                                // If text has not been initalized
                                                if(tempJourney.text == ""){
                                                        // Set it to this
                                                        tempJourney.text =  "Journey Summary\n===============\nEmbark at " + origin.stationName + " on " + link.routeName + "\n";
                                                } else {
                                                        // Add this
                                                        tempJourney.text = tempJourney.text + "At " + origin.stationName + " change to " + link.routeName + "\n";
                                                }
                                        }
                                        // Increment changes
                                        tempJourney.changes++;
                                }
                                // Recursive call with the next station on the route
                                doGetBestRoutes(graph, link.station, destination, tempJourney, routesFound, link.routeName);
                        }
                }
        }
        // Return the newly populated routesFound array
        return routesFound;
}

/**
 * This is a sorting function used in getBestRoute()
 * @param {Journey} a the current element
 * @param {Journey} b the next element
 */
function sortRoutes(a, b){
        if(a.changes != b.changes){
                return a.changes - b.changes;
        } else {
                return a.distance - b.distance;
        }
}

/**
 * Displays the contents of all remaining successful journies
 * @param {Journey[]} journiesFound the array of journy objects
 */
function displayRoutes(journiesFound){
        console.log("Found " + journiesFound.length + " routes.\n");
        let i = 1;
        for(journey of journiesFound){
                console.log(i+": ");
                journey.report();
                i++;
        }
}
/**
 * Makes a graph object that is pretty much just an array of stations
 */
function Graph(){
        this.stations = [];
}

function main(){
        if(process.argv[2] != null && process.argv[3] != null && process.argv[4] != null && process.argv[5] != null){
                let graph = network(process.argv[2]);
                let routesFound = getBestRoute(graph, process.argv[3], process.argv[4], process.argv[5]);
                displayRoutes(routesFound);
        } else {
                console.log("Error! Usage: node network.js <data set> <origin> <destination> <max results>")
                process.exit(1);
        }

}

if(require.main === module){
        main();
}

