/**
 * @author Nate Welch
 * @version 05/24/22
 * This file models a railway network based on a json-defined network
 */

/** This adds the FileSync module to our program so we can read from files */
var fs = require('fs');

/* Here we define the fields and functions that are visible when this class is imported*/
var exports = module.exports = {};
exports.RailwayNetwork = RailwayNetwork;
exports.Route = Route;
exports.Stop = Stop;
exports.loadData = loadData;
exports.getNetworkName = getNetworkName;
exports.getRoutes = getRoutes;
exports.getRouteNames = getRouteNames;
exports.routeNamesToString = routeNamesToString;
exports.routeSummary = routeSummary;
exports.getRoute = getRoute;
exports.totalStations = totalStations;
exports.routeToString = routeToString;
exports.routeDistance = routeDistance;
exports.findLongestRoute = findLongestRoute;
exports.addDistances = addDistances;
exports.sortRoutesByName = sortRoutesByName;
exports.sortRoutesByLength = sortRoutesByLength;


/**
 * This function creates a new Railway Network object
 * @param {string} networkName the name of the network
 * @param {array[Route]} routes all routes on the network
 */
function RailwayNetwork(networkName, routes){
    if(networkName != null && routes != null){
        this.networkName = networkName;
        this.routes = routes;
     }else {
        console.log("Please enter valid values for all fields");
        process.exit(1);
    }
    
}

/**
 * This function creates a new Route object
 * @param {string} name the name of the route
 * @param {array[Stop]} stops all stops on the route
 */
function Route(name, stops){
    if(name != null && stops != null){
        this.name = name;
        this.stops = stops;
    } else {
        console.log("Please enter valid values for all fields");
        process.exit(1);
    }
}

/**
 * This function creates a new Stop object
 * @param {number} stop the number of the stop on the route
 * @param {string} stationName the name of the station at the stop
 * @param {number} stationID the unique ID of the station
 * @param {number} distanceToNext distance to the next Stop on the route
 * @param {number} distanceToPrev distance to the previous Stop on the route
 */
function Stop(stop, stationName, stationID, distanceToNext, distanceToPrev){
    if(stop != null && stationName != null && stationID != null && (distanceToNext != null || distanceToPrev != null)){
        this.stop = stop;
        this.stationName = stationName;
        this.stationID = stationID;
        this.distanceToNext = distanceToNext;
        this.distanceToPrev = distanceToPrev;
    } else {
        console.log("Please enter valid values for all fields");
        process.exit(1);
    }
}

/**
 * This function reads in a file and parses the string into an object
 * @param {string} fileName the file name and path of the file to parse
 * @returns {object} an object constructed from the file
 */
function loadData(fileName){
    try{
        objectString = fs.readFileSync(fileName, 'utf-8');
        return JSON.parse(objectString);
    } catch (err) {
        console.log("An error has occurred while loading in data from the file. Please check file name.");
        process.exit(1);
    }
}

/**
 * This function returns the name of a railway network
 * @param {RailywayNetwork} data the railway network to get the name of
 * @returns {string} the name of the railway network passed in
 */
function getNetworkName(data){
    if(data.networkName !== null){
        return data.networkName;
    } else {
        console.log("An error has occurred while getting the network's name. Please check that passed in data has a networkName field.");
        process.exit(1);
    }
}

/**
 * This function returns the routes on a railway network
 * @param {RailwayNetwork} data the railway network to get the routes of
 * @returns {Routes[]} the routes on the railway network
 */
function getRoutes(data){
    if(data.routes != null && data.routes != undefined){
        return data.routes;
    } else {
        console.log("An error has occurred while getting the network's name. Please check that passed in data has a routes field.");
        process.exit(1);
    }
}

/**
 * This function returns an array containing the names of the routes on the railway network
 * @param {RailwayNetwork} data the railway network to get the names of the routes it contains
 * @returns {string[]} an array containing the route names on the railway network
 */
function getRouteNames(data){
    if(data.routes != null && data.routes != undefined && data.routes.length != null && data.routes.length != undefined){
        let stringArr = [];             // Creates an empty array that we will populate with the strings of the route names
        let i = 0;
        while(i < data.routes.length){
            stringArr.push(data.routes[i].name); // Push each route inside of data's name onto stringArr
            i++;
        }
        return stringArr;
    } else {
        console.log("An error has occurred while getting the names of the routes on the network. Please check that passed in data has a routes field that is an array.");
        process.exit(1);
    }
}

/**
 * This function returns a formatted string of all the route names on a network
 * @param {RailwayNetwork} data the railway network to get the names of the routes it contains
 * @returns {string} a formatted string of all the route names on a network
 */
function routeNamesToString(data){
     return getRouteNames(data).join(",\n");        // Joins all the names in the array with a comma and a newline
}

/**
 * This function returns the Route object on the railway network with the name matching routeName
 * @param {RailwayNetwork} data the railway network to check
 * @param {string} routeName the name to match
 * @returns {Route} the route object on the railway network with the name matching routeName
 */
function getRoute(data, routeName){
    if(data.routes != null && data.routes != undefined && data.routes.length != null && data.routes.length != undefined){
        let i = 0;
        while(i < data.routes.length){                  // For each route in data
            if(data.routes[i].name === routeName){      // If the name of the route is the same as the name argument passed in
                return data.routes[i];                  // Return that route
            }
            i++;
        }
    }else {
        console.log("An error has occurred while getting the route. Please check that passed in data has a routes field that is an array containing suitable objects.");
        process.exit(1);
    }
    return null;
}

/**
 * This function returns a formatted string representing a Route object
 * @param {Route} route the route object to format into a string
 * @returns {string} a formatted string representing the Route object passed in
 */
function routeToString(route){
    if(route != null && route != undefined){
        let returnString = "ROUTE: " + route.name + "\nSTATIONS:\n"
        let runningDistance = 0;
        let i = 0;
        while(i < route.stops.length){          // For each stop on the route, make this string and add its distance into the total
            returnString = returnString + route.stops[i].stop + " " + route.stops[i].stationName + " " + runningDistance + " miles\n";
            runningDistance = runningDistance + route.stops[i].distanceToNext;
            i++;
        }
        returnString = returnString + "Total Route Distance:" + runningDistance;
        return returnString;
    } else {
        console.log("A correct route was not found. Please check passed in data. The function will now return null");
        return null;
    }
}

/**
 * This function returns a formatted string representing all routes on the network
 * @param {RailwayNetwork} data the network to use
 * @returns {string} a formatted string representing all routes on the network
 */
function routeSummary(data){
    if(data.routes != null && data.routes != undefined){
        addDistances(data);
        let returnString = "Routes Summary\n========\n";
        let i = 0;
        while(i < data.routes.length){                  // For each route in data, makes padded strings based off certain key data entries
            tempString = data.routes[i].name;
            tempString = tempString.padEnd(25, " ");
            tempString = tempString + "-";
            tempString = tempString.padEnd(35, " ");
            tempString = tempString + data.routes[i].stops[0].stationName;
            tempString = tempString.padEnd(50, " ");
            tempString = tempString + "to";
            tempString = tempString.padEnd(60, " ");
            tempString = tempString + data.routes[i].stops[data.routes[i].stops.length - 1].stationName;
            tempString = tempString.padEnd(75, " ");
            tempString = tempString + "-";
            tempString = tempString.padEnd(80, " ");
            tempString = tempString + data.routes[i].distance + " miles\n";
            returnString = returnString + tempString;
            i++;
        }
        return returnString;
    } else {
        console.log("An error has occurred while printing the network's summary. Please check passed in data.");
        process.exit(1);
    }
}

/**
 * This function calculates and returns how many unique stations are on a network
 * @param {RailwayNetwork} data the network to check
 * @returns {number} a number representing the number of unique stations on the network
 */
function totalStations(data){
    if(data.routes != null && data.routes != undefined){
        let stationArr = [];
        let i = 0;
        while(i < data.routes.length){
            let j = 0;
            while(j < data.routes[i].stops.length){     // For each route in data, and for each stop on those routes, if the station isnt in the array, push it onto the array
                if(!(stationArr.includes(data.routes[i].stops[j].stationID))){
                    stationArr.push(data.routes[i].stops[j].stationID)
                }
                j++;
            }
            i++;
        }
        return stationArr.length;
    } else {
        console.log("An error has occurred while calculating the total stations on the network. Please check passed in data.");
        process.exit(1);
    }
}

/**
 * This function calculates and returns the total length of the route
 * @param {Route} route the route to use
 * @return {number} The total distance in miles of the route
 */
function routeDistance(route){
    if(route != null && route != undefined) {
        if(route.distance != null && route.distance != undefined){
            return route.distance;
        } else {
            let i = 0;
            let runningDistance = 0;
            while(i < route.stops.length){
                runningDistance = runningDistance + route.stops[i].distanceToNext;
                i++;
            }
        return runningDistance;
        }
    } else {
        console.log("An error has occurred while calculating the distance of the route. Please check passed in data. Now returning null");
        return null;
    }
}

/**
 * This function adds a distance field to each route on the network equal to the total distance of the route
 * @param {RailwayNetwork} data the network to sue
 */
function addDistances(data){
    if(data != null && data != undefined){
        let i = 0;
        while(i < data.routes.length){
            data.routes[i].distance = routeDistance(data.routes[i]);
            i++;
        }
    } else {
        console.log("An error has occurred while adding distances to the route's. Please check passed in data.");
        process.exit(1);
    }
}

/**
 * This function returns the route with the highest distance field on a network
 * @param {RailwayNetwork} data the network to check
 * @returns {Route} the route with the highest distance field on the network
 */
function findLongestRoute(data){
    try{
        let routeArr = [];
        let i = 0;
        while(i < data.routes.length){
            routeArr.push([data.routes[i], data.routes[i].distance]);
            i++;
        }
        return routeArr.sort((a,b) => b[1] - a[1])[0][0];      // Sorts the array we have populated by length of the route and returns the longest
    } catch (err) {
        console.log("An error has occurred while finding the longest route on the network. Please check passed in data.");
        process.exit(1);
    }
}

/**
 * This function sorts the network's routes by their name. A-Z if asc is true. Z-A if false. Z-A by default as well.
 * @param {RailwayNetwork} data the network to use
 * @param {boolean} asc the trigger for ascending order or descending order
 * @returns {string} a formatted string representing all routes on the network
 */
function sortRoutesByName(data, asc){
    try{
        if(asc === true){
            data.routes.sort((a, b) => a.name > b.name ? 1 : -1);
        } else if(asc === false || asc == undefined){
            data.routes.sort((a, b) => a.name > b.name ? -1 : 1);
        }
    } catch (err) {
        console.log("An error has occurred while sorting the routes on the network by name. Please check passed in data.");
        process.exit(1);
    }
}

/**
 * This function sorts the network's routes by their distance. 
 * @param {RailwayNetwork} data the network to use
 * @param {boolean} asc the trigger for ascending order or descending order
 * @returns {string} a formatted string representing all routes on the network
 */
function sortRoutesByLength(data, asc){
    try{
        addDistances(data);
        if(asc === true){
            data.routes.sort((a, b) => a.distance - b.distance);
        } else if(asc == undefined || asc === false){
            data.routes.sort((a, b) => b.distance - a.distance);
        }
    } catch (err) {
        console.log("An error has occurred while sorting the routes on the network by distance. Please check passed in data.");
        process.exit(1);
    }
}


/**
 * Conduct a range of tests on the functions developed
 **/
function main (fileName){

    //Load the railway data structure from rom file.
    let data = loadData(fileName);

    //Test route name
   console.log("===TEST=1=NETWORK=NAME==="); 
   console.log( getNetworkName(data) );

   //Test getting routes
   console.log("\nTEST=2=GETTING=ROUTES=ARRAY");
   console.log("There are " + getRoutes(data).length + "routes on this network");
   console.log("The typeof the routes is " + typeof getRoutes(data));
   
   //Test getting route names
   console.log("\n===TEST=3=ROUTE=NAMES===");
   console.log(getRouteNames(data));

   //Test getting route names formated as a String
   console.log("\n===TEST=4=ROUTE=NAMES=TOSTRING===");
    console.log(routeNamesToString(data));

    //Test getting data for one route
    console.log("\n===TEST=5=GET=ROUTE===")
    let route =getRoute(data, "West Coast Main Line");
    if(route != null)
         console.log( "Found: " + route.name);
    else
          console.log("Route not found");

    //Test route toString
    console.log("\n===TEST=6=ROUTE=TO=STRING===");
    console.log(routeToString(route));

    //Test route distance calculation
    console.log("\n===TEST=7=ROUTE=DISTANCE===");
    var dist = routeDistance(route);
    console.log("Distance of Line as calculated: " + dist);   

    //Test the routeSummay function
    console.log("\n===TEST=8=ROUTE=SUMMARY===");
    console.log(routeSummary(data));

    //Test sorting routes by name in ascending order
    console.log("\n===TEST=9=SORT=ROUTE=BY=NAME===");
    sortRoutesByName(data, true);
    console.log(routeSummary(data));

    //Test sorting routes by name in descending order
    console.log("\n===TEST=10=SORT=ROUTE=BY=NAME=(DESC)===");
    sortRoutesByName(data);
    console.log(routeSummary(data));

    //Test sorting in assending order
    console.log("\n===TEST=11=SORT=ROUTE=BY=LENGTH=(ASC)===");
    sortRoutesByLength(data, true);
    console.log(routeSummary(data));
    
    //Test sorting in descending order
    console.log("\n===TEST=12=SORT=ROUTE=BY=LENGTH=(DESC)===");
    sortRoutesByLength(data, false);
    console.log(routeSummary(data));
    
    //Test finding the longest route
    console.log("\n===TEST=13=FIND=LONGEST=ROUTE===");
    route = findLongestRoute(data);
    console.log("Longest route is: "  +routeToString(route) + "\n");

    //Test routeDistance
    console.log("\n===TEST=14=Total_Stations===");
    let n = totalStations(data);
    console.log("There are " + n + " stations in this network.");
}//end main

//Call the main function
if(require.main === module){
    main(process.argv[2]);
}
