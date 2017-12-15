

function insertRect(textElm) {
  // var ctx = document.getElementById(idSvg);
  // var textElm = ctx.getElementById(idElem);
  // var box = textElm.getBBox();
  var ctx = textElm;
  while(ctx.tagName != "svg" && ctx != null)
  {
    // console.log("ctx : " + ctx.tagName);
    ctx = ctx.parentNode;
  }
  if(ctx == null)
  {
    console.log("this is not an SVG.");
    return;
  }

  var box = getBoundingBox(textElm,ctx);
  console.log(box);

  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", box.x);
  rect.setAttribute("y", box.y);
  rect.setAttribute("width", box.width);
  rect.setAttribute("height", box.height);
  rect.setAttribute("fill", "yellow");

  var parent = textElm.parentElement;
  var child = textElm;
  while(parent.tagName == "text" || parent.tagName == "tspan")
  {
    child = parent;
    parent = parent.parentElement;
  }
  parent.insertBefore(rect, child);
}

function getBoundingBox(textElm, ctx)
{
  return textElm.getBBox();
  //if Firefox
  //return boundingClientRectToBBox(textElm.getBoundingClientRect(), ctx);
  //if chrome, select more precisely the box
  //TODO
}

function boundingClientRectToBBox(rect, ctx)
{
  var pt = ctx.createSVGPoint();

  var xform = ctx.getScreenCTM().inverse();

  pt.x = rect.left;
  pt.y = rect.top;
  var pt2 = pt.matrixTransform(xform);

  pt.x = rect.right;
  pt.y = rect.bottom;
  var pt3 = pt.matrixTransform(xform);

  return {x:pt2.x, y:pt2.y, width: pt3.x - pt2.x, height: pt3.y - pt2.y};
}


function lol() {
  var svg = document.getElementsByTagName('svg')[0];
  var svgNS = svg.getAttribute('xmlns');
  var pt = svg.createSVGPoint();
  var g = document.querySelector('g');
  window.onload = function () {
    var xform = g.getScreenCTM().inverse();
    var tspans = svg.getElementsByTagName('tspan');
    for (var i = 0, len = tspans.length; i < len; ++i) {
      var tspan = tspans[i]; //TODO mettre le rect à la racine du document
      //TODO vérifier rotation
      var rect = document.createElementNS(svgNS, 'rect');
      var bbox = tspan.getBoundingClientRect();

      pt.x = bbox.left;
      pt.y = bbox.top;
      var pt2 = pt.matrixTransform(xform);
      rect.setAttribute('x', pt2.x);
      rect.setAttribute('y', pt2.y);

      pt.x = bbox.right;
      pt.y = bbox.bottom;
      pt = pt.matrixTransform(xform);
      rect.setAttribute('width', pt.x - pt2.x);
      rect.setAttribute('height', pt.y - pt2.y);

      g.appendChild(rect);
    }
  }
}

module.exports = insertRect;