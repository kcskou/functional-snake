/** 
 * @author Kelvin Kou
 * A very fun classic snake game written in Javascript using the HTML5 Canvas
 * element. This is an experiment to apply some of the functional programming
 * and systematic program design techniques I've learned in the introductory
 * computer science course (CPSC 110) at the University of British Columbia
 * with a different language and environment.
 * November 2014
 */   

function Game() {
    
    // Variables
    var boardSize = 30;
    var cellPixels = 10;
    var boardWidth = boardSize * cellPixels;
    var boardHeight = boardWidth;
    var updateInterval = 50;
    var canvas;
    var context;
    var gameState;
    var gameLoop;
    var foodEaten;

    // Data Definitions:

    /**
     * Direction is one of:
     * - "U"
     * - "D"
     * - "L"
     * - "R"
     * interp. the four directions a snake could travel

    function fnForDir(dir) {
        switch(dir) {
            case "U":
                //...
                break;
            case "D":
                //...
                break;
            case "L":
                //...
                break;
            case "R":
                //...
                break;
        };
    }
     */
    
    function Pos(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Pos is new Pos(Integer[-1, boardSize], Integer[-1, boardSize])
     * interp. a position on the board measured from top-left corner.
     *         x and y are horizontal and vertical distances respectively.
     *         -1 and boardSize are on the edges of the board and indicate
     *         "going out of bounds"/game-over condition.
     */ 
    var P1 = new Pos(0, 0);                         // top-left corner
    var P2 = new Pos(boardSize - 1, boardSize - 1); // bottom-right corner
    var P3 = new Pos(-1, 5);                        // out of left bound
    var P4 = new Pos(boardSize, 5);                 // out of right bound
    var P5 = new Pos(5, -1);                        // out of upper bound
    var P6 = new Pos(5, boardSize);                 // out of lower bound
    /** 
    function fnForPos(p) {
        //... p.x
        //... p.y
    }
     */

    /**
     * Body is an array of Pos
     * interp. the body of a snake.
     */
    var B1 = [new Pos(0, 1)];
    var B2 = [new Pos(boardSize - 1, boardSize - 2),
              new Pos(boardSize - 1, boardSize - 3)];
    var B3 = [new Pos(0, 5),
              new Pos(1, 5),
              new Pos(2, 5)];
    /**
    function fnForBody(b) {
        for (var i = 0; i < b.length; i++) {
            //... fnForPos(b[i]);
        };
    }
     */

    function Snake(dir, head, body, len) {
        this.dir = dir;
        this.head = head;
        this.body = body;
        this.len = len;
    }
    /**
     * Snake is new Snake(Direction, Pos, Body, Integer[>3])
     * interp. a snake with a head and a body moving in one of the four directions.
     *         len is the length of its body.
     */
    var S1 = new Snake("R", P1, B1, 3); // head at top-left corner, facing right
    var S2 = new Snake("L", P2, B2, 3); // head at bottom-right corner, facing left
    var S3 = new Snake("L", P3, B3, 3); // head out of left bound, facing left
    /**
    function fnForSnake(s) {
        //... fnForDir(s.dir);
        //... fnForPos(s.head);
        //... fnForBody(s.body);
        //... s.len;
    }
     */
    
    /**
     * Food is new Pos(Integer[0, boardSize - 1], Integer[0, boardSize - 1])
     * interp. a food item on the board.
     */
    
    function GameState(snake, food, score) {
        this.snake = snake;
        this.food = food;
        this.score = score;
    }
    /**
     * GameState is new GameState(Snake, Pos, Integer[>=0])
     * interp. state of the game with a snake, a food item, and the score.
     */
    var GS1 = new GameState(S1, P1, 0)
    var GS2 = new GameState(S2, P1, 10)
    var GS3 = new GameState(S3, P2, 30)
    /**
    function fnForGameState(gs) {
        //... fnForSnake(gs.snake);
        //... fnForPos(gs.food);
        //... gs.score;
    }
     */    
    
    // Methods: 
    
    /**
     * Runs the game if initialization is successful.
     */
    this.run = function () {
        if (this.init()) {
            var initSnake = this.setSnake();
            var initFood = this.makeFood(initSnake);
            var initScore = 0;
            gameState = new GameState(initSnake, initFood, initScore);
            window.removeEventListener('keydown', this.handleReset, false);                
            window.addEventListener('keydown', this.handleKey, false);
            gameLoop = setInterval(this.update, updateInterval);            
        }
    };

    /**
     * Initializes the game. Returns true if successful, otherwise false.
     */
    this.init = function () {
        canvas = document.getElementById('snake-game')
        if (canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            buffer = document.createElement('canvas');
            buffer.width = canvas.width;
            buffer.height = canvas.height;
            bufferContext = buffer.getContext('2d');
            context.font = '16px Arial, sans-serif';
            context.textAlign = "center";
            bufferContext.font = '14px Arial, sans-serif';
            bufferContext.textAlign = "center";
            foodEaten = document.getElementById('food-eaten');
            document.getElementById('menu').style.display = "none";
            return true;
        }
        return false;
    };
        
    this.update = function () {
        var game = document.snakeGame;
        if (game.headOnWall()) {
            game.gameOver();
        } else if (game.eatenItself()) {
            game.gameOver();
        } else {
            gameState = game.nextGameState(gameState);
            game.render(gameState);
        }
    };

    /**
     * Returns the next game state given the current game state.
     */
    this.nextGameState = function (gs) {
        return new GameState(nextSnake(gs.snake, gs.food),
                             nextFood(gs.snake, gs.food),
                             nextScore(gs.snake, gs.score));
        
        /**
         * Advances snake by 1 cell if snake head is within bound, otherwise the snake stays where it is.
         */
        function nextSnake(s, f) {
            var head = nextHead(s.head, s.dir);
            var body = nextBody(s.body, s.head);
            var len;
            if (hasEaten(s, f)) {
                len = s.len + 1
            } else {
                len = s.len
            }
            return new Snake(s.dir, head, body, len);
        
            /**
             * Takes the current head position and direction and returns the next head position.
             */
            function nextHead(p, dir) {
                switch(dir) {
                    case "U":
                        if (p.y == -1) {
                            return p;
                        } else {
                            return new Pos(p.x, p.y - 1);
                        }
                        break;
                    case "D":
                        if (p.y == boardSize) {
                            return p;
                        } else {
                            return new Pos(p.x, p.y + 1);
                        }
                        break;
                    case "L":
                        if (p.x == -1) {
                            return p;
                        } else {
                            return new Pos(p.x - 1, p.y);
                        }
                        break;
                    case "R":
                        if (p.x == boardSize) {
                            return p;
                        } else {
                            return new Pos(p.x + 1, p.y);
                        }
                        break;
                };
            }
            
            /**
             * Takes the current body and head position and returns the next body.
             */
            function nextBody(b, p) {
                if (b.length > s.len) {
                    var body = b.slice(0, -1);
                    body.unshift(p);
                    return body;
                } else {
                    var body = b.slice();
                    body.unshift(p);
                    return body;
                }
            }
        }
        
        /**
         * Returns new position of food if eaten.
         */
        function nextFood(s, f) {
            if (hasEaten(s, f)) {
                return document.snakeGame.makeFood(s);
            } else {
                return f;
            }
        }
        
        
        /**
         * Returns true if snake head is on the food item, otherwise false.
         */
        function hasEaten(s, f) {
            if (s.head.x == f.x && s.head.y == f.y) {
                playEatingSound();
                return true;
            }
            return false;
            
            function playEatingSound() {
                foodEaten.currentTime = 0;
                foodEaten.play();
            }
        }
        
        
        /**
         * Returns current score based on length of the snake.
         */
        function nextScore(snake) {
            return (snake.len - 3) * 10;
        }
    };
    
    /**
    * Draws all game images on the canvas.
    */
    this.render = function (gs) {
        bufferContext.clearRect(0, 0, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        renderSnake(gs.snake);
        renderFood(gs.food);
        renderScore(gs.score);
        context.drawImage(buffer, 0, 0);
        
        function renderSnake(s) {
            renderHead(s.head);
            renderBody(s.body);
        }
        
        function renderHead(h) {
            renderPos(h);
        }
        
        function renderBody(b) {
            for (var i = 0; i < b.length; i++) {
                renderPos(b[i]);
            }
        }
        
        function renderPos(p) {
            bufferContext.fillRect(p.x * cellPixels,
                                   p.y * cellPixels,
                                   cellPixels,
                                   cellPixels);
        }
        
        function renderFood(p) {
            renderPos(p);
        }
        
        function renderScore(score) {
            var p = document.getElementById('score');
            var s = p.getElementsByTagName('span')[0];
            s.innerHTML = score.toString();
        }
    };
    
    /**
     * Changes direction of snake head when corresponding keys are pressed.
     */
    this.handleKey = function(e) {
        var keyId = e.keyCode;
        var currentDir = gameState.snake.dir;

        if (keyId == 87 || keyId == 38) {          // W or Up
            if (currentDir != "D") {
                gameState.snake.dir = "U";
            }
        } else if (keyId == 83 || keyId == 40) {   // S or Down         
            if (currentDir != "U") {
                gameState.snake.dir = "D";
            }
        } else if (keyId == 65 || keyId == 37) {   // A or Left
            if (currentDir != "R") {
                gameState.snake.dir = "L";
            }
        } else if (keyId == 68 || keyId == 39) {   // D or Right
            if (currentDir != "L") {
                gameState.snake.dir = "R";
            }
        }
    }
    
    /**
     * Produces true if snake head touches the edge, otherwise false.
     */
    this.headOnWall = function () {
        var head = gameState.snake.head;
        return (head.x == -1 || 
                head.x == boardSize ||
                head.y == -1 ||
                head.y == boardSize);
    }
    
    /**
     * Produces true if snake has eaten itself, otherwise false.
     */
    this.eatenItself = function () {
        var head = gameState.snake.head;
        var body = gameState.snake.body;
        for (var i = 0; i < body.length; i++) {
            if (head.x == body[i].x && head.y == body[i].y) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Stops the game and allows game to restart when spacebar is pressed.
     */
    this.gameOver = function () {
        
        clearInterval(gameLoop);
        window.addEventListener('keydown', this.handleReset, false);
        renderGameOver();
        var p = document.getElementById('high-score');
            if (gameState.score > 0) {                
                if (p.textContent == "") {
                    p.innerHTML = 'High Score: <span></span>';
                    var sp = p.getElementsByTagName('span')[0];
                    sp.innerHTML = gameState.score;                
                } else {
                    var sp = p.getElementsByTagName('span')[0];
                    var highScore = sp.innerHTML;
                    if (gameState.score > highScore) {
                        sp.innerHTML = gameState.score;
                    }
                }
                tweetMyScore(gameState.score);              
            }
        
        function renderGameOver() {
            var centerPixels = Math.round(boardWidth / 2);
            var gameOverMessage = 'Game Over. You scored '.concat(gameState.score.toString(), ' points!');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillText(gameOverMessage, centerPixels, centerPixels - 20);
            context.fillText('Press space to try again?', centerPixels, centerPixels + 10);
        }
        
        function tweetMyScore(s) {
            var tweet = document.getElementById("tweet");
            var msg = 'I scored '.concat(s.toString(), ' points in the classic Snake game!');
            var tweetURL = 'http://twitter.com/share?'.concat('&text=', msg, '&via=kcskou');            
            tweet.href = tweetURL;
            document.getElementById('tweet').style.display = "block";
        }
    }
    
    /**
     * Resets the game when spacebar is pressed.
     */
    this.handleReset = function (e) {
        var keyId = e.keyCode;
        if (keyId == 32) {        
            clearInterval(gameLoop);
            document.getElementById('tweet').style.display = "none";
            document.snakeGame.run();        
        }
    }
    
    /**
     * Returns a snake in the middle of the screen moving to the right.
     */
    this.setSnake = function () {
        var center = Math.round(boardSize / 2);        
        var head = new Pos(center - 2, center);
        var body = [new Pos(center - 3, center),
                    new Pos(center - 4, center),
                    new Pos(center - 5, center)];
        return new Snake("R", head, body, 3);
    }
    
    /**
     * Returns position to put a food item not occupied by the given snake.
     */
    this.makeFood = function (s) {
    
        function randomFood(s) {
            var candidate = new Pos(Math.floor(Math.random() * (boardSize - 1)),
                                Math.floor(Math.random() * (boardSize - 1)));
            return randomFoodCheck(s, candidate);
        }
        
        function randomFoodCheck(s, candidate) {
            if (s.body.some(isOccupied)) {
                return randomFood(s);
            } else {
                return candidate;
            }
            
            function isOccupied(element, index, array) {
                return (element.x == candidate.x && element.y == candidate.y);
            }            
        }
        return randomFood(s);    
    }
}
