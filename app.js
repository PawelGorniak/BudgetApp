
// BUDGET CONTROLLER
var budgetController = (function(){
	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};
	Expense.prototype.calculatePercentage = function(totalInc){
		if (totalInc > 0 ){
			this.percentage = Math.round((this.value / totalInc)*100);
			console.log( "proecnt pojednyczy wynosi: " + this.percentage);
		} else {this.percentage = -1;}
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	

	var calculateTotal = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(cur){
			sum += cur.value;
			
		});
		data.totals[type] = sum;
	};
	var data = {
		totals: {
			inc: 0,
			exp: 0
		},
		allItems: {
			inc: [],
			exp: []
		},
		budget:0,
		percentage:-1
	};
	return {
		addItem: function(type,des,val){
			var newItem, ID;

			// Create new ID
			if (data.allItems[type].length >0){
				ID = data.allItems[type][data.allItems[type].length-1].id +1;
			} else {ID =0;}

			// Create new instance of Income or Expense
			if (type==="inc"){
				newItem = new Income(ID, des, val);
			} else if(type ==="exp"){
				newItem = new Expense(ID, des, val);

			}

			// add new Items to data structure
			data.allItems[type].push(newItem);
			return newItem;

		},
		deleteItem: function(type, id){
			var ids, index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});			
			index = ids.indexOf(id);			
			if (index !== -1){
				data.allItems[type].splice(index,1);
			}
		},
		calculateBudget: function(type){
			calculateTotal(type);
			data.budget = data.totals.inc - data.totals.exp;
			if(data.totals.inc >0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		calculatePercentages(){
			data.allItems.exp.forEach(function(cur){
				cur.calculatePercentage(data.totals.inc);
			});			
		},
		getPercentages(){
			var percArray = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return percArray;
		},
		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		testing : function(){
			return data;
		}
	}
	})();


// UI CONTROLLER
var UIController = (function(){
	var DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		labelTotalIncome: ".budget__income--value",
		labelTotalExpenses: ".budget__expenses--value",
		labelBudget: ".budget__value",
		labelPercentage: ".budget__expenses--percentage",
		container: ".container",
		expPercLabel : ".item__percentage",
		dateLabel: ".budget__title--month"
	};
	var numberFormat = function(numb, type) {
		var numbSplit, int, dec;
		/* 
		- add - or +
		- add 2 number after point
		- separate int and float
		*/

		numb = Math.abs(numb);
		numb = numb.toFixed(2);
		numbSplit = numb.split(".");
		int = numbSplit[0];
		dec = numbSplit[1];
		if(int.length >3){
			int = int.substr(0,int.length-3) + "," + int.substr(int.length-3, int.lenght);
		}


		return (type === "inc" ? "+" : "-") + " " + int + "." + dec; 
	};
	var foreachList = function(fields, callback){
				for (i=0; i<fields.length; i++){
					callback (fields[i],i);
				}
			};
	return {
		getInput: function() {
			return {
			type: document.querySelector(DOMstrings.inputType).value, // will get inc exp
			description: document.querySelector(DOMstrings.inputDescription).value,
			value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},
		getDOMstrings: function(){
			return DOMstrings;
		},
		addItem: function (object, type){
			var HTML, newHTML, element;

			if(type === "inc"){
			element = DOMstrings.incomeContainer;
			HTML = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if(type === "exp"){
			element = DOMstrings.expensesContainer;
			HTML = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			newHTML = HTML.replace('%id%', object.id);
			newHTML = newHTML.replace('%description%', object.description);
			newHTML = newHTML.replace('%value%', numberFormat(object.value,type));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

		},
		clearFields: function(){
			var fields;
			fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
			var fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(current,index,array){
				current.value = "";
			});

			document.querySelector(DOMstrings.inputDescription).focus();
		},
		deleteListItem: function(classId) {
			var el = document.getElementById(classId);
			el.parentNode.removeChild(el);

		},
		updateBudget: function(object){
			var type;
			document.querySelector(DOMstrings.labelTotalIncome).textContent = numberFormat(object.totalInc, "inc");
			document.querySelector(DOMstrings.labelTotalExpenses).textContent = numberFormat(object.totalExp, "exp");
			object.budget >= 0 ? type = "inc" : type = "exp";
			document.querySelector(DOMstrings.labelBudget).textContent = numberFormat(object.budget, type);
			if (object.percentage > 0){
						document.querySelector(DOMstrings.labelPercentage).textContent = object.percentage + "%";	
			} else{
				document.querySelector(DOMstrings.labelPercentage).textContent = "---";	
			}
		},
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expPercLabel);

			

			var updatePerc = function(cur,index){	
				if(percentages[index] > 0){			
				cur.textContent = percentages[index] + "%";}
				else{ cur.textContent = "---";}
			}
			foreachList(fields, updatePerc);
		},
		displayDate: function(){
			var now, year, month, months;
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			months = ["January", "February", "March", "April", "May", "June", "July", "August", 
			"September", "October", "November", "December"];

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;

		},
		changeType: function(){
			var fields;
			fields = document.querySelectorAll(
				DOMstrings.inputType + ","
				 + DOMstrings.inputDescription + ","
				 + DOMstrings.inputValue);
			foreachList(fields, function(current){
				current.classList.toggle("red-focus");
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle("red");

		}

	}

})();


 // GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
	var setupEventListeners = function() {
		var DOM = UIController.getDOMstrings();
		document.querySelector(DOM.inputType).addEventListener('change', UIController.changeType);
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(e){
			if (e.keycode === 13 || e.which === 13){
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	}

	var calculateBudget = function (type){
	// 1. Calculate the total incomes and expenses
		budgetController.calculateBudget(type);
		// return budget
	}

	var updateBudget = function (type){
		// 4. Calculate the budget
		calculateBudget(type);
		// Return the budget
		var budget = budgetCtrl.getBudget();
		// 5. Display the budget on the UI
		UIController.updateBudget(budget);
	};

	var updatePercentages = function(){
		// 1. calculate percentages
		budgetController.calculatePercentages();
		// 2. read from datat store
		var percentages = budgetController.getPercentages();
		// 3. display in UI
		UIController.displayPercentages(percentages);
	}; 

	var ctrlAddItem = function () {
		// 1. Get the field input data
		var input = UIController.getInput();
		if (input.description !== "" && !isNaN(input.value) && input.value>0){
			// 2. Add the item to the budget controller
			var addItem = budgetController.addItem(input.type, input.description, input.value);
			// 3. Add the item to the UIController
			UIController.addItem(addItem, input.type);
			// Clear fields and focus on description
			UIController.clearFields();
			// 4. Calculate the budget and block empty inputs
			updateBudget(input.type);
			// 5 . Calculate precentages
			updatePercentages();
		};
	};
	var ctrlDeleteItem = function (event){
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splitID = itemID.split("-");
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// delete item from store data
			budgetController.deleteItem(type,ID);
			// delete item from UI
			UIController.deleteListItem(itemID);
			// recalculate budget and totals
			updateBudget(type);
			// update percentages
			updatePercentages();
		}
		
	};		
		
	
	return {
		init: function(){
			setupEventListeners();
			UIController.updateBudget(
				{budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1});
			UIController.displayDate();
		}
	}
})(budgetController, UIController);

controller.init();


