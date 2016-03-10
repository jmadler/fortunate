(function() {
  'use strict';

  /**
   * shuffle() is a Fisher-Yates shuffling function -- it takes an array and returns the same array, shuffled.
   * @param {array} arr - any array
   * @return {array} - The same array, shuffled
   */
  function shuffle(arr) {
    if (!(Array.isArray(arr) && arr.length < 1)) {
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

  /**
   * FortuneFile class, representing a fortune file
   * @param {string} fortuneFileId - the FortuneFile ID (i.e. "douglas-adams" for "../fortunes/douglas-adams.fortune")
   * @param {array} fortunes - an array of strings that contain the fortunes within that file
   */
  var FortuneFile = function(fortuneFileId, fortunes) {
    if (typeof fortuneFileId !== 'string' || fortuneFileId.length < 1) {
      console.log('Not sure what this fortuneFileId is: ' + fortuneFileId);
      return;
    }
    this.fortuneFileId = fortuneFileId;
    this.fortunes = fortunes;
  };

  /**
   * FortuneFile.loadFortunes() chunks the fortuneFile's contents into an array of fortunes
   * @return {promise} - promises promises promises.
   */
  FortuneFile.prototype.loadFortunes = function() {
    var self = this;
    return fetch(this.fortuneFileId).then(function(response) {
      if (response.ok) {
        response.text().then(function(text) {
          self.fortunes = text.split('\n%\n'); // XXX do we want to load it all in mem?
          shuffle(self.fortunes);
        });
      } else {
        console.log('Our response was not ok :('); // XXX
      }
    });
  };

  /**
   * FortuneFile.elem() returns the element at a given position
   * @param {number} position - the position of the element
   * @return {string} - a string representing the fortune
   */
  FortuneFile.prototype.elem = function(position) {
    return this.fortunes[position];
  };

  /**
   * Fortunate class, the controller
   * @param {FortuneFile} fortuneFile - the currently loaded FortuneFile object
   */
  var Fortunate = function(fortuneFile) {
    // position (location of the next fortune in the list to display)
    this.position = 0;
    // currentFortuneFile (the currently loaded FortuneFile object)
    this.currentFortuneFile = fortuneFile;
    this.loadFortunes();
  };

  /**
   * Fortunate.loadFortunes() loads the current fortuneFile's contents into memory
   */
  Fortunate.prototype.loadFortunes = function() {
    var self = this;
    this.currentFortuneFile.loadFortunes().then(function() {
      // Reset the position of the current fortune file
      self.position = 0;
    });
  };

  /**
   * Fortunate.switchFortuneFile() takes a fortuneFile and switches to it
   * @param {FortuneFile} fortuneFile - a FortuneFile object to switch to
   */
  Fortunate.prototype.switchFortuneFile = function(fortuneFile) {
    this.currentFortuneFile = fortuneFile;
    this.loadFortunes();
  };

  /**
   * Fortunate.nextFortune()
   * @return {string} - the next fortune in the current fortune file
   */
  Fortunate.prototype.nextFortune = function() {
    this.position++;
    if (this.position >= this.currentFortuneFile.fortunes.length) {
      // if we've hit the end of the fortune file, let's wrap back to the beginning
      this.position = 0;
    }
    return this.currentFortuneFile.elem(this.position);
  };

  /**
   * hashToFortune is a utility function that, when given a location.hash value, returns the corresponding fortune file's path
   * @param {string} hash - a location.hash string
   * @return {string} - the corresponding fortune file path
   */
  function hashToFortune(hash) {
    if (typeof hash !== 'string' || hash.length < 1) {
      console.log('Not sure what this location.hash is: ' + hash);
      return;
    }
    var fortune = hash.replace(/^[^#]+?#/, '');
    return '../fortunes/' + fortune + '.fortune';
  }

  window.addEventListener('load', function() {
    var fortuneElement = window.document.getElementById('fortune');

    // build Fortunate controller
    var fortuneFileId = hashToFortune(
     document.getElementById('default-fortune').href
    );
    var fortunate = new Fortunate(new FortuneFile(fortuneFileId));

    document.getElementById('content').addEventListener('click', function() {
      // when the is clicked, replace it with a random Fortune
      fortuneElement.innerHTML = fortunate.nextFortune();
    });

    window.addEventListener('onhashchange', function() {
      // switch fortune files
      var newFortuneFile = new FortuneFile(hashToFortune(location.hash));
      fortunate.switchFortuneFile(newFortuneFile);
    });
  });
})();
