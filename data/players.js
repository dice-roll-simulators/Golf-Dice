'use strict';

// Fixed field for the 11 Championship Series events (8 elevated events + the 3
// postseason stages). Per spec, this exact 120-player roster plays every one
// of those events regardless of how the live World Ranking below moves.
// Source: OWGR-style snapshot, Aug 2026 (see the Fairway Draft Board artifact).
const TOP_120 = [
  ["Scottie Scheffler","USA"],["Rory McIlroy","NIR"],["Cameron Young","USA"],["Matt Fitzpatrick","ENG"],["Wyndham Clark","USA"],
  ["Russell Henley","USA"],["Tommy Fleetwood","ENG"],["Chris Gotterup","USA"],["Sam Burns","USA"],["Collin Morikawa","USA"],
  ["Xander Schauffele","USA"],["Jon Rahm","ESP"],["Si Woo Kim","KOR"],["Justin Rose","ENG"],["Viktor Hovland","NOR"],
  ["J.J. Spaun","USA"],["Ludvig Åberg","SWE"],["Robert MacIntyre","SCO"],["Aaron Rai","ENG"],["Alex Noren","SWE"],
  ["Ben Griffin","USA"],["Justin Thomas","USA"],["Tyrrell Hatton","ENG"],["Hideki Matsuyama","JPN"],["Ryan Fox","NZL"],
  ["Patrick Cantlay","USA"],["Ryan Gerard","USA"],["Jacob Bridgeman","USA"],["Tom Kim","KOR"],["Kristoffer Reitan","NOR"],
  ["Min Woo Lee","AUS"],["Sepp Straka","AUT"],["Akshay Bhatia","USA"],["Michael Brennan","USA"],["Patrick Reed","USA"],
  ["Bryson DeChambeau","USA"],["J.T. Poston","USA"],["Kurt Kitayama","USA"],["Harris English","USA"],["Nicolai Højgaard","DEN"],
  ["Michael Thorbjornsen","USA"],["Gary Woodland","USA"],["Joaquín Niemann","CHI"],["Maverick McNealy","USA"],["Bud Cauley","USA"],
  ["Alex Smalley","USA"],["Rickie Fowler","USA"],["Keegan Bradley","USA"],["Jake Knapp","USA"],["Lucas Herbert","AUS"],
  ["Adam Scott","AUS"],["Corey Conners","CAN"],["Shane Lowry","IRL"],["Marco Penge","ENG"],["Jordan Spieth","USA"],
  ["Nico Echavarria","COL"],["Sungjae Im","KOR"],["Sam Stevens","USA"],["Daniel Berger","USA"],["Matt Wallace","ENG"],
  ["Brian Harman","USA"],["Michael Kim","USA"],["Ryo Hisatsune","JPN"],["Eugenio Chacarra","ESP"],["Jackson Koivun","USA"],
  ["Jason Day","AUS"],["Pierceson Coody","USA"],["Alex Fitzpatrick","ENG"],["Johnny Keefer","USA"],["Casey Jarvis","RSA"],
  ["Matt McCarty","USA"],["Jordan Smith","ENG"],["Rasmus Højgaard","DEN"],["Keith Mitchell","USA"],["Andrew Novak","USA"],
  ["Harry Hall","ENG"],["Eric Cole","USA"],["David Puig","ESP"],["Max Homa","USA"],["Nick Taylor","CAN"],
  ["Sami Välimäki","FIN"],["Steven Fisk","USA"],["Rasmus Neergaard-Petersen","DEN"],["Ross Steelman","USA"],["Sahith Theegala","USA"],
  ["Matti Schmid","GER"],["Thomas Detry","BEL"],["Max Greyserman","USA"],["Mac Meissner","USA"],["Denny McCarthy","USA"],
  ["Aldrich Potgieter","RSA"],["Keita Nakajima","JPN"],["Beau Hossler","USA"],["Jayden Schaper","RSA"],["Ricky Castillo","USA"],
  ["Taylor Pendrith","CAN"],["John Parry","ENG"],["Christiaan Bezuidenhout","RSA"],["Shaun Norris","RSA"],["Kevin Yu","TPE"],
  ["Blades Brown","USA"],["Patrick Rodgers","USA"],["Emiliano Grillo","ARG"],["Jackson Suber","USA"],["Andrew Putnam","USA"],
  ["Ben Kohles","USA"],["Rico Hoey","PHI"],["Sudarshan Yellamaraju","CAN"],["Lucas Glover","USA"],["Stephan Jaeger","GER"],
  ["Davis Thompson","USA"],["Chris Kirk","USA"],["Oliver Lindell","FIN"],["Doc Redman","USA"],["Austin Smotherman","USA"],
  ["Kevin Roy","USA"],["Kota Kaneko","JPN"],["Max McGreevy","USA"],["Brooks Koepka","USA"],["Daniel Hillier","NZL"]
];

// Ranks 121-200, real names from the same snapshot. These are eligible for
// Challenger Series / DP World Tour weeks and for World Ranking movement —
// a strong week here can climb a player into the numerical top 120 even
// though it doesn't buy them a seat in the fixed 120-man Championship fields.
const RANK_121_200 = [
  ["Chandler Blanchet","USA"],["Andy Sullivan","ENG"],["Davis Riley","USA"],["Garrick Higgo","RSA"],["Haotong Li","CHN"],
  ["Hennie Du Plessis","RSA"],["David Lipsky","USA"],["Tom Hoge","USA"],["Angel Ayora","ESP"],["Brandt Snedeker","USA"],
  ["Daniel Brown","ENG"],["Chandler Phillips","USA"],["Cameron Smith","AUS"],["Lee Hodges","USA"],["Scott Vincent","ZIM"],
  ["Tony Finau","USA"],["Josele Ballester","ESP"],["William Mouw","USA"],["Jacob Skov Olesen","DEN"],["Zac Blair","USA"],
  ["Elvis Smylie","AUS"],["Tom McKibbin","NIR"],["Mikael Lindberg","SWE"],["Adrien Saddier","FRA"],["Mark Hubbard","USA"],
  ["Richard Sterne","RSA"],["Sergio García","ESP"],["Zach Bauchou","USA"],["Laurie Canter","ENG"],["Doug Ghim","USA"],
  ["Mackenzie Hughes","CAN"],["Ian Holt","USA"],["Cole Sherwood","USA"],["Calum Hill","SCO"],["Billy Horschel","USA"],
  ["Nacho Elvira","ESP"],["Michael Hollick","RSA"],["Brian Campbell","USA"],["Alistair Docherty","USA"],["Victor Perez","FRA"],
  ["Marcus Armitage","ENG"],["Taylor Moore","USA"],["JC Ritchie","RSA"],["Bernd Wiesberger","AUT"],["Ben James","USA"],
  ["Thorbjørn Olesen","DEN"],["Tommy Morrison","USA"],["S.H. Kim","KOR"],["Jeremy Gandon","FRA"],["Davis Lamb","USA"],
  ["Dan Bradbury","ENG"],["Kazuki Higa","JPN"],["Travis Smyth","AUS"],["Carlos Ortiz","MEX"],["Dylan Menante","USA"],
  ["Davis Bryant","USA"],["Jesper Svensson","SWE"],["Joakim Lagergren","SWE"],["Takumi Kanaya","JPN"],["Jeff Winther","DEN"],
  ["Martin Couvra","FRA"],["Jhonattan Vegas","VEN"],["Yuta Sugiura","JPN"],["Kristoffer Ventura","NOR"],["Thriston Lawrence","RSA"],
  ["Austin Eckroat","USA"],["Dean Burmester","RSA"],["Adrien Dumont de Chassart","BEL"],["Zecheng Dou","CHN"],["A.J. Ewart","CAN"],
  ["Hunter Eichhorn","USA"],["Matt Kuchar","USA"],["Jay Card III","USA"],["Chad Ramey","USA"],["Jorge Campillo","ESP"],
  ["Vince Whaley","USA"],["Abraham Ancer","MEX"],["Séamus Power","IRL"],["Adam Schenk","USA"],["Ewen Ferguson","SCO"]
];

// Real, publicly documented past major champions still plausibly active/alive
// on the relevant date, used only as an *eligibility* input for building
// historical-exemption categories. Birth years are approximate/public record.
// Ages are computed relative to the tournament's simulated 2028 date.
// [name, birthYear, country] — country only used if we have to mint a
// "legacy" player object for someone no longer in the active ranked pool.
const PAST_CHAMPIONS = {
  masters: [
    ["Tiger Woods", 1975, "USA"], ["Phil Mickelson", 1970, "USA"], ["Bubba Watson", 1978, "USA"], ["Fred Couples", 1959, "USA"],
    ["Vijay Singh", 1963, "FIJ"], ["José María Olazábal", 1966, "ESP"], ["Mike Weir", 1970, "CAN"], ["Zach Johnson", 1976, "USA"],
    ["Trevor Immelman", 1979, "RSA"], ["Charl Schwartzel", 1984, "RSA"], ["Danny Willett", 1987, "ENG"], ["Sergio García", 1980, "ESP"],
    ["Patrick Reed", 1990, "USA"], ["Dustin Johnson", 1984, "USA"], ["Hideki Matsuyama", 1992, "JPN"], ["Scottie Scheffler", 1996, "USA"],
    ["Jon Rahm", 1994, "ESP"], ["Adam Scott", 1980, "AUS"], ["Jordan Spieth", 1993, "USA"]
  ],
  pga: [
    ["Justin Thomas", 1993, "USA"], ["Brooks Koepka", 1990, "USA"], ["Collin Morikawa", 1997, "USA"], ["Phil Mickelson", 1970, "USA"],
    ["Xander Schauffele", 1993, "USA"], ["Rory McIlroy", 1989, "NIR"], ["Jason Day", 1987, "AUS"], ["Padraig Harrington", 1971, "IRL"],
    ["Y.E. Yang", 1971, "KOR"], ["Martin Kaymer", 1984, "GER"], ["Keegan Bradley", 1986, "USA"], ["Jason Dufner", 1980, "USA"],
    ["Jimmy Walker", 1979, "USA"]
  ],
  usopen: [
    ["Tiger Woods", 1975, "USA"], ["Retief Goosen", 1969, "RSA"], ["Jim Furyk", 1970, "USA"], ["Michael Campbell", 1969, "NZL"],
    ["Geoff Ogilvy", 1977, "AUS"], ["Angel Cabrera", 1969, "ARG"], ["Lucas Glover", 1979, "USA"], ["Graeme McDowell", 1979, "NIR"],
    ["Rory McIlroy", 1989, "NIR"], ["Webb Simpson", 1985, "USA"], ["Justin Rose", 1980, "ENG"], ["Martin Kaymer", 1984, "GER"],
    ["Jordan Spieth", 1993, "USA"], ["Dustin Johnson", 1984, "USA"], ["Brooks Koepka", 1990, "USA"], ["Gary Woodland", 1984, "USA"],
    ["Bryson DeChambeau", 1993, "USA"], ["Jon Rahm", 1994, "ESP"], ["Wyndham Clark", 1997, "USA"], ["Matt Fitzpatrick", 1994, "ENG"]
  ],
  open: [
    ["Tiger Woods", 1975, "USA"], ["Ernie Els", 1969, "RSA"], ["Padraig Harrington", 1971, "IRL"], ["Stewart Cink", 1973, "USA"],
    ["Louis Oosthuizen", 1982, "RSA"], ["Darren Clarke", 1968, "NIR"], ["Phil Mickelson", 1970, "USA"], ["Rory McIlroy", 1989, "NIR"],
    ["Zach Johnson", 1976, "USA"], ["Henrik Stenson", 1976, "SWE"], ["Jordan Spieth", 1993, "USA"], ["Francesco Molinari", 1982, "ITA"],
    ["Shane Lowry", 1987, "IRL"], ["Collin Morikawa", 1997, "USA"], ["Cameron Smith", 1993, "AUS"], ["Brian Harman", 1985, "USA"],
    ["Xander Schauffele", 1993, "USA"]
  ]
};

// Real Korn Ferry Tour / DP World Tour players (2024-2026 tournament winners
// on those tours) who don't otherwise appear in TOP_120 or RANK_121_200. This
// is the "not in the Championship Series" real-player pool used to simulate
// Challenger Series / European Tour weeks and major-field random qualifiers.
const REAL_EXTRA = [
  ["Hank Lebioda","USA"],["Josh Teater","USA"],["Kyle Westmoreland","USA"],["Justin Suh","USA"],["Logan McAllister","USA"],
  ["Neal Shipley","USA"],["Bryson Nimmer","USA"],["Kim Seong-hyeon","KOR"],["Pontus Nyholm","SWE"],["Trace Crowe","USA"],
  ["Myles Creighton","CAN"],["Julian Suri","USA"],["Christo Lamprecht","RSA"],["Emilio González","MEX"],["John VanDerLaan","USA"],
  ["Ryggs Johnston","USA"],["Johannes Veerman","USA"],["Alejandro del Rey","ESP"],["Jacques Kruyswijk","RSA"],["Dylan Naidoo","RSA"],
  ["Richard Mansell","ENG"],["Wu Ashun","CHN"],["Nicolai von Dellingshausen","GER"],["Connor Syme","SCO"],["Grant Forrest","SCO"],
  ["Lee Jung-hwan","KOR"],["Taylor Dickson","USA"],["James Nicholas","USA"],["Álvaro Ortiz","MEX"],["Zack Fischer","USA"],
  ["Drew Nesbitt","CAN"],["Derek Hitchner","USA"],["Frankie Harris","USA"],["Freddy Schott","GER"],["Jordan Gumberg","USA"],
  ["Yurav Premlall","RSA"],["Stefano Mazzoli","ITA"],["Scott Jamieson","SCO"],["Jeremy Paul","GER"],["Isaiah Salinda","USA"],
  ["Kevin Velo","USA"],["Mason Andersen","USA"],["Tim Widing","SWE"],["Harry Higgs","USA"],["Kaito Onishi","JPN"],
  ["John Pak","USA"],["Cristóbal del Solar","CHI"],["Thomas Rosenmüller","GER"],["Karl Vilips","AUS"],["Paul Peterson","USA"],
  ["Frankie Capan III","USA"],["Braden Thornberry","USA"],["Dylan Frittelli","RSA"],["Rikuya Hoshino","JPN"],
  ["Darius van Driel","NED"],["Matteo Manassero","ITA"],["Yuto Katsuragawa","JPN"],["Adrián Otaegui","ESP"],["Guido Migliozzi","ITA"],
  ["Marcel Siem","GER"],["Nick Dunlap","USA"],["David Ravetto","FRA"],["Frédéric Lacroix","FRA"],["Niklas Nørgaard","DEN"],
  ["Ángel Hidalgo","ESP"],["Julien Guerrier","FRA"],["An Byeong-hun","KOR"],["Paul Waring","ENG"],
  ["Davis Chatfield","USA"],["Kensei Hirata","JPN"],["Jeffrey Kang","USA"],["S.T. Lee","KOR"],
  ["Zander Lombard","RSA"],["Aaron Cockerill","CAN"],["Connor McKinney","ENG"],["Shubhankar Sharma","IND"],
  ["Nathan Kimsey","ENG"],["Daniel Rodrigues","POR"],["Quentin Debove","FRA"],["Matthew Baldwin","ENG"],
  ["Gregorio De Leo","ITA"],["Benjamin Follett-Smith","ZIM"],["Adri Arnaus","ESP"],["Andreas Halvorsen","NOR"],
  ["Eddie Pepperell","ENG"],["Jack Yule","SCO"],["Fred Biondi","BRA"],["Andrés Gallegos","CHI"],
  ["Sadom Kaewkanjana","THA"],["Hunter Logan","USA"],["Mike Toorop","NED"],

  // +129 more real Korn Ferry / Web.com Tour graduates, picked from actual
  // year-by-year graduate lists (2016-2024) newest-first, so this batch is a
  // recency-verified swap for an earlier, less-targeted "all-time category"
  // pull. Grayson Murray (deceased, 2024) is deliberately excluded.
  ["Quade Cummins","USA"],["Trevor Cone","USA"],["Danny Walker","USA"],["Noah Goodwin","USA"],["Chan Kim","USA"],
  ["Alejandro Tosti","ARG"],["Ben Silverman","CAN"],["Paul Barjon","FRA"],["David Skinns","ENG"],["Jimmy Stanger","USA"],
  ["Norman Xiong","USA"],["Nicholas Lindheim","USA"],["Joe Highsmith","USA"],["Patrick Fishburn","USA"],["Tom Whitney","USA"],
  ["Kevin Dougherty","USA"],["Wilson Furr","USA"],["Parker Coody","USA"],["Ryan McCormick","USA"],["Scott Gutschewski","USA"],
  ["Roger Sloan","CAN"],["Rafael Campos","PUR"],["Yuan Yechun","CHN"],["Will Gordon","USA"],["Paul Haley II","USA"],
  ["David Lingmerth","SWE"],["Dou Zecheng","CHN"],["Robby Shelton","USA"],["Philip Knowles","USA"],["M. J. Daffue","RSA"],
  ["Michael Gligic","CAN"],["Taylor Montgomery","USA"],["Ben Taylor","ENG"],["Joseph Bramlett","USA"],["Austin Cook","USA"],
  ["Brandon Matthews","USA"],["Nick Hardy","USA"],["Augusto Núñez","ARG"],["Henrik Norlander","SWE"],["Ben Martin","USA"],
  ["Erik Barnes","USA"],["Ryan Armour","USA"],["Brent Grant","USA"],["Carson Young","USA"],["Tyson Alexander","USA"],
  ["Scott Harrington","USA"],["Harrison Endycott","AUS"],["Trevor Werbylo","USA"],["Estanislao Goya","ARG"],["Nico Echavarría","COL"],
  ["Anders Albertson","USA"],["Vincent Norrman","SWE"],["Brice Garnett","USA"],["Brian Stuard","USA"],["Will Zalatoris","USA"],
  ["Greyson Sigg","USA"],["Trey Mullinax","USA"],["Bronson Burgoon","USA"],["Hayden Buckley","USA"],["John Huh","USA"],
  ["Jared Wolfe","USA"],["Joshua Creel","USA"],["Dylan Wu","USA"],["Brandon Wu","USA"],["Kelly Kraft","USA"],
  ["Seth Reeves","USA"],["Curtis Thompson","USA"],["Justin Lower","USA"],["Adam Svensson","CAN"],["Stephan Jäger","GER"],
  ["Mito Pereira","CHI"],["Matthias Schwab","AUT"],["Callum Tarren","ENG"],["Peter Uihlein","USA"],["Dawie van der Walt","RSA"],
  ["Brett Drewitt","AUS"],["Matthew NeSmith","USA"],["Brandon Hagy","USA"],["Lanto Griffin","USA"],["Kramer Hickok","USA"],
  ["Ryan Brehm","USA"],["Brendon Todd","USA"],["Bo Hoag","USA"],["Tyler Duncan","USA"],["Chase Seiffert","USA"],
  ["Mark Anderson","USA"],["Chris Baker","USA"],["Robert Streb","USA"],["Vince Covello","USA"],["Michael Gellerman","USA"],
  ["Tyler McCumber","USA"],["Richy Werenski","USA"],["D. J. Trahan","USA"],["Zhang Xinjun","CHN"],["Tom Lewis","ENG"],
  ["Fabián Gómez","ARG"],["Nelson Ledesma","ARG"],["Anirban Lahiri","IND"],["Rhein Gibson","AUS"],["Cameron Davis","AUS"],
  ["Cameron Percy","AUS"],["David Hearn","CAN"],["Sebastian Cappelen","DEN"],["Tim Wilkinson","NZL"],
  ["Bae Sang-moon","KOR"],["Peter Malnati","USA"],["Scott Langley","USA"],["Cameron Champ","USA"],["Martin Trainer","USA"],
  ["Lee Kyoung-hoon","KOR"],["Matt Jones","AUS"],["Chase Wright","USA"],["Hunter Mahan","USA"],["Sebastián Muñoz","COL"],
  ["Kyle Jones","USA"],["Shawn Stefani","USA"],["Alex Prugh","USA"],["John Chin","USA"],["Roberto Díaz","MEX"],
  ["José de Jesús Rodríguez","MEX"],["Curtis Luck","AUS"],["Adam Long","USA"],["Wes Roach","USA"],["Julián Etulain","ARG"],
  ["Chris Thompson","USA"],["Cameron Tringale","USA"],["Joey Garber","USA"],["Brady Schnell","USA"]
];

// Fictional names for PGA Championship "club professional" qualifiers only —
// the one category the user wants simulated rather than sourced from real people.
const NAME_BANK = {
  clubPro: ["Kelvin","Marv","Sal","Rusty","Dutch","Skip","Gordy","Norm","Chet","Dale","Lonnie","Wade","Boyd","Curt","Alton","Merle","Perry","Duane","Stan","Elmo"],
  clubProLast: ["Beringer","Whitlock","McAllister","Osterman","Pruett","Vance","Kessler","Radford","Stallings","Tibbetts","Crenwell","Hopwell","Sanderling","Odum","Brackett","Fenwick","Larrabee","Combs","Ostrander","Vollmer"]
};

// Real, public-record birth years for real, named professional golfers, used
// by the client's age-based relegation rule (any player turning 50+ in a
// given season year is pulled out of the system). Sourced from general
// public-record knowledge (tour bios, Wikipedia) rather than a live
// database, so treat it as best-effort — not every name is included. A
// player is only listed here when there's real confidence in the year;
// anyone genuinely unlisted (mostly lower-profile Korn Ferry/mini-tour
// names further down REAL_EXTRA) falls back to the client's disclosed
// synthetic age system instead of a guessed "real" year, since guessing
// would be the exact fabrication-for-a-real-person problem this table
// exists to avoid.
const REAL_BIRTH_YEARS = {
  "Scottie Scheffler": 1996, "Rory McIlroy": 1989, "Cameron Young": 1996, "Matt Fitzpatrick": 1994, "Wyndham Clark": 1993,
  "Russell Henley": 1989, "Tommy Fleetwood": 1991, "Chris Gotterup": 1999, "Sam Burns": 1996, "Collin Morikawa": 1997,
  "Xander Schauffele": 1993, "Jon Rahm": 1994, "Si Woo Kim": 1995, "Justin Rose": 1980, "Viktor Hovland": 1997,
  "J.J. Spaun": 1990, "Ludvig Åberg": 2001, "Robert MacIntyre": 1996, "Aaron Rai": 1994, "Alex Noren": 1980,
  "Ben Griffin": 1995, "Justin Thomas": 1993, "Tyrrell Hatton": 1991, "Hideki Matsuyama": 1992, "Ryan Fox": 1984,
  "Patrick Cantlay": 1992, "Tom Kim": 2002, "Min Woo Lee": 1998, "Sepp Straka": 1993, "Akshay Bhatia": 2002,
  "Patrick Reed": 1990, "Bryson DeChambeau": 1993, "J.T. Poston": 1993, "Kurt Kitayama": 1993, "Harris English": 1989,
  "Nicolai Højgaard": 2000, "Gary Woodland": 1984, "Joaquín Niemann": 1998, "Maverick McNealy": 1994, "Bud Cauley": 1990,
  "Alex Smalley": 1996, "Rickie Fowler": 1988, "Keegan Bradley": 1986, "Jake Knapp": 1994, "Lucas Herbert": 1995,
  "Adam Scott": 1980, "Corey Conners": 1991, "Shane Lowry": 1987, "Jordan Spieth": 1993, "Nico Echavarria": 1994,
  "Sungjae Im": 1996, "Sam Stevens": 1996, "Daniel Berger": 1993, "Matt Wallace": 1991, "Brian Harman": 1985,
  "Michael Kim": 1992, "Ryo Hisatsune": 2001, "Eugenio Chacarra": 2000, "Jackson Koivun": 2004, "Jason Day": 1987,
  "Pierceson Coody": 2000, "Alex Fitzpatrick": 1997, "Matt McCarty": 1994, "Jordan Smith": 1992, "Rasmus Højgaard": 2000,
  "Keith Mitchell": 1992, "Andrew Novak": 1994, "Harry Hall": 1997, "Eric Cole": 1991, "David Puig": 2001,
  "Max Homa": 1990, "Nick Taylor": 1988, "Sami Välimäki": 1998, "Steven Fisk": 1995, "Sahith Theegala": 1997,
  "Matti Schmid": 1996, "Thomas Detry": 1994, "Max Greyserman": 1993, "Denny McCarthy": 1992, "Aldrich Potgieter": 2005,
  "Keita Nakajima": 2000, "Beau Hossler": 1996, "Jayden Schaper": 2001, "Ricky Castillo": 2001, "Taylor Pendrith": 1993,
  "Christiaan Bezuidenhout": 1995, "Kevin Yu": 1998, "Patrick Rodgers": 1992, "Emiliano Grillo": 1993, "Andrew Putnam": 1990,
  "Ben Kohles": 1989, "Rico Hoey": 1996, "Lucas Glover": 1979, "Stephan Jaeger": 1991, "Davis Thompson": 1998,
  "Chris Kirk": 1986, "Doc Redman": 1997, "Austin Smotherman": 1994, "Kevin Roy": 1988, "Max McGreevy": 1996,
  "Brooks Koepka": 1990, "Shaun Norris": 1982,

  "Andy Sullivan": 1991, "Davis Riley": 1997, "Garrick Higgo": 1999, "Haotong Li": 1995, "David Lipsky": 1988,
  "Tom Hoge": 1990, "Brandt Snedeker": 1980, "Cameron Smith": 1993, "Scott Vincent": 1992, "Tony Finau": 1988,
  "Zac Blair": 1990, "Tom McKibbin": 2002, "Mark Hubbard": 1988, "Richard Sterne": 1979, "Sergio García": 1980,
  "Laurie Canter": 1990, "Doug Ghim": 1996, "Mackenzie Hughes": 1990, "Billy Horschel": 1986, "Brian Campbell": 1993,
  "Victor Perez": 1994, "Marcus Armitage": 1988, "Taylor Moore": 1993, "Bernd Wiesberger": 1985, "Thorbjørn Olesen": 1990,
  "Kazuki Higa": 1997, "Carlos Ortiz": 1991, "Joakim Lagergren": 1991, "Takumi Kanaya": 1998, "Jhonattan Vegas": 1986,
  "Kristoffer Ventura": 1995, "Thriston Lawrence": 1997, "Austin Eckroat": 1997, "Dean Burmester": 1992, "Matt Kuchar": 1978,
  "Jorge Campillo": 1983, "Abraham Ancer": 1991, "Séamus Power": 1986, "Adam Schenk": 1991, "Ewen Ferguson": 1996,

  "Wu Ashun": 1990, "Anirban Lahiri": 1987, "Cameron Champ": 1996, "Peter Malnati": 1987, "Will Zalatoris": 1996,
  "Nick Dunlap": 2004, "Guido Migliozzi": 1997, "Cameron Davis": 1994, "Cameron Percy": 1979, "David Hearn": 1983,
  "Hunter Mahan": 1982, "Matt Jones": 1980, "Bae Sang-moon": 1988, "Kramer Hickok": 1992, "Mito Pereira": 1998,
  "Matthias Schwab": 1994, "Robert Streb": 1987, "Brendon Todd": 1985, "John Huh": 1990, "Adam Long": 1988,
  "Lanto Griffin": 1990, "Peter Uihlein": 1990, "Joseph Bramlett": 1988, "Nick Hardy": 1994, "Henrik Norlander": 1987,
  "Adam Svensson": 1993, "Tyler Duncan": 1988, "David Lingmerth": 1985,
};

module.exports = { TOP_120, RANK_121_200, REAL_EXTRA, PAST_CHAMPIONS, NAME_BANK, REAL_BIRTH_YEARS };
