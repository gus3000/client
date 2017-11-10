'use strict';

// @ngInject
module.exports = {
  controller: function (settings) {
    this.category = 'unknown';
    this.catIndex = 0; //TODO use dropdown
    //this.dropdownMenuLabel = ['A','B','C','D'];

    //*
    this.categories = settings.annotationProtocol;

    this.onClick = function () {
      this.catIndex++;
      console.log('category-btn click');
    };

    this.getCategory = function () {
      return this.category;
    };

    this.isCategoryTag = function (tag) {
      return tag.startsWith('cat:');
    };

    this.setCategory = function ($newcat) {
      this.category = $newcat;
      var catTag = 'cat:' + $newcat.name;

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
