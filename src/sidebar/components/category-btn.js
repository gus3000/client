'use strict';

// @ngInject
module.exports = {
    controller: function () {
	this.category = "unknown";
	this.catIndex = 0; //TODO use dropdown
	//this.dropdownMenuLabel = ['A','B','C','D'];

	this.categories = [
	    {
		name: "Important",
		color: "#0f75f1"
	    },
	    {
		name: "Mot-clef",
		color: "#db3498"
	    },
	    {
		name: "Commentaire",
		color: "#2ecc71"
	    },
	    {
		name: "Appel:expertise",
		color: "#007533"
	    },
	    {
		name: "Appel:discussion",
		color: "#007533"
	    },
	];

	this.onClick = function () {
	    this.catIndex++;
	    console.log('category-btn click');
	};

	this.getCategory = function () {
	    return this.category;
	};

	this.isCategoryTag = function(tag)
	{
	    return tag.startsWith('cat:');
	};

	this.setCategory = function ($newcat) {
	    this.category = $newcat;
	    var catTag = 'cat:'+ $newcat.name;

	    // set category tag
	    var currentCatIndex = this.tags.findIndex(this.isCategoryTag);
	    if (currentCatIndex === -1) {
		this.tags.push(catTag);
	    }
	    else {
		this.tags[currentCatIndex] = catTag;
	    }

	    // set button color
	    //console.log(this.css());
	};

	this.getDescription = function () {
	    return "placeholder description"; //TODO
	};

	this.getColor = function () {
	    return this.category.color;
	};
    },
    controllerAs: 'vm',
    bindings: {
	annotation: '<',
	categories: '<',
	getColor: '<',
	getCategory: '<',
	getDescription: '<',
	label: '<',
	tags: '<',

	// dropdownMenuLabel: '@',
	onClick: '&',
    },
    template: require('../templates/category-btn.html'),
};
