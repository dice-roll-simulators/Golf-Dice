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
  ["Frankie Capan III","USA"],["Braden Thornberry","USA"],["Dean Burmester","RSA"],["Dylan Frittelli","RSA"],["Rikuya Hoshino","JPN"],
  ["Darius van Driel","NED"],["Matteo Manassero","ITA"],["Yuto Katsuragawa","JPN"],["Adrián Otaegui","ESP"],["Guido Migliozzi","ITA"],
  ["Marcel Siem","GER"],["Nick Dunlap","USA"],["David Ravetto","FRA"],["Frédéric Lacroix","FRA"],["Niklas Nørgaard","DEN"],
  ["Ángel Hidalgo","ESP"],["Julien Guerrier","FRA"],["An Byeong-hun","KOR"],["Paul Waring","ENG"],
  ["Davis Chatfield","USA"],["Kensei Hirata","JPN"],["Jeffrey Kang","USA"],["S.T. Lee","KOR"],
  ["Zander Lombard","RSA"],["Aaron Cockerill","CAN"],["Connor McKinney","ENG"],["Shubhankar Sharma","IND"],
  ["Nathan Kimsey","ENG"],["Daniel Rodrigues","POR"],["Quentin Debove","FRA"],["Matthew Baldwin","ENG"],
  ["Gregorio De Leo","ITA"],["Benjamin Follett-Smith","ZIM"],["Adri Arnaus","ESP"],["Andreas Halvorsen","NOR"],
  ["Eddie Pepperell","ENG"],["Jack Yule","SCO"],["Fred Biondi","BRA"],["Andrés Gallegos","CHI"],
  ["Sadom Kaewkanjana","THA"],["Hunter Logan","USA"],["Mike Toorop","NED"]
];

// Fictional names for PGA Championship "club professional" qualifiers only —
// the one category the user wants simulated rather than sourced from real people.
const NAME_BANK = {
  clubPro: ["Kelvin","Marv","Sal","Rusty","Dutch","Skip","Gordy","Norm","Chet","Dale","Lonnie","Wade","Boyd","Curt","Alton","Merle","Perry","Duane","Stan","Elmo"],
  clubProLast: ["Beringer","Whitlock","McAllister","Osterman","Pruett","Vance","Kessler","Radford","Stallings","Tibbetts","Crenwell","Hopwell","Sanderling","Odum","Brackett","Fenwick","Larrabee","Combs","Ostrander","Vollmer"]
};

module.exports = { TOP_120, RANK_121_200, REAL_EXTRA, PAST_CHAMPIONS, NAME_BANK };
