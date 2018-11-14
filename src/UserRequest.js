const Screen = require('./Screen').Screen;

function UserRequest (handlerInput) {

  let _handlerInput = handlerInput;
  this._screen = extractScreen(handlerInput);

  function extractScreen(handlerInput) {
    return new Screen(handlerInput.shape, handlerInput.dimensions);
  }

  function addAttribute (key, value) {
    _handlerInput.addAttribute(key, value);
  }

  function removeAttribute (key) {
    _handlerInput.removeAttribute(key);
  }

  function respond (template, data) {
    console.log(`response`);
  }

  function clearState (keys) {
    keys.forEach(k => that.removeAttribute(k));
  }

  let that = this;

  this.getScreen = () => {
    return that._screen;
  };

  this.setState = (key, value) => {
    that.addAttribute(key, value);
  };

  this.transition = (template, data) => {
    that.respond(template, data);
    that.clearState(template.getKeysToClear());
  };
}

module.exports = UserRequest;
