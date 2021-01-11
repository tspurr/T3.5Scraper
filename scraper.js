const puppeteer = require('puppeteer');
const $ = require('cheerio');
const { Browser } = require('puppeteer/lib/cjs/puppeteer/common/Browser');
const teamsURL = 'https://gamebattles.majorleaguegaming.com/pc/overwatch/tournament/fa20-owcc-varsity-series-ms/teams';

var t = require('./team.js'); // Load the team class from team.js
let tournament = []; // Array of all the teams in the tournament


// Function tests if the link object
// is a team or not
function isTeam(str) {
    //let pos = str.search('Eligible');

    // In the table of teams there is another link for Eligible and Ineligible
    if (str.search('Eligible') != -1 
        || str.search('Ineligible') != -1) {

        return true;
        
    }

    return false;
}


// Function to store the teams on the webpage
async function storeTeams(html) {

    // Collecting the team names and links to team page on page one
    $('a', html).each(function() {
        //console.log($(this).text());

        if ( isTeam($(this).text()) ) {

            let teamName = $(this).text().substr(0, $(this).text().search('Eligible') - 1);
            let teamURLShort = $(this).attr(`href`);
            let teamURL = `https://gamebattles.majorleaguegaming.com/`+ $(this).attr(`href`);

            // Store all the teams in an array
            let team = new t.Team(teamName, teamURL);
            tournament.push(team);
            
            console.log(`${teamName}:\t\t\t${teamURLShort}`);

        }

    });

    // console.log('\nPage done\n')

}


// ===============================
//       Main Async Function
// ===============================
(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(teamsURL); // Going to the major league gaming website
    let bodyHTML = await page.content();

    // Was getting a repeat of the same page in the print out
    // Adding await seemed to have fixed the issue
    await storeTeams(bodyHTML);

    // Click to the next page of teams
    await page.click('button[aria-label="Next page"]');
    bodyHTML = await page.content();

    // Storing the second page of teams
    await storeTeams(bodyHTML);

})();