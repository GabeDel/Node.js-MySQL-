//Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// Initializes the connection variable to sync with a MySQL database
var connection = mysql.createConnection({
  host: "localhost",

  
  port: 8080,

  
  user: "root",

  
  password: "602318Gd1",
  database: "bamazon"
});


connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
  }
  loadProducts();
});

function loadProducts() {
  
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    console.table(res);

    promptForUser(res);
  });
}


function promptForUser(inventory) {
  
  inquirer
    .prompt([
      {
        type: "input",
        name: "choice",
        message: "The ID of the item you want to buy [Quit with Q]",
        validate: function(val) {
          return !isNaN(val) || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      
      checkExit(val.choice);
      var choiceId = parseInt(val.choice);
      var product = checkInventory(choiceId, inventory);

      if (product) {

        promptQuantity(product);
      }
      else {
        
        console.log("We dont have that item");
        loadProducts();
      }
    });
}

function promptQuantity(product) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many? [Quit with Q]",
        validate: function(val) {
          return val > 0 || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      
      checkExit(val.quantity);
      var quantity = parseInt(val.quantity);

     
      if (quantity > product.stock_quantity) {
        console.log("try again");
        loadProducts();
      }
      else {
       
        makePurchase(product, quantity);
      }
    });
}


function makePurchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product.item_id],
    function(err, res) {
     
      console.log("Purchased! " + quantity + " " + product.product_name);
      loadProducts();
    }
  );
}


function checkInventory(choiceId, inventory) {
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].item_id === choiceId) {
     
      return inventory[i];
    }
  }

  return null;
}


function checkExit(choice) {
  if (choice.toLowerCase() === "q") {
    console.log("bye!");
    process.exit(0);
  }
}
