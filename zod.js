class ZodType {
  safeParse(val) {
    try {
      return { success: true, data: this.parse(val) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

class ZodString extends ZodType {
  constructor() {
    super();
    this._min = null;
    this._minMessage = null;
  }

  min(length, message) {
    this._min = length;
    this._minMessage = message;
    return this;
  }

  parse(val) {
    if (typeof val !== 'string') {
      throw new Error(`Expected string, received ${typeof val}`);
    }
    if (this._min !== null && val.length < this._min) {
      throw new Error(this._minMessage || `String must contain at least ${this._min} character(s)`);
    }
    return val;
  }
}

class ZodNumber extends ZodType {
  parse(val) {
    if (typeof val !== 'number') {
      throw new Error(`Expected number, received ${typeof val}`);
    }
    return val;
  }
}

class ZodEnum extends ZodType {
  constructor(values) {
    super();
    this.values = values;
  }

  parse(val) {
    if (!this.values.includes(val)) {
      throw new Error(`Expected one of [${this.values.join(', ')}], received '${val}'`);
    }
    return val;
  }
}

class ZodOptional extends ZodType {
  constructor(innerType) {
    super();
    this.innerType = innerType;
  }

  parse(val) {
    if (val === undefined) {
      return val;
    }
    return this.innerType.parse(val);
  }
}

class ZodObject extends ZodType {
  constructor(shape) {
    super();
    this.shape = shape;
  }

  parse(val) {
    if (typeof val !== 'object' || val === null) {
      throw new Error(`Expected object, received ${typeof val}`);
    }
    const result = {};
    for (const key in this.shape) {
      result[key] = this.shape[key].parse(val[key]);
    }
    return result;
  }
}

// Chainable optional helper
ZodType.prototype.optional = function () {
  return new ZodOptional(this);
};

const z = {
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  enum: (values) => new ZodEnum(values),
  object: (shape) => new ZodObject(shape),
};

module.exports = z;
