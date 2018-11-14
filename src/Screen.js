function Screen(type, size) {

  this._type = type;
  this._size = size;

  let that = this;

  this.getType = () => {
    return that.Type[that._type] || -1;
  };

  this.getSize = () => {
    return that.Size[that._size] || -1;
  };
}

Screen.prototype.Type = Object.freeze({'round': 1, 'rectangle': 2});
Screen.prototype.Size = Object.freeze({'xsmall': 1, 'small': 2, 'medium': 3, 'large': 4, 'xlarge': 5});

exports.Screen = Screen;
