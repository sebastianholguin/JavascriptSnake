var DEBUG = true;

document.addEventListener("DOMContentLoaded", (event) => {
    const canvas = document.getElementById("canvasMain");
    const snakeGame = new SnakeGame(canvas);  
    snakeGame.play();

    if(!DEBUG){
        const showDebug = document.getElementById("showDebug");
        showDebug.style.display = "none";
    }
});

class SnakeGame {

    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.snake = new Snake(this.ctx);        
        this.direction = new SnakeDirection();
        this.speed = 200;
        this.level = 1;
        this.stack = new Stack();
    }

    play(){        
        if(this.direction.moveUp || this.direction.moveDown){
            this.snake.create(false);
        } 
        else if(this.direction.moveLeft || this.direction.moveRight){
            this.snake.create(true);
        }                

        this.intervalPlaying = setInterval(() => { this.playing() }, this.speed);
        document.addEventListener("keyup", (event) => { this.changeDirection(event) });

        this.randomSnakeFood();
    }

    playing(){        
        this.stack.calling();
        this.snake.move(this.direction);
        this.validateLimits();
        this.validateFood();
        this.validateSpeed();
    }

    changeDirection(event){

        if(
            event.keyCode == 38 //ArrowUp
            || event.keyCode == 40 //ArrowDown
            || event.keyCode == 37 //ArrowLeft
            || event.keyCode == 39 //ArrowRight
        ){
            this.stack.push(this.direction, event);
        }                
    }

    validateLimits(){
        if(DEBUG){
            const limitsOfCanvas = document.getElementById("canvasLimits");
            limitsOfCanvas.innerHTML = "X: " + this.canvas.offsetWidth + ", Y: " + this.canvas.offsetHeight;
        }

        const head = this.snake.getHead();
        if(head.offsetWidth() > this.canvas.offsetWidth
            || head.offsetWidth() <= 1
            || head.offsetHeight() > this.canvas.offsetHeight
            || head.offsetHeight() <= 1){
            this.gameOver();
        }

        if(this.isHitWithOwnSelf(head)){
            this.gameOver();
        }
    }

    gameOver(){
        clearInterval(this.intervalPlaying);
        this.ctx.textAlign = 'center';
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "red";
        this.ctx.fillText("Game Over", (this.canvas.width / 2), (this.canvas.height / 2));
    }

    randomSnakeFood(){

        const food = new Square(this.ctx, 10, 10);     

        do{                           
            const maxXRandom = (this.canvas.width / (food.w + 1));
            const randomX = Math.floor(Math.random() * (maxXRandom + 1));
            const posX = 1 + (randomX-1) * (food.w + 1);
    
            const maxYRandom = (this.canvas.height / (food.h + 1));
            const randomY = Math.floor(Math.random() * (maxYRandom + 1));
            const posY = 1 + (randomY-1) * (food.h + 1);        

            food.x = posX;
            food.y = posY;

        }while(this.isFoodOffTheLimit(food) || this.isCoordinateInUse(food))
        
        food.create();
        this.food = food;

        if(DEBUG){
            const coordinatesFood = document.getElementById("coordinatesFood");
            coordinatesFood.innerHTML = "X: " + this.food.x + ", Y: " + this.food.y;

            const coordinatesFoodOffset = document.getElementById("coordinatesFoodOffset");
            coordinatesFoodOffset.innerHTML = "X: " + this.food.offsetWidth() + ", Y: " + this.food.offsetHeight();                        
        }        
    }

    isCoordinateInUse(food){        
        for(let i=0;i<this.snake.squares.length;i++){
            let square = this.snake.squares[i];
            if(square.x == food.x && square.y == food.y){
                return true;
            }
        }
        return false;
    }    

    isFoodOffTheLimit(food){
        return (food.offsetWidth() > this.canvas.offsetWidth
            || food.x <= 1
            || food.offsetHeight() > this.canvas.offsetHeight
            || food.y <= 1);
    }    

    validateFood(){
        const head = this.snake.getHead();
        const tail = this.snake.getTail();
        const food = this.food;

        if(head.x == food.x && head.y == food.y){
            let square = new Square(this.ctx, 10, 10);
            square.x = tail.x - (1 + tail.w);
            square.y = tail.y - (1 + tail.h);

            this.snake.squares = [square, ...this.snake.squares];

            //this.snake.updatePositions();    
            this.randomSnakeFood()
        }
    }

    speedUp(){
        this.speed = this.speed - 20;
        this.level++;

        clearInterval(this.intervalPlaying);        
        this.intervalPlaying = setInterval(() => { this.playing() }, this.speed);
    }

    validateSpeed(){
        if(Math.round(this.snake.squares.length / 4) != this.level){
            this.speedUp();
        }

        if(DEBUG){
            const currentSpeed = document.getElementById("currentSpeed");
            currentSpeed.innerHTML = this.speed;

            const currentLevel = document.getElementById("currentLevel");
            currentLevel.innerHTML = this.level;            

            const numbreOfSquares = document.getElementById("numbreOfSquares");
            numbreOfSquares.innerHTML = this.snake.squares.length;                        
        }
    }

    isHitWithOwnSelf(head){        
        for(let i=0;i<(this.snake.squares.length - 1);i++){
            let square = this.snake.squares[i];
            if(square.x == head.x && square.y == head.y){
                return true;
            }
        }
        return false;
    }
}

class SnakeDirection{
    constructor(){
        this.setRight();    
    }

    setLeft(){
        this.moveLeft = true;
        this.moveUp = this.moveDown = this.moveRight = false;   
    }

    setRight(){
        this.moveRight = true;
        this.moveUp = this.moveDown = this.moveLeft = false;   
    }

    setUp(){
        this.moveUp = true;
        this.moveRight = this.moveDown = this.moveLeft = false;   
    }

    setDown(){
        this.moveDown = true;
        this.moveRight = this.moveUp = this.moveLeft = false;   
    }
}

class Snake {    

    constructor(ctx){
        this.ctx = ctx;
        this.squares = [];
    }

    getTail(){
        return this.squares[0];        
    }

    getHead(){
        return this.squares[this.squares.length - 1];
    }

    create(inX) {

        for(let i = 0;i < 4;i++){
            let square = new Square(this.ctx, 10, 10);
            if(this.squares.length > 0){
                let lastSquare = this.squares[this.squares.length - 1];

                if(inX){
                    square.x = lastSquare.offsetWidth();
                    square.y = lastSquare.y;
                } else {
                    square.x = lastSquare.x;
                    square.y = lastSquare.offsetHeight();
                }               
            }else{
                square.x = 1;
                square.y = 1;
            }
            square.create();
            this.squares.push(square);
        }                           
    }    

    move(direction){
        let tail = this.getTail();
        let head = this.getHead();

        tail.clear();
        this.updatePositions();    

        if(direction.moveRight){              
            head.x  = head.offsetWidth();
        }            
        else if(direction.moveLeft){                
            head.x  = -1 + (head.x - head.w);            
        } 
        else if(direction.moveDown){                
            head.y  = head.offsetHeight();
        }  
        else if(direction.moveUp){                
            head.y  = -1 + (head.y - head.h);
        }          

        head.create();            

        if(DEBUG){
            const coordinatesHead = document.getElementById("coordinatesHead");
            coordinatesHead.innerHTML = " X: " + head.x + " Y: " + head.y;        

            const coordinatesHeadOffset = document.getElementById("coordinatesHeadOffset");
            coordinatesHeadOffset.innerHTML = " X: " + head.offsetWidth() + " Y: " + head.offsetHeight();        
        }
    }

    updatePositions(){
        for(let i=0;i<this.squares.length - 1;i++){
            let square = this.squares[i];
            let nextSquare = this.squares[i + 1];

            square.x = nextSquare.x;
            square.y = nextSquare.y;
        }
    }
}

class Square{

    constructor(ctx, w, h){
        this.ctx = ctx;
        this.w = w;
        this.h = h;
        this.x = -1;
        this.y = -1;
    }

    offsetWidth(){
        return (this.x + this.w + 1);
    }

    offsetHeight(){
        return (this.y + this.h + 1);
    }    

    create(){
        let ctx = this.ctx;

        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.stroke();          
    }

    clear(){
        let ctx = this.ctx;

        ctx.beginPath();
        ctx.clearRect(this.x, this.y, this.w, this.h);      
    }
}

class Stack{    

    constructor(){
        this.container = [];
    }

    push(direction, event){
        this.container.push({ direction: direction, event: event });        
    }

    isEmpty(){
        return this.container.length == 0;
    }

    calling(){
        if(!this.isEmpty()){

            let e = this.container[0];
            
            let promise = new Promise(function (resolve, reject) {                
                if(e.event.keyCode == 38 //ArrowUp
                ){
                    if(!e.direction.moveDown){
                        e.direction.setUp();
                    }            
                }
                if(e.event.keyCode == 40 //ArrowDown
                ){
                    if(!e.direction.moveUp){
                        e.direction.setDown();
                    }
                }
                if(e.event.keyCode == 37 //ArrowLeft
                ){
                    if(!e.direction.moveRight){
                        e.direction.setLeft();
                    }
                }
                if(e.event.keyCode == 39 //ArrowRight
                ){
                    if(!e.direction.moveLeft){
                        e.direction.setRight();
                    }
                }

                resolve(true);
            });            

            promise.then((result) =>{
                if(!this.isEmpty()){
                    this.container.shift();
                }                
            });            
        }
    }
}