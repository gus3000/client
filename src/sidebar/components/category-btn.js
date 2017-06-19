'use strict';

// @ngInject
module.exports = {
  controller: function () {
    this.category = "unknown";
    this.catIndex = 0; //TODO use dropdown
    this.dropdownMenuLabel = ['A','B','C','D']; //TODO

    this.onClick = function () {
      this.catIndex++;
      console.log('category-btn click');
    };

    this.onRobert = function () {
      console.log('Bonjour, je m\'appelle Robert.');
    };

    this.getCategory = function () {
      return this.category;
    };

    this.isCategoryTag = function(tag)
    {
      return tag.startsWith('cat:');
    }

    this.setCategory = function ($newcat) {
      this.category = $newcat;
      var catTag = 'cat:'+ $newcat;

      var currentCatIndex = this.tags.findIndex(this.isCategoryTag);
      if (currentCatIndex === -1) {
        this.tags.push(catTag);
      }
      else {
        this.tags[currentCatIndex] = catTag;
      }

      console.log(this.tags);
    };

    this.getDescription = function () {
      return "placeholder description"; //TODO
    };

    this.color = function () {
      //TODO
    };
  },
  controllerAs: 'vm',
  bindings: {
    label: '<',
    getCategory: '<',
    getDescription: '<',
    color: '<',
    annotation: '<',
    tags: '<',
    dropdownMenuLabel: '@',
    onClick: '&',
    onRobert: '&',
  },
  template: require('../templates/category-btn.html'),
};
