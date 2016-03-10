(function() {
  'use strict';

  function shuffle(arr) {
    // shuffle() is a Fisher-Yates shuffling function -- it takes an array and returns the same array, shuffled.
    if (typeof arr != 'Array' || arr.length < 1) {
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
    //   has => fortuneFileId (string)
    //   has => fortunes (array of strings) 
    if (typeof fortuneFileId != 'string' || fortuneFileId.length < 1) {
      console.log('Not sure what this fortuneFileId is: ' + fortuneFIleId);
      return;
    }
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
        console.log('Our response was not ok :('); // XXX
      }
    });
  }

  FortuneFile.prototype.elem = function(position) { 
    // fortuneFile.elem() returns the element at a given position
    return this.fortunes[position];
  }
  
  var Fortunate = function(fortuneFile) {
    // Fortunate object
    //   the controller
    //   has => currentFortuneFile (the currently loaded FortuneFile object)
    //   has => position (integer) - location of the next fortune in the list to display
    this.position = 0;
    this.currentFortuneFile = fortuneFile;
    this.loadFortunes();
  }

  Fortunate.prototype.loadFortunes = function() {
    // fortune.loadFortunes() loads the current fortuneFile's contents into memory
    var self = this;
    this.currentFortuneFile.loadFortunes().then( function () {
      // Reset the position of the current fortune file
      self.position = 0;
    });
  }

  Fortunate.prototype.switchFortuneFile = function (fortuneFile) {
    // fortune.switchFortuneFile() takes a fortuneFile and switches to it
    this.currentFortuneFile = fortuneFile;
    this.loadFortunes();
  }

  Fortunate.prototype.nextFortune = function () {
    // fortune.nextFortune() returns the next fortune in the current fortune file
    this.position++;
    if (this.position >= this.currentFortuneFile.fortunes.length) {
      // if we've hit the end of the fortune file, let's wrap back to the beginning
      this.position = 0;
    }
    return this.currentFortuneFile.elem(this.position);
  }

  function hashToFortune (hash) {
    // hashToFortune(hash) is a utility function that, when given a location.hash value, returns the corresponding fortune file's path
    if (typeof hash != 'string' || hash.length < 1) {
      console.log('Not sure what this location.hash is: ' + hash);
      return;
    }
    var fortune = hash.replace(/^[^#]+?#/, '');
    return '../fortunes/' + fortune + '.fortune';
  }

  window.addEventListener('load', function() {
    var fortuneElement = window.document.getElementById('fortune');

    // build Fortunate controller
    var fortunate = new Fortunate(new FortuneFile(hashToFortune(document.getElementById('default-fortune').href)));

    document.getElementById('content').addEventListener('click', function() {
      // when the is clicked, replace it with a random Fortune  
      fortuneElement.innerHTML = fortunate.nextFortune();
    });

    window.addEventListener('onhashchange', function() { 
      // switch fortune files
      fortunate.switchFortuneFile(new FortuneFile(hashToFortune(location.hash)));
    });

 });
})();
