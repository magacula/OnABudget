////////// BUDGET CONTROLLER ////////// (Module that handles the data entered - Income, Expenses, Percentages )
var budgetController = (function() {
  // Function Constructor: Sets up an object that includes a id(type), description, & value
  // Expense object
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Function calculates percentage of total income
  Expense.prototype.calculatePercentages = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // Function gets percentage
  Expense.prototype.getPercentage = function () {
    return this.percentage;
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
    percentage: -1,
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

    // Function that deletes items from data structure
    deleteItem: function (type, id) {
      var ids, index;

      // Loop over all elements in inc & exp Array using map
      // Returns a brand new array
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      // Finds the index of the item's id we want to delete
      index = ids.indexOf(id);

      // if the element exists in the array
      if (index !== -1) {
        data.allItems[type].splice(index, 1); //splice used to remove elements. splice(position where we want to start deleting, # of elements we want to delete)
      }

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
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    // Function that calculates percentages of each expense of the total income
    calculatePercentages: function () {
      // Loops through expense array and calculating percentage for each element
      data.allItems.exp.forEach(function (curr) {
        curr.calculatePercentages(data.totals.inc);
      });
    },

    // Function that stores all calculated percentages and returns them
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (curr) {
        return curr.getPercentage();
      });
      return allPerc;
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
    },
  };




})();


////////// UI CONTROLLER ////////// (Module that handles UI)
var UIController = (function() {

  // Variable that stores all user input values
  // Makes it easier for us to edit the input string names without having to edit the name throughout entire code or "hard code"
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container1',
    ExpPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  // Function that formats the numbers by adding minus sign for expense & plus sign for income items
  // Rounds to exactly two decimal points & comma separting the thousands
  // parameters: number is the digits associated with objects
  //            type is whether it is exp or inc
  var formatNumber =  function (num, type) {
    var numSplit, int, dec;
    // returns absolute value of number, removes sign
    num = Math.abs(num);
    // method of number prototype (rounds exactly to two numbers decimal places)
    // 2314.4567 -> 2,313.46
    num = num.toFixed(2); // 2 = two decimal places

    numSplit = num.split('.');  // splits string into an array of substrings, then returns new array

    int = numSplit[0];  // first element is integer part of number
    // if our number has more than 3 digits then a comma is added for thousands
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);  // ex) 23471 -> 23,471
    }

    dec = numSplit[1];  // second element is decimal numbers of whole number

    // Returns formatted number
    // ternary operator used
    return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
  };

  // This function is a for loop, after each iteration it will call callback function
  // Callback function has parameters (current, index)
  // Reuseable code for the rest of program if needed
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // Function that gets input values from user & is returned
    getInput: function () {
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

      // Creates HTML string with placeholder text. (Hard coded)
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__desciption">%description%</div><div class="left clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__desciption">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Function that replaces the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));  // FormatNumber function called and value is formatted & returned

      // Insert the html into the DOM using insertAdjacentHTML method
      // beforeend keyword - lets us insert our new html as a child of income__list or expenses__list (incomeContainer/expensesContainer)
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    // Function that deletes elements from UI
    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
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

    // Function that prints budget to screen, taking in an object to store the data
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    // Function that displays the percentages of each expense object
    displayPercentages: function (percentages) {
      // variable that stores all percent labels
      var fields = document.querySelectorAll(DOMstrings.ExpPercLabel);

      // Function that passes callback function & adds HTML to UI
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }

      });
    },

    // Function that displays date on top of budget
    displayDate: function () {
      var now, year;

      now = new Date(); // Date object represents the current date and time, specified in the local time zone, as of the time of instantiation.

      // Array that holds month strings
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      // Returns the current month as a number
      month = now.getMonth();


      year = now.getFullYear(); // Returns the current year

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year; // placeholder html is replaced with current year string
    },

    // Function that changes color depending on income or expense
    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

      //  Changes colors
      nodeListForEach(fields, function (curr) {
        curr.classList.toggle('red-focus'); //toggle adds the red-focus class when its not there. Also removes it when it is there
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

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
      // Adds item if user clicks enter buttom, calls ctrlAddItem function. Return button keyCode = 13
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    // Deletes events
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    // creates a changed event to change colors of events
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  // Function that updates the budget everytime we enter a new item in the UI
  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  // Function that updates Percentages
  var updatePercentages = function () {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

     // 3. Update the UI with new percentages
     UICtrl.displayPercentages(percentages);
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

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };

  // Function that will delete events in Event Handler. Passes "event" into function to select target element on UI
  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    // Moves up from target element to parent node. (button -> item clearfix) Using DOM Traversing 4 times
    itemID = event.target.parentNode.parentNode.parentNode.id;

    //Gets unique ID to delete
    if (itemID) {
      // spilts string of ID into two strings: type and ID. ex) 'inc-1'
      // isolated strings into separate variables
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]); // convert to an integer

      // 1. Delete item from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update & Show the new budget
      updateBudget();

      // 4. Calculate and update percentages
      updatePercentages();
    }


  };

  return {
    // Intialization Function - (Function that executes everytime we begin program. Ensures we "set up" objects correctly)
    init: function() {
      console.log('Application has started');
      // function call to display current year
      UICtrl.displayDate();
      // function call to display budget and to reset at start up
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1, //since no percentage at all at start up
      });
      setupEventListeners(); // function call to set up EventListeners
    }
  };

})(budgetController, UIController);

controller.init();
