const Type = Object.freeze({'round': 1, 'rectangle': 2});
const Size = Object.freeze({'xsmall': 1, 'small': 2, 'medium': 3, 'large': 4, 'xlarge': 5});

function Screen(type, size) {

  this._type = type;
  this._size = size;

  let that = this;

  this.getType = () => {
    return Type[that._type] || -1;
  };

  this.getSize = () => {
    return Size[that._size] || -1;
  };

  this.isSupported = () => {
    return that._type !== -1 && that._size !== -1;
  };
}

module.exports = {
  Type,
  Size,
  Screen
};
