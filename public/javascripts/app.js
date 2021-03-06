angular.module('socketDemo', ['ngRoute'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/partials/home.html',
        controller: 'HomeController'
      }).
      otherwise({
        redirectTo: '/'
      });
  })
  .controller('HomeController', function ($scope, $rootScope, $document) {

    // io is a global object given to you by /socket.io/socket.io.js
    var socket = io();
    var coordinateArray = [];

    $scope.messages = [];

    $document.bind('keydown', function (e) {
        $rootScope.$broadcast('keydown', e, String.fromCharCode(e.which));
    });

    $rootScope.$on('keydown', function (e, a, key) {
        $scope.$apply(function () {
          switch(key){
            case '%':
              $scope.arrow("left");
              break;
            case '\'':
              $scope.arrow("right");
              break;
            case '(':
              $scope.arrow("down");
              break;
            case '&':
              $scope.arrow("up");
              break;
          }
        });
    })

    $scope.arrow = function(direction){
      var data = {
        direction: direction
      }
      socket.emit('arrow', data);
    }

    $scope.updateOpponent = function(activePieceCoordx, activePieceCoordy){
      var data = {
        x: activePieceCoordx,
        y: activePieceCoordy
      }
      socket.emit('oppCoord', data);
    }

    // when the _server_ sends a message
    // we'll add that message to our $scope.messages array
    socket.on('message', function (data) {

      var alreadyAdded = false
      for (var i = 0; i < coordinateArray.length; i++) {
        if(coordinateArray[i].x == data.x && coordinateArray[i].y == data.y){
          alreadyAdded = true;
        }
      }
      if(!alreadyAdded){
        coordinateArray.push(data);
      }

      if(coordinateArray.length === 4){

        var clear = $('.opponentBrickNow').removeClass('opponentBrickNow');

        // console.log(coordinateArray);

        clear.promise().done(function() {
          coordinateArray.forEach(function (element) {
            // console.log("y " + coordinateArray[i].y);
            // console.log("x " + coordinateArray[i].x);
            // document.querySelector('[opponent-y="'+coordinateArray[i].y+'"] [opponent-x="'+coordinateArray[i].x+'"]').className = "opponentBrickNow";
            // console.log(element.x,element.y);
            var oppBrick = $('div[opponent-y=' + element.y + '] div[opponent-x=' + element.x + ']');
            // console.log('before',oppBrick.hasClass('opponentBrickNow'));
            oppBrick.addClass('opponentBrickNow');
            // console.log('after',oppBrick.hasClass('opponentBrickNow'));

          })
          coordinateArray = [];
        })

      }

    })

    // $scope.self = function () {
    //   // this sends a message to the server
    //   // with the name of "self"
    //   socket.emit('self', 'replaceme');
    // }
    //
    // $scope.all = function () {
    //   // this sends a message to the server
    //   // with the name of "all"
    //   socket.emit('all', 'replaceme');
    // }
    //
    // $scope.broadcast = function () {
    //   // this sends a message to the server
    //   // with the name of "broadcast"
    //   socket.emit('broadcast', 'replaceme');
    // }

    $scope.chat = function(){
      var data = {
        name: $scope.Username,
        msg: $scope.Message
      }
      socket.emit('chat', data);
    }

    // The $destroy event is triggered when the controller is about to go away
    // For example when you move to another route
    $scope.$on('$destroy', function (event) {
      // since the global io object is reused, all the event listeners from
      // above will remain until the page is reloaded.

      // So clean up by removing all listeners
      socket.removeAllListeners();
    });


    var fs = "1111:01|01|01|01*011|110:010|011|001*110|011:001|011|010*111|010:01|11|01:010|111:10|11|10*11|11*010|010|011:111|100:11|01|01:001|111*01|01|11:100|111:11|10|10:111|001", now = [3,0], pos = [4,0];
    var gP = function(x,y) {
      $scope.updateOpponent(x,y);
      return document.querySelector('[data-y="'+y+'"] [data-x="'+x+'"]');
    };
    var draw = function(ch, cls) {
        var f = fs.split('*')[now[0]].split(':')[now[1]].split('|').map(function(a){return a.split('')});
        for(var y=0; y<f.length; y++)
            for(var x=0; x<f[y].length; x++)
                if(f[y][x]=='1') {
                    if(x+pos[0]+ch[0]>9||x+pos[0]+ch[0]<0||y+pos[1]+ch[1]>19||gP(x+pos[0]+ch[0],y+pos[1]+ch[1]).classList.contains('on')) return false;
                    gP(x+pos[0]+ch[0], y+pos[1]+ch[1]).classList.add(cls!==undefined?cls:'now');
                }
        pos = [pos[0]+ch[0], pos[1]+ch[1]];
    }
    var deDraw = function(){ if(document.querySelectorAll('.now').length>0) deDraw(document.querySelector('.now').classList.remove('now')); }
    var check = function(){
    	for(var i=0; i<20; i++)
    		if(document.querySelectorAll('[data-y="'+i+'"] .brick.on').length == 10)
    			return check(roll(i), document.querySelector('#result').innerHTML=Math.floor(document.querySelector('#result').innerHTML)+10);
    };
    var roll = function(ln){ if(false !== (document.querySelector('[data-y="'+ln+'"]').innerHTML = document.querySelector('[data-y="'+(ln-1)+'"]').innerHTML) && ln>1) roll(ln-1); };
    window.addEventListener('keydown', kdf = function(e){
        if(e.keyCode==38&&false!==(now[1]=((prv=now[1])+1)%fs.split('*')[now[0]].split(':').length) && false===draw([0,0], undefined, deDraw())) draw([0,0],undefined, deDraw(), now=[now[0],prv]);
        if((e.keyCode==39||e.keyCode==37)&&false===draw([e.keyCode==39?1:-1,0],undefined,deDraw())) draw([0,0],undefined,deDraw());
        if(e.keyCode == 40)
            if(false === draw([0,1], undefined, deDraw())) {
                if(draw([0,0], 'on', deDraw())||true) check();
                if(false === draw([0,0], undefined, now = [Math.floor(Math.random()*fs.split('*').length),0], pos = [1,0])) {
    				toV=-1;
    				alert('Your score: '+document.querySelector('#result').innerHTML);
    			}
            }
    });
    toF = function() {
        kdf({keyCode:40});
        setTimeout(
          function(){
            if(toV>=0)toF();
        },
          2000
        );
    }
    toF(toV = 2000);


  })
