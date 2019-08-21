////////// BUDGET CONTROLLER ////////// (Module that handles the data entered - Income, Expenses, Percentages )
var budgetController = (function() {
  // Function Constructor: Sets up an object that includes a id(type), description, & value
  // Expense object
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Income object
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Function calculating total expenses / incomes
  var calculateTotal = function (type) {
    var sum = 0;

    // For each loops over array adding up all of its elements
    data.allItems[type].forEach(function (curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;  // stores the sum into totals object
  };

  // Our big Data structure that holds all of the program's data
  var data = {
    // Object that holds both Expense and Income objects
    allItems: {
      exp: [],
      inc: []
    },
    // Object that holds total values of each object
    totals: {
      exp: 0,
      inc: 0
    },
    // Object the holds calculated budget
    budget: 0,
    // -1 validates that something is non existant
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // Creates new ID
      // Every object's ID is unqiue and every new item is greater than the previous by 1.
      // Ex. [1 2 3 4 5 ] ---> (ID = last ID + 1)
      // If the data array is empty, then ID is set to 0
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }



      // Create new item based on inc or exp
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem); //Pushes at the end of our data structure (array)
      return newItem; //returns the item
    },

    // Function that calculates budget by calcuating total incomes and total expenses
    // and finds the difference. Also w/ percentage
    calculateBudget: function () {
      // 1. Calcualte total income & expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // 2. Calculate the budget: (Budget = total income - total expenses)
      data.budget = data.totals.inc - data.totals.exp;

      // 3. Calculate the percentage of income that we spent: (percentage = (total expenses / total income) * 100)
      // ONLY if income is greater than 0. Also rounds to the nearest integer
      if (data.totals.income > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    // Function that gets & returns calculated budget w/ total incomes, expenses, and percentages
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    // Good practice to use testing method, to test functions in console
    // Remove or comment out during production
    testing: function() {
      console.log(data);
    }
  };




})();


////////// UI CONTROLLER ////////// (Module that handles UI)
var UIController = (function() {

  // Variable stores all user input values
  // Makes it easier for us to edit the input string names without having to edit the name throughout entire code or "hard code"
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
  };

  return {
    // Function that gets input values from user & is returned
    getInput: function() {
      return {
        // Creates and returns an object of all 3 input values
        type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value), // pareFloat(): converts string to decimal number
      };
    },
    // Function that adds item to array to display to UI
    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Creates HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__desciption">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__desciption">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Functipm that replaces the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // Insert the html into the DOM using insertAdjacentHTML method
      // beforeend keyword - lets us insert our new html as a child of income__list or expenses__list (incomeContainer/expensesContainer)
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    // Function that clears input fields after entering
    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue); //variable holds result of selection, returns a list
      // Converting a list -> Array using slice method (only on Arrays)
      fieldsArr = Array.prototype.slice.call(fields);
      // For each loop that loops through Array and sets the value of each element in array to empty string
      //Anonymous function can take up to only 3 parameters
      //Access to : ( current value of array, index number, entire array )
      //
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      //Sets the focus back to the first element of the array (Goes back to "Add description")
      fieldsArr[0].focus();

    },

    // Function that gets & returns the object DOMstrings
    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();


////////// GLOBAL APP CONTROLLER ////////// (Module that connects budget & UI controller)
var controller = (function(budgetCtrl, UICtrl) {

  // Function that holds all of the EventListeners
  var setupEventListeners = function() {
    // Stores DOM Strings into variable "DOM"
    var DOM = UICtrl.getDOMstrings();

    // Event Handler on buttom
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      // Adds item if user clicks enter buttom, calls ctrlAddItem function
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem();
      }

    });
  };

  // Function that updates the budget everytime we enter a new item in the UI
  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    console.log(budget);
  };

  // Function that adds items to Event Handler
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. Get the filed input data
    input = UICtrl.getInput();

    // Input validation preventing items to be added with no decription or value & to ensure the value IS a number
    // Runs "true" when input is a number (NOT be NotaNumber)
    if (input.description !== "" && input.value > 0 && !isNaN(input.value)) {
      // 2. Add an item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add an item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();
    }



  };

  return {
    // Intialization Function - (Function that executes everytime we begin program. Ensures we "set up" objects correctly)
    init: function() {
      console.log('Application has started');
      setupEventListeners(); // function call to set up EventListeners
    }
  };

})(budgetController, UIController);

controller.init();
