/* https://developer.mozilla.org/en-US/docs/Games/Anatomy
 *
 * gameData.lastRender
 *     keeps track of the last provided requestAnimationFrame
 *     timestamp.
 * gameData.lastUpdate
 *     keeps track of the last update time. Always increments by
 *     updateInterval.
 * gameData.updateInterval
 *     is how frequently the game state updates.
 *
 * timeSinceUpdate
 *     is the time between requestAnimationFrame callback and last
 *     update.
 * numUpdates
 *     is how many updates should have happened between these two
 *     rendered frames.
 *
 * render()
 *     is passed tFrame because it is assumed that the render method
 *     will calculate how long it has been since the most recently
 *     passed update for extrapolation (purely cosmetic for fast
 *     devices). It draws the scene.
 *
 * update()
 *     calculates the game state as of a given point in time. It
 *     should always increment by updateInterval. It is the authority for
 *     game state. It is passed the DOMHighResTimeStamp for the time
 *     it represents (which, again, is always last update +
 *     gameData.updateInterval unless a pause feature is added, etc.)
 *
 * setInitialState()
 *     Performs whatever tasks are leftover before the mainloop must
 *     run.
 */

/* Get cavas context. */
let c = document.getElementById("canvas")
let ctx = document.getElementById("canvas").getContext("2d");

let canvas_rect = canvas.getBoundingClientRect();
let mouse_position = { x: 0, y: 0 }

var gameData = {
    /* The image files. */
    image_files: [
        /* The first image is used as the backside of a tile. */
        "images/back.png",

        /* Each tile needs three images. */
        "images/Skull.png",
        "images/Skull.png",
        "images/Skull.png",
        "images/Truck.png",
        "images/Truck.png",
        "images/Truck.png",
        "images/House 1.png",
        "images/House 2.png",
        "images/House 3.png"
    ],

    /* The number of cards to use. */
    numberCards: 2,

    /* The number of images per card. */
    numberImagesPerCard: 2,

    /* The number of rows. */
    numberRows: 2,

    /* Set the update interval in ms. */
    updateInterval: 200
};

/* Start loading the images. */
preloadImages(gameData.image_files).done(function(images) {
    /* Organize the images. */
    gameData.back = images.shift();
    gameData.tiles = [];
    while (images.length > 0) {
        gameData.tiles.push([
            images.shift(),
            images.shift(),
            images.shift()
        ]);
    }

    gameData.lastUpdate = performance.now();
    gameData.lastRender = gameData.lastUpdate;

    /* Initialize the tiles. */
    setInitialState();

    /* Start the main loop. */
    mainLoop(performance.now());
});

function setInitialState() {
    debugger;
    pickTiles();
    placeTiles();
}

function pickTiles() {
    /* First pick the cards. */
    gameData.cards = [];
    let temp = [...Array(gameData.tiles.length).keys()];
    for (let i = 0; i < gameData.numberCards; i++) {
        /* Pick a card at random. */
        let cardIndex = temp.splice(Math.floor(Math.random() * temp.length), 1)[0];

        /* Now pick the images for that card. */
        let temp_images = [...Array(gameData.tiles[cardIndex].length).keys()];
        for (let j = 0; j < gameData.numberImagesPerCard; j++) {
            gameData.cards.push([cardIndex,
                                 temp_images.splice(
                                     Math.floor(Math.random()
                                                * temp_images.length), 1)[0]]);
        }
    }
    /* Shuffle the tiles. */
    shuffleArray(gameData.cards);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function placeTiles() {
}

function mainLoop(tFrame) {
    gameData.stopMain = window.requestAnimationFrame(mainLoop);
    var nextUpdate = gameData.lastUpdate + gameData.updateInterval;
    var numUpdates = 0;

    /* If tFrame < nextUpdate then 0 ticks need to be updated (0
     * is default for numUpdates).
     *
     * If tFrame = nextUpdate then 1 tick needs to be updated (and
     * so forth).
     *
     * Note: As we mention in summary, you should keep track of
     * how large numUpdates is.  If it is large, then either your
     * game was asleep, or the machine cannot keep up.
     */
    if (tFrame > nextUpdate) {
        var timeSinceUpdate = tFrame - gameData.lastUpdate;
        numUpdates = Math.floor(timeSinceUpdate / gameData.updateInterval);
    }

    queueUpdates(numUpdates);
    render(tFrame);
    gameData.lastRender = tFrame;
}

function queueUpdates(numUpdates) {
    for(var i = 0; i < numUpdates; i++) {
        gameData.lastUpdate = gameData.lastUpdate
            + gameData.updateInterval; // Now lastUpdate is this tick.
        update(gameData.lastUpdate);
    }
}

function update(lastUpdate) {
    flipTiles();
}

function render(tFrame) {
    renderTiles();
    renderGameStats();
}

/* From http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml */
function preloadImages(image_files) {
    let loaded_images = 0;
    let failed_images = 0;
    let post_loaded = function() {}

    let images = [];

    function image_loaded(i, image_succeeded) {
        if (image_succeeded) {
            loaded_images++;
        } else {
            failed_images++;
        }

        if (loaded_images + failed_images == image_files.length) {
            if (failed_images > 0) {
                alert("Some images failed to load");
            }
            post_loaded(images);
        }
    }

    /* Loop over image files and load them. For each specify the
     * `image_loaded` function for the `onload` event to keep track of
     * how many images are already loaded. */
    for (let i = 0; i < image_files.length; i++) {
        images.push(new Image())
        images[i].src = image_files[i];
        images[i].onload = function(i) { image_loaded(i, true); }
        images[i].onerror = function(i) { image_loaded(i, false); }
    }

    /* Add a `done` method and return the empty function or the
     * function passed into `preloadImages()` function as argument. */
    return {
        done: function(f) {
            post_loaded = f || post_loaded;
        }
    }
}

function get_mouse_position(canvas, event) {
    return {
        x: (event.clientX - canvas_rect.left) / (canvas_rect.right - canvas_rect.left) * 1000,
        y: (event.clientY - canvas_rect.top) / (canvas_rect.bottom - canvas_rect.top) * 1000
    }
}
