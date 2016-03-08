(function() {
  'use strict';

  // XXX error testng

  function shuffle(arr) {
    if (typeof arr != 'Array' && arr.length >= 0) {
      console.log('Not sure what this "array" is: ' + arr);
      return arr;
    }
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  var FortuneFile = function(fortuneFileId, fortunes) {
    // FortuneFile object
    //   represents a fortune file
    //   has => fortuneFileId
    //   has => fortunes (array of fortunes as strings) // XXX should be a linked list so it loops
    this.fortuneFileId = fortuneFileId;
    this.fortunes = fortunes;
  }

  FortuneFile.prototype.loadFortunes = function (fortuneFileId) {
    var self = this;
    return fetch(this.fortuneFileId).then(function (response) {
      if (response.ok) {
        response.text().then(function(text) {
          self.fortunes = text.split('\n%\n'); // XXX do we want to laod it all in mem?
          shuffle(self.fortunes);
        });
      } else {
        console.log('foo');
      }
    });
  }

  FortuneFile.prototype.elem = function(position) { 
    return this.fortunes[position];
  }
  
  var Fortunate = function(fortuneFile) {
    // Fortunate object
    //   the controller
    //   has => fortuneFiles (array of FortuneFile objects available)
    //   has => currentFortuneFile (the currently loaded FortuneFile object)
    //   has => position (Number) - location of the next fortune in the list to display
    this.position = 0;
    this.currentFortuneFile = fortuneFile;
    this.loadFortunes();
  }

  Fortunate.prototype.loadFortunes = function() {
    var self = this;
    this.currentFortuneFile.loadFortunes().then( function () {
      self.position = 0;
    });
  }

  Fortunate.prototype.switchFortuneFile = function (fortuneFile) {
    this.currentFortuneFile = fortuneFile;
    this.loadFortunes();
  }

  Fortunate.prototype.nextFortune = function () {
    this.position++;
    if (this.position >= this.currentFortuneFile.fortunes.length) {
      this.position = 0;
    }
    return this.currentFortuneFile.elem(this.position);
  }

  function hashToFortune (hash) {
    var fortune = hash.replace(/^[^#]+?#/, '');
    console.log(fortune);
    return '../fortunes/' + fortune + '.fortune';
  }

  window.addEventListener('load', function() {
    var fortuneElement = window.document.getElementById('fortune');

    // build Fortunate controller
    var fortunate = new Fortunate(new FortuneFile(hashToFortune(document.getElementById('default-fortune').href)));

    document.getElementById('content').addEventListener('click', function() {
      // when body is clicked, replace it with a random Fortune  
      fortuneElement.innerHTML = fortunate.nextFortune();
    });

    window.addEventListener('onhashchange', function() { 
      // switch fortune files
      console.log('hash change');
      fortunate.switchFortuneFile(new FortuneFile(hashToFortune(location.hash)));
    });

 });
})();
