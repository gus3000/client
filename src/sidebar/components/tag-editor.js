'use strict';

var tagEditorTemplate = require('../templates/tag-editor-template.html');

// @ngInject
function TagEditorController(tags, annotationUI, $templateCache) {

  $templateCache.put('tag-editor-template', tagEditorTemplate);

  this.onTagsChanging = function (tag) {

    let tagStr = null;
    if(typeof tag === 'string') {
      tagStr = tag;
    } else if ('text' in tag) {
      tagStr = tag.text;
    } else if ('label' in tag) {
      tagStr = tag.label;
    }
    if(!tagStr || tagStr.startsWith('cat:')) {
      return false;
    }
    const tagStrList = this.getTagStrList();
    const nbOccurence = tagStrList.reduce(function(prevRes, t) {
      if(t === tag) {
        prevRes += 1;
      }
      return prevRes;
    },0);
    if(nbOccurence > 1) {
      return false;
    }
    return true;
  };

  this.getTagStrList = function () {
    return this.tagList.map(function (item) {
      if('text' in item) {
        return item.text;
      } else {
        return item.label;
      }
    });
  };

  this.onTagsChanged = function () {
    tags.store(this.tagList);

    const newTags = this.getTagStrList();
    this.onEditTags({tags: newTags});
  };

  this.autocomplete = function (query) {
    return Promise.resolve(tags.filter(query));
  };

  this.$onChanges = function (changes) {
    console.log("NEW TAGS", changes);
    if (changes.tags) {
      this.tagList = changes.tags.currentValue.map(function (tag) {
        let label = tag;
        const color = annotationUI.getTagColor(tag);
        if(color !== null && tag.startsWith('cat:')) {
          label = label.slice(4);
        }
        return {
          text: tag,
          label: label,
          color: color,
        };
      });
    }
  };
}

module.exports = {
  controller: TagEditorController,
  controllerAs: 'vm',
  bindings: {
    tags: '<',
    onEditTags: '&',
  },
  template: require('../templates/tag-editor.html'),
};
