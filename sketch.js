/*

The Game Project Final - Bring it all together

My Comments
I have add extensios including:
- sounds for the game character movement, including jumping, walking and plummeting, and when the game character reaches the flagpole
- platforms that the game character can jump on, and the game character will move with the platform
- two enemies that move in a set range

What I am proud of, and was difficult, was to enable the game character to move with the platform after jumping onto a platform.
The platforms move forward and back, without the user needing to do anything, the game character will move with the platform.

What was difficult was to get the game character to interact with the enemies.
What I also difficult was to create a firing capability for the game character's defense to interact with the enemies.

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees_x;
var trees_y;
var collectables;
var clouds;
var darkclouds;
var emit1; // variable for killer rain clouds
var emit2; // variable for killer rain clouds
var killerclouds;
var drop1; // variable for rain with cloud one
var drop2; // variable for rain with cloud two
var moutains;
var canyons;
var platforms;
var range; // variable for range of platform movement

var game_score;
var flagpole;
var total_lives;
var defense; // variable for defense item
var enemies;

var jumpSound;
var zapSound;
var wetFootSound;
var sweepSound;
var descentSound;
var cannonSound;


function preload() {
    radio = loadImage("images/radio.png"); // nuclear symbol image

    soundFormats('mp3', 'wav');

    jumpSound = loadSound("assets/jump.wav");
    jumpSound.setVolume(0.1);
    zapSound = loadSound('assets/zapsplat.mp3')
    zapSound.setVolume(0.1);
    wetFootSound = loadSound('assets/wetFoot.mp3')
    wetFootSound.setVolume(0.1);
    sweepSound = loadSound('assets/sweeping.mp3')
    sweepSound.setVolume(0.1);
    descendSound = loadSound('assets/descend.mp3')
    descendSound.setVolume(0.1);
    cannonSound = loadSound('assets/cannon.mp3')
    cannonSound.setVolume(0.4);
}


function setup() {
    createCanvas(1024, 576);

    floorPos_y = height * 3 / 4; // 432

    total_lives = 3;

    startGame();
}


function draw() {
    background(100, 155, 255); // fill the sky blue

    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, width, height / 4); // draw some green ground

    // scrolling code -----------------------------------------------------------------------------

    push();
    translate(scrollPos, 0);

    // Draw clouds. At line ~695 ------------------------------------------------------------------

    drawClouds();

    // Draw mountains. At line ~720 ---------------------------------------------------------------

    drawMountains();

    // Draw rain clouds. At linke ~780 ------------------------------------------------------------

    drawDarkClouds();

    // Draw trees. At line ~745 -------------------------------------------------------------------

    drawTrees();

    // Draw killer rain clouds. At line ~1200 -----------------------------------------------------

    emit1 = new Emitter(120, 250, 0, -1, 10, color(random(110, 140), 0, random(110, 140), 50));
    emit1.startEmitter(100, 100);
    emit1.updateParticles();

    emit2 = new Emitter(820, 250, 0, -1, 10, color(random(110, 140), 0, random(110, 140), 50));
    emit2.startEmitter(100, 100);
    emit2.updateParticles();

    for (var i = 0; i < 50; i++) {
        drop1[i].shower();
        drop1[i].update();
    }

    for (var i = 0; i < 50; i++) {
        drop2[i].shower();
        drop2[i].update();
    }

    // Draw platform items. At line ~940 ----------------------------------------------------------

    drawPlatforms();

    // Draw canyons. At line ~870 -----------------------------------------------------------------

    for (var i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }

    // Draw collectables. At line ~895 ------------------------------------------------------------

    for (var i = 0; i < collectables.length; i++) {
        if (!collectables[i].isFound) {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        }
    }

    // Draw defense items. At line ~920 -----------------------------------------------------------

    for (var i = 0; i < defense.length; i++) {
        if (!defense[i].ifFound) {
            drawDefense(defense[i]);
            checkDefense(defense[i]);
        }
    }

    // Draw radioactive image ---------------------------------------------------------------------

    image(radio, 805, 410, 30, 30);
    image(radio, 105, 410, 30, 30);

    renderFlagpole();

    // Draw enemies. At line ~1250 ----------------------------------------------------------------

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();

        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        if (isContact === true) {
            if (total_lives > 0) {
                total_lives -= 1;
                startGame();
                break;
            }
        }
    }

    pop();
    // end scrolling code -------------------------------------------------------------------------


    // Draw game character ------------------------------------------------------------------------

    drawGameChar(); // At line ~205

    // draw the score and lives -------------------------------------------------------------------
    push();
    fill(0);
    noStroke();
    textSize(20);
    text("SCORE: " + game_score, 20, 50);
    text("LIVES: " + total_lives, 900, 50);
    text("LIVES: ", width / 2 - 90, 50);
    for (var i = 0; i < total_lives; i++) {
        fill(255, 215, 0);
        ellipse(width / 2 + i * 50, 40, 40, 40);
        fill(0, 0, 128);
        ellipse(width / 2 + i * 50, 40, 20, 20);
    }
    pop();

    // --------------------------------------------------------------------------------------------

    // check when lives < 1; Game Over ------------------------------------------------------------
    if (total_lives < 1) {
        push()
        fill(0);
        textSize(30);
        textAlign(CENTER)
        text("GAME OVER!", width / 2, 100);
        text("Press space bar to continue.", width / 2, 150);
        pop();
        return; //exit from draw function to prevent further game logic
    }

    // check when flagpole is reached; Level Complete ---------------------------------------------
    if (flagpole.isReached) {
        push()
        fill(0);
        textSize(30);
        textAlign(CENTER)
        text("LEVEL COMPLETE!", width / 2, 100);
        text("Press space bar to continue.", width / 2, 150);
        pop();
        return; //exit from draw function to prevent further game logic
    }

    // Logic to make the game character move or the background scroll -----------------------------

    if (isLeft === true && isPlummeting === false) {
        if (gameChar_x > width * 0.2) {
            gameChar_x -= 5;
        } else {
            scrollPos += 5;
        }
    }

    if (isRight === true && isPlummeting === false) {
        if (gameChar_x < width * 0.8) {
            gameChar_x += 5;
        } else {
            scrollPos -= 5; // negative for moving against the background
        }
    }

    // Logic to make the game character slowly fall back to ground level --------------------------

    if (gameChar_y < floorPos_y) {
        var isContact = false;
        for (var i = 0; i < platforms.length; i++) {
            if (checkPlatform(gameChar_world_x, gameChar_y) === true) {
                isContact = true;
                isFalling = false;
                if (platforms[i].left === false) {
                    gameChar_x += 0.1;
                } else if (platforms[i].left === true) {
                    gameChar_x -= 0.1;
                }
            }
        }
        if (isContact === false) {
            gameChar_y += 3;
            isFalling = true;
        }
    } else {
        isFalling = false;
    }

    if (isPlummeting === true) { // character plummeting into the canyon --------------------------
        gameChar_y += 3;
        gameChar_x += random(-4, 4);
        descendSound.play(0.1);
    }

    if (!flagpole.isReached) {
        checkFlagpole();
    }

    checkPlayerDie();

    // Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;
}

// ------------------------------------------------------------------------------------------------
// Key control functions
// ------------------------------------------------------------------------------------------------

function keyPressed() {
    // if statements to control the animation of the character when
    // keys are pressed.


    if (keyCode == 37 && flagpole.isReached === false) { // left arrow key
        isLeft = true;
        sweepSound.play();
    }

    if (keyCode == 39 && flagpole.isReached === false) { // right arrow key
        isRight = true;
        sweepSound.play();
    }

    // space bar for character jump
    if (keyCode == 32 && isPlummeting === false && flagpole.isReached === false) {
        if (!isFalling) {
            gameChar_y -= 150;
            jumpSound.play();
        }
    }
}

function keyReleased() {
    // if statements to control the animation of the character when -------------------------------
    // keys are released --------------------------------------------------------------------------

    if (keyCode == 37) {
        isLeft = false;
    }

    if (keyCode == 39) {
        isRight = false;
    }
}

// ------------------------------------------------------------------------------------------------
// Game character render function
// ------------------------------------------------------------------------------------------------

// Function to draw the game character ------------------------------------------------------------

function drawGameChar() {

    if (flagpole.isReached === false && total_lives != 0) {
        // draw game character
        if (isLeft && isFalling && defense[0].ifFound === true) { // jumping and facing left with gun
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 76, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 82, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x - 8, gameChar_y - 60, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 6, gameChar_y - 54);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 10, gameChar_y - 26, 7, 8, 5); // legs
            rect(gameChar_x, gameChar_y - 26, 7, 8, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x - 12, gameChar_y - 68, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 16, gameChar_y - 20, 15, 10, 5); // feet
            rect(gameChar_x, gameChar_y - 20, 15, 10, 5); // feet
            fill(10, 10, 10);
            noStroke();
            rect(gameChar_x - 26, gameChar_y - 52, 14, 8, 5); // gun
            rect(gameChar_x - 18, gameChar_y - 72, 6, 24, 5); // gun

        } else if (isLeft && isFalling) { // jumping and facing left
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 76, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 82, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x - 8, gameChar_y - 60, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 6, gameChar_y - 54);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 10, gameChar_y - 26, 7, 8, 5); // legs
            rect(gameChar_x, gameChar_y - 26, 7, 8, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x - 12, gameChar_y - 68, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 16, gameChar_y - 20, 15, 10, 5); // feet
            rect(gameChar_x, gameChar_y - 20, 15, 10, 5); // feet

        } else if (isRight && isFalling && defense[0].ifFound === true) { // jumping and facing right with gun
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 76, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 82, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x + 8, gameChar_y - 60, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x + 4, gameChar_y - 54);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 7, gameChar_y - 26, 7, 8, 5); // legs
            rect(gameChar_x + 4, gameChar_y - 26, 7, 8, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x + 6, gameChar_y - 68, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 13, gameChar_y - 20, 15, 10, 5); // feet
            rect(gameChar_x + 3, gameChar_y - 20, 15, 10, 5); // feet
            fill(10, 10, 10);
            noStroke();
            rect(gameChar_x + 12, gameChar_y - 55, 14, 8, 5); // gun
            rect(gameChar_x + 12, gameChar_y - 74, 6, 24, 5); // gun

        } else if (isRight && isFalling) { // jumping and facing right
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 76, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 82, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x + 8, gameChar_y - 60, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x + 4, gameChar_y - 54);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 7, gameChar_y - 26, 7, 8, 5); // legs
            rect(gameChar_x + 4, gameChar_y - 26, 7, 8, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x + 6, gameChar_y - 68, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 13, gameChar_y - 20, 15, 10, 5); // feet
            rect(gameChar_x + 3, gameChar_y - 20, 15, 10, 5); // feet

        } else if (isLeft && defense[0].ifFound === true) { // walking to the left with gun
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 70, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 76, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x - 8, gameChar_y - 62, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 6, gameChar_y - 54);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 10, gameChar_y - 26, 7, 18, 5); // legs
            rect(gameChar_x, gameChar_y - 26, 7, 18, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x - 12, gameChar_y - 48, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 18, gameChar_y - 10, 15, 10, 5); // feet
            rect(gameChar_x - 3, gameChar_y - 10, 15, 10, 5); // feet
            fill(10, 10, 10);
            noStroke();
            rect(gameChar_x - 18, gameChar_y - 35, 8, 14, 5); // gun
            rect(gameChar_x - 34, gameChar_y - 35, 24, 6, 5); // gun

        } else if (isLeft) { // walking to the left
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 70, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 76, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x - 8, gameChar_y - 62, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 8, gameChar_y - 58);
            curveVertex(gameChar_x - 6, gameChar_y - 54);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 10, gameChar_y - 26, 7, 18, 5); // legs
            rect(gameChar_x, gameChar_y - 26, 7, 18, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x - 12, gameChar_y - 48, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 18, gameChar_y - 10, 15, 10, 5); // feet
            rect(gameChar_x - 3, gameChar_y - 10, 15, 10, 5); // feet

        } else if (isRight && defense[0].ifFound === true) { // walking to the right with gun
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 70, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 76, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x + 8, gameChar_y - 60, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x + 4, gameChar_y - 54);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 7, gameChar_y - 26, 7, 18, 5); // legs
            rect(gameChar_x + 4, gameChar_y - 26, 7, 18, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x + 4, gameChar_y - 48, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 13, gameChar_y - 10, 15, 10, 5); // feet
            rect(gameChar_x + 2, gameChar_y - 10, 15, 10, 5); // feet
            fill(10, 10, 10);
            noStroke();
            rect(gameChar_x + 10, gameChar_y - 35, 8, 14, 5); // gun
            rect(gameChar_x + 10, gameChar_y - 35, 24, 6, 5); // gun

        } else if (isRight) { // walking to the right
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 16, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 70, 20, 6); // hat
            rect(gameChar_x - 8, gameChar_y - 76, 16, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // left eye
            fill(205, 92, 92);
            ellipse(gameChar_x + 8, gameChar_y - 60, 4, 4); // nose
            beginShape(); //mouth start
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 58);
            curveVertex(gameChar_x + 4, gameChar_y - 54);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            curveVertex(gameChar_x + 8, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 7, gameChar_y - 52, 12, 30, 5); // body
            rect(gameChar_x - 7, gameChar_y - 26, 7, 18, 5); // legs
            rect(gameChar_x + 4, gameChar_y - 26, 7, 18, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x + 4, gameChar_y - 48, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 13, gameChar_y - 10, 15, 10, 5); // feet
            rect(gameChar_x + 3, gameChar_y - 10, 15, 10, 5); // feet

        } else if (isFalling && defense[0].ifFound === true ||
            isPlummeting && defense[0].ifFound === true) { // falling or plummeting front facing with gun
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 22, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 76, 24, 6); // hat
            rect(gameChar_x - 10, gameChar_y - 82, 20, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // right eye
            ellipse(gameChar_x, gameChar_y - 62, 3, 3); // nose
            fill(205, 92, 92);
            ellipse(gameChar_x, gameChar_y - 56, 6, 6); // mouth
            fill(0, 0, 128); // body
            rect(gameChar_x - 10, gameChar_y - 52, 20, 35, 5); // body
            fill(65, 105, 225); // arms
            rect(gameChar_x - 15, gameChar_y - 68, 8, 25, 5); // arms
            rect(gameChar_x + 8, gameChar_y - 68, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 18, gameChar_y - 20, 15, 10, 5); // feet
            rect(gameChar_x + 2, gameChar_y - 20, 15, 10, 5); // feet
            fill(10, 10, 10);
            noStroke();
            rect(gameChar_x + 10, gameChar_y - 55, 14, 8, 5); // gun
            rect(gameChar_x + 10, gameChar_y - 80, 6, 24, 5); // gun

        } else if (isFalling || isPlummeting) { // falling or plummeting front facing
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 22, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 76, 24, 6); // hat
            rect(gameChar_x - 10, gameChar_y - 82, 20, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // right eye
            ellipse(gameChar_x, gameChar_y - 62, 3, 3); // nose
            fill(205, 92, 92);
            ellipse(gameChar_x, gameChar_y - 56, 6, 6); // mouth
            fill(0, 0, 128); // body
            rect(gameChar_x - 10, gameChar_y - 52, 20, 35, 5); // body
            fill(65, 105, 225); // arms
            rect(gameChar_x - 15, gameChar_y - 68, 8, 25, 5); // arms
            rect(gameChar_x + 8, gameChar_y - 68, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 18, gameChar_y - 20, 15, 10, 5); // feet
            rect(gameChar_x + 2, gameChar_y - 20, 15, 10, 5); // feet

        } else if (defense[0].ifFound === true) { // standing front facing with gun
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 22, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 70, 24, 6); // hat
            rect(gameChar_x - 10, gameChar_y - 76, 20, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // right eye
            ellipse(gameChar_x, gameChar_y - 62, 3, 3); // nose
            fill(205, 92, 92);
            beginShape(); // mouth start
            curveVertex(gameChar_x - 6, gameChar_y - 58);
            curveVertex(gameChar_x - 6, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 54);
            curveVertex(gameChar_x + 6, gameChar_y - 58);
            curveVertex(gameChar_x + 6, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 10, gameChar_y - 52, 20, 30, 5); // body
            rect(gameChar_x - 10, gameChar_y - 26, 7, 18, 5); // legs
            rect(gameChar_x + 3, gameChar_y - 26, 7, 18, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x - 15, gameChar_y - 48, 8, 25, 5); // arms
            rect(gameChar_x + 8, gameChar_y - 48, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 18, gameChar_y - 10, 15, 10, 5); // feet
            rect(gameChar_x + 2, gameChar_y - 10, 15, 10, 5); // feet
            fill(10, 10, 10);
            noStroke();
            rect(gameChar_x + 10, gameChar_y - 35, 8, 14, 5); // gun
            rect(gameChar_x + 10, gameChar_y - 35, 24, 6, 5); // gun

        } else { // standing front facing
            fill(255, 182, 193); // head
            ellipse(gameChar_x, gameChar_y - 62, 22, 22); //head
            fill(40);
            ellipse(gameChar_x, gameChar_y - 70, 24, 6); // hat
            rect(gameChar_x - 10, gameChar_y - 76, 20, 6, 2); // hat
            fill(0);
            ellipse(gameChar_x - 4, gameChar_y - 64, 3, 3); // left eye
            ellipse(gameChar_x + 4, gameChar_y - 64, 3, 3); // right eye
            ellipse(gameChar_x, gameChar_y - 62, 3, 3); // nose
            fill(205, 92, 92);
            beginShape(); //mouth start
            curveVertex(gameChar_x - 6, gameChar_y - 58);
            curveVertex(gameChar_x - 6, gameChar_y - 58);
            curveVertex(gameChar_x, gameChar_y - 54);
            curveVertex(gameChar_x + 6, gameChar_y - 58);
            curveVertex(gameChar_x + 6, gameChar_y - 58);
            endShape(); // mouth end
            fill(0, 0, 128); // body
            rect(gameChar_x - 10, gameChar_y - 52, 20, 30, 5); // body
            rect(gameChar_x - 10, gameChar_y - 26, 7, 18, 5); // legs
            rect(gameChar_x + 3, gameChar_y - 26, 7, 18, 5); // legs
            fill(65, 105, 225); // arms
            rect(gameChar_x - 15, gameChar_y - 48, 8, 25, 5); // arms
            rect(gameChar_x + 8, gameChar_y - 48, 8, 25, 5); // arms
            fill(139, 69, 19); // feet
            rect(gameChar_x - 18, gameChar_y - 10, 15, 10, 5); // feet
            rect(gameChar_x + 2, gameChar_y - 10, 15, 10, 5); // feet

        }
    }
}

// ------------------------------------------------------------------------------------------------
// Background render functions
// ------------------------------------------------------------------------------------------------

// Function to draw cloud objects -----------------------------------------------------------------

function drawClouds() {
    for (var i = 0; i < clouds.length; i++) { // grouping of four clouds below
        fill(255, 255, 240);
        ellipse(clouds[i].pos_x += clouds[i].speed, clouds[i].pos_y, // anchors for clouds[i].pos_x and clouds[i].pos_y
            clouds[i].cloudSize, clouds[i].cloudSize); // anchor clouds[i].cloudSize
        fill(255, 230, 230);
        ellipse(clouds[i].pos_x2 += clouds[i].speed, clouds[i].pos_y - 15,
            clouds[i].cloudSize, clouds[i].cloudSize);
        fill(255, 240, 240);
        ellipse(clouds[i].pos_x3 += clouds[i].speed, clouds[i].pos_y + 15,
            clouds[i].cloudSize, clouds[i].cloudSize);
        fill(255, 245, 245);
        ellipse(clouds[i].pos_x4 += clouds[i].speed, clouds[i].pos_y - 25,
            clouds[i].cloudSize, clouds[i].cloudSize);
        clouds[i].pos_y += random(-0.2, 0.2);
        if (clouds[i].pos_x >= flagpole.x_pos) {
            clouds[i].pos_x = -260;
            clouds[i].pos_x2 = -280;
            clouds[i].pos_x3 = -220;
            clouds[i].pos_x4 = -240;
        }
    }
}

// Function to draw mountains objects -------------------------------------------------------------

function drawMountains() {
    for (var i = 0; i < mountains.length; i++) {
        fill(60, 60, 60);
        quad(mountains[i].pos_x, 432, // anchor for mountains[i].pos_x
            mountains[i].pos_x + 40, mountains[i].height + 120,
            mountains[i].pos_x + 80, mountains[i].height + 100,
            mountains[i].pos_x + 180, 432);
        fill(235, 235, 235);
        triangle(mountains[i].pos_x + 40, mountains[i].height + 120,
            mountains[i].pos_x + 55, mountains[i].height + 40,
            mountains[i].pos_x + 80, mountains[i].height + 100)
        fill(100, 100, 100)
        triangle(mountains[i].pos_x + 20, 432,
            mountains[i].pos_x + 120, mountains[i].height + 30,
            mountains[i].pos_x + 220, 432)
        fill(120, 120, 120)
        triangle(mountains[i].pos_x + 40, 432,
            mountains[i].pos_x + 100, mountains[i].height + 100,
            mountains[i].pos_x + 150, 432)
    }
}

// Function to draw trees objects -----------------------------------------------------------------

function drawTrees() {
    for (var i = 0; i < trees.length; i++) {
        fill(160, 82, 45);
        rect(trees[i].pos_x, trees[i].pos_y + (150 - trees[i].height), 30, trees[i].height, 5); // tree trunk; anchor for trees.pos_x[i], trees[i].pos_y
        fill(0, 100, 0);
        triangle(trees[i].pos_x - 40, trees[i].pos_y + (150 - trees[i].height) + 10, // tree greenary
            trees[i].pos_x + 70, trees[i].pos_y + (150 - trees[i].height) + 10,
            trees[i].pos_x + 15, trees[i].pos_y + (150 - trees[i].height) - 50);
        fill(0, 128, 0);
        triangle(trees[i].pos_x - 35, trees[i].pos_y + (150 - trees[i].height) - 10, // tree greenary
            trees[i].pos_x + 65, trees[i].pos_y + (150 - trees[i].height) - 10,
            trees[i].pos_x + 15, trees[i].pos_y + (150 - trees[i].height) - 70);
        fill(34, 139, 34);
        triangle(trees[i].pos_x - 30, trees[i].pos_y + (150 - trees[i].height) - 30, // tree greenary
            trees[i].pos_x + 60, trees[i].pos_y + (150 - trees[i].height) - 30,
            trees[i].pos_x + 15, trees[i].pos_y + (150 - trees[i].height) - 90);
        fill(46, 139, 87);
        triangle(trees[i].pos_x - 25, trees[i].pos_y + (150 - trees[i].height) - 50, // tree greenary
            trees[i].pos_x + 55, trees[i].pos_y + (150 - trees[i].height) - 50,
            trees[i].pos_x + 15, trees[i].pos_y + (150 - trees[i].height) - 110);
        noStroke();
        fill(139, 0, 0);
        ellipse(trees[i].pos_x - 10, trees[i].pos_y + (150 - trees[i].height) - 5, 10, 10);
        ellipse(trees[i].pos_x + 40, trees[i].pos_y + (150 - trees[i].height) + 0, 10, 10);
        ellipse(trees[i].pos_x + 30, trees[i].pos_y + (150 - trees[i].height) - 20, 10, 10);
        ellipse(trees[i].pos_x + 10, trees[i].pos_y + (150 - trees[i].height) - 30, 10, 10);
        ellipse(trees[i].pos_x - 5, trees[i].pos_y + (150 - trees[i].height) - 45, 10, 10);
        ellipse(trees[i].pos_x + 30, trees[i].pos_y + (150 - trees[i].height) - 50, 10, 10);
        ellipse(trees[i].pos_x + 10, trees[i].pos_y + (150 - trees[i].height) - 60, 10, 10);
        ellipse(trees[i].pos_x + 30, trees[i].pos_y + (150 - trees[i].height) - 70, 10, 10);
        ellipse(trees[i].pos_x + 10, trees[i].pos_y + (150 - trees[i].height) - 85, 10, 10);
        ellipse(trees[i].pos_x + 15, trees[i].pos_y + (150 - trees[i].height) - 110, 20, 20);
    }
}

// Function to draw dark clouds objects -----------------------------------------------------------

function drawDarkClouds() {
    for (var i = 0; i < darkclouds.length; i++) { // grouping of four clouds below
        fill(90, 90, 90);
        ellipse(darkclouds[i].pos_x -= darkclouds[i].speed, darkclouds[i].pos_y, // anchors for darkclouds[i].pos_x and darkclouds[i].pos_y
            darkclouds[i].cloudSize, darkclouds[i].cloudSize);
        fill(80, 80, 80);
        ellipse(darkclouds[i].pos_x2 -= darkclouds[i].speed, darkclouds[i].pos_y - 10,
            darkclouds[i].cloudSize, darkclouds[i].cloudSize);
        fill(95, 95, 95);
        ellipse(darkclouds[i].pos_x3 -= darkclouds[i].speed, darkclouds[i].pos_y - 10,
            darkclouds[i].cloudSize, darkclouds[i].cloudSize);
        fill(80, 80, 80);
        ellipse(darkclouds[i].pos_x4 -= darkclouds[i].speed, darkclouds[i].pos_y - 25,
            darkclouds[i].cloudSize, darkclouds[i].cloudSize);
        fill(85, 85, 85);
        ellipse(darkclouds[i].pos_x5 -= darkclouds[i].speed, darkclouds[i].pos_y - 35,
            darkclouds[i].cloudSize, darkclouds[i].cloudSize);
        fill(90, 90, 90);
        ellipse(darkclouds[i].pos_x6 -= darkclouds[i].speed, darkclouds[i].pos_y - 30,
            darkclouds[i].cloudSize, darkclouds[i].cloudSize);
        darkclouds[i].pos_y += random(-0.2, 0.2);
        if (darkclouds[i].pos_x <= -100) {
            darkclouds[i].pos_x = 1100;
            darkclouds[i].pos_x2 = 1110;
            darkclouds[i].pos_x3 = 1070;
            darkclouds[i].pos_x4 = 1090;
            darkclouds[i].pos_x5 = 1095;
            darkclouds[i].pos_x6 = 1115;
        }
    }
}

// Function to draw killer rain -------------------------------------------------------------------

function Drop1() {
    this.x = random(795, 840);
    this.y = random(280, 432);

    this.shower = function() {
        noStroke();
        fill(139, 0, 139);
        ellipse(this.x, this.y, random(1, 6), random(1, 6));
    }

    this.update = function() {
        this.speed = random(3, 5);
        this.gravity = 1.01;
        this.y = this.y + this.speed * this.gravity;

        if (this.y > 432) {
            this.y = 280;
            this.gravity = 0;
        }
    }
}

// Function to draw killer rain -------------------------------------------------------------------

function Drop2() {
    this.x = random(95, 140);
    this.y = random(280, 432);

    this.shower = function() {
        noStroke();
        fill(139, 0, 139);
        ellipse(this.x, this.y, random(1, 6), random(1, 6));
    }

    this.update = function() {
        this.speed = random(3, 5);
        this.gravity = 1.01;
        this.y = this.y + this.speed * this.gravity;

        if (this.y > 432) {
            this.y = 280;
            this.gravity = 0;
        }
    }
}

// ------------------------------------------------------------------------------------------------
// Canyon render and check functions
// ------------------------------------------------------------------------------------------------

// Function to draw canyon objects ----------------------------------------------------------------

function drawCanyon(t_canyon) {
    fill(120, 120, 120);
    quad(t_canyon.pos_x, 432, t_canyon.pos_x + t_canyon.width, 432, t_canyon.pos_x + t_canyon.width * 0.9, 576, t_canyon.pos_x + t_canyon.width * 0.1, 576); // t_canyon.pos_x anchor
    fill(90, 90, 90);
    quad(t_canyon.pos_x, 432, t_canyon.pos_x + t_canyon.width * 0.95, 432, t_canyon.pos_x + t_canyon.width * 0.7, 576, t_canyon.pos_x + t_canyon.width * 0.15, 576);
    fill(70, 70, 70);
    quad(t_canyon.pos_x, 432, t_canyon.pos_x + t_canyon.width * 0.9, 432, t_canyon.pos_x + t_canyon.width * 0.6, 576, t_canyon.pos_x + t_canyon.width * 0.2, 576);
    fill(50, 50, 50);
    quad(t_canyon.pos_x, 432, t_canyon.pos_x + t_canyon.width * 0.85, 432, t_canyon.pos_x + t_canyon.width * 0.5, 576, t_canyon.pos_x + t_canyon.width * 0.25, 576);
    t_canyon.width = max(90, t_canyon.width += random(-0.5, 0.5));
}

// Function to check character is over a canyon -------------------------------

function checkCanyon(t_canyon) {
    if ((gameChar_world_x < t_canyon.pos_x + t_canyon.width && gameChar_world_x > t_canyon.pos_x && gameChar_y == floorPos_y) ||
        (gameChar_world_x > t_canyon.pos_x && gameChar_world_x < t_canyon.pos_x + t_canyon.width && gameChar_y == floorPos_y)) {
        isPlummeting = true;
    }
}

// ------------------------------------------------------------------------------------------------
// Collectable items render and check functions
// ------------------------------------------------------------------------------------------------

// Function to draw collectable objects -----------------------------------------------------------

function drawCollectable(t_collectable) {
    fill(184, 134, 11); // outer colour for base circle
    ellipse(t_collectable.pos_x, t_collectable.pos_y, // anchor for t_collectable_pos_x / pos_y
        t_collectable.size, t_collectable.size); // anchor for t_collectable.size
    fill(255, 215, 0); // inner colour for base circle
    ellipse(t_collectable.pos_x, t_collectable.pos_y,
        t_collectable.size - 10, t_collectable.size - 10);
    fill(220, 20, 60); // red circle above
    ellipse(t_collectable.pos_x, t_collectable.pos_y - 20,
        t_collectable.size - 10, t_collectable.size - 20);
    fill(218, 165, 32); // inner circle for red circle
    ellipse(t_collectable.pos_x, t_collectable.pos_y - 20,
        t_collectable.size - 35, t_collectable.size - 35);
}

// Function to check character has collected an item ----------------------------------------------

function checkCollectable(t_collectable) {
    if (dist(gameChar_world_x, gameChar_y, t_collectable.pos_x, t_collectable.pos_y) <
        t_collectable.size * 1.5) {
        t_collectable.isFound = true;
        game_score += 1;
    }
}

function drawDefense(t_defense) {
    push();
    fill(10, 10, 10);
    noStroke();
    rect(t_defense.x, t_defense.y, 8, 14, 5);
    rect(t_defense.x, t_defense.y - 2, 24, 6, 5);
    stroke(255, 215, 0);
    strokeWeight(4);
    fill(255, 215, 0, 80);
    ellipse(t_defense.x + 10, t_defense.y + 4, 44, 44);
    pop();
}

function checkDefense(t_defense) {
    if (dist(gameChar_world_x, gameChar_y, t_defense.x, t_defense.y) < 40) {
        t_defense.ifFound = true;
        console.log(t_defense.x, t_defense.y);
        console.log("collected");
    }
}

// Functions to create platforms ------------------------------------------------------------------

function drawPlatforms() {
    for (var i = 0; i < platforms.length; i++) {
        fill(150, 0, 0);
        noStroke();
        ellipse(platforms[i].x + 10, platforms[i].y + 15, 25, 25);
        ellipse(platforms[i].x + platforms[i].length * 0.5, platforms[i].y + 15, 25, 25);
        ellipse(platforms[i].x + platforms[i].length - 12, platforms[i].y + 15, 25, 25);
        fill(150, 0, 0);
        noStroke();
        rect(platforms[i].x, platforms[i].y, platforms[i].length, 20);
        fill(128, 0, 128);
        noStroke();
        ellipse(platforms[i].x + platforms[i].length * 0.5, platforms[i].y + 12, platforms[i].length, 30);
        fill(0);
        textSize(16);
        text("JUMP!", platforms[i].x + platforms[i].length * 0.3, platforms[i].y + 15);
        if (platforms[i].range == 80) {
            platforms[i].left = true
        } else if (platforms[i].range == 0) {
            platforms[i].left = false
        }
        if (platforms[i].left == false) {
            platforms[i].x += platforms[i].speed;
            platforms[i].range += 0.5;
        } else if (platforms[i].left == true) {
            platforms[i].x -= platforms[i].speed;
            platforms[i].range -= 0.5;
        }
    }
}

function checkPlatform(gameC_x, gameC_y) {
    for (var i = 0; i < platforms.length; i++)
        if (gameC_x > platforms[i].x && gameC_x < platforms[i].x + platforms[i].length) {
            var d = platforms[i].y - gameC_y;
            if (d >= 0 && d < 3) {
                return true;
            }
            return false;
        }
}

// ------------------------------------------------------------------------------------------------
// End of level conditions
// ------------------------------------------------------------------------------------------------

// Function to draw flagpole ----------------------------------------------------------------------

function renderFlagpole() {
    push();
    strokeWeight(10);
    stroke(100, 100, 100);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
    pop();
    if (!flagpole.isReached) {
        fill(139, 0, 0);
        rect(flagpole.x_pos + 5, floorPos_y - 40, 60, 35);
    } else {
        fill(220, 20, 60);
        rect(flagpole.x_pos + 5, floorPos_y - 245, 80, 60);
        rect(flagpole.x_pos + 85, floorPos_y - 245, random(38, 42), random(59, 61));
        fill(255);
        noStroke();
        textSize(16);
        text("Level", flagpole.x_pos + 15, floorPos_y - 225);
        text("COMPLETE!", flagpole.x_pos + 15, floorPos_y - 200);
    }
}

// Function to check if player reaches flagpole ---------------------------------------------------

function checkFlagpole() {
    var d = abs(gameChar_world_x - flagpole.x_pos);
    if (d < 10) {
        flagpole.isReached = true;
        cannonSound.play();
    }
}

// Function to check if player lives reach 0 ------------------------------------------------------

function checkPlayerDie() {
    if (gameChar_y > 670 || dist(gameChar_world_x, gameChar_y, killerclouds[0].pos_x, 432) < 20 ||
        dist(gameChar_world_x, gameChar_y, killerclouds[1].pos_x, 432) < 20) {
        total_lives -= 1;
        if (total_lives > 0) {
            startGame();
        }
    }
}

// ------------------------------------------------------------------------------------------------
// Start game setup
// ------------------------------------------------------------------------------------------------

function startGame() {
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;

    game_score = 0;

    flagpole = {
        x_pos: 1800,
        isReached: false,
    }

    // Variable to control the background scrolling -----------------------------------------------
    scrollPos = 0;

    // Variable to store the real position of the gameChar in the game world ----------------------
    // Needed for collision detection -------------------------------------------------------------
    gameChar_world_x = gameChar_x - scrollPos;

    // Boolean variables to control the movement of the game character ----------------------------
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;

    // Initialise arrays of scenery objects -------------------------------------------------------

    trees = [
        { pos_x: -380, pos_y: 288, height: random(50, 120) },
        { pos_x: -180, pos_y: 288, height: random(50, 120) },
        { pos_x: -120, pos_y: 288, height: random(50, 120) },
        { pos_x: -20, pos_y: 288, height: random(50, 120) },
        { pos_x: 200, pos_y: 288, height: random(50, 120) },
        { pos_x: 440, pos_y: 288, height: random(50, 120) },
        { pos_x: 600, pos_y: 288, height: random(50, 120) },
        { pos_x: 680, pos_y: 288, height: random(50, 120) },
        { pos_x: 740, pos_y: 288, height: random(50, 120) },
        { pos_x: 900, pos_y: 288, height: random(50, 120) },
        { pos_x: 1120, pos_y: 288, height: random(50, 120) },
        { pos_x: 1160, pos_y: 288, height: random(50, 120) },
    ]

    collectables = [ // initialize the location and size of a collectable
        { pos_x: -380, pos_y: 432 - random(0, 150), size: 50, isFound: false },
        { pos_x: 10, pos_y: 432 - random(0, 150), size: 50, isFound: false },
        { pos_x: 400, pos_y: 432 - random(0, 150), size: 30, isFound: false },
        { pos_x: 780, pos_y: 432 - random(0, 150), size: 50, isFound: false },
        { pos_x: 950, pos_y: 432 - random(0, 150), size: 40, isFound: false },
        { pos_x: 1050, pos_y: 432 - random(0, 150), size: 40, isFound: false },
        { pos_x: 1250, pos_y: 432 - random(0, 150), size: 40, isFound: false },
    ]

    defense = [
        { x: random(-300, 50), y: random(floorPos_y - 5, floorPos_y - 150), ifFound: false }
    ]

    clouds = [ // initialize a 'cloud area' for four clouds each, anchored to each x & y position below
        { pos_x: -160, pos_x2: -180, pos_x3: -120, pos_x4: -140, pos_y: 100, cloudSize: 60, speed: random(0.1, 0.3) },
        { pos_x: -20, pos_x2: -40, pos_x3: 20, pos_x4: 0, pos_y: 90, cloudSize: 60, speed: random(0.1, 0.3) },
        { pos_x: 160, pos_x2: 140, pos_x3: 200, pos_x4: 180, pos_y: 120, cloudSize: 60, speed: random(0.1, 0.3) },
        { pos_x: 280, pos_x2: 260, pos_x3: 320, pos_x4: 300, pos_y: 90, cloudSize: 60, speed: random(0.1, 0.3) },
        { pos_x: 500, pos_x2: 480, pos_x3: 540, pos_x4: 520, pos_y: 130, cloudSize: 60, speed: random(0.1, 0.3) },
        { pos_x: 700, pos_x2: 680, pos_x3: 740, pos_x4: 720, pos_y: 110, cloudSize: 60, speed: random(0.1, 0.3) },
        { pos_x: 960, pos_x2: 940, pos_x3: 1000, pos_x4: 980, pos_y: 110, cloudSize: 60, speed: random(0.1, 0.3) },
        { pos_x: 1100, pos_x2: 1080, pos_x3: 1140, pos_x4: 1120, pos_y: 120, cloudSize: 60, speed: random(0.1, 0.3) },
    ]

    darkclouds = [ // initialize a 'cloud area' for four rain clouds, anchored to each x & y position below
        { pos_x: 1100, pos_x2: 1110, pos_x3: 1070, pos_x4: 1090, pos_x5: 1070, pos_x6: 1100, pos_y: 240, cloudSize: 45, speed: random(0.2, 0.5) },
        { pos_x: 800, pos_x2: 810, pos_x3: 770, pos_x4: 790, pos_x5: 770, pos_x6: 800, pos_y: 180, cloudSize: 45, speed: random(0.2, 0.5) },
    ]

    killerclouds = [ // initialize a 'cloud area' for four killer clouds, anchored to each x & y position below
        { pos_x: 820, pos_x2: 830, pos_x3: 800, pos_x4: 810, pos_x5: 815, pos_x6: 835, pos_y: 250, cloudSize: 40 },
        { pos_x: 120, pos_x2: 130, pos_x3: 100, pos_x4: 110, pos_x5: 115, pos_x6: 135, pos_y: 250, cloudSize: 40 },
    ]

    drop1 = [];
    for (var i = 0; i < 50; i++) {
        drop1[i] = new Drop1()
    }

    drop2 = [];
    for (var i = 0; i < 50; i++) {
        drop2[i] = new Drop2()
    }

    mountains = [ // initialize the location and height of mountains ------------------------------
        { pos_x: -40, height: 20 },
        { pos_x: 400, height: 100 },
        { pos_x: 700, height: 120 },
        { pos_x: 1200, height: 100 },
    ]

    canyons = [ // initialize the location and width of canyons -----------------------------------
        { pos_x: -300, width: 80 },
        { pos_x: 260, width: 100 },
        { pos_x: 940, width: 160 },
    ]

    // create 5 platforms of non-overlapping random locations and sizes ---------------------------
    platforms = [];
    range = 0;
    while (platforms.length < 6) {
        //for (var i = 0; i < 6; i++) {
        var plat = {
            x: random(-600, 1400),
            y: random(300, 360),
            length: random(80, 180),
            speed: 0.5,
            range: 0,
            left: false,
        };
        var overlapping = false;
        for (var j = 0; j < platforms.length; j++) {
            var other = platforms[j];
            var d = dist(plat.x, plat.y, other.x, other.y);
            if (d < plat.length + other.length) {
                overlapping = true;
            }
        }
        if (!overlapping) {
            platforms.push(plat);
        }
    }

    enemies = [] // creates enemies ---------------------------------------------------------------
    enemies.push(new Enemy(600, floorPos_y - 10, 50))
    enemies.push(new Enemy(0, floorPos_y - 10, 50))
}

// ------------------------------------------------------------------------------------------------
// Constructors for particle clouds and enemies
// ------------------------------------------------------------------------------------------------


// function to create killer clouds with movement -------------------------------------------------

function Particle(x, y, xSpeed, ySpeed, size, colour) {
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;
    this.age = 0;

    this.drawParticle = function() {
        fill(this.colour);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }

    this.updateParticle = function() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.age++;
    }
}

// function to create the killer purple rain clouds -----------------------------------------------

function Emitter(x, y, xSpeed, ySpeed, size, colour) {
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;

    this.particles = [];

    this.startParticles = [];
    this.lifetime = 0;

    this.addParticle = function() {
        var p = new Particle(random(this.x - 5, this.x + 5),
            random(this.y - 5, this.y + 5),
            random(this.xSpeed - 0.4, this.xSpeed + 0.4),
            random(this.ySpeed - 2, this.ySpeed - 1),
            random(this.size - 4, this.size + 60),
            this.colour);
        return p;
    }

    this.startEmitter = function(startParticles, lifetime) {
        this.startParticles = startParticles;
        this.lifetime = lifetime;

        for (var i = 0; i < startParticles; i++) {
            this.particles.push(this.addParticle());
        }
    }

    // update the particles of the killer purple rain clouds to add movement ----------------------
    this.updateParticles = function() {
        var deadParticles = 0
        for (var i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].drawParticle();
            this.particles[i].updateParticle();
            if (this.particles[i].age > random(0, this.lifetime)) {
                this.particles.splice(i, 1);
                deadParticles++;
            }
        }
        if (deadParticles > 0) {
            for (var i = 0; i < deadParticles; i++) {
                this.particles.push(this.addParticle());
            }
        }
    }
}

// constuctor to create the enemy -----------------------------------------------------------------

function Enemy(x, y, range) {
    this.x = x;
    this.y = y;
    this.range = range;

    this.currentX = x;
    this.increment = 1;

    this.update = function() {
        this.currentX += this.increment;

        if (this.currentX >= this.x + this.range) {
            this.increment = -1;
        } else if (this.currentX < this.x) {
            this.increment = 1;
        }
    }
    this.draw = function() {
        this.update();
        fill(0, 0, 0);
        ellipse(this.currentX, this.y, 40, 40);
        fill(200, 0, 0);
        triangle(this.currentX + 5, this.y, this.currentX + 10, this.y - 5, this.currentX + 15, this.y)
        triangle(this.currentX - 15, this.y, this.currentX - 10, this.y - 5, this.currentX - 5, this.y)
        ellipse(this.currentX, this.y + 8, 10, 10);
    }

    this.checkContact = function(gameCharX, gameCharY) {
        var d = dist(gameCharX, gameCharY, this.currentX, this.y)
        if (d < 20) {
            return true;
        }
        return false;
    }
}