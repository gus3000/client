

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

module.exports = insertRect;
