app.directive('dragscroll', function(){
    return {
        restrict : 'A',
        link: function ($scope, elements) {
            var element = elements[0],
                curYPos = 0,
                curXPos = 0,
                curDown = false;

            element.addEventListener('mousemove', function(e){
                if(curDown === true)
                    element.scrollLeft +=- e.movementX;
            });

            element.addEventListener('mousedown', function(e){ curDown = true; curYPos = e.pageY; curXPos = e.pageX; });
            element.addEventListener('mouseup', function(e){ curDown = false; });
        }
    };
});