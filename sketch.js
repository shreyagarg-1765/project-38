//Create variables here
var dog, database,foodS,foodStock;
var frameCountNow=0;
var sadDog,happyDog;
var fedTime,lastFed,foodObj,currentTime;
var feed,addFood;
var milk,input,names;
var gameState= "hungry";
var gameStateRef;
var bedroomIMG, gardenIMG,washroomIMG,sleepIMG,runIMG;
var input,button;

function preload()
{
	//load images here
  hungryDog= loadImage("images/dogImg.png");
  happyDog= loadImage("images/happydogimg.png");
  bedroomIMG =loadImage("images/Bed Room.png");
  gardenIMG =loadImage("images/Garden.png");
  washroomIMG =loadImage("images/Wash Room.png");
  sleepIMG =loadImage("images/Lazy.png");
  livingroom=loadImage("images/Living Room.png")
  runIMG =loadImage("images/running.png");
}

function setup() {
	createCanvas(1150, 500);
  database= firebase.database();

  foodObj=new Food();

  foodStock= database.ref('Food');
  foodStock.on("value",readStock);
  //foodStock.set(20);

  dog= createSprite(width/2+250,height/2,10,10);
  dog.addAnimation("hungry",hungryDog);
  dog.addAnimation("happy",happyDog);
  dog.addAnimation("sleeping",sleepIMG);
  dog.addAnimation("run",runIMG);
  dog.scale=0.3;

  getGameState();

  feed= createButton("Feed the dog");
  feed.position(950,95);
  feed.mousePressed(feedDog);

  addFood= createButton("Add Food");
  addFood.position(1050,95);
  addFood.mousePressed(addFoods);

  input= createInput("Pet Name");
  input.position(950,120);

  button =createButton("Confirm");
  button.position(1000,145);
  button.mousePressed(createName);



  
}


function draw() {  
  background("green");

  //foodObj.display();
  writeStock(foodS);

  if(foodS == 0)
  {
    dog.addImage(happyDog);
    foodObj.visible= false;
  }
  else{
    dog.addImage(hungryDog);
    foodObj.visible=true;
  }

   if (gameState===1){
     dog.addImage(happyDog);
     dog.scale=1;
     dog.y=250;
   }
   if(gameState==="hungry"){
    dog.addImage(hungryDog);
    dog.scale=1;
    foodObj.visible= false;
    dog.y=250;
  }
   
  var Bath=createButton("I Want To Take Bath");
  Bath.position(580,125);
  if(Bath.mousePressed(function(){
    gameState="bathing";
    database.ref('/').update({'gameState':gameState});
  }));
  if(gameState==="bathing"){
    dog.addImage(washroomIMG);
    dog.scale=0.25;
    foodObj.visible=false;
  }
  var Sleep=createButton("I am very sleepy");
  Sleep.position(710,125);
  if(Sleep.mousePressed(function(){
    gameState="sleeping";
    database.ref('/').update({'gameState':gameState})
  }));
  if(gameState==="sleeping"){
    //dog.addImage(bedroomIMG);
    foodObj.bedroom();
    dog.scale=0.25;
    foodObj.visible=false;
  }
  var Play=createButton("Lets Play !");
  Play.position(500,160);
  if(Play.mousePressed(function(){
    gameState="hungry";
    database.ref('/').update({'gameState':gameState})
  }));
  if(gameState==="hungry"){
    dog.addImage(livingroom);
    dog.scale=0.25;
    foodObj.visible=false;
  }

  var PlayInGarden=createButton("let's play in park");
  PlayInGarden.position(585,160);
  if(Sleep.mousePressed(function(){
    gameState="playing";
    database.ref('/').update({'gameState':gameState})
  }));
  if(gameState==="playing"){
    dog.y=175;
    dog.addImage(gardenIMG);
    dog.scale=0.25;
    foodObj.visible=false;
  }

  currrentTime=hour();
  if(currentTime === lastFed + 1){
    gameState= "playing";
    updateGameState();
    foodObj.garden();

  }
   else if(currentTime === lastFed + 2){
    gameState= "sleeping";
    updateGameState();
    foodObj.bedroom();
    
  }
  else if(currentTime > lastFed +2 && currentTime <+ lastFed + 4){
    gameState ="bathing";
    updateGameState();
    foodObj.washroom();
  }
  else{
    gameState="hungry";
    updateGameState();
    foodObj.display();
  }
  foodObj.getFoodStock();
  getGameState();
  

  fedTime= database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed=data.val();
  })

  if(gameState === "hungry"){
    feed.show();
    addFood.show();
    dog.addAnimation("hungry",hungryDog);
  }
  else{
    feed.hide();
    addFood.hide();
    dog.remove();
  }
   
  /*fill(255,255,254);
  textSize(15);
  if(lastFed >=12){
    text("Last Feed  "+lastFed %12 +"PM",350,30);
  }
  else if (lastFed ==0){
    text("Last Feed : 12AM" , 350,30)

  }
   else{
     text("Last Feed " + lastFed+ "AM" ,350,30)
   }
   */
  drawSprites();
  
  textSize(20);
  fill("black");
  text("Last Fed:"+ lastFed+":00",800,95);
  text("Time Since Last Fed :"+(currentTime- lastFed),300,125);


  }
  //add styles here

  function readStock(data){
    foodS=data.val();
    foodObj.updateFoodStock(foodS);
  }
  
  function feedDog()  {
    foodObj.deductFood();
    foodObj.updateFoodStock();
    dog.changeAnimation("happy",happyDog);
    gameState ="happy";
    updateGameState();
    dog.addImage(happyDog);

    /*foodObj.updateFoodStock(foodObj.getFoodStock()-1);
    database.ref('/').update({
      Food : foodObj.getFoodStock(),
      FeedTime : hour()

    })*/
    
    

  }

 function addFoods(){
   foodObj.addFood();
   foodObj.updateFoodstock();
 }

 async function hour(){
   var site = await fetch("http://worldtimeapi.org/api/timezone/Asia/kolkata");
   var siteJSON = await site.json();
   var datetime= siteJSON.datetime;
   var hourTime=datetime.slice(11,13);
   return hourTime;
 }
   function createName(){
     input.hide();
     button.hide();

     names= input.value();
     var greeting=createElement('h3');
     greeting.html("pet's Name :"+ names);
     greeting.position(width/2+850,height/2+200);
   }
 
   function getGameState(){
     gameStateRef= database.ref('gameState');
     gameStateRef.on("value",function(data){
       gameState= data.val();
     });
   };
   function updateGameState(){
     database.ref('/').update({
       gameState:gameState
     })
   }
function writeStock(x){
  if(x<=0){
    x=20;
  }
  else{
    x=x-1;
    foodS=x;
  }
}
  

