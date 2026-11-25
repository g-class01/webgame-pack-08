# Burger Rush

## 13 September
- Collision issues on branch
- Timeline progressing
- Custom events on cash

+ Unlock with 3 ads count
+ Unlock next branch with ads
+ NPCs with reward ads
- More customers
+ Hoverboard on the map, collectable item

## 13 July
- Checkpoint saving was totally wrong.

## 28 June Update
+ only burger why?
+ Customers waiting in line stucks there for some reason (more than 10 customers maybe)?
+ AIs doesn't work sometimes
+ Japan branch doesn't work, this glitch fixed.
+ We don't get customers on branch switch, this glitch fixed.
- Add animations to burger bounty
- https://github.com/OnRushStudio/burger-bounty/issues/81

## 27 June Update
- No customer issue fixed.
- Hoverboard ads problem fixed.
- Japan branch line fixes.

## 26 June Update
- Top-right table NPC problem.
- Bring back camera focus task.
- Daily reward fix.

## 26 June Update
- Top-right table NPC problem

## 25 June Update
+ Fix money has function
+ I guess if NPCs already carrying some items, they don't deliver

## Dev Log 13-24 June
## Final Touch
+ General test to see if it works with old data
+ Order icons doesn't show (outside of the camera)

## 24 June
+ Balance prices of stations
+ [IMPORTANT] While watching the advertisement, the waiting time of the customers continues, so when the advertisement is over, they leave the table angrily.
- When I switch between 2 restaurants, it started showing arrows like this. This waiter came out after he upgraded.
- Make new branch more expensive

+ Close popup if it's the same branch
+ Money registered shows on USA restaurant and Japan stays at 0$
+ hands showing when walk animation run
- Sink feels far away (will try different approach because they have hoverboard at this point probably, wanna measure the times first)

+ [REJECT] Table 2 15 USD?
- Fix mobile issue (I don't know what it is tho)

## 22 June
+ Fix burger's create index order

+ Cosmetic points
+ Sushi making sound
+ Boiling sound
- Notification for new branch

## 21 June
+ Obstacles
+ Garbage collector guy
+ Sushi delivery guy
+ Ramen delivery guy

- [LATER] Coke delivery guy
- AI Chef

+ All tutorial indexes
+ Purchase new branch
+ Stretview

+ Fix physics bugs (kitchen)
+ Tables doesn't reset on branch switch

+ Check decoration manager listeners
+ Cosmetic places
+ Wall cosmetics
+ Floor cosmetics

## 20 June
+ Coke
+ Sushi
+ Ramen
+ Finish invisible enable/disable objects
+ Outside walking people
+ Tutorial indexes (no real tutorial, just next objective)
+ Start testing

+ Design the kitchen
+ Collisions
+ ramen machine
+ Coke position
+ fix garbage bag position
+ Fix garbage camera focus

## 19 June
+ Add sushi
+ Sink
+ Coke machine
+ Design kitchen
+ table

+ Remove first midroll ads, it's really annoying and shows the game cheap
+ Add all japan models
+ coke machine
- garbage helper
- table
- sushi chef
- ramen machine
- table
- sushi helper
- Mobile camera fix

## 18 June
+ sushi machine
+ first order
+ sushi animation


+ BranchManager
+ Make sure switch button works on popups
+ reset pc.RequestNumber
+ Reset our position properly
+ Add transition
+ fix exit point

+ Make it so custom spawn is in right position
+ Make it so customers requests sushi in japan

## 14 June
+ Clear tutorial manager properly
+ Clear cosmetics properly
+ Table Manager
+ Clean the ones that uses app.root

+ Clear customers properly

## 13 June
+ Made truck model smaller
+ Show upgrade button on max capacity display (reward ads)
+ Hoverboard reward ads button
+ Enabled first ads
+ Add an option to throw garbage plates too
+ Remove ice cream icon
+ When the maximum capacity is reached in the coke machine, the coke stays in the air.
+ Play game doesn't work (if two ads causes issue), don't pause if it's already paused
+ french fries machine and the table are very close to each other, it automatically collects the potatoes then max capacity is written and potatoes are wasted.

- Add new characters to the game
- Add plus button to money display
- physical reward, suitcase
- Daily schedule to make them hooked

+ Enable first midroll
+ Balance the game little bit more

## 5 June
+ https://github.com/OnRushStudio/burger-bounty/issues/43
+ https://github.com/OnRushStudio/burger-bounty/issues/41
+ Hide arrow when we are close to it
+ Add coke helper (need to design helper)
+ Ice cream machine (unlock)
+ ice cream helpers
+ Make reward button add animated
+ Check what's going on with first ads
+ Second door for more customers
+ TypeError: Cannot read properties of undefined (reading 'walkable') (endNode) if(!endNode.walkable){
+ TypeError: Cannot read properties of undefined (reading 'customer') this.currentCustomer.script.customer.hasMoney()
+ TypeError: Cannot read properties of undefined (reading 'sound')
+ Split decorations into tabs
+ Wall colors
+ Add opacity models instead of question mark
+ Fix camera offset
+ Disable context
+ Reward ads freezeing
+ Plate visual problem

## 4 June
- Add system to define different resturants
- Add Day-night https://github.com/OnRushStudio/burger-bounty/issues/26 add bar next to the screen (15 minute engagement)
- Carry more give reward ads button
+ Make the game longer

## 31 May Changes (v12)
- Add ground upgrade stations back
- Customers pays less (10 -> 8)
- table2 is 25
- coke is 50
- collector 150
- fries 100
- chef 150
- 75 upgrade shelf
- table3 100
- burger maker 150
- Question marks added back for visilibity

## 29 May Changes
+ AI stuck issue fixed.
+ Fix max display
+ Fix mobile bottom button

## 28 May Changes
+ When they have enough money for any upgrade, show notification
+ Finish all level types including NPC speed and carry count
+ More textures for grounds
+ StationLevels
+ Station Levels interface (designed with reward ads in mind)
+ Render upgrades
+ hourly reward if you are coming back!
+ Disable reward ads from shop after first try
+ Make everything more expensive and grindy
+ Add more buyables (add 10 custom models, add wall colors, add floor colors)
+ Fix double buying
+ Make burger stove slower
+ Instead of using first login, use a tutorial step, so we can actually see data instantly...
+ Make it so we don't collect dirty tables if there is a guy for collecting it
+ New tables doesn't work for customer script (they work)
+ Add lock on door, disable it when unlocked
+ Move the doors when it's unlocked!
+ make you need money error smaller

## Balance
- 2:10 with old method
- 2:48 with new method
- 4:00 with v6 method


- Don't give japan items unless it's unlocked

## 26 May Changes

+ [TEST] Music fix
- Carry one item (limit)
- Stove faster cook

+ If you didn't watch any reward ads, or have adblock, you should add value to our engagement, make it harder

- Ice cream machine

- Fries guy stuck in table for some reason?
- Put upgrade unlock station on kitchen, accessable from menu
- Add upgrade menu, make sure they click button all the time and they see reward ads by mistake

+ Remove existing one
+ Make everything more expensive and grindy
+ Add more buyables (add 10 custom models, add wall colors, add floor colors)
+ Enable first ads
+ Bring back camera focus


+ Fix double buying
+ Make burger stove slower
+ Instead of using first login, use a tutorial step, so we can actually see data instantly...
+ Make it so we don't collect dirty tables if there is a guy for collecting it
+ New tables doesn't work for customer script (they work)

## Balance
- 2:10 with old method
- 2:48 with new method
- 4:00 with v6 method

## 25 May Changes
+ Put world2screen elements on screen properly (for mobile)
+ Seperate shop buttons and money, change popup order
+ close reward popup after reward
- lower carry capacity to make it upgradable

- show hoverboard reward
- fix poki errors

- Fix employee speed (snail)
- Add mouse movement

- Add upgrade for all stations
- Burger stove, better stove model, faster cooking (time, amount)
- Coke machine, better coke machine, faster result
- Fries machine, bigger fries machine, faster result (time, amount)
- Cash machine, put someone there to finalize
- Upgrade tables (better tables, tables flower and menu)

+ Add lock on door, disable it when unlocked
+ Move the doors when it's unlocked!
+ make you need money error smaller

- Make cosmetics button more clear on mobile
- Implement a system to show notification for newly added stuff


+ Split returning user and new user to measure properly
+ Measure rewards and buyables
+ Disable zoom on popups

- Make people want less stuff on late-game

+ Remove world attention icon from arrow

+ Move world icons to the bottom-left to make it more visible on mobile

- Add clothes (update that menu, make it mobile friendly)

- Fix customer glitch (people wont pay and block others)
- Make some stuff more expensive, it seems like making them cheaper hurts the engagement
- Make the cafe bigger, so we have space to go
- sometimes reward ads doesn't add money, why?
- Make upgrades also station

- once you get to a certain stage you cant buy anything and nothing happens in order address that, introduce new steps
- add upgrade button for stations, remove upgrades (https://github.com/OnRushStudio/burger-bounty/issues/21)

## 24 May Changes
+ Add zoom in/out button
+ make camera focuses faster, so users doesn't get bored easily
+ Instead of camera movement, add line

- Show buy button, so they can actually buy more stuff
- Add new cafe

## 23 May Changes
- All AIs moved to grid based system (dragon keeper NPC)
+ If target doesn't exist anymore, cancel and go to base
+ Fix NPC waypoints, add proper lines, they should create a curve and follow it
+ Add unlock indicator
+ Added proper reward ads
+ Second floor decoration problem fixed.
+ Maybe change the position with sink
+ Make sure camera focuses to it
+ make it cheaper
+ [IGNORED] Add an UI button to make buying easier instead of going there
+ First unlock coke machine
+ Then second table
+ Remove coke upgrade
+ Make camera focus better (zoom out)
+ Remove you need money alert from burger station


- Add mouse movement
- Add more places for placing down items
- Add lines, so we can see where we should go

## 21 May Changes
+ Make mobile buttons bigger
+ Show hidden arrows on the map (if it's outside of the map)
+ We need to show first to take dirty plate and then show sink. (tutorial)
+ Hide midroll indicator on mobile
+ Show you don't have money indicator
+ Show burger bar more clear, people can't read it for some reason.
+ Make burger bar non-upgrade faster
+ Fix the collision with second table, poeple got stuck.
+ Trigger stop function for movement on ads moments
+ Fix world2screen z position
+ Play with the camera zoom on mobile
+ Put mobile stats into chart seperated
+ On mobile customers doesn't show up portrait mode left/right
+ Make icons more clear on mobile


- [BUG] pickup a hamburger, wait until one of the guests ask for it, fullfill the order, hamburger delivery girl has to go to guest and give the hamburger already filled hamburger, freezes game completely

## 20 May Changes
+ New reward ads popup
+ New 2 NPCs
+ Add ads breakpoints on data
+ fix burger shelve issue
+ Make hoverboard reward clear
+ show ads at 4th minute, not early
+ Add shop cosmetics with money (super simple enable/disable stuff)
+ Flowers
+ Move apperance menu to UI
+ Show other possible locations on the top left and put coming soon popup
+ Add other popups for countries
+ Reward ads doesn't work
+ Second table is too expensive (made it 15)
+ People hit apparance menu by mistake, move the location (changed the location)
+ Add question marks for unlockable station areas, people look around in kitchen (added stations)
+ Make burger upgrade cheaper, it's annoying (made it 15 USD)
+ Make the first guy eat faster (4 seconds)
+ Hover opacity bug fixed.
+ Undefined "pc" bug fixed.
+ Update balance data
+ Fixed initial cost issue

## 20 May - After balance changes (last 1h push!)
+ Design reward ads popup (not enough money)
+ Add other AI's stations
+ Check waypoint script for dancing
- Final test and release! 🚀

+ Pave colors


+ Disable teleport for cosmetics
+ Size popups for mobile

+ Add shop cosmetics with money (super simple enable/disable stuff)
+ Flowers
+ Move apperance menu to UI
+ Show other possible locations on the top left and put coming soon popup
+ Add other popups for countries


## Later
- Wall colors
- Modern tables
- Add ice machine
- Add ice cream machine

+ Reward ads doesn't work
+ Second table is too expensive (made it 15)
+ People hit apparance menu by mistake, move the location (changed the location)
+ Add question marks for unlockable station areas, people look around in kitchen (added stations)
+ Make burger upgrade cheaper, it's annoying (made it 15 USD)
+ Make the first guy eat faster (4 seconds)
+ Hover opacity bug fixed.
+ Undefined "pc" bug fixed.
+ Update balance data


## 8 May - Changes (Stishka works on it)
- If you have enough money to upgrade next station, show with camera, it's possible to unlock it
- Show bar for the customer waiting for payment as well. It'd be nice to know how much they can wait.
- Color changes for waiting bar green to red!
- Update upgrade images
- show hoverboard reward
- it doesn't give the plates if they are not top of the list

## Game Design
- Figure out a way to put upgrades to a better place, they always hit apperance
- put burger shelf offset, we take while we walk
+ When 2 customers will pay, first one doesn't start until the second one pays.

## Long shot
- A robot that helps with orders (super quick)

## Balance Changes (22 minutes)
+ make the first customer wait longer
+ remove shadows from plates

+ move more burgers next to the shelf

+ Increase garbage timer, it's annoying

+ make chef's logo, so they are still engaging
+ less burgers, don't add big numbers

+ make money display red if we don't have money
+ Add an animation for upgrading stations
+ Fix arrows of upgrades
+ Make sure each upgrade has different bars
+ add an animation to cooking station
+ don't play sink sounds for garbage
+ Show arrow for garbage bag
+ one upgrade has wrong arrow
+ disable it so it doesn't always set to the next tutorial

## Notes from players
- make it easier overtime, not harder
- move upgrades next to the machines

- accept more burgers upgrade (upgrade idea)
+ upgrading burgers (should have visual effect) - enable and disable plate on cooking
+ split the upgrades (fries, burgers, coke) (more content)

- hoverboard can be reward ads (its fun and valuable)

Ugur
[02:48];8;Coke
[03:23];9;Fries

Comments:
hocam hiç bir mekanik yok oyunda ya
mal gibi duruyorsun 3 sn bişey cıkıyor
burger aynı cola aynı patates aynı
incremental bişey yok

## 2 May Changes
- When you complete tutorial faster than it's designed, game stucks and players can't progress, this has been fixed.
- Once you unlock first cafe expansion, it doesn't show table, this issue has been fixed.
- Made kitchen bigger for better movement.
- Fixed some timing problems with arrows.
- Garbage collecting added as side-quest. Customers leave if you have garbage in your hand.

## Bugs
+ If you enable tutorial faster then it's enable time, it causes issues, we need to somehow make sure listener

## Notes
+ I ran into a bug where after getting the coffee machine, I couldn't progress anymore. The green arrow stayed on the coffee machine. I kept serving, had about $300 or so, but didn't unlock new progress. After a reset the same thing happened, but immediately at the first table. The kitchen did not unlock to make burgers

## More improvements after release
+ Add table stations for expansion
+ Expand kitchen little bit more

+ Garbage fixes
+ garbage attention icon
+ Add flies around garbage
+ Make kitchen bigger

- sometimes they can't leave items

- Add ice cream machine
- add crowns
- add shop cosmetic options to apperance

## Final Changes - 30 April
+ Enable station functionality
+ Cafe expand station

+ add reset button with confirmation
+ Collect garbages

## Make getting into it easier
+ make first table -40
+ make first upgrade cheaper
+ add another upgrade with the same price
+ [Will be tested] 4 table delay is not good, it's too slow
+ add more plates upgrade after chef

## TODO 29 April (22 minutes, stable not boring content)
+ Taking something from table should also have timer

+ disable shadow on mobile
+ table 4 arrow is wrong


+ Change the way upgrades work
+ leave function fixes (same object, recollide)
- fix upgrade prices
+ fries throw animation is not perfect for 5 seconds
+ disable camera shake for chef
+ ring the bell when they enter
+ don't show reward for 1 minute
+ first table should be cheaper, and change moneystep
+ if it's only hamburger, sometimes want more than 3
+ early stages, money step should be lower to

+ tutorial arrow hide
+ [Feels good] slow player spawn at late game (needs testing)
+ 10 money step is too much
+ fries glitch

## Side Tasks
- Fix machines




+ hoverboard doesn't work
+ make fries and coke station more expensive
+ make cooking times even longer, not 3 seconds
+ fix this deliver bug, it's annoying
+ hide arrow if it's ugprade

+ if there are so many orders, it hard to focus all of them, increase customer delay if there is so many orders
+ trio orders are bad, hard to deliver, overwhelming
+ if there is trio order, make it so it's only coke, burger and fries
+ other upgrades doesn't work

+ when we do speed update, change the color of stove
+ customers should eat longer
+ lower the drinking sound, it's annoying

- make restorant nice upgrade
- new room upgrade

- change upgrade popup's view, it should be a station



- no money for upgrade?


- open up more space, it's too tight, we always hit stuff
- when I turn, I always get two stuff, add a timer on plates as well
+ re-design upgrade order, it's bad right now
+ make the game more grindy
+ introduce hover early, it's interesting
- play different music on upgrade
+ don't show arrow on upgrade focus
+ reward is annoying, increases a lot and shows up on every station
- there is something wrong with collisions
+ tutorial arrow didn't focus ugprade
- fries still have issue
+ hamburger starts spawning from the end
- three burgers has problem
- upgrade didn't go to next tutorial stage
+ Upgrade popup screen
+ Add upgrade display, when it shows up, add 100 to our money and also show reward potential

## TODO 28 April
+ more carry capacity upgrade
+ time update for all machines
+ ginger rollers upgrade

- add buy popup, where we can buy stuff (remove storage room)
- add an option to remove items from ground and move them

- Queue for people, fix that, we need to wait for the next one, why?
- Pause during breaks, customers still leave after commercial (setTimeout poly)

- cleaner boi, i pick up plates, he comes to me and does an animation and doesnt pick up plates

## Talking to Dennis
- I figured that we def. need to make it even more cute and make it so you can actually open up more store, even tho it doesn't sound fun to me.

## Final Changes
+ UpgradeManager / With a popup gateway it (an image, what we'll get)
+ introduce more burgers shelf (enabled place points and hasspace update)

- cash machine guy upgrade
+ upgrades should come before table (tutorial)

- keep storage box, but also add ice cream machine


+ make request panels bigger on mobile
+ Drop-off funnel added.
+ Add bottom background on mobile
+ Make money size bigger on mobile
+ Make controls bigger on mobile

## Finish Today
- desert / ice cream room
- order guy

## 26 April Fixes
+ with more table, customer delay should increase, it's overwhelming
+ fix mobile view on apperance
+ We can show even more rewards, people are down for it!
+ coke's tutorial position is wrong
+ coke station still has problems (don't make it work add condition)
+ -1 money
+ people should want more random multiple stuff
+ people shouldn't want more than 1 coke, it's harder to deliver
+ 4th table should be 50
+ fries should be cheaper

## 24 April Fixes (played 15 minutes)
- we need someone that delivers food to people (mark customers checked)
- add more stuff to unlock for apperance
- after helper we need to upgrade stuff
- put some clothes to buy (with money)

- make ice cream room, we can get cookies, desert etc.
- Once there is nothing else doing, they will leave, so we can stretch that

## Reward
- add reward with filling burgers
- hire helper before helper
- crazy booster (star eyes)
- ginger rollers upgrade


+ caught TypeError: Cannot set properties of undefined (setting 'opacity')
+ peError: Cannot read properties of undefined (reading 'clone')
 
 
+ fix footstep sounds
+ make first customer faster come
+ fix customer leave time

+ if we refresh the page, table station doesn't show up

+ fix reward ads ratio, it's exessive

+ multiple food request
+ Drinks bug fixed


+ change reward ads show up
+ Play with customer spawning (8 cokes by two fat people annoying)
+ Introduce storage room after first customer
+ Fries midroll

+ Fix progression material
+ Connect everything into tutorial system

+ Add reward icon for reward button
+ Make reward button bigger on mobile
- Unlock storage room early

- Upgrade system added.

## 22 April Changes
## Requirements
- SDKStatusInitiated fires before all other events.
- Fire commercialBreak before first gameplayStart.
- commercialBreak was 2 minutes interval, but disabled that. I think it's too interuptive. Instead made it, so it shows up before you unlock something new.
- Removed XP bar fully, it's confusing.
- I updated materials to phong for lower-end devices. But can't reproduce this one.
- Upgraded visuals little bit more.
- Upgraded sound effects.

## Gameplay
- Improved collisions like sink, cash machine etc.
- Removed reward ads for tutorial.
- Pause and music mute buttons added.
- Total earned money display removed.
- [REJECT] We didn't want to add player hurting, on our tests it didn't give the best results.
- Namings from achivements removed.
- Monetization upgraded, now it gives more money overtime. It becomes to a point where it would be stupid to reject those offers :ragedog:
- Camera fixed on mobile.


## Longevitiy ideas
- Phone delivery
+ Put clothes next to the cash machine

## 20 April Comments
+ Remove XP system, replace it with ordered focus money based progression

+ Add pause back
+ Music settings (mute on/off)
+ Delete cache button
+ Remove collision from customers
- Make the enterange little bit annoying
+ Remove +1 animation from taking money
+ Make money transfer process faster
+ Improve collisions for taking/dropping plates
+ Make it on stations we need to wait just a little bit
- Unlock more capacity for character
+ Upgrade stove
- fat guy time (boss fight, different music)
- add blurb sound (only for the fat guy)
- make fat guy disgusting
+ Around 5-6 minutes, we should upgrade all the stuff
- Reaction to flowers and cosmetics, pay more money
- add more cosmetics

## Improvements
+ save built down placements

## 18 April
+ add space button for PC display
+ add place down button for mobile

+ Fries are still buggy
+ EXP bar
+ Fix midroll, make it so after watch complete, reset the timer
+ Set the timer for customers, if we have more and more tables
+ Change lock icon with doorkey (unlock items too)

- add reward hover on storage box (upgrade your character)

## 17 April
+ reset midroll timer on reward ads too
+ fix the bar for EXP
+ Carry item and model
+ Disable taking items on building mode
+ disable apperance icon

+ fix reward issue, it can't show up again

- saksı
- flower for tables


## Before lunch
+ Unlock dirty collector guy first after 4
+ Unlock storage room after, enable buying points

+ Add items to shelves

## After lunch

- Make the shop doors physical
- Add an icon for garbage stink carry thingy



## Finish this part until 13:30
- Place guide
- Shelves
- Update tutorial, first let us buy table

- Save table locations


- Take table, place it with guidence (green, red)
- Shelves (other cosmetic types)
+ Update tutorial accordingly


+ Add this popup to a collision system
+ Gender selection
+ Save chef's name
+ Branch

+ Pant color
+ Shoes color

## Some important visuals




- Hat selection
- Add carry capacity

## 16 April
- Shop screen for when we hover on thing, so we can change hat, and colors
+ Thsirt color etc.

- Make customer spawn delay slower when we have more available table
- Make it so they want different stuff in same order like coke + burger
- put garbages outside, it's stink!
+ upgrade version
- If you deliver it early, give them a reward and particles

- Add a guy that delivers food to people (this seems hard)

+ Remove boost 10 seconds later
+ Make it so fries can be made by chef too
+ add icons for helper, fries and coke, so they understand what they will unlock
+ get helper's icon
+ Fries count limited to total world count, don't count the ones in our hand
+ make it so he can push the door (kinematic applyForce)

+ Stop the man on camera movement
+ Fix money animation
+ remove booster 5 seconds later (add timer)
+ Fix cash machine collision
+ Fix plate order on carry
+ add throw sound for fries
+ Lock the door on first tutorial
+ camera zoom out maybe?

## TODO 16 April Bug Fixes
- add garson first, because it's needed to keep up
- chef hire etmek çok zor (ama nice objective)
- buy cosmetics from the box

- Add ginger riding

## TODO 15 April
14:00

+ fix reward ads timer

## Bugs
+ Sometimes cash animation stuck
+ AI stucks

+ Shop screen when we hover to the thing that is next to cash machine

## TODO 14 April
+ Throw animation for fries (make fries opposite direction)
+ Add dirty plate collector guy to the game and make him unlockable (almost added 7 minutes)
+ unlock him before waitress
? show table when it's available with camera
- Wake up AIs
- AI chef should do his job faster

## TODO 13 April
+ have waypoint AI as plugin, because we'll design another AI with that thing, have events and shid
+ dirty plate collector guy

- Simple shop with color changed (hats, and custom colors) (Add shop icon to the map)
- upgrade your shop (next to the cash machine)

- waitress guy

+ show dirty tables, so we can clean them up
+ make table prices cheaper
+ make fat customers more rare and spawn them little bit later
+ put fries next to the table, and make it so chef also helps out with fries

+ get available burger point is weird
+ make icon vault, instead of crown
+ (skip) burger visual flip rotation
+ fill up exp image (make it gold color)
+ disable player on camera locking

## TODO 12 April (16 minutes without being bored)
+ Booster boots (every 4.5 minutes) (different music)
+ Fat Star customer (10, they wait longer)
+ When we hire a chef, focus to it
+ Make customer wait more

+ show ads every 2.2 minutes
+ add lock icon for ice cream room

+ show total amount of money
+ add max level for bar
+ update logo
+ make chef 70 USD
+ remove hamburger from their hands
+ put glass to other hand
+ Fix fries station sound

## Feelings 11 April (11 minutes)
+ When it fails to pay, show reward ads option
+ add cleaner chef
- add children that add dirty tables to the ground
+ Add some sort of effect for unlocking stuff
+ change wait time for arrow on customers
+ Fix customer waiting time
+ Fix coke station

+ When we wait for them to eat, we have nothing to do

+ Add chef
+ Disable 4 fries thingy, it's annoying
+ Introduce coke building even early
+ Increase the bar size of EXP
+ Do you need chef button (reward ads) at minute 4.

## Monkey
First part of the game : 2:00
Show first ads at : 3:20
Introduce new building : 3:42
Introduce AI (helper) : 4:12
Ads : 6:10
Reward ads offer (after midroll with 2x, 2x money for 2m minutes)
Game feels even better at : 7:37 (with AI helper)
Ad : 8:50
Ad offer for 2x : 9:50
Ad offer for energy drink : 10:45
Ad : 11:22
Ad offer for 2x : 12:33
it's boring
introduced new building, new AI (waiter) : 13:55
Ad : 14:00
introduced new building : 16:17
ad : 16:30


Show offer twice before midroll, and take the offer back
Parayı toplarken de 2x offer sunuyor

Played for 18 minutes

- Kitchen sound that increases
- Get their request with colliding to them

## 29 March
- Make hamburgers 3 at max
- Introduce tables and buildings early, interaction with more people is better
- Fix the timer thing, it's really annoying


- Add chef's model
+ Play with the experience UI

+ Second tutorial stand time fix
+ Add a sound for fries machine
+ Remove hamburger from their hand complete request
+ Add coke to the other hand
+ Make the waiting time with their request burger count
- Add shop button to upgrade stuff and cosmetics
+ Add lock for the second shop

+ Add hamburger's to their hand
+ Add drinks to their hand
+ Add drinking sound
+ Add fries stand
+ next customer script cause

## 27 March
+ implement poki's SDK
- Reward ads, Press space to complete it on mobile, touch on it
- Dirt (stay on it to clear it)
- Add unlocking sound effect
- Çerçeveler ekle (kedi falan)

## 26 March
+ Fix coke stand bar
+ Add sound to coke
+ Prepare thumbnails


+ Coke fixes
+ Coke number affects hamburger fix
+ Show unlocked stuff with camera and particles

## 25 March
+ Finish experience system (make it so it saves)

## 23 March
+ Finish level system
+ Make it so, they leave happy after they pay, not before they pay
+ design a chef hat

## On first test
- Test at 5 march, I played 3 minutes
- Test at 25 march, I played for 7 minutes without being bored
- Test at 11 April, I played for 12 minutes without being bored
- Test at 16 April, I played for 13 minutes without being bored

## levels
5. customer unlocks coke - 5 minutes (1 excitement)
10. customer unlocks chef - 10 minutes (1 excitement)
5. customer unlocks fries - 4 minutes (2 excitement)
5. customer unlocks ice cream - 2-3 minutes
10. customer cleaner guy - 5 minutes

+ add cars outside

- Open everything with groups, not by random order
- Unlock chef and make him faster
+ Disable second table after first one
+ Show keyboard on PC, touch on mobile
- Dirt on the ground, where you need to clean with paspas.
+ fix coke timing

+ Make it so they wait little bit more after deliver
+ Change how they, they put money on ground first, then we take it
+ Build table first, then oven
+ Save money
+ Make it so we have circular loading bar
- Add an option to expand capacity of deliver point
- Add fries section, so they can get fries
- Send two customers to one table (table array)
+ Show XP bar with happy customer count, next level
- Add fat customer (VIP)
- Make other tables cheaper






- Sushi plates
- Ice cream station
+ Fix it so cokes doesn't move camera
+ Fix it so cokes doesn't spawn with offset

+ Buy sushi station
+ Buy coke station (and ice station)

- XP for unlocking new items


+ Unlock coke machine (needs ice)
+ Unlock second food type

+ They will wait at the machine to pay
- You will get money with money add button there (add like that mobile game)

+ Weird animation try

- Show midroll every 2 minutes if they don't watch ads

## Expectation
1000€ daily revenue.


+ Increase requestItem rate after some point

+ add some camera offset for burger focus
+ stop animation when it's full (ocak)

+ Add HEY! angry and happy sounds



+ Save tutorial
+ Sounds
- Unlock chef
+ Customer speed (for higher FPS)

- Lunch time, extra cash, faster people
+ Disable burger making if we are on it

- Cleaning option

- Buz makinası buz oluştursun, kola yapma makinasına koyalım (kola yapma makinası elimize versin)


+ Fix carry index
+ Place chef buy button
- Add level system, where we unlock new stuff if we reach 20 happy customers, show that we can hire chef for 100 USD
+ Add tutorial

- One important detail, that do not take stuff from automatically, but add layers that can be automated

- Sigara molası
- Tabakları yere atma
+ Kasa ekleyelim oyuna
- ocağı anlamadı bar doluyor

- Coke machine

+ Make it when we are on it, it doesn't spawn burgers


- Every customer takes 30 seconds to deal with
- Tutorial and beginner start : 4 minutes 
- Ceren's test: 6m39s93
- 10 people will unlock coke station (100 USD)
- 15 people will unlock another food station (50 USD)
- 25 people will unlock chef (250 USD)
- 35 people will unlock waitress (250 USD)




- Enable coke later, not at the beginning

- Show extra cash button
- Add AI chef button
- Add enabling new kitchen types
- Add hiring waitress
- And hiring a guy for cleaning


+ Add dirty plates on the table
+ Reset timer if they get at least one

+ Make it people stay at the table much longer
+ People walk on the street
- Cars
- Add lock for side cafe
+ Add physics
+ Add better UI like fireplace icon etc.

## Details for completionist
Definition : someone who tends to complete every single task given to them. That guy finished all the quests in the video game. He's a completionist.

- They wanna unlock new stuff and look for it
- They wanna watch their workers work and see this whole automated empire
- They wanna see a progression with a bar, see achivements and unlocking levels, implement that

+ Add eating animation
- Customers takes items from wrong carry point index
+ Fix chat baloons


- Focus reward ads first
- Finish designing the map


+ Happy customer count
+ Negative customer count
+ Limit table plate
- Show cleaning area
- Add boss customer that is fat (different walking animation)

+ Add door for kitchen
+ Add coke

- chair animation

## New menu
- 200 USD
- Chef 300 USD


- Design the #CAFE
+ Remove loading bar for taking

## Thinks
- After 5 minutes, it gets boring, we need to introduce new things
- Like A.I. cleaner, that takes plates and helps me to run restourant

+ Fix the issue with cleaning
+ A.I. chef
+ Trash bin
+ Enable next station
+ Table cleaning
+ Timer problem
+ max available point

+ New station bug should be fixed
+ Little timer that shows up on customers for getting angry
+ Dropping items problem
+ Add an option so they want 2 and more same thing
- Ice cream bar



+ Create table object with paying
+ Customer manager, where basically customers will go to empty tables
+ Grabbing plates, multiple plates and delivering them will provide cash
+ Drop cash to the ground, make them collectable
+ Customers will leave if you don't deliver in 5 seconds
+ Multiple carry
- Cleaning lady
- Cosmetics
- Their head can look at me
- Different characters
+ Openning new menus

## Ads
- 2x more expensive menus for 30 seconds
- sell special donut for 30 seconds (people go crazy for it)
- extra 100 cash money with ads
- faster boots (speeds up character)
- ads for customer frenzyd


## Testing with different people
-2:27: ufaktan sıktı
-3:10: +25 dolar teklifine yetişemedim, üzüldüm. anlamam zaman aldı
-4:40: 2. masamı açtım, işler hızlandı, heyecan arttı
-2. +25 dolar teklifi geldi, gidip harcamaya çalıştım ama öyle olmuyormuş, herhalde tıklamam gerekiyormuş
-4:00'da sıkıldım. daha fazla burger yapabilme imkanı yok.
-6:42 sıkıldım
-rush oldu çok sıkıştım, heyecan yükseldi
-8:00 işler çoğaldı ama imkanlar kolaylaşmadı
-10:00 yardımcı eleman geldi
-11:50 elemanın yardım ettiğini görünce patatesi açmaya cesaret edebildim
-12:20 eleman boş duruyor ve sadece boşları alıyor, sanırım sadece lobi görevlisi imiş
-16:00 chef alma imkanı çıktı, aldım
-18:33 müşterilerin para harcayıp özenle yerleştirdiğim çiçeklere tepki vermemeleri beni üzdü
-20:00 elemanımın boşu elimden alması hoşuma gitti
-21:00 son 11 dk boyunca para sıkıntısı çekmediğimi farkettim
-22:50: 4. masayı açtım
-24:00 çok sıkıldım
-24:40 tüm masalar birsürü içecek istedi, stok yapmak mümkün olmadığı için iki tanesini kaçırdım ve kapattım 
Notes from my latest gameplay session:
Chef cooks too fast, there always have been burgers and potatoes ready for me to take
The inability to drop things I accidentally pick up have been a problem from start to end
Getting money from a star customer takes too much time. Whenever I go to the cash register to cash out a star customer, I felt like I wasted too much time for this fat ass person
No matter how much money I have, it was impossible to tend all of the drink ordering customers because it was too hard to generate drinks that fast
Accidental money spending was a problem. Spent almost $50 for the tables I didn't want to open yet.
Plants didn't affect anything
Ability to level up stations


Oyunu Seda'ya oynattım ve oynarken onu izledim herhangi bir yorum yapmadım ve karışmadım. Herşeyi kendisi bulması ve test etmesini görmek istedim. Onun yaşadığı zorlukları sonrasında kendim de test ettim en alt bölümde yorumlarımı yazdım.   @Cem 


Oyun sürelerine göre yorumlar;

-2. Dakika burger yapmak çok uzun sürüyor bu yüzden de oyunun akıcılığı olmadığı için sıkılmaya başladı.

-4. Dakikada yeni masa aldı ve müşteriler artmaya başladı.

-5. Dakika yanıma biri lazım hiçbir şeye yetişemiyorum yorumu oldu.

-12. Dakika garsonu yeni fark etti.

-13. Dakika pause seçeneği yok mu müşteriler sürekli kaçıyor yetişemiyorum.

-17. Dakikada reklamı yeni gördü görünmesi çok zor bir alanda çünkü ekranın genelde orta ve sol bölümüne dikkat ediyoruz.

-18. Dakikada Chef’i açtı.

-18:30 Bu chef ve garson çok iyiymiş işimi kolaylaştırdı. 

-22. Dakikada artık yapacak hiçbir şey kalmadığı için aşırı sıkıldı.

-23:40 Storage alanı açıldı ve oradaki çiçeğin üzerine geldi çiçeği elinden bırakamadığı için her yere koyması gerekti ve tüm parasını çiçeklere harcamak zorunda kaldı.

-25:30 Dakikada şef ve garsona sürekli takıldığı için kızdı.

-26:30 artık oynamak istemediği için oyunu kapattı. ( Normalde 10. Dakikada kapatırdı fakat test etmesini istediğim için uzun sürdü. ) 
------------------------------------------------------------------------------------------ 

Genel yorumlar ve düşünceleri; 

Kasada para toplarken 1 1 1 ya da 2 2 2 yazması çok hoşuna gitmedi. Bunun yerine müşteriler parayı masaya koysun direkt ben tek seferde hızlıca alıyım böylece 2 defa beklememiş olurum yorumunda bulundu. Bu bana da mantıklı geldi çünkü o kadar çok şeyle uğraşmak gerekiyor ki bi de orada zaman kaybediyoruz. Buna ek olarak Monkey’deki kasadaki elemanı çok sevdi orada para birikmesi onu tatmin etti "Oooo paralara bak harika bir sürü" yorumunda bulundu. Kasada sıra olmalarını sağlasak iyi olabilir çünkü zaten yetişemediği için belki 3 kişi ya da maksimum 5 kişi sıra olabilir sonra kasaya birini alarak kasanın üzerinde biriken paraları sadece toplamak için gidebiliriz. 

Açılacak alanların üzerinde bir süre durunca para ödemesi gerekiyor. Örneğin 2 saniye ya da 1 saniye kadar bekleyince para vermeye başlaması gerekiyor. Çünkü siparişleri götürürken sürekli olarak o alanların üzerinden geçti ve parasını kaybetti. Bunu fark ettiğinde de sürekli olarak etrafından dolaşmaya başladı bu da zaman kaybettirdi. 

Maksimum 3 adet içecek hamburger ve patates yapabiliyoruz. Fakat maksimum olduğunu belirten herhangi bir simge veya yazı yok aynı şekilde elinde taşıdığı siparişlerin de maksimum kaç tane olduğu anlaşılmadığı için yaklaşık bir dakika kadar hala hamburgeri almaya çalıştı. Anlamayınca neden almıyor diye sinirlendi. 

Müşteri siparişlerinin üzerinde ne kadar sinirlenme süresi kaldı göremiyor muyum ? Göremediğim için bazen siparişleri kaçırıyorum.  Evet üzerinde bir kırmızı bar var ama patates kızartmasının oraya inince artık göremiyorum yorumunda bulundu. Büyük ekranlarda hiç görünmüyor fakat laptop gibi ekranlarda o süre sorunsuz görünebiliyor. 

Elimde 3 tane hamburger var bunlar gidip başka bir şey sipariş veriyor atmak zorunda kalmak hoşuma gitmedi Monkey’de elimde kalsa bile onu tezgaha ya da başka bir yere hızlıca koyabiliyorum yorumunda bulundu. Eğer o an elinde 2 hamburger varsa gelen müşteri içecek yerine hamburger siparişi verebilir mi böylece çöpe atmasına gerek kalmaz. 

Hamburger patates gibi şeylerin sayısı çok az bu yüzden yetişemiyorum ama Monkey’de her şeyi rahat rahat stoklayıp müşteriler kendileri siparişleri alabiliyor ya da stoktan hızlıca teslim edebiliyorum yorumunda bulundu. 

İlk başta oyun beni çok gerdiği için soğudum daha az müşteri gelebilirdi çünkü yetişmeye çalıştıkça ve kaçırdıkça başarısız oldum hissi uyandırıyor. ( Açılacak alanların üstünden siparişleri teslim etmek için geçtiği için o istemeden o alanlar açıldı ve kendi kendine işleri daha da zorlaştırdı ) 
 
Karakter ekranında kız karakter için uygun renk ve kıyafet seçeneği olmadığı için hoşuna gitmedi. Etek vs neden yok erkekler için mi sadece ben belki kız restoran sahibi olmak istiyorum sadece erkeklere göre yorumunda bulundu. ( Ama Monkey’de de cinsiyet seçemiyorsun dediğimde ama o maymun neden seçeyim ki dedi, çok mantıklı geldi )
------------------------------------------------------------------------------------------ 

Ne olsa daha iyi olurdu ? 

Genel olarak hamburger vb şeyler daha hızlı yapılabilirse daha iyi olabilir hızını %50 arttırabiliriz. Böylece stok yapma ihtiyacından kurtulmuş oluruz. 
 
Açılacak alanların üzerindeki ikonları kaldırmalıyız. Böylece sonra ne olacak acaba burada ne açılacak hissini yeni oyuncularda uyandırmak için böyle bir güncelleme yapabiliriz. Buna ek olarak o alanları highlight edebiliriz. Böylece açılması gerektiğini anlayabilirler. 
 
Kasada bekleyen müşteriler olabilir. Kasadaki müşterilere de yetişmeyi bir oranda azaltmak için böyle bir şey yapabiliriz. Birbiri arkasında bekleyen maksimum 4 ya da 5 kişi olarak sınırlandırabiliriz. 
 
Müşterilerden parayı alırken direkt olarak kasa masasının üstünden parayı alabiliriz. Böylece hem müşterinin vermesini hem de almayı beklememiş oluruz bu bize %50 zaman kazandırır. 
 
Garson ve Şef’in içinden geçilebilir olması çok iyi olabilir çünkü hem onlara takılıyoruz hem de çöpe atmamız gereken bir şey olduğunda garsonun yana çekilmesini beklememiz gerekiyor.
 
Masalara siparişi teslim ederken sadece belirli bir açıdan teslim edersek elindeki tabağı bırakıyor. Bu da oyundaki akıcılığı düşürüyor. Siparişleri teslim alırken herhangi bir sorun yok fakat teslim ederken belirli bir yerde durmak gerekiyor, bunu düzenler ve her yerden teslim edilebilir hale getirirsek tık aldım tık bıraktım hızlı bir oyun deneyimi sağlamış oluruz. 
 
Eğer elimde o an 2 hamburger var ise yeni gelen müşteri hamburger sipariş etmeli ki elimdeki hamburgerleri çöpe atmak yerine ona teslim edebilirsek daha iyi olabilir. Eğer elimde 3 tane hamburgerle bekliyorum o zaman ne olacak dersek de 2 masa varsa gelen 2. kişi farklı bir sipariş vererek sürekli hamburger teslimatını ya da içecek teslimatını engellemiş oluruz.
------------------------------------------------------------------------------------------

Monkey'de sevdiği şeyler; 

Kasada para birikmesine bayıldı hatta onunla ilgili bir de fotoğraf paylaşıyor olacağım. 

Oyunun akıcılığını ve stok yapabilmeyi çok sevdi. 

Uyuya kalan yardımcıları çok sevdi.