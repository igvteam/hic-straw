(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.HicStraw = factory());
}(this, function () { 'use strict';

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Modified for injection into igv.js after bable translation.  Search for "regeneratorRuntime rollup" for
 * threads on this topic.  Posted solutions did not work for me or others.
 */

var regeneratorRuntime  = {}
var Op = Object.prototype;
var hasOwn = Op.hasOwnProperty;
var undefined; // More compressible than void 0.
var $Symbol = typeof Symbol === "function" ? Symbol : {};
var iteratorSymbol = $Symbol.iterator || "@@iterator";
var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
}
regeneratorRuntime.wrap = wrap;

// Try/catch helper to minimize deoptimizations. Returns a completion
// record like context.tryEntries[i].completion. This interface could
// have been (and was previously) designed to take a closure to be
// invoked without arguments, but in all the cases we care about we
// already have an existing method we want to call, so there's no need
// to create a new function object. We can even get away with assuming
// the method takes exactly one argument, since that happens to be true
// in every case, so we don't have to touch the arguments object. The
// only additional allocation required is the completion record, which
// has a stable shape and so hopefully should be cheap to allocate.
function tryCatch(fn, obj, arg) {
    try {
        return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
        return { type: "throw", arg: err };
    }
}

var GenStateSuspendedStart = "suspendedStart";
var GenStateSuspendedYield = "suspendedYield";
var GenStateExecuting = "executing";
var GenStateCompleted = "completed";

// Returning this object from the innerFn has the same effect as
// breaking out of the dispatch switch statement.
var ContinueSentinel = {};

// Dummy constructor functions that we use as the .constructor and
// .constructor.prototype properties for functions that return Generator
// objects. For full spec compliance, you may wish to configure your
// minifier not to mangle the names of these two functions.
function Generator() {}
function GeneratorFunction() {}
function GeneratorFunctionPrototype() {}

// This is a polyfill for %IteratorPrototype% for environments that
// don't natively support it.
var IteratorPrototype = {};
IteratorPrototype[iteratorSymbol] = function () {
    return this;
};

var getProto = Object.getPrototypeOf;
var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
if (NativeIteratorPrototype &&
    NativeIteratorPrototype !== Op &&
    hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
}

var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
GeneratorFunctionPrototype.constructor = GeneratorFunction;
GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

// Helper for defining the .next, .throw, and .return methods of the
// Iterator interface in terms of a single ._invoke method.
function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
            return this._invoke(method, arg);
        };
    });
}

regeneratorRuntime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
        ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
};

regeneratorRuntime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
        }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
};

// Within the body of any async function, `await x` is transformed to
// `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
// `hasOwn.call(value, "__await")` to determine if the yielded value is
// meant to be awaited.
regeneratorRuntime.awrap = function(arg) {
    return { __await: arg };
};

function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
            reject(record.arg);
        } else {
            var result = record.arg;
            var value = result.value;
            if (value &&
                typeof value === "object" &&
                hasOwn.call(value, "__await")) {
                return Promise.resolve(value.__await).then(function(value) {
                    invoke("next", value, resolve, reject);
                }, function(err) {
                    invoke("throw", err, resolve, reject);
                });
            }

            return Promise.resolve(value).then(function(unwrapped) {
                // When a yielded Promise is resolved, its final value becomes
                // the .value of the Promise<{value,done}> result for the
                // current iteration.
                result.value = unwrapped;
                resolve(result);
            }, function(error) {
                // If a rejected Promise was yielded, throw the rejection back
                // into the async generator function so it can be handled there.
                return invoke("throw", error, resolve, reject);
            });
        }
    }

    var previousPromise;

    function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
            return new Promise(function(resolve, reject) {
                invoke(method, arg, resolve, reject);
            });
        }

        return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
                callInvokeWithMethodAndArg,
                // Avoid propagating failures to Promises returned by later
                // invocations of the iterator.
                callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
}

defineIteratorMethods(AsyncIterator.prototype);
AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
};
regeneratorRuntime.AsyncIterator = AsyncIterator;

// Note that simple async functions are implemented on top of
// AsyncIterator objects; they just return a Promise for the value of
// the final result produced by the iterator.
regeneratorRuntime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
    );

    return regeneratorRuntime.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
        });
};

function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
        if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
            if (method === "throw") {
                throw arg;
            }

            // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
            var delegate = context.delegate;
            if (delegate) {
                var delegateResult = maybeInvokeDelegate(delegate, context);
                if (delegateResult) {
                    if (delegateResult === ContinueSentinel) continue;
                    return delegateResult;
                }
            }

            if (context.method === "next") {
                // Setting context._sent for legacy support of Babel's
                // function.sent implementation.
                context.sent = context._sent = context.arg;

            } else if (context.method === "throw") {
                if (state === GenStateSuspendedStart) {
                    state = GenStateCompleted;
                    throw context.arg;
                }

                context.dispatchException(context.arg);

            } else if (context.method === "return") {
                context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;

            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
                // If an exception is thrown from innerFn, we leave state ===
                // GenStateExecuting and loop back for another invocation.
                state = context.done
                    ? GenStateCompleted
                    : GenStateSuspendedYield;

                if (record.arg === ContinueSentinel) {
                    continue;
                }

                return {
                    value: record.arg,
                    done: context.done
                };

            } else if (record.type === "throw") {
                state = GenStateCompleted;
                // Dispatch the exception by looping back around to the
                // context.dispatchException(context.arg) call above.
                context.method = "throw";
                context.arg = record.arg;
            }
        }
    };
}

// Call delegate.iterator[context.method](context.arg) and handle the
// result, either by returning a { value, done } result from the
// delegate iterator, or by modifying context.method and context.arg,
// setting context.delegate to null, and returning the ContinueSentinel.
function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
                // If the delegate iterator has a return method, give it a
                // chance to clean up.
                context.method = "return";
                context.arg = undefined;
                maybeInvokeDelegate(delegate, context);

                if (context.method === "throw") {
                    // If maybeInvokeDelegate(context) changed context.method from
                    // "return" to "throw", let that override the TypeError below.
                    return ContinueSentinel;
                }
            }

            context.method = "throw";
            context.arg = new TypeError(
                "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
    }

    if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined;
        }

    } else {
        // Re-yield the result returned by the delegate method.
        return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
}

// Define Generator.prototype.{next,throw,return} in terms of the
// unified ._invoke helper method.
defineIteratorMethods(Gp);

Gp[toStringTagSymbol] = "Generator";

// A Generator should always return itself as the iterator object when the
// @@iterator function is called on it. Some browsers' implementations of the
// iterator prototype chain incorrectly implement this, causing the Generator
// object to not be returned from this call. This ensures that doesn't happen.
// See https://github.com/facebook/regenerator/issues/274 for more details.
Gp[iteratorSymbol] = function() {
    return this;
};

Gp.toString = function() {
    return "[object Generator]";
};

function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
        entry.catchLoc = locs[1];
    }

    if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
}

function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
}

function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
}

regeneratorRuntime.keys = function(object) {
    var keys = [];
    for (var key in object) {
        keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
        while (keys.length) {
            var key = keys.pop();
            if (key in object) {
                next.value = key;
                next.done = false;
                return next;
            }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
    };
};

function values(iterable) {
    if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
            return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
            return iterable;
        }

        if (!isNaN(iterable.length)) {
            var i = -1, next = function next() {
                while (++i < iterable.length) {
                    if (hasOwn.call(iterable, i)) {
                        next.value = iterable[i];
                        next.done = false;
                        return next;
                    }
                }

                next.value = undefined;
                next.done = true;

                return next;
            };

            return next.next = next;
        }
    }

    // Return an iterator with no values.
    return { next: doneResult };
}
regeneratorRuntime.values = values;

function doneResult() {
    return { value: undefined, done: true };
}

Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
            for (var name in this) {
                // Not sure about the optimal order of these conditions:
                if (name.charAt(0) === "t" &&
                    hasOwn.call(this, name) &&
                    !isNaN(+name.slice(1))) {
                    this[name] = undefined;
                }
            }
        }
    },

    stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
            throw rootRecord.arg;
        }

        return this.rval;
    },

    dispatchException: function(exception) {
        if (this.done) {
            throw exception;
        }

        var context = this;
        function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
                // If the dispatched exception was caught by a catch block,
                // then let that catch block handle the exception normally.
                context.method = "next";
                context.arg = undefined;
            }

            return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
                // Exception thrown outside of any try block that could handle
                // it, so set the completion value of the entire function to
                // throw the exception.
                return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc");
                var hasFinally = hasOwn.call(entry, "finallyLoc");

                if (hasCatch && hasFinally) {
                    if (this.prev < entry.catchLoc) {
                        return handle(entry.catchLoc, true);
                    } else if (this.prev < entry.finallyLoc) {
                        return handle(entry.finallyLoc);
                    }

                } else if (hasCatch) {
                    if (this.prev < entry.catchLoc) {
                        return handle(entry.catchLoc, true);
                    }

                } else if (hasFinally) {
                    if (this.prev < entry.finallyLoc) {
                        return handle(entry.finallyLoc);
                    }

                } else {
                    throw new Error("try statement without catch or finally");
                }
            }
        }
    },

    abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev &&
                hasOwn.call(entry, "finallyLoc") &&
                this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
            }
        }

        if (finallyEntry &&
            (type === "break" ||
                type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
        }

        return this.complete(record);
    },

    complete: function(record, afterLoc) {
        if (record.type === "throw") {
            throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
            this.next = record.arg;
        } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
        }

        return ContinueSentinel;
    },

    finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
                this.complete(entry.completion, entry.afterLoc);
                resetTryEntry(entry);
                return ContinueSentinel;
            }
        }
    },

    "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if (record.type === "throw") {
                    var thrown = record.arg;
                    resetTryEntry(entry);
                }
                return thrown;
            }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
        };

        if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined;
        }

        return ContinueSentinel;
    }
};

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // from https://github.com/imaya/zlib.js
  var Zlib = {
    Huffman: {},
    Util: {},
    CRC32: {}
  };
  /**
   * Compression Method
   * @enum {number}
   */

  Zlib.CompressionMethod = {
    DEFLATE: 8,
    RESERVED: 15
  };
  /**
   * @param {Object=} opt_params options.
   * @constructor
   */

  Zlib.Zip = function (opt_params) {
    opt_params = opt_params || {};
    /** @type {Array.<{
     *   buffer: !(Array.<number>|Uint8Array),
     *   option: Object,
     *   compressed: boolean,
     *   encrypted: boolean,
     *   size: number,
     *   crc32: number
     * }>} */

    this.files = [];
    /** @type {(Array.<number>|Uint8Array)} */

    this.comment = opt_params['comment'];
    /** @type {(Array.<number>|Uint8Array)} */

    this.password;
  };
  /**
   * @enum {number}
   */


  Zlib.Zip.CompressionMethod = {
    STORE: 0,
    DEFLATE: 8
  };
  /**
   * @enum {number}
   */

  Zlib.Zip.OperatingSystem = {
    MSDOS: 0,
    UNIX: 3,
    MACINTOSH: 7
  };
  /**
   * @enum {number}
   */

  Zlib.Zip.Flags = {
    ENCRYPT: 0x0001,
    DESCRIPTOR: 0x0008,
    UTF8: 0x0800
  };
  /**
   * @type {Array.<number>}
   * @const
   */

  Zlib.Zip.FileHeaderSignature = [0x50, 0x4b, 0x01, 0x02];
  /**
   * @type {Array.<number>}
   * @const
   */

  Zlib.Zip.LocalFileHeaderSignature = [0x50, 0x4b, 0x03, 0x04];
  /**
   * @type {Array.<number>}
   * @const
   */

  Zlib.Zip.CentralDirectorySignature = [0x50, 0x4b, 0x05, 0x06];
  /**
   * @param {Array.<number>|Uint8Array} input
   * @param {Object=} opt_params options.
   */

  Zlib.Zip.prototype.addFile = function (input, opt_params) {
    opt_params = opt_params || {};
    /** @type {string} */

    var filename =  opt_params['filename'];
    /** @type {boolean} */

    var compressed;
    /** @type {number} */

    var size = input.length;
    /** @type {number} */

    var crc32 = 0;

    if ( input instanceof Array) {
      input = new Uint8Array(input);
    } // default


    if (typeof opt_params['compressionMethod'] !== 'number') {
      opt_params['compressionMethod'] = Zlib.Zip.CompressionMethod.DEFLATE;
    } // その場で圧縮する場合


    if (opt_params['compress']) {
      switch (opt_params['compressionMethod']) {
        case Zlib.Zip.CompressionMethod.STORE:
          break;

        case Zlib.Zip.CompressionMethod.DEFLATE:
          crc32 = Zlib.CRC32.calc(input);
          input = this.deflateWithOption(input, opt_params);
          compressed = true;
          break;

        default:
          throw new Error('unknown compression method:' + opt_params['compressionMethod']);
      }
    }

    this.files.push({
      buffer: input,
      option: opt_params,
      compressed: compressed,
      encrypted: false,
      size: size,
      crc32: crc32
    });
  };
  /**
   * @param {(Array.<number>|Uint8Array)} password
   */


  Zlib.Zip.prototype.setPassword = function (password) {
    this.password = password;
  };

  Zlib.Zip.prototype.compress = function () {
    /** @type {Array.<{
     *   buffer: !(Array.<number>|Uint8Array),
     *   option: Object,
     *   compressed: boolean,
     *   encrypted: boolean,
     *   size: number,
     *   crc32: number
     * }>} */
    var files = this.files;
    /** @type {{
     *   buffer: !(Array.<number>|Uint8Array),
     *   option: Object,
     *   compressed: boolean,
     *   encrypted: boolean,
     *   size: number,
     *   crc32: number
     * }} */

    var file;
    /** @type {!(Array.<number>|Uint8Array)} */

    var output;
    /** @type {number} */

    var op1;
    /** @type {number} */

    var op2;
    /** @type {number} */

    var op3;
    /** @type {number} */

    var localFileSize = 0;
    /** @type {number} */

    var centralDirectorySize = 0;
    /** @type {number} */

    var endOfCentralDirectorySize;
    /** @type {number} */

    var offset;
    /** @type {number} */

    var needVersion;
    /** @type {number} */

    var flags;
    /** @type {Zlib.Zip.CompressionMethod} */

    var compressionMethod;
    /** @type {Date} */

    var date;
    /** @type {number} */

    var crc32;
    /** @type {number} */

    var size;
    /** @type {number} */

    var plainSize;
    /** @type {number} */

    var filenameLength;
    /** @type {number} */

    var extraFieldLength;
    /** @type {number} */

    var commentLength;
    /** @type {(Array.<number>|Uint8Array)} */

    var filename;
    /** @type {(Array.<number>|Uint8Array)} */

    var extraField;
    /** @type {(Array.<number>|Uint8Array)} */

    var comment;
    /** @type {(Array.<number>|Uint8Array)} */

    var buffer;
    /** @type {*} */

    var tmp;
    /** @type {Array.<number>|Uint32Array|Object} */

    var key;
    /** @type {number} */

    var i;
    /** @type {number} */

    var il;
    /** @type {number} */

    var j;
    /** @type {number} */

    var jl; // ファイルの圧縮

    for (i = 0, il = files.length; i < il; ++i) {
      file = files[i];
      filenameLength = file.option['filename'] ? file.option['filename'].length : 0;
      extraFieldLength = file.option['extraField'] ? file.option['extraField'].length : 0;
      commentLength = file.option['comment'] ? file.option['comment'].length : 0; // 圧縮されていなかったら圧縮

      if (!file.compressed) {
        // 圧縮前に CRC32 の計算をしておく
        file.crc32 = Zlib.CRC32.calc(file.buffer);

        switch (file.option['compressionMethod']) {
          case Zlib.Zip.CompressionMethod.STORE:
            break;

          case Zlib.Zip.CompressionMethod.DEFLATE:
            file.buffer = this.deflateWithOption(file.buffer, file.option);
            file.compressed = true;
            break;

          default:
            throw new Error('unknown compression method:' + file.option['compressionMethod']);
        }
      } // encryption


      if (file.option['password'] !== void 0 || this.password !== void 0) {
        // init encryption
        key = this.createEncryptionKey(file.option['password'] || this.password); // add header

        buffer = file.buffer;

        {
          tmp = new Uint8Array(buffer.length + 12);
          tmp.set(buffer, 12);
          buffer = tmp;
        }

        for (j = 0; j < 12; ++j) {
          buffer[j] = this.encode(key, i === 11 ? file.crc32 & 0xff : Math.random() * 256 | 0);
        } // data encryption


        for (jl = buffer.length; j < jl; ++j) {
          buffer[j] = this.encode(key, buffer[j]);
        }

        file.buffer = buffer;
      } // 必要バッファサイズの計算


      localFileSize += // local file header
      30 + filenameLength + // file data
      file.buffer.length;
      centralDirectorySize += // file header
      46 + filenameLength + commentLength;
    } // end of central directory


    endOfCentralDirectorySize = 22 + (this.comment ? this.comment.length : 0);
    output = new ( Uint8Array )(localFileSize + centralDirectorySize + endOfCentralDirectorySize);
    op1 = 0;
    op2 = localFileSize;
    op3 = op2 + centralDirectorySize; // ファイルの圧縮

    for (i = 0, il = files.length; i < il; ++i) {
      file = files[i];
      filenameLength = file.option['filename'] ? file.option['filename'].length : 0;
      extraFieldLength = 0; // TODO

      commentLength = file.option['comment'] ? file.option['comment'].length : 0; //-------------------------------------------------------------------------
      // local file header & file header
      //-------------------------------------------------------------------------

      offset = op1; // signature
      // local file header

      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[0];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[1];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[2];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[3]; // file header

      output[op2++] = Zlib.Zip.FileHeaderSignature[0];
      output[op2++] = Zlib.Zip.FileHeaderSignature[1];
      output[op2++] = Zlib.Zip.FileHeaderSignature[2];
      output[op2++] = Zlib.Zip.FileHeaderSignature[3]; // compressor info

      needVersion = 20;
      output[op2++] = needVersion & 0xff;
      output[op2++] =
      /** @type {Zlib.Zip.OperatingSystem} */
      file.option['os'] || Zlib.Zip.OperatingSystem.MSDOS; // need version

      output[op1++] = output[op2++] = needVersion & 0xff;
      output[op1++] = output[op2++] = needVersion >> 8 & 0xff; // general purpose bit flag

      flags = 0;

      if (file.option['password'] || this.password) {
        flags |= Zlib.Zip.Flags.ENCRYPT;
      }

      output[op1++] = output[op2++] = flags & 0xff;
      output[op1++] = output[op2++] = flags >> 8 & 0xff; // compression method

      compressionMethod =
      /** @type {Zlib.Zip.CompressionMethod} */
      file.option['compressionMethod'];
      output[op1++] = output[op2++] = compressionMethod & 0xff;
      output[op1++] = output[op2++] = compressionMethod >> 8 & 0xff; // date

      date =
      /** @type {(Date|undefined)} */
      file.option['date'] || new Date();
      output[op1++] = output[op2++] = (date.getMinutes() & 0x7) << 5 | (date.getSeconds() / 2 | 0);
      output[op1++] = output[op2++] = date.getHours() << 3 | date.getMinutes() >> 3; //

      output[op1++] = output[op2++] = (date.getMonth() + 1 & 0x7) << 5 | date.getDate();
      output[op1++] = output[op2++] = (date.getFullYear() - 1980 & 0x7f) << 1 | date.getMonth() + 1 >> 3; // CRC-32

      crc32 = file.crc32;
      output[op1++] = output[op2++] = crc32 & 0xff;
      output[op1++] = output[op2++] = crc32 >> 8 & 0xff;
      output[op1++] = output[op2++] = crc32 >> 16 & 0xff;
      output[op1++] = output[op2++] = crc32 >> 24 & 0xff; // compressed size

      size = file.buffer.length;
      output[op1++] = output[op2++] = size & 0xff;
      output[op1++] = output[op2++] = size >> 8 & 0xff;
      output[op1++] = output[op2++] = size >> 16 & 0xff;
      output[op1++] = output[op2++] = size >> 24 & 0xff; // uncompressed size

      plainSize = file.size;
      output[op1++] = output[op2++] = plainSize & 0xff;
      output[op1++] = output[op2++] = plainSize >> 8 & 0xff;
      output[op1++] = output[op2++] = plainSize >> 16 & 0xff;
      output[op1++] = output[op2++] = plainSize >> 24 & 0xff; // filename length

      output[op1++] = output[op2++] = filenameLength & 0xff;
      output[op1++] = output[op2++] = filenameLength >> 8 & 0xff; // extra field length

      output[op1++] = output[op2++] = extraFieldLength & 0xff;
      output[op1++] = output[op2++] = extraFieldLength >> 8 & 0xff; // file comment length

      output[op2++] = commentLength & 0xff;
      output[op2++] = commentLength >> 8 & 0xff; // disk number start

      output[op2++] = 0;
      output[op2++] = 0; // internal file attributes

      output[op2++] = 0;
      output[op2++] = 0; // external file attributes

      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0; // relative offset of local header

      output[op2++] = offset & 0xff;
      output[op2++] = offset >> 8 & 0xff;
      output[op2++] = offset >> 16 & 0xff;
      output[op2++] = offset >> 24 & 0xff; // filename

      filename = file.option['filename'];

      if (filename) {
        {
          output.set(filename, op1);
          output.set(filename, op2);
          op1 += filenameLength;
          op2 += filenameLength;
        }
      } // extra field


      extraField = file.option['extraField'];

      if (extraField) {
        {
          output.set(extraField, op1);
          output.set(extraField, op2);
          op1 += extraFieldLength;
          op2 += extraFieldLength;
        }
      } // comment


      comment = file.option['comment'];

      if (comment) {
        {
          output.set(comment, op2);
          op2 += commentLength;
        }
      } //-------------------------------------------------------------------------
      // file data
      //-------------------------------------------------------------------------


      {
        output.set(file.buffer, op1);
        op1 += file.buffer.length;
      }
    } //-------------------------------------------------------------------------
    // end of central directory
    //-------------------------------------------------------------------------
    // signature


    output[op3++] = Zlib.Zip.CentralDirectorySignature[0];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[1];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[2];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[3]; // number of this disk

    output[op3++] = 0;
    output[op3++] = 0; // number of the disk with the start of the central directory

    output[op3++] = 0;
    output[op3++] = 0; // total number of entries in the central directory on this disk

    output[op3++] = il & 0xff;
    output[op3++] = il >> 8 & 0xff; // total number of entries in the central directory

    output[op3++] = il & 0xff;
    output[op3++] = il >> 8 & 0xff; // size of the central directory

    output[op3++] = centralDirectorySize & 0xff;
    output[op3++] = centralDirectorySize >> 8 & 0xff;
    output[op3++] = centralDirectorySize >> 16 & 0xff;
    output[op3++] = centralDirectorySize >> 24 & 0xff; // offset of start of central directory with respect to the starting disk number

    output[op3++] = localFileSize & 0xff;
    output[op3++] = localFileSize >> 8 & 0xff;
    output[op3++] = localFileSize >> 16 & 0xff;
    output[op3++] = localFileSize >> 24 & 0xff; // .ZIP file comment length

    commentLength = this.comment ? this.comment.length : 0;
    output[op3++] = commentLength & 0xff;
    output[op3++] = commentLength >> 8 & 0xff; // .ZIP file comment

    if (this.comment) {
      {
        output.set(this.comment, op3);
        op3 += commentLength;
      }
    }

    return output;
  };
  /**
   * @param {!(Array.<number>|Uint8Array)} input
   * @param {Object=} opt_params options.
   * @return {!(Array.<number>|Uint8Array)}
   */


  Zlib.Zip.prototype.deflateWithOption = function (input, opt_params) {
    /** @type {Zlib.RawDeflate} */
    var deflator = new Zlib.RawDeflate(input, opt_params['deflateOption']);
    return deflator.compress();
  };
  /**
   * @param {(Array.<number>|Uint32Array)} key
   * @return {number}
   */


  Zlib.Zip.prototype.getByte = function (key) {
    /** @type {number} */
    var tmp = key[2] & 0xffff | 2;
    return tmp * (tmp ^ 1) >> 8 & 0xff;
  };
  /**
   * @param {(Array.<number>|Uint32Array|Object)} key
   * @param {number} n
   * @return {number}
   */


  Zlib.Zip.prototype.encode = function (key, n) {
    /** @type {number} */
    var tmp = this.getByte(
    /** @type {(Array.<number>|Uint32Array)} */
    key);
    this.updateKeys(
    /** @type {(Array.<number>|Uint32Array)} */
    key, n);
    return tmp ^ n;
  };
  /**
   * @param {(Array.<number>|Uint32Array)} key
   * @param {number} n
   */


  Zlib.Zip.prototype.updateKeys = function (key, n) {
    key[0] = Zlib.CRC32.single(key[0], n);
    key[1] = (((key[1] + (key[0] & 0xff)) * 20173 >>> 0) * 6681 >>> 0) + 1 >>> 0;
    key[2] = Zlib.CRC32.single(key[2], key[1] >>> 24);
  };
  /**
   * @param {(Array.<number>|Uint8Array)} password
   * @return {!(Array.<number>|Uint32Array|Object)}
   */


  Zlib.Zip.prototype.createEncryptionKey = function (password) {
    /** @type {!(Array.<number>|Uint32Array)} */
    var key = [305419896, 591751049, 878082192];
    /** @type {number} */

    var i;
    /** @type {number} */

    var il;

    {
      key = new Uint32Array(key);
    }

    for (i = 0, il = password.length; i < il; ++i) {
      this.updateKeys(key, password[i] & 0xff);
    }

    return key;
  };
  /**
   * build huffman table from length list.
   * @param {!(Array.<number>|Uint8Array)} lengths length list.
   * @return {!Array} huffman table.
   */


  Zlib.Huffman.buildHuffmanTable = function (lengths) {
    /** @type {number} length list size. */
    var listSize = lengths.length;
    /** @type {number} max code length for table size. */

    var maxCodeLength = 0;
    /** @type {number} min code length for table size. */

    var minCodeLength = Number.POSITIVE_INFINITY;
    /** @type {number} table size. */

    var size;
    /** @type {!(Array|Uint8Array)} huffman code table. */

    var table;
    /** @type {number} bit length. */

    var bitLength;
    /** @type {number} huffman code. */

    var code;
    /**
     * サイズが 2^maxlength 個のテーブルを埋めるためのスキップ長.
     * @type {number} skip length for table filling.
     */

    var skip;
    /** @type {number} reversed code. */

    var reversed;
    /** @type {number} reverse temp. */

    var rtemp;
    /** @type {number} loop counter. */

    var i;
    /** @type {number} loop limit. */

    var il;
    /** @type {number} loop counter. */

    var j;
    /** @type {number} table value. */

    var value; // Math.max は遅いので最長の値は for-loop で取得する

    for (i = 0, il = listSize; i < il; ++i) {
      if (lengths[i] > maxCodeLength) {
        maxCodeLength = lengths[i];
      }

      if (lengths[i] < minCodeLength) {
        minCodeLength = lengths[i];
      }
    }

    size = 1 << maxCodeLength;
    table = new ( Uint32Array )(size); // ビット長の短い順からハフマン符号を割り当てる

    for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
      for (i = 0; i < listSize; ++i) {
        if (lengths[i] === bitLength) {
          // ビットオーダーが逆になるためビット長分並びを反転する
          for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
            reversed = reversed << 1 | rtemp & 1;
            rtemp >>= 1;
          } // 最大ビット長をもとにテーブルを作るため、
          // 最大ビット長以外では 0 / 1 どちらでも良い箇所ができる
          // そのどちらでも良い場所は同じ値で埋めることで
          // 本来のビット長以上のビット数取得しても問題が起こらないようにする


          value = bitLength << 16 | i;

          for (j = reversed; j < size; j += skip) {
            table[j] = value;
          }

          ++code;
        }
      } // 次のビット長へ


      ++bitLength;
      code <<= 1;
      skip <<= 1;
    }

    return [table, maxCodeLength, minCodeLength];
  }; //-----------------------------------------------------------------------------

  /** @define {number} buffer block size. */


  var ZLIB_RAW_INFLATE_BUFFER_SIZE = 0x8000; // [ 0x8000 >= ZLIB_BUFFER_BLOCK_SIZE ]
  //-----------------------------------------------------------------------------

  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  /**
   * @constructor
   * @param {!(Uint8Array|Array.<number>)} input input buffer.
   * @param {Object} opt_params option parameter.
   *
   * opt_params は以下のプロパティを指定する事ができます。
   *   - index: input buffer の deflate コンテナの開始位置.
   *   - blockSize: バッファのブロックサイズ.
   *   - bufferType: Zlib.RawInflate.BufferType の値によってバッファの管理方法を指定する.
   *   - resize: 確保したバッファが実際の大きさより大きかった場合に切り詰める.
   */

  Zlib.RawInflate = function (input, opt_params) {
    /** @type {!(Array.<number>|Uint8Array)} inflated buffer */
    this.buffer;
    /** @type {!Array.<(Array.<number>|Uint8Array)>} */

    this.blocks = [];
    /** @type {number} block size. */

    this.bufferSize = ZLIB_RAW_INFLATE_BUFFER_SIZE;
    /** @type {!number} total output buffer pointer. */

    this.totalpos = 0;
    /** @type {!number} input buffer pointer. */

    this.ip = 0;
    /** @type {!number} bit stream reader buffer. */

    this.bitsbuf = 0;
    /** @type {!number} bit stream reader buffer size. */

    this.bitsbuflen = 0;
    /** @type {!(Array.<number>|Uint8Array)} input buffer. */

    this.input =  new Uint8Array(input) ;
    /** @type {!(Uint8Array|Array.<number>)} output buffer. */

    this.output;
    /** @type {!number} output buffer pointer. */

    this.op;
    /** @type {boolean} is final block flag. */

    this.bfinal = false;
    /** @type {Zlib.RawInflate.BufferType} buffer management. */

    this.bufferType = Zlib.RawInflate.BufferType.ADAPTIVE;
    /** @type {boolean} resize flag for memory size optimization. */

    this.resize = false; // option parameters

    if (opt_params || !(opt_params = {})) {
      if (opt_params['index']) {
        this.ip = opt_params['index'];
      }

      if (opt_params['bufferSize']) {
        this.bufferSize = opt_params['bufferSize'];
      }

      if (opt_params['bufferType']) {
        this.bufferType = opt_params['bufferType'];
      }

      if (opt_params['resize']) {
        this.resize = opt_params['resize'];
      }
    } // initialize


    switch (this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        this.op = Zlib.RawInflate.MaxBackwardLength;
        this.output = new ( Uint8Array )(Zlib.RawInflate.MaxBackwardLength + this.bufferSize + Zlib.RawInflate.MaxCopyLength);
        break;

      case Zlib.RawInflate.BufferType.ADAPTIVE:
        this.op = 0;
        this.output = new ( Uint8Array )(this.bufferSize);
        break;

      default:
        throw new Error('invalid inflate mode');
    }
  };
  /**
   * @enum {number}
   */


  Zlib.RawInflate.BufferType = {
    BLOCK: 0,
    ADAPTIVE: 1
  };
  /**
   * decompress.
   * @return {!(Uint8Array|Array.<number>)} inflated buffer.
   */

  Zlib.RawInflate.prototype.decompress = function () {
    while (!this.bfinal) {
      this.parseBlock();
    }

    switch (this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        return this.concatBufferBlock();

      case Zlib.RawInflate.BufferType.ADAPTIVE:
        return this.concatBufferDynamic();

      default:
        throw new Error('invalid inflate mode');
    }
  };
  /**
   * @const
   * @type {number} max backward length for LZ77.
   */


  Zlib.RawInflate.MaxBackwardLength = 32768;
  /**
   * @const
   * @type {number} max copy length for LZ77.
   */

  Zlib.RawInflate.MaxCopyLength = 258;
  /**
   * huffman order
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */

  Zlib.RawInflate.Order = function (table) {
    return  new Uint16Array(table) ;
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  /**
   * huffman length code table.
   * @const
   * @type {!(Array.<number>|Uint16Array)}
   */


  Zlib.RawInflate.LengthCodeTable = function (table) {
    return  new Uint16Array(table) ;
  }([0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b, 0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b, 0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3, 0x00e3, 0x0102, 0x0102, 0x0102]);
  /**
   * huffman length extra-bits table.
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */


  Zlib.RawInflate.LengthExtraTable = function (table) {
    return  new Uint8Array(table) ;
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  /**
   * huffman dist code table.
   * @const
   * @type {!(Array.<number>|Uint16Array)}
   */


  Zlib.RawInflate.DistCodeTable = function (table) {
    return  new Uint16Array(table) ;
  }([0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001]);
  /**
   * huffman dist extra-bits table.
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */


  Zlib.RawInflate.DistExtraTable = function (table) {
    return  new Uint8Array(table) ;
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  /**
   * fixed huffman length code table
   * @const
   * @type {!Array}
   */


  Zlib.RawInflate.FixedLiteralLengthTable = function (table) {
    return table;
  }(function () {
    var lengths = new ( Uint8Array )(288);
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8;
    }

    return buildHuffmanTable(lengths);
  }());
  /**
   * fixed huffman distance code table
   * @const
   * @type {!Array}
   */


  Zlib.RawInflate.FixedDistanceTable = function (table) {
    return table;
  }(function () {
    var lengths = new ( Uint8Array )(30);
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] = 5;
    }

    return buildHuffmanTable(lengths);
  }());
  /**
   * parse deflated block.
   */


  Zlib.RawInflate.prototype.parseBlock = function () {
    /** @type {number} header */
    var hdr = this.readBits(3); // BFINAL

    if (hdr & 0x1) {
      this.bfinal = true;
    } // BTYPE


    hdr >>>= 1;

    switch (hdr) {
      // uncompressed
      case 0:
        this.parseUncompressedBlock();
        break;
      // fixed huffman

      case 1:
        this.parseFixedHuffmanBlock();
        break;
      // dynamic huffman

      case 2:
        this.parseDynamicHuffmanBlock();
        break;
      // reserved or other

      default:
        throw new Error('unknown BTYPE: ' + hdr);
    }
  };
  /**
   * read inflate bits
   * @param {number} length bits length.
   * @return {number} read bits.
   */


  Zlib.RawInflate.prototype.readBits = function (length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    /** @type {number} */

    var inputLength = input.length;
    /** @type {number} input and output byte. */

    var octet; // input byte

    if (ip + (length - bitsbuflen + 7 >> 3) >= inputLength) {
      throw new Error('input buffer is broken');
    } // not enough buffer


    while (bitsbuflen < length) {
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8;
    } // output byte


    octet = bitsbuf &
    /* MASK */
    (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet;
  };
  /**
   * read huffman code using table
   * @param {!(Array.<number>|Uint8Array|Uint16Array)} table huffman code table.
   * @return {number} huffman code.
   */


  Zlib.RawInflate.prototype.readCodeByTable = function (table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    /** @type {number} */

    var inputLength = input.length;
    /** @type {!(Array.<number>|Uint8Array)} huffman code table */

    var codeTable = table[0];
    /** @type {number} */

    var maxCodeLength = table[1];
    /** @type {number} code length & code (16bit, 16bit) */

    var codeWithLength;
    /** @type {number} code bits length */

    var codeLength; // not enough buffer

    while (bitsbuflen < maxCodeLength) {
      if (ip >= inputLength) {
        break;
      }

      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8;
    } // read max length


    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;

    if (codeLength > bitsbuflen) {
      throw new Error('invalid code length: ' + codeLength);
    }

    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 0xffff;
  };
  /**
   * parse uncompressed block.
   */


  Zlib.RawInflate.prototype.parseUncompressedBlock = function () {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    /** @type {number} */

    var inputLength = input.length;
    /** @type {number} block length */

    var len;
    /** @type {number} number for check block length */

    var nlen;
    /** @type {number} output buffer length */

    var olength = output.length;
    /** @type {number} copy counter */

    var preCopy; // skip buffered header bits

    this.bitsbuf = 0;
    this.bitsbuflen = 0; // len

    if (ip + 1 >= inputLength) {
      throw new Error('invalid uncompressed block header: LEN');
    }

    len = input[ip++] | input[ip++] << 8; // nlen

    if (ip + 1 >= inputLength) {
      throw new Error('invalid uncompressed block header: NLEN');
    }

    nlen = input[ip++] | input[ip++] << 8; // check len & nlen

    if (len === ~nlen) {
      throw new Error('invalid uncompressed block header: length verify');
    } // check size


    if (ip + len > input.length) {
      throw new Error('input buffer is broken');
    } // expand buffer


    switch (this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        // pre copy
        while (op + len > output.length) {
          preCopy = olength - op;
          len -= preCopy;

          {
            output.set(input.subarray(ip, ip + preCopy), op);
            op += preCopy;
            ip += preCopy;
          }

          this.op = op;
          output = this.expandBufferBlock();
          op = this.op;
        }

        break;

      case Zlib.RawInflate.BufferType.ADAPTIVE:
        while (op + len > output.length) {
          output = this.expandBufferAdaptive({
            fixRatio: 2
          });
        }

        break;

      default:
        throw new Error('invalid inflate mode');
    } // copy


    {
      output.set(input.subarray(ip, ip + len), op);
      op += len;
      ip += len;
    }

    this.ip = ip;
    this.op = op;
    this.output = output;
  };
  /**
   * parse fixed huffman block.
   */


  Zlib.RawInflate.prototype.parseFixedHuffmanBlock = function () {
    switch (this.bufferType) {
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        this.decodeHuffmanAdaptive(Zlib.RawInflate.FixedLiteralLengthTable, Zlib.RawInflate.FixedDistanceTable);
        break;

      case Zlib.RawInflate.BufferType.BLOCK:
        this.decodeHuffmanBlock(Zlib.RawInflate.FixedLiteralLengthTable, Zlib.RawInflate.FixedDistanceTable);
        break;

      default:
        throw new Error('invalid inflate mode');
    }
  };
  /**
   * parse dynamic huffman block.
   */


  Zlib.RawInflate.prototype.parseDynamicHuffmanBlock = function () {
    /** @type {number} number of literal and length codes. */
    var hlit = this.readBits(5) + 257;
    /** @type {number} number of distance codes. */

    var hdist = this.readBits(5) + 1;
    /** @type {number} number of code lengths. */

    var hclen = this.readBits(4) + 4;
    /** @type {!(Uint8Array|Array.<number>)} code lengths. */

    var codeLengths = new ( Uint8Array )(Zlib.RawInflate.Order.length);
    /** @type {!Array} code lengths table. */

    var codeLengthsTable;
    /** @type {!(Uint8Array|Array.<number>)} literal and length code table. */

    var litlenTable;
    /** @type {!(Uint8Array|Array.<number>)} distance code table. */

    var distTable;
    /** @type {!(Uint8Array|Array.<number>)} code length table. */

    var lengthTable;
    /** @type {number} */

    var code;
    /** @type {number} */

    var prev;
    /** @type {number} */

    var repeat;
    /** @type {number} loop counter. */

    var i;
    /** @type {number} loop limit. */

    var il; // decode code lengths

    for (i = 0; i < hclen; ++i) {
      codeLengths[Zlib.RawInflate.Order[i]] = this.readBits(3);
    }


    codeLengthsTable = buildHuffmanTable(codeLengths);
    lengthTable = new ( Uint8Array )(hlit + hdist);

    for (i = 0, il = hlit + hdist; i < il;) {
      code = this.readCodeByTable(codeLengthsTable);

      switch (code) {
        case 16:
          repeat = 3 + this.readBits(2);

          while (repeat--) {
            lengthTable[i++] = prev;
          }

          break;

        case 17:
          repeat = 3 + this.readBits(3);

          while (repeat--) {
            lengthTable[i++] = 0;
          }

          prev = 0;
          break;

        case 18:
          repeat = 11 + this.readBits(7);

          while (repeat--) {
            lengthTable[i++] = 0;
          }

          prev = 0;
          break;

        default:
          lengthTable[i++] = code;
          prev = code;
          break;
      }
    }

    litlenTable =  buildHuffmanTable(lengthTable.subarray(0, hlit)) ;
    distTable =  buildHuffmanTable(lengthTable.subarray(hlit)) ;

    switch (this.bufferType) {
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        this.decodeHuffmanAdaptive(litlenTable, distTable);
        break;

      case Zlib.RawInflate.BufferType.BLOCK:
        this.decodeHuffmanBlock(litlenTable, distTable);
        break;

      default:
        throw new Error('invalid inflate mode');
    }
  };
  /**
   * decode huffman code
   * @param {!(Array.<number>|Uint16Array)} litlen literal and length code table.
   * @param {!(Array.<number>|Uint8Array)} dist distination code table.
   */


  Zlib.RawInflate.prototype.decodeHuffmanBlock = function (litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    /** @type {number} output position limit. */

    var olength = output.length - Zlib.RawInflate.MaxCopyLength;
    /** @type {number} huffman code. */

    var code;
    /** @type {number} table index. */

    var ti;
    /** @type {number} huffman code distination. */

    var codeDist;
    /** @type {number} huffman code length. */

    var codeLength;
    var lengthCodeTable = Zlib.RawInflate.LengthCodeTable;
    var lengthExtraTable = Zlib.RawInflate.LengthExtraTable;
    var distCodeTable = Zlib.RawInflate.DistCodeTable;
    var distExtraTable = Zlib.RawInflate.DistExtraTable;

    while ((code = this.readCodeByTable(litlen)) !== 256) {
      // literal
      if (code < 256) {
        if (op >= olength) {
          this.op = op;
          output = this.expandBufferBlock();
          op = this.op;
        }

        output[op++] = code;
        continue;
      } // length code


      ti = code - 257;
      codeLength = lengthCodeTable[ti];

      if (lengthExtraTable[ti] > 0) {
        codeLength += this.readBits(lengthExtraTable[ti]);
      } // dist code


      code = this.readCodeByTable(dist);
      codeDist = distCodeTable[code];

      if (distExtraTable[code] > 0) {
        codeDist += this.readBits(distExtraTable[code]);
      } // lz77 decode


      if (op >= olength) {
        this.op = op;
        output = this.expandBufferBlock();
        op = this.op;
      }

      while (codeLength--) {
        output[op] = output[op++ - codeDist];
      }
    }

    while (this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--;
    }

    this.op = op;
  };
  /**
   * decode huffman code (adaptive)
   * @param {!(Array.<number>|Uint16Array)} litlen literal and length code table.
   * @param {!(Array.<number>|Uint8Array)} dist distination code table.
   */


  Zlib.RawInflate.prototype.decodeHuffmanAdaptive = function (litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    /** @type {number} output position limit. */

    var olength = output.length;
    /** @type {number} huffman code. */

    var code;
    /** @type {number} table index. */

    var ti;
    /** @type {number} huffman code distination. */

    var codeDist;
    /** @type {number} huffman code length. */

    var codeLength;
    var lengthCodeTable = Zlib.RawInflate.LengthCodeTable;
    var lengthExtraTable = Zlib.RawInflate.LengthExtraTable;
    var distCodeTable = Zlib.RawInflate.DistCodeTable;
    var distExtraTable = Zlib.RawInflate.DistExtraTable;

    while ((code = this.readCodeByTable(litlen)) !== 256) {
      // literal
      if (code < 256) {
        if (op >= olength) {
          output = this.expandBufferAdaptive();
          olength = output.length;
        }

        output[op++] = code;
        continue;
      } // length code


      ti = code - 257;
      codeLength = lengthCodeTable[ti];

      if (lengthExtraTable[ti] > 0) {
        codeLength += this.readBits(lengthExtraTable[ti]);
      } // dist code


      code = this.readCodeByTable(dist);
      codeDist = distCodeTable[code];

      if (distExtraTable[code] > 0) {
        codeDist += this.readBits(distExtraTable[code]);
      } // lz77 decode


      if (op + codeLength > olength) {
        output = this.expandBufferAdaptive();
        olength = output.length;
      }

      while (codeLength--) {
        output[op] = output[op++ - codeDist];
      }
    }

    while (this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--;
    }

    this.op = op;
  };
  /**
   * expand output buffer.
   * @param {Object=} opt_param option parameters.
   * @return {!(Array.<number>|Uint8Array)} output buffer.
   */


  Zlib.RawInflate.prototype.expandBufferBlock = function (opt_param) {
    /** @type {!(Array.<number>|Uint8Array)} store buffer. */
    var buffer = new ( Uint8Array )(this.op - Zlib.RawInflate.MaxBackwardLength);
    /** @type {number} backward base point */

    var backward = this.op - Zlib.RawInflate.MaxBackwardLength;
    var output = this.output; // copy to output buffer

    {
      buffer.set(output.subarray(Zlib.RawInflate.MaxBackwardLength, buffer.length));
    }

    this.blocks.push(buffer);
    this.totalpos += buffer.length; // copy to backward buffer

    {
      output.set(output.subarray(backward, backward + Zlib.RawInflate.MaxBackwardLength));
    }

    this.op = Zlib.RawInflate.MaxBackwardLength;
    return output;
  };
  /**
   * expand output buffer. (adaptive)
   * @param {Object=} opt_param option parameters.
   * @return {!(Array.<number>|Uint8Array)} output buffer pointer.
   */


  Zlib.RawInflate.prototype.expandBufferAdaptive = function (opt_param) {
    /** @type {!(Array.<number>|Uint8Array)} store buffer. */
    var buffer;
    /** @type {number} expantion ratio. */

    var ratio = this.input.length / this.ip + 1 | 0;
    /** @type {number} maximum number of huffman code. */

    var maxHuffCode;
    /** @type {number} new output buffer size. */

    var newSize;
    /** @type {number} max inflate size. */

    var maxInflateSize;
    var input = this.input;
    var output = this.output;

    if (opt_param) {
      if (typeof opt_param.fixRatio === 'number') {
        ratio = opt_param.fixRatio;
      }

      if (typeof opt_param.addRatio === 'number') {
        ratio += opt_param.addRatio;
      }
    } // calculate new buffer size


    if (ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.currentLitlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1;
    } else {
      newSize = output.length * ratio;
    } // buffer expantion


    {
      buffer = new Uint8Array(newSize);
      buffer.set(output);
    }

    this.output = buffer;
    return this.output;
  };
  /**
   * concat output buffer.
   * @return {!(Array.<number>|Uint8Array)} output buffer.
   */


  Zlib.RawInflate.prototype.concatBufferBlock = function () {
    /** @type {number} buffer pointer. */
    var pos = 0;
    /** @type {number} buffer pointer. */

    var limit = this.totalpos + (this.op - Zlib.RawInflate.MaxBackwardLength);
    /** @type {!(Array.<number>|Uint8Array)} output block array. */

    var output = this.output;
    /** @type {!Array} blocks array. */

    var blocks = this.blocks;
    /** @type {!(Array.<number>|Uint8Array)} output block array. */

    var block;
    /** @type {!(Array.<number>|Uint8Array)} output buffer. */

    var buffer = new ( Uint8Array )(limit);
    /** @type {number} loop counter. */

    var i;
    /** @type {number} loop limiter. */

    var il;
    /** @type {number} loop counter. */

    var j;
    /** @type {number} loop limiter. */

    var jl; // single buffer

    if (blocks.length === 0) {
      return  this.output.subarray(Zlib.RawInflate.MaxBackwardLength, this.op) ;
    } // copy to buffer


    for (i = 0, il = blocks.length; i < il; ++i) {
      block = blocks[i];

      for (j = 0, jl = block.length; j < jl; ++j) {
        buffer[pos++] = block[j];
      }
    } // current buffer


    for (i = Zlib.RawInflate.MaxBackwardLength, il = this.op; i < il; ++i) {
      buffer[pos++] = output[i];
    }

    this.blocks = [];
    this.buffer = buffer;
    return this.buffer;
  };
  /**
   * concat output buffer. (dynamic)
   * @return {!(Array.<number>|Uint8Array)} output buffer.
   */


  Zlib.RawInflate.prototype.concatBufferDynamic = function () {
    /** @type {Array.<number>|Uint8Array} output buffer. */
    var buffer;
    var op = this.op;

    {
      if (this.resize) {
        buffer = new Uint8Array(op);
        buffer.set(this.output.subarray(0, op));
      } else {
        buffer = this.output.subarray(0, op);
      }
    }

    this.buffer = buffer;
    return this.buffer;
  };

  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  /**
   * @param {!(Uint8Array|Array.<number>)} input input buffer.
   * @param {number} ip input buffer pointer.
   * @param {number=} opt_buffersize buffer block size.
   * @constructor
   */

  Zlib.RawInflateStream = function (input, ip, opt_buffersize) {
    /** @type {!Array.<(Array|Uint8Array)>} */
    this.blocks = [];
    /** @type {number} block size. */

    this.bufferSize = opt_buffersize ? opt_buffersize : ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE;
    /** @type {!number} total output buffer pointer. */

    this.totalpos = 0;
    /** @type {!number} input buffer pointer. */

    this.ip = ip === void 0 ? 0 : ip;
    /** @type {!number} bit stream reader buffer. */

    this.bitsbuf = 0;
    /** @type {!number} bit stream reader buffer size. */

    this.bitsbuflen = 0;
    /** @type {!(Array|Uint8Array)} input buffer. */

    this.input =  new Uint8Array(input) ;
    /** @type {!(Uint8Array|Array)} output buffer. */

    this.output = new ( Uint8Array )(this.bufferSize);
    /** @type {!number} output buffer pointer. */

    this.op = 0;
    /** @type {boolean} is final block flag. */

    this.bfinal = false;
    /** @type {number} uncompressed block length. */

    this.blockLength;
    /** @type {boolean} resize flag for memory size optimization. */

    this.resize = false;
    /** @type {Array} */

    this.litlenTable;
    /** @type {Array} */

    this.distTable;
    /** @type {number} */

    this.sp = 0; // stream pointer

    /** @type {Zlib.RawInflateStream.Status} */

    this.status = Zlib.RawInflateStream.Status.INITIALIZED; //
    // backup
    //

    /** @type {!number} */

    this.ip_;
    /** @type {!number} */

    this.bitsbuflen_;
    /** @type {!number} */

    this.bitsbuf_;
  };
  /**
   * @enum {number}
   */


  Zlib.RawInflateStream.BlockType = {
    UNCOMPRESSED: 0,
    FIXED: 1,
    DYNAMIC: 2
  };
  /**
   * @enum {number}
   */

  Zlib.RawInflateStream.Status = {
    INITIALIZED: 0,
    BLOCK_HEADER_START: 1,
    BLOCK_HEADER_END: 2,
    BLOCK_BODY_START: 3,
    BLOCK_BODY_END: 4,
    DECODE_BLOCK_START: 5,
    DECODE_BLOCK_END: 6
  };
  /**
   * decompress.
   * @return {!(Uint8Array|Array)} inflated buffer.
   */

  Zlib.RawInflateStream.prototype.decompress = function (newInput, ip) {
    /** @type {boolean} */
    var stop = false;

    if (newInput !== void 0) {
      this.input = newInput;
    }

    if (ip !== void 0) {
      this.ip = ip;
    } // decompress


    while (!stop) {
      switch (this.status) {
        // block header
        case Zlib.RawInflateStream.Status.INITIALIZED:
        case Zlib.RawInflateStream.Status.BLOCK_HEADER_START:
          if (this.readBlockHeader() < 0) {
            stop = true;
          }

          break;
        // block body

        case Zlib.RawInflateStream.Status.BLOCK_HEADER_END:
        /* FALLTHROUGH */

        case Zlib.RawInflateStream.Status.BLOCK_BODY_START:
          switch (this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if (this.readUncompressedBlockHeader() < 0) {
                stop = true;
              }

              break;

            case Zlib.RawInflateStream.BlockType.FIXED:
              if (this.parseFixedHuffmanBlock() < 0) {
                stop = true;
              }

              break;

            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if (this.parseDynamicHuffmanBlock() < 0) {
                stop = true;
              }

              break;
          }

          break;
        // decode data

        case Zlib.RawInflateStream.Status.BLOCK_BODY_END:
        case Zlib.RawInflateStream.Status.DECODE_BLOCK_START:
          switch (this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if (this.parseUncompressedBlock() < 0) {
                stop = true;
              }

              break;

            case Zlib.RawInflateStream.BlockType.FIXED:
            /* FALLTHROUGH */

            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if (this.decodeHuffman() < 0) {
                stop = true;
              }

              break;
          }

          break;

        case Zlib.RawInflateStream.Status.DECODE_BLOCK_END:
          if (this.bfinal) {
            stop = true;
          } else {
            this.status = Zlib.RawInflateStream.Status.INITIALIZED;
          }

          break;
      }
    }

    return this.concatBuffer();
  };
  /**
   * @const
   * @type {number} max backward length for LZ77.
   */


  Zlib.RawInflateStream.MaxBackwardLength = 32768;
  /**
   * @const
   * @type {number} max copy length for LZ77.
   */

  Zlib.RawInflateStream.MaxCopyLength = 258;
  /**
   * huffman order
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */

  Zlib.RawInflateStream.Order = function (table) {
    return  new Uint16Array(table) ;
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  /**
   * huffman length code table.
   * @const
   * @type {!(Array.<number>|Uint16Array)}
   */


  Zlib.RawInflateStream.LengthCodeTable = function (table) {
    return  new Uint16Array(table) ;
  }([0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b, 0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b, 0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3, 0x00e3, 0x0102, 0x0102, 0x0102]);
  /**
   * huffman length extra-bits table.
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */


  Zlib.RawInflateStream.LengthExtraTable = function (table) {
    return  new Uint8Array(table) ;
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  /**
   * huffman dist code table.
   * @const
   * @type {!(Array.<number>|Uint16Array)}
   */


  Zlib.RawInflateStream.DistCodeTable = function (table) {
    return  new Uint16Array(table) ;
  }([0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001]);
  /**
   * huffman dist extra-bits table.
   * @const
   * @type {!(Array.<number>|Uint8Array)}
   */


  Zlib.RawInflateStream.DistExtraTable = function (table) {
    return  new Uint8Array(table) ;
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  /**
   * fixed huffman length code table
   * @const
   * @type {!Array}
   */


  Zlib.RawInflateStream.FixedLiteralLengthTable = function (table) {
    return table;
  }(function () {
    var lengths = new ( Uint8Array )(288);
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8;
    }

    return buildHuffmanTable(lengths);
  }());
  /**
   * fixed huffman distance code table
   * @const
   * @type {!Array}
   */


  Zlib.RawInflateStream.FixedDistanceTable = function (table) {
    return table;
  }(function () {
    var lengths = new ( Uint8Array )(30);
    var i, il;

    for (i = 0, il = lengths.length; i < il; ++i) {
      lengths[i] = 5;
    }

    return buildHuffmanTable(lengths);
  }());
  /**
   * parse deflated block.
   */


  Zlib.RawInflateStream.prototype.readBlockHeader = function () {
    /** @type {number} header */
    var hdr;
    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_START;
    this.save_();

    if ((hdr = this.readBits(3)) < 0) {
      this.restore_();
      return -1;
    } // BFINAL


    if (hdr & 0x1) {
      this.bfinal = true;
    } // BTYPE


    hdr >>>= 1;

    switch (hdr) {
      case 0:
        // uncompressed
        this.currentBlockType = Zlib.RawInflateStream.BlockType.UNCOMPRESSED;
        break;

      case 1:
        // fixed huffman
        this.currentBlockType = Zlib.RawInflateStream.BlockType.FIXED;
        break;

      case 2:
        // dynamic huffman
        this.currentBlockType = Zlib.RawInflateStream.BlockType.DYNAMIC;
        break;

      default:
        // reserved or other
        throw new Error('unknown BTYPE: ' + hdr);
    }

    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_END;
  };
  /**
   * read inflate bits
   * @param {number} length bits length.
   * @return {number} read bits.
   */


  Zlib.RawInflateStream.prototype.readBits = function (length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    /** @type {number} input and output byte. */

    var octet; // not enough buffer

    while (bitsbuflen < length) {
      // input byte
      if (input.length <= ip) {
        return -1;
      }

      octet = input[ip++]; // concat octet

      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8;
    } // output byte


    octet = bitsbuf &
    /* MASK */
    (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet;
  };
  /**
   * read huffman code using table
   * @param {Array} table huffman code table.
   * @return {number} huffman code.
   */


  Zlib.RawInflateStream.prototype.readCodeByTable = function (table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    /** @type {!(Array|Uint8Array)} huffman code table */

    var codeTable = table[0];
    /** @type {number} */

    var maxCodeLength = table[1];
    /** @type {number} input byte */

    var octet;
    /** @type {number} code length & code (16bit, 16bit) */

    var codeWithLength;
    /** @type {number} code bits length */

    var codeLength; // not enough buffer

    while (bitsbuflen < maxCodeLength) {
      if (input.length <= ip) {
        return -1;
      }

      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8;
    } // read max length


    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;

    if (codeLength > bitsbuflen) {
      throw new Error('invalid code length: ' + codeLength);
    }

    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 0xffff;
  };
  /**
   * read uncompressed block header
   */


  Zlib.RawInflateStream.prototype.readUncompressedBlockHeader = function () {
    /** @type {number} block length */
    var len;
    /** @type {number} number for check block length */

    var nlen;
    var input = this.input;
    var ip = this.ip;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;

    if (ip + 4 >= input.length) {
      return -1;
    }

    len = input[ip++] | input[ip++] << 8;
    nlen = input[ip++] | input[ip++] << 8; // check len & nlen

    if (len === ~nlen) {
      throw new Error('invalid uncompressed block header: length verify');
    } // skip buffered header bits


    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.ip = ip;
    this.blockLength = len;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
  };
  /**
   * parse uncompressed block.
   */


  Zlib.RawInflateStream.prototype.parseUncompressedBlock = function () {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var len = this.blockLength;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START; // copy
    // XXX: とりあえず素直にコピー

    while (len--) {
      if (op === output.length) {
        output = this.expandBuffer({
          fixRatio: 2
        });
      } // not enough input buffer


      if (ip >= input.length) {
        this.ip = ip;
        this.op = op;
        this.blockLength = len + 1; // コピーしてないので戻す

        return -1;
      }

      output[op++] = input[ip++];
    }

    if (len < 0) {
      this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END;
    }

    this.ip = ip;
    this.op = op;
    return 0;
  };
  /**
   * parse fixed huffman block.
   */


  Zlib.RawInflateStream.prototype.parseFixedHuffmanBlock = function () {
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.litlenTable = Zlib.RawInflateStream.FixedLiteralLengthTable;
    this.distTable = Zlib.RawInflateStream.FixedDistanceTable;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0;
  };
  /**
   * オブジェクトのコンテキストを別のプロパティに退避する.
   * @private
   */


  Zlib.RawInflateStream.prototype.save_ = function () {
    this.ip_ = this.ip;
    this.bitsbuflen_ = this.bitsbuflen;
    this.bitsbuf_ = this.bitsbuf;
  };
  /**
   * 別のプロパティに退避したコンテキストを復元する.
   * @private
   */


  Zlib.RawInflateStream.prototype.restore_ = function () {
    this.ip = this.ip_;
    this.bitsbuflen = this.bitsbuflen_;
    this.bitsbuf = this.bitsbuf_;
  };
  /**
   * parse dynamic huffman block.
   */


  Zlib.RawInflateStream.prototype.parseDynamicHuffmanBlock = function () {
    /** @type {number} number of literal and length codes. */
    var hlit;
    /** @type {number} number of distance codes. */

    var hdist;
    /** @type {number} number of code lengths. */

    var hclen;
    /** @type {!(Uint8Array|Array)} code lengths. */

    var codeLengths = new ( Uint8Array )(Zlib.RawInflateStream.Order.length);
    /** @type {!Array} code lengths table. */

    var codeLengthsTable;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.save_();
    hlit = this.readBits(5) + 257;
    hdist = this.readBits(5) + 1;
    hclen = this.readBits(4) + 4;

    if (hlit < 0 || hdist < 0 || hclen < 0) {
      this.restore_();
      return -1;
    }

    try {
      parseDynamicHuffmanBlockImpl.call(this);
    } catch (e) {
      this.restore_();
      return -1;
    }

    function parseDynamicHuffmanBlockImpl() {
      /** @type {number} */
      var bits;
      var code;
      var prev = 0;
      var repeat;
      /** @type {!(Uint8Array|Array.<number>)} code length table. */

      var lengthTable;
      /** @type {number} loop counter. */

      var i;
      /** @type {number} loop limit. */

      var il; // decode code lengths

      for (i = 0; i < hclen; ++i) {
        if ((bits = this.readBits(3)) < 0) {
          throw new Error('not enough input');
        }

        codeLengths[Zlib.RawInflateStream.Order[i]] = bits;
      } // decode length table


      codeLengthsTable = buildHuffmanTable(codeLengths);
      lengthTable = new ( Uint8Array )(hlit + hdist);

      for (i = 0, il = hlit + hdist; i < il;) {
        code = this.readCodeByTable(codeLengthsTable);

        if (code < 0) {
          throw new Error('not enough input');
        }

        switch (code) {
          case 16:
            if ((bits = this.readBits(2)) < 0) {
              throw new Error('not enough input');
            }

            repeat = 3 + bits;

            while (repeat--) {
              lengthTable[i++] = prev;
            }

            break;

          case 17:
            if ((bits = this.readBits(3)) < 0) {
              throw new Error('not enough input');
            }

            repeat = 3 + bits;

            while (repeat--) {
              lengthTable[i++] = 0;
            }

            prev = 0;
            break;

          case 18:
            if ((bits = this.readBits(7)) < 0) {
              throw new Error('not enough input');
            }

            repeat = 11 + bits;

            while (repeat--) {
              lengthTable[i++] = 0;
            }

            prev = 0;
            break;

          default:
            lengthTable[i++] = code;
            prev = code;
            break;
        }
      } // literal and length code
      this.litlenTable =  buildHuffmanTable(lengthTable.subarray(0, hlit)) ;
      this.distTable =  buildHuffmanTable(lengthTable.subarray(hlit)) ;
    }

    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0;
  };
  /**
   * decode huffman code (dynamic)
   * @return {(number|undefined)} -1 is error.
   */


  Zlib.RawInflateStream.prototype.decodeHuffman = function () {
    var output = this.output;
    var op = this.op;
    /** @type {number} huffman code. */

    var code;
    /** @type {number} table index. */

    var ti;
    /** @type {number} huffman code distination. */

    var codeDist;
    /** @type {number} huffman code length. */

    var codeLength;
    var litlen = this.litlenTable;
    var dist = this.distTable;
    var olength = output.length;
    var bits;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;

    while (true) {
      this.save_();
      code = this.readCodeByTable(litlen);

      if (code < 0) {
        this.op = op;
        this.restore_();
        return -1;
      }

      if (code === 256) {
        break;
      } // literal


      if (code < 256) {
        if (op === olength) {
          output = this.expandBuffer();
          olength = output.length;
        }

        output[op++] = code;
        continue;
      } // length code


      ti = code - 257;
      codeLength = Zlib.RawInflateStream.LengthCodeTable[ti];

      if (Zlib.RawInflateStream.LengthExtraTable[ti] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.LengthExtraTable[ti]);

        if (bits < 0) {
          this.op = op;
          this.restore_();
          return -1;
        }

        codeLength += bits;
      } // dist code


      code = this.readCodeByTable(dist);

      if (code < 0) {
        this.op = op;
        this.restore_();
        return -1;
      }

      codeDist = Zlib.RawInflateStream.DistCodeTable[code];

      if (Zlib.RawInflateStream.DistExtraTable[code] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.DistExtraTable[code]);

        if (bits < 0) {
          this.op = op;
          this.restore_();
          return -1;
        }

        codeDist += bits;
      } // lz77 decode


      if (op + codeLength >= olength) {
        output = this.expandBuffer();
        olength = output.length;
      }

      while (codeLength--) {
        output[op] = output[op++ - codeDist];
      } // break


      if (this.ip === this.input.length) {
        this.op = op;
        return -1;
      }
    }

    while (this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--;
    }

    this.op = op;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END;
  };
  /**
   * expand output buffer. (dynamic)
   * @param {Object=} opt_param option parameters.
   * @return {!(Array|Uint8Array)} output buffer pointer.
   */


  Zlib.RawInflateStream.prototype.expandBuffer = function (opt_param) {
    /** @type {!(Array|Uint8Array)} store buffer. */
    var buffer;
    /** @type {number} expantion ratio. */

    var ratio = this.input.length / this.ip + 1 | 0;
    /** @type {number} maximum number of huffman code. */

    var maxHuffCode;
    /** @type {number} new output buffer size. */

    var newSize;
    /** @type {number} max inflate size. */

    var maxInflateSize;
    var input = this.input;
    var output = this.output;

    if (opt_param) {
      if (typeof opt_param.fixRatio === 'number') {
        ratio = opt_param.fixRatio;
      }

      if (typeof opt_param.addRatio === 'number') {
        ratio += opt_param.addRatio;
      }
    } // calculate new buffer size


    if (ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.litlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1;
    } else {
      newSize = output.length * ratio;
    } // buffer expantion


    {
      buffer = new Uint8Array(newSize);
      buffer.set(output);
    }

    this.output = buffer;
    return this.output;
  };
  /**
   * concat output buffer. (dynamic)
   * @return {!(Array|Uint8Array)} output buffer.
   */


  Zlib.RawInflateStream.prototype.concatBuffer = function () {
    /** @type {!(Array|Uint8Array)} output buffer. */
    var buffer;
    /** @type {number} */

    var op = this.op;
    /** @type {Uint8Array} */

    var tmp;

    if (this.resize) {
      {
        buffer = new Uint8Array(this.output.subarray(this.sp, op));
      }
    } else {
      buffer =  this.output.subarray(this.sp, op) ;
    }

    this.sp = op; // compaction

    if (op > Zlib.RawInflateStream.MaxBackwardLength + this.bufferSize) {
      this.op = this.sp = Zlib.RawInflateStream.MaxBackwardLength;

      {
        tmp =
        /** @type {Uint8Array} */
        this.output;
        this.output = new Uint8Array(this.bufferSize + Zlib.RawInflateStream.MaxBackwardLength);
        this.output.set(tmp.subarray(op - Zlib.RawInflateStream.MaxBackwardLength, op));
      }
    }

    return buffer;
  };
  /**
   * @constructor
   * @param {!(Uint8Array|Array)} input deflated buffer.
   * @param {Object=} opt_params option parameters.
   *
   * opt_params は以下のプロパティを指定する事ができます。
   *   - index: input buffer の deflate コンテナの開始位置.
   *   - blockSize: バッファのブロックサイズ.
   *   - verify: 伸張が終わった後 adler-32 checksum の検証を行うか.
   *   - bufferType: Zlib.Inflate.BufferType の値によってバッファの管理方法を指定する.
   *       Zlib.Inflate.BufferType は Zlib.RawInflate.BufferType のエイリアス.
   */


  Zlib.Inflate = function (input, opt_params) {
    /** @type {number} */

    var cmf;
    /** @type {number} */

    var flg;
    /** @type {!(Uint8Array|Array)} */

    this.input = input;
    /** @type {number} */

    this.ip = 0;
    /** @type {Zlib.RawInflate} */

    this.rawinflate;
    /** @type {(boolean|undefined)} verify flag. */

    this.verify; // option parameters

    if (opt_params || !(opt_params = {})) {
      if (opt_params['index']) {
        this.ip = opt_params['index'];
      }

      if (opt_params['verify']) {
        this.verify = opt_params['verify'];
      }
    } // Compression Method and Flags


    cmf = input[this.ip++];
    flg = input[this.ip++]; // compression method

    switch (cmf & 0x0f) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;

      default:
        throw new Error('unsupported compression method');
    } // fcheck


    if (((cmf << 8) + flg) % 31 !== 0) {
      throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
    } // fdict (not supported)


    if (flg & 0x20) {
      throw new Error('fdict flag is not supported');
    } // RawInflate


    this.rawinflate = new Zlib.RawInflate(input, {
      'index': this.ip,
      'bufferSize': opt_params['bufferSize'],
      'bufferType': opt_params['bufferType'],
      'resize': opt_params['resize']
    });
  };
  /**
   * @enum {number}
   */


  Zlib.Inflate.BufferType = Zlib.RawInflate.BufferType;
  /**
   * decompress.
   * @return {!(Uint8Array|Array)} inflated buffer.
   */

  Zlib.Inflate.prototype.decompress = function () {
    /** @type {!(Array|Uint8Array)} input buffer. */
    var input = this.input;
    /** @type {!(Uint8Array|Array)} inflated buffer. */

    var buffer;
    /** @type {number} adler-32 checksum */

    var adler32;
    buffer = this.rawinflate.decompress();
    this.ip = this.rawinflate.ip; // verify adler-32

    if (this.verify) {
      adler32 = (input[this.ip++] << 24 | input[this.ip++] << 16 | input[this.ip++] << 8 | input[this.ip++]) >>> 0;

      if (adler32 !== Zlib.Adler32(buffer)) {
        throw new Error('invalid adler-32 checksum');
      }
    }

    return buffer;
  };
  /* vim:set expandtab ts=2 sw=2 tw=80: */

  /**
   * @param {!(Uint8Array|Array)} input deflated buffer.
   * @constructor
   */


  Zlib.InflateStream = function (input) {
    /** @type {!(Uint8Array|Array)} */
    this.input = input === void 0 ? new ( Uint8Array )() : input;
    /** @type {number} */

    this.ip = 0;
    /** @type {Zlib.RawInflateStream} */

    this.rawinflate = new Zlib.RawInflateStream(this.input, this.ip);
    /** @type {Zlib.CompressionMethod} */

    this.method;
    /** @type {!(Array|Uint8Array)} */

    this.output = this.rawinflate.output;
  };
  /**
   * decompress.
   * @return {!(Uint8Array|Array)} inflated buffer.
   */


  Zlib.InflateStream.prototype.decompress = function (input) {
    /** @type {!(Uint8Array|Array)} inflated buffer. */
    var buffer;
    // XXX Array, Uint8Array のチェックを行うか確認する

    if (input !== void 0) {
      {
        var tmp = new Uint8Array(this.input.length + input.length);
        tmp.set(this.input, 0);
        tmp.set(input, this.input.length);
        this.input = tmp;
      }
    }

    if (this.method === void 0) {
      if (this.readHeader() < 0) {
        return new ( Uint8Array )();
      }
    }

    buffer = this.rawinflate.decompress(this.input, this.ip);

    if (this.rawinflate.ip !== 0) {
      this.input =  this.input.subarray(this.rawinflate.ip) ;
      this.ip = 0;
    } // verify adler-32

    /*
    if (this.verify) {
      adler32 =
        input[this.ip++] << 24 | input[this.ip++] << 16 |
        input[this.ip++] << 8 | input[this.ip++];
       if (adler32 !== Zlib.Adler32(buffer)) {
        throw new Error('invalid adler-32 checksum');
      }
    }
    */


    return buffer;
  };

  Zlib.InflateStream.prototype.readHeader = function () {
    var ip = this.ip;
    var input = this.input; // Compression Method and Flags

    var cmf = input[ip++];
    var flg = input[ip++];

    if (cmf === void 0 || flg === void 0) {
      return -1;
    } // compression method


    switch (cmf & 0x0f) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;

      default:
        throw new Error('unsupported compression method');
    } // fcheck


    if (((cmf << 8) + flg) % 31 !== 0) {
      throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
    } // fdict (not supported)


    if (flg & 0x20) {
      throw new Error('fdict flag is not supported');
    }

    this.ip = ip;
  };
  /**
   * @fileoverview GZIP (RFC1952) 展開コンテナ実装.
   */

  /**
   * @constructor
   * @param {!(Array|Uint8Array)} input input buffer.
   * @param {Object=} opt_params option parameters.
   */


  Zlib.Gunzip = function (input, opt_params) {
    /** @type {!(Array.<number>|Uint8Array)} input buffer. */
    this.input = input;
    /** @type {number} input buffer pointer. */

    this.ip = 0;
    /** @type {Array.<Zlib.GunzipMember>} */

    this.member = [];
    /** @type {boolean} */

    this.decompressed = false;
  };
  /**
   * @return {Array.<Zlib.GunzipMember>}
   */


  Zlib.Gunzip.prototype.getMembers = function () {
    if (!this.decompressed) {
      this.decompress();
    }

    return this.member.slice();
  };
  /**
   * inflate gzip data.
   * @return {!(Array.<number>|Uint8Array)} inflated buffer.
   */


  Zlib.Gunzip.prototype.decompress = function () {
    /** @type {number} input length. */
    var il = this.input.length;

    while (this.ip < il) {
      this.decodeMember();
    }

    this.decompressed = true;
    return this.concatMember();
  };
  /**
   * decode gzip member.
   */


  Zlib.Gunzip.prototype.decodeMember = function () {
    /** @type {Zlib.GunzipMember} */
    var member = new Zlib.GunzipMember();
    /** @type {number} */

    var isize;
    /** @type {Zlib.RawInflate} RawInflate implementation. */

    var rawinflate;
    /** @type {!(Array.<number>|Uint8Array)} inflated data. */

    var inflated;
    /** @type {number} inflate size */

    var inflen;
    /** @type {number} character code */

    var c;
    /** @type {number} character index in string. */

    var ci;
    /** @type {Array.<string>} character array. */

    var str;
    /** @type {number} modification time. */

    var mtime;
    /** @type {number} */

    var crc32;
    var input = this.input;
    var ip = this.ip;
    member.id1 = input[ip++];
    member.id2 = input[ip++]; // check signature

    if (member.id1 !== 0x1f || member.id2 !== 0x8b) {
      throw new Error('invalid file signature:' + member.id1 + ',' + member.id2);
    } // check compression method


    member.cm = input[ip++];

    switch (member.cm) {
      case 8:
        /* XXX: use Zlib const */
        break;

      default:
        throw new Error('unknown compression method: ' + member.cm);
    } // flags


    member.flg = input[ip++]; // modification time

    mtime = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
    member.mtime = new Date(mtime * 1000); // extra flags

    member.xfl = input[ip++]; // operating system

    member.os = input[ip++]; // extra

    if ((member.flg & Zlib.Gzip.FlagsMask.FEXTRA) > 0) {
      member.xlen = input[ip++] | input[ip++] << 8;
      ip = this.decodeSubField(ip, member.xlen);
    } // fname


    if ((member.flg & Zlib.Gzip.FlagsMask.FNAME) > 0) {
      for (str = [], ci = 0; (c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c);
      }

      member.name = str.join('');
    } // fcomment


    if ((member.flg & Zlib.Gzip.FlagsMask.FCOMMENT) > 0) {
      for (str = [], ci = 0; (c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c);
      }

      member.comment = str.join('');
    } // fhcrc


    if ((member.flg & Zlib.Gzip.FlagsMask.FHCRC) > 0) {
      member.crc16 = Zlib.CRC32.calc(input, 0, ip) & 0xffff;

      if (member.crc16 !== (input[ip++] | input[ip++] << 8)) {
        throw new Error('invalid header crc16');
      }
    } // isize を事前に取得すると展開後のサイズが分かるため、
    // inflate処理のバッファサイズが事前に分かり、高速になる


    isize = input[input.length - 4] | input[input.length - 3] << 8 | input[input.length - 2] << 16 | input[input.length - 1] << 24; // isize の妥当性チェック
    // ハフマン符号では最小 2-bit のため、最大で 1/4 になる
    // LZ77 符号では 長さと距離 2-Byte で最大 258-Byte を表現できるため、
    // 1/128 になるとする
    // ここから入力バッファの残りが isize の 512 倍以上だったら
    // サイズ指定のバッファ確保は行わない事とする

    if (input.length - ip -
    /* CRC-32 */
    4 -
    /* ISIZE */
    4 < isize * 512) {
      inflen = isize;
    } // compressed block


    rawinflate = new Zlib.RawInflate(input, {
      'index': ip,
      'bufferSize': inflen
    });
    member.data = inflated = rawinflate.decompress();
    ip = rawinflate.ip; // crc32

    member.crc32 = crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;

    if (Zlib.CRC32.calc(inflated) !== crc32) {
      throw new Error('invalid CRC-32 checksum: 0x' + Zlib.CRC32.calc(inflated).toString(16) + ' / 0x' + crc32.toString(16));
    } // input size


    member.isize = isize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;

    if ((inflated.length & 0xffffffff) !== isize) {
      throw new Error('invalid input size: ' + (inflated.length & 0xffffffff) + ' / ' + isize);
    }

    this.member.push(member);
    this.ip = ip;
  };
  /**
   * サブフィールドのデコード
   * XXX: 現在は何もせずスキップする
   */


  Zlib.Gunzip.prototype.decodeSubField = function (ip, length) {
    return ip + length;
  };
  /**
   * @return {!(Array.<number>|Uint8Array)}
   */


  Zlib.Gunzip.prototype.concatMember = function () {
    /** @type {Array.<Zlib.GunzipMember>} */
    var member = this.member;
    /** @type {number} */

    var i;
    /** @type {number} */

    var il;
    /** @type {number} */

    var p = 0;
    /** @type {number} */

    var size = 0;
    /** @type {!(Array.<number>|Uint8Array)} */

    var buffer;

    for (i = 0, il = member.length; i < il; ++i) {
      size += member[i].data.length;
    }

    {
      buffer = new Uint8Array(size);

      for (i = 0; i < il; ++i) {
        buffer.set(member[i].data, p);
        p += member[i].data.length;
      }
    }

    return buffer;
  };
  /**
   * @constructor
   */


  Zlib.GunzipMember = function () {
    /** @type {number} signature first byte. */
    this.id1;
    /** @type {number} signature second byte. */

    this.id2;
    /** @type {number} compression method. */

    this.cm;
    /** @type {number} flags. */

    this.flg;
    /** @type {Date} modification time. */

    this.mtime;
    /** @type {number} extra flags. */

    this.xfl;
    /** @type {number} operating system number. */

    this.os;
    /** @type {number} CRC-16 value for FHCRC flag. */

    this.crc16;
    /** @type {number} extra length. */

    this.xlen;
    /** @type {number} CRC-32 value for verification. */

    this.crc32;
    /** @type {number} input size modulo 32 value. */

    this.isize;
    /** @type {string} filename. */

    this.name;
    /** @type {string} comment. */

    this.comment;
    /** @type {!(Uint8Array|Array.<number>)} */

    this.data;
  };

  Zlib.GunzipMember.prototype.getName = function () {
    return this.name;
  };

  Zlib.GunzipMember.prototype.getData = function () {
    return this.data;
  };

  Zlib.GunzipMember.prototype.getMtime = function () {
    return this.mtime;
  };
  /**
   * @fileoverview GZIP (RFC1952) 実装.
   */

  /**
   * @constructor
   * @param {!(Array|Uint8Array)} input input buffer.
   * @param {Object=} opt_params option parameters.
   */


  Zlib.Gzip = function (input, opt_params) {
    /** @type {!(Array.<number>|Uint8Array)} input buffer. */
    this.input = input;
    /** @type {number} input buffer pointer. */

    this.ip = 0;
    /** @type {!(Array.<number>|Uint8Array)} output buffer. */

    this.output;
    /** @type {number} output buffer. */

    this.op = 0;
    /** @type {!Object} flags option flags. */

    this.flags = {};
    /** @type {!string} filename. */

    this.filename;
    /** @type {!string} comment. */

    this.comment;
    /** @type {!Object} deflate options. */

    this.deflateOptions; // option parameters

    if (opt_params) {
      if (opt_params['flags']) {
        this.flags = opt_params['flags'];
      }

      if (typeof opt_params['filename'] === 'string') {
        this.filename = opt_params['filename'];
      }

      if (typeof opt_params['comment'] === 'string') {
        this.comment = opt_params['comment'];
      }

      if (opt_params['deflateOptions']) {
        this.deflateOptions = opt_params['deflateOptions'];
      }
    }

    if (!this.deflateOptions) {
      this.deflateOptions = {};
    }
  };
  /**
   * @type {number}
   * @const
   */


  Zlib.Gzip.DefaultBufferSize = 0x8000;
  /**
   * encode gzip members.
   * @return {!(Array|Uint8Array)} gzip binary array.
   */

  Zlib.Gzip.prototype.compress = function () {
    /** @type {number} flags. */
    var flg;
    /** @type {number} modification time. */

    var mtime;
    /** @type {number} CRC-16 value for FHCRC flag. */

    var crc16;
    /** @type {number} CRC-32 value for verification. */

    var crc32;
    /** @type {!Zlib.RawDeflate} raw deflate object. */

    var rawdeflate;
    /** @type {number} character code */

    var c;
    /** @type {number} loop counter. */

    var i;
    /** @type {number} loop limiter. */

    var il;
    /** @type {!(Array|Uint8Array)} output buffer. */

    var output = new ( Uint8Array )(Zlib.Gzip.DefaultBufferSize);
    /** @type {number} output buffer pointer. */

    var op = 0;
    var input = this.input;
    var ip = this.ip;
    var filename = this.filename;
    var comment = this.comment; // check signature

    output[op++] = 0x1f;
    output[op++] = 0x8b; // check compression method

    output[op++] = 8;
    /* XXX: use Zlib const */
    // flags

    flg = 0;
    if (this.flags['fname']) flg |= Zlib.Gzip.FlagsMask.FNAME;
    if (this.flags['fcomment']) flg |= Zlib.Gzip.FlagsMask.FCOMMENT;
    if (this.flags['fhcrc']) flg |= Zlib.Gzip.FlagsMask.FHCRC; // XXX: FTEXT
    // XXX: FEXTRA

    output[op++] = flg; // modification time

    mtime = (Date.now ? Date.now() : +new Date()) / 1000 | 0;
    output[op++] = mtime & 0xff;
    output[op++] = mtime >>> 8 & 0xff;
    output[op++] = mtime >>> 16 & 0xff;
    output[op++] = mtime >>> 24 & 0xff; // extra flags

    output[op++] = 0; // operating system

    output[op++] = Zlib.Gzip.OperatingSystem.UNKNOWN; // extra

    /* NOP */
    // fname

    if (this.flags['fname'] !== void 0) {
      for (i = 0, il = filename.length; i < il; ++i) {
        c = filename.charCodeAt(i);

        if (c > 0xff) {
          output[op++] = c >>> 8 & 0xff;
        }

        output[op++] = c & 0xff;
      }

      output[op++] = 0; // null termination
    } // fcomment


    if (this.flags['comment']) {
      for (i = 0, il = comment.length; i < il; ++i) {
        c = comment.charCodeAt(i);

        if (c > 0xff) {
          output[op++] = c >>> 8 & 0xff;
        }

        output[op++] = c & 0xff;
      }

      output[op++] = 0; // null termination
    } // fhcrc


    if (this.flags['fhcrc']) {
      crc16 = Zlib.CRC32.calc(output, 0, op) & 0xffff;
      output[op++] = crc16 & 0xff;
      output[op++] = crc16 >>> 8 & 0xff;
    } // add compress option


    this.deflateOptions['outputBuffer'] = output;
    this.deflateOptions['outputIndex'] = op; // compress

    rawdeflate = new Zlib.RawDeflate(input, this.deflateOptions);
    output = rawdeflate.compress();
    op = rawdeflate.op; // expand buffer

    {
      if (op + 8 > output.buffer.byteLength) {
        this.output = new Uint8Array(op + 8);
        this.output.set(new Uint8Array(output.buffer));
        output = this.output;
      } else {
        output = new Uint8Array(output.buffer);
      }
    } // crc32


    crc32 = Zlib.CRC32.calc(input);
    output[op++] = crc32 & 0xff;
    output[op++] = crc32 >>> 8 & 0xff;
    output[op++] = crc32 >>> 16 & 0xff;
    output[op++] = crc32 >>> 24 & 0xff; // input size

    il = input.length;
    output[op++] = il & 0xff;
    output[op++] = il >>> 8 & 0xff;
    output[op++] = il >>> 16 & 0xff;
    output[op++] = il >>> 24 & 0xff;
    this.ip = ip;

    if ( op < output.length) {
      this.output = output = output.subarray(0, op);
    }

    return output;
  };
  /** @enum {number} */


  Zlib.Gzip.OperatingSystem = {
    FAT: 0,
    AMIGA: 1,
    VMS: 2,
    UNIX: 3,
    VM_CMS: 4,
    ATARI_TOS: 5,
    HPFS: 6,
    MACINTOSH: 7,
    Z_SYSTEM: 8,
    CP_M: 9,
    TOPS_20: 10,
    NTFS: 11,
    QDOS: 12,
    ACORN_RISCOS: 13,
    UNKNOWN: 255
  };
  /** @enum {number} */

  Zlib.Gzip.FlagsMask = {
    FTEXT: 0x01,
    FHCRC: 0x02,
    FEXTRA: 0x04,
    FNAME: 0x08,
    FCOMMENT: 0x10
  };
  /**
   * @fileoverview Heap Sort 実装. ハフマン符号化で使用する.
   */

  /**
   * カスタムハフマン符号で使用するヒープ実装
   * @param {number} length ヒープサイズ.
   * @constructor
   */

  Zlib.Heap = function (length) {
    this.buffer = new ( Uint16Array )(length * 2);
    this.length = 0;
  };
  /**
   * 親ノードの index 取得
   * @param {number} index 子ノードの index.
   * @return {number} 親ノードの index.
   *
   */


  Zlib.Heap.prototype.getParent = function (index) {
    return ((index - 2) / 4 | 0) * 2;
  };
  /**
   * 子ノードの index 取得
   * @param {number} index 親ノードの index.
   * @return {number} 子ノードの index.
   */


  Zlib.Heap.prototype.getChild = function (index) {
    return 2 * index + 2;
  };
  /**
   * Heap に値を追加する
   * @param {number} index キー index.
   * @param {number} value 値.
   * @return {number} 現在のヒープ長.
   */


  Zlib.Heap.prototype.push = function (index, value) {
    var current,
        parent,
        heap = this.buffer,
        swap;
    current = this.length;
    heap[this.length++] = value;
    heap[this.length++] = index; // ルートノードにたどり着くまで入れ替えを試みる

    while (current > 0) {
      parent = this.getParent(current); // 親ノードと比較して親の方が小さければ入れ替える

      if (heap[current] > heap[parent]) {
        swap = heap[current];
        heap[current] = heap[parent];
        heap[parent] = swap;
        swap = heap[current + 1];
        heap[current + 1] = heap[parent + 1];
        heap[parent + 1] = swap;
        current = parent; // 入れ替えが必要なくなったらそこで抜ける
      } else {
        break;
      }
    }

    return this.length;
  };
  /**
   * Heapから一番大きい値を返す
   * @return {{index: number, value: number, length: number}} {index: キーindex,
   *     value: 値, length: ヒープ長} の Object.
   */


  Zlib.Heap.prototype.pop = function () {
    var index,
        value,
        heap = this.buffer,
        swap,
        current,
        parent;
    value = heap[0];
    index = heap[1]; // 後ろから値を取る

    this.length -= 2;
    heap[0] = heap[this.length];
    heap[1] = heap[this.length + 1];
    parent = 0; // ルートノードから下がっていく

    while (true) {
      current = this.getChild(parent); // 範囲チェック

      if (current >= this.length) {
        break;
      } // 隣のノードと比較して、隣の方が値が大きければ隣を現在ノードとして選択


      if (current + 2 < this.length && heap[current + 2] > heap[current]) {
        current += 2;
      } // 親ノードと比較して親の方が小さい場合は入れ替える


      if (heap[current] > heap[parent]) {
        swap = heap[parent];
        heap[parent] = heap[current];
        heap[current] = swap;
        swap = heap[parent + 1];
        heap[parent + 1] = heap[current + 1];
        heap[current + 1] = swap;
      } else {
        break;
      }

      parent = current;
    }

    return {
      index: index,
      value: value,
      length: this.length
    };
  };
  /* vim:set expandtab ts=2 sw=2 tw=80: */

  /**
   * @fileoverview Deflate (RFC1951) 符号化アルゴリズム実装.
   */

  /**
   * Raw Deflate 実装
   *
   * @constructor
   * @param {!(Array.<number>|Uint8Array)} input 符号化する対象のバッファ.
   * @param {Object=} opt_params option parameters.
   *
   * typed array が使用可能なとき、outputBuffer が Array は自動的に Uint8Array に
   * 変換されます.
   * 別のオブジェクトになるため出力バッファを参照している変数などは
   * 更新する必要があります.
   */


  Zlib.RawDeflate = function (input, opt_params) {
    /** @type {Zlib.RawDeflate.CompressionType} */
    this.compressionType = Zlib.RawDeflate.CompressionType.DYNAMIC;
    /** @type {number} */

    this.lazy = 0;
    /** @type {!(Array.<number>|Uint32Array)} */

    this.freqsLitLen;
    /** @type {!(Array.<number>|Uint32Array)} */

    this.freqsDist;
    /** @type {!(Array.<number>|Uint8Array)} */

    this.input =  input instanceof Array ? new Uint8Array(input) : input;
    /** @type {!(Array.<number>|Uint8Array)} output output buffer. */

    this.output;
    /** @type {number} pos output buffer position. */

    this.op = 0; // option parameters

    if (opt_params) {
      if (opt_params['lazy']) {
        this.lazy = opt_params['lazy'];
      }

      if (typeof opt_params['compressionType'] === 'number') {
        this.compressionType = opt_params['compressionType'];
      }

      if (opt_params['outputBuffer']) {
        this.output =  opt_params['outputBuffer'] instanceof Array ? new Uint8Array(opt_params['outputBuffer']) : opt_params['outputBuffer'];
      }

      if (typeof opt_params['outputIndex'] === 'number') {
        this.op = opt_params['outputIndex'];
      }
    }

    if (!this.output) {
      this.output = new ( Uint8Array )(0x8000);
    }
  };
  /**
   * @enum {number}
   */


  Zlib.RawDeflate.CompressionType = {
    NONE: 0,
    FIXED: 1,
    DYNAMIC: 2,
    RESERVED: 3
  };
  /**
   * LZ77 の最小マッチ長
   * @const
   * @type {number}
   */

  Zlib.RawDeflate.Lz77MinLength = 3;
  /**
   * LZ77 の最大マッチ長
   * @const
   * @type {number}
   */

  Zlib.RawDeflate.Lz77MaxLength = 258;
  /**
   * LZ77 のウィンドウサイズ
   * @const
   * @type {number}
   */

  Zlib.RawDeflate.WindowSize = 0x8000;
  /**
   * 最長の符号長
   * @const
   * @type {number}
   */

  Zlib.RawDeflate.MaxCodeLength = 16;
  /**
   * ハフマン符号の最大数値
   * @const
   * @type {number}
   */

  Zlib.RawDeflate.HUFMAX = 286;
  /**
   * 固定ハフマン符号の符号化テーブル
   * @const
   * @type {Array.<Array.<number, number>>}
   */

  Zlib.RawDeflate.FixedHuffmanTable = function () {
    var table = [],
        i;

    for (i = 0; i < 288; i++) {
      switch (true) {
        case i <= 143:
          table.push([i + 0x030, 8]);
          break;

        case i <= 255:
          table.push([i - 144 + 0x190, 9]);
          break;

        case i <= 279:
          table.push([i - 256 + 0x000, 7]);
          break;

        case i <= 287:
          table.push([i - 280 + 0x0C0, 8]);
          break;

        default:
          throw 'invalid literal: ' + i;
      }
    }

    return table;
  }();
  /**
   * DEFLATE ブロックの作成
   * @return {!(Array.<number>|Uint8Array)} 圧縮済み byte array.
   */


  Zlib.RawDeflate.prototype.compress = function () {
    /** @type {!(Array.<number>|Uint8Array)} */
    var blockArray;
    /** @type {number} */

    var position;
    /** @type {number} */

    var length;
    var input = this.input; // compression

    switch (this.compressionType) {
      case Zlib.RawDeflate.CompressionType.NONE:
        // each 65535-Byte (length header: 16-bit)
        for (position = 0, length = input.length; position < length;) {
          blockArray =  input.subarray(position, position + 0xffff) ;
          position += blockArray.length;
          this.makeNocompressBlock(blockArray, position === length);
        }

        break;

      case Zlib.RawDeflate.CompressionType.FIXED:
        this.output = this.makeFixedHuffmanBlock(input, true);
        this.op = this.output.length;
        break;

      case Zlib.RawDeflate.CompressionType.DYNAMIC:
        this.output = this.makeDynamicHuffmanBlock(input, true);
        this.op = this.output.length;
        break;

      default:
        throw 'invalid compression type';
    }

    return this.output;
  };
  /**
   * 非圧縮ブロックの作成
   * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
   * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
   * @return {!(Array.<number>|Uint8Array)} 非圧縮ブロック byte array.
   */


  Zlib.RawDeflate.prototype.makeNocompressBlock = function (blockArray, isFinalBlock) {
    /** @type {number} */
    var bfinal;
    /** @type {Zlib.RawDeflate.CompressionType} */

    var btype;
    /** @type {number} */

    var len;
    /** @type {number} */

    var nlen;
    var output = this.output;
    var op = this.op; // expand buffer

    {
      output = new Uint8Array(this.output.buffer);

      while (output.length <= op + blockArray.length + 5) {
        output = new Uint8Array(output.length << 1);
      }

      output.set(this.output);
    } // header


    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.NONE;
    output[op++] = bfinal | btype << 1; // length

    len = blockArray.length;
    nlen = ~len + 0x10000 & 0xffff;
    output[op++] = len & 0xff;
    output[op++] = len >>> 8 & 0xff;
    output[op++] = nlen & 0xff;
    output[op++] = nlen >>> 8 & 0xff; // copy buffer

    {
      output.set(blockArray, op);
      op += blockArray.length;
      output = output.subarray(0, op);
    }

    this.op = op;
    this.output = output;
    return output;
  };
  /**
   * 固定ハフマンブロックの作成
   * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
   * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
   * @return {!(Array.<number>|Uint8Array)} 固定ハフマン符号化ブロック byte array.
   */


  Zlib.RawDeflate.prototype.makeFixedHuffmanBlock = function (blockArray, isFinalBlock) {
    /** @type {Zlib.BitStream} */
    var stream = new Zlib.BitStream( new Uint8Array(this.output.buffer) , this.op);
    /** @type {number} */

    var bfinal;
    /** @type {Zlib.RawDeflate.CompressionType} */

    var btype;
    /** @type {!(Array.<number>|Uint16Array)} */

    var data; // header

    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.FIXED;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray);
    this.fixedHuffman(data, stream);
    return stream.finish();
  };
  /**
   * 動的ハフマンブロックの作成
   * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
   * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
   * @return {!(Array.<number>|Uint8Array)} 動的ハフマン符号ブロック byte array.
   */


  Zlib.RawDeflate.prototype.makeDynamicHuffmanBlock = function (blockArray, isFinalBlock) {
    /** @type {Zlib.BitStream} */
    var stream = new Zlib.BitStream( new Uint8Array(this.output.buffer) , this.op);
    /** @type {number} */

    var bfinal;
    /** @type {Zlib.RawDeflate.CompressionType} */

    var btype;
    /** @type {!(Array.<number>|Uint16Array)} */

    var data;
    /** @type {number} */

    var hlit;
    /** @type {number} */

    var hdist;
    /** @type {number} */

    var hclen;
    /** @const @type {Array.<number>} */

    var hclenOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    /** @type {!(Array.<number>|Uint8Array)} */

    var litLenLengths;
    /** @type {!(Array.<number>|Uint16Array)} */

    var litLenCodes;
    /** @type {!(Array.<number>|Uint8Array)} */

    var distLengths;
    /** @type {!(Array.<number>|Uint16Array)} */

    var distCodes;
    /** @type {{
     *   codes: !(Array.<number>|Uint32Array),
     *   freqs: !(Array.<number>|Uint8Array)
     * }} */

    var treeSymbols;
    /** @type {!(Array.<number>|Uint8Array)} */

    var treeLengths;
    /** @type {Array} */

    var transLengths = new Array(19);
    /** @type {!(Array.<number>|Uint16Array)} */

    var treeCodes;
    /** @type {number} */

    var code;
    /** @type {number} */

    var bitlen;
    /** @type {number} */

    var i;
    /** @type {number} */

    var il; // header

    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.DYNAMIC;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray); // リテラル・長さ, 距離のハフマン符号と符号長の算出

    litLenLengths = this.getLengths_(this.freqsLitLen, 15);
    litLenCodes = this.getCodesFromLengths_(litLenLengths);
    distLengths = this.getLengths_(this.freqsDist, 7);
    distCodes = this.getCodesFromLengths_(distLengths); // HLIT, HDIST の決定

    for (hlit = 286; hlit > 257 && litLenLengths[hlit - 1] === 0; hlit--) {}

    for (hdist = 30; hdist > 1 && distLengths[hdist - 1] === 0; hdist--) {} // HCLEN


    treeSymbols = this.getTreeSymbols_(hlit, litLenLengths, hdist, distLengths);
    treeLengths = this.getLengths_(treeSymbols.freqs, 7);

    for (i = 0; i < 19; i++) {
      transLengths[i] = treeLengths[hclenOrder[i]];
    }

    for (hclen = 19; hclen > 4 && transLengths[hclen - 1] === 0; hclen--) {}

    treeCodes = this.getCodesFromLengths_(treeLengths); // 出力

    stream.writeBits(hlit - 257, 5, true);
    stream.writeBits(hdist - 1, 5, true);
    stream.writeBits(hclen - 4, 4, true);

    for (i = 0; i < hclen; i++) {
      stream.writeBits(transLengths[i], 3, true);
    } // ツリーの出力


    for (i = 0, il = treeSymbols.codes.length; i < il; i++) {
      code = treeSymbols.codes[i];
      stream.writeBits(treeCodes[code], treeLengths[code], true); // extra bits

      if (code >= 16) {
        i++;

        switch (code) {
          case 16:
            bitlen = 2;
            break;

          case 17:
            bitlen = 3;
            break;

          case 18:
            bitlen = 7;
            break;

          default:
            throw 'invalid code: ' + code;
        }

        stream.writeBits(treeSymbols.codes[i], bitlen, true);
      }
    }

    this.dynamicHuffman(data, [litLenCodes, litLenLengths], [distCodes, distLengths], stream);
    return stream.finish();
  };
  /**
   * 動的ハフマン符号化(カスタムハフマンテーブル)
   * @param {!(Array.<number>|Uint16Array)} dataArray LZ77 符号化済み byte array.
   * @param {!Zlib.BitStream} stream 書き込み用ビットストリーム.
   * @return {!Zlib.BitStream} ハフマン符号化済みビットストリームオブジェクト.
   */


  Zlib.RawDeflate.prototype.dynamicHuffman = function (dataArray, litLen, dist, stream) {
    /** @type {number} */
    var index;
    /** @type {number} */

    var length;
    /** @type {number} */

    var literal;
    /** @type {number} */

    var code;
    /** @type {number} */

    var litLenCodes;
    /** @type {number} */

    var litLenLengths;
    /** @type {number} */

    var distCodes;
    /** @type {number} */

    var distLengths;
    litLenCodes = litLen[0];
    litLenLengths = litLen[1];
    distCodes = dist[0];
    distLengths = dist[1]; // 符号を BitStream に書き込んでいく

    for (index = 0, length = dataArray.length; index < length; ++index) {
      literal = dataArray[index]; // literal or length

      stream.writeBits(litLenCodes[literal], litLenLengths[literal], true); // 長さ・距離符号

      if (literal > 256) {
        // length extra
        stream.writeBits(dataArray[++index], dataArray[++index], true); // distance

        code = dataArray[++index];
        stream.writeBits(distCodes[code], distLengths[code], true); // distance extra

        stream.writeBits(dataArray[++index], dataArray[++index], true); // 終端
      } else if (literal === 256) {
        break;
      }
    }

    return stream;
  };
  /**
   * 固定ハフマン符号化
   * @param {!(Array.<number>|Uint16Array)} dataArray LZ77 符号化済み byte array.
   * @param {!Zlib.BitStream} stream 書き込み用ビットストリーム.
   * @return {!Zlib.BitStream} ハフマン符号化済みビットストリームオブジェクト.
   */


  Zlib.RawDeflate.prototype.fixedHuffman = function (dataArray, stream) {
    /** @type {number} */
    var index;
    /** @type {number} */

    var length;
    /** @type {number} */

    var literal; // 符号を BitStream に書き込んでいく

    for (index = 0, length = dataArray.length; index < length; index++) {
      literal = dataArray[index]; // 符号の書き込み

      Zlib.BitStream.prototype.writeBits.apply(stream, Zlib.RawDeflate.FixedHuffmanTable[literal]); // 長さ・距離符号

      if (literal > 0x100) {
        // length extra
        stream.writeBits(dataArray[++index], dataArray[++index], true); // distance

        stream.writeBits(dataArray[++index], 5); // distance extra

        stream.writeBits(dataArray[++index], dataArray[++index], true); // 終端
      } else if (literal === 0x100) {
        break;
      }
    }

    return stream;
  };
  /**
   * マッチ情報
   * @param {!number} length マッチした長さ.
   * @param {!number} backwardDistance マッチ位置との距離.
   * @constructor
   */


  Zlib.RawDeflate.Lz77Match = function (length, backwardDistance) {
    /** @type {number} match length. */
    this.length = length;
    /** @type {number} backward distance. */

    this.backwardDistance = backwardDistance;
  };
  /**
   * 長さ符号テーブル.
   * [コード, 拡張ビット, 拡張ビット長] の配列となっている.
   * @const
   * @type {!(Array.<number>|Uint32Array)}
   */


  Zlib.RawDeflate.Lz77Match.LengthCodeTable = function (table) {
    return  new Uint32Array(table) ;
  }(function () {
    /** @type {!Array} */
    var table = [];
    /** @type {number} */

    var i;
    /** @type {!Array.<number>} */

    var c;

    for (i = 3; i <= 258; i++) {
      c = code(i);
      table[i] = c[2] << 24 | c[1] << 16 | c[0];
    }
    /**
     * @param {number} length lz77 length.
     * @return {!Array.<number>} lz77 codes.
     */


    function code(length) {
      switch (true) {
        case length === 3:
          return [257, length - 3, 0];
          break;

        case length === 4:
          return [258, length - 4, 0];
          break;

        case length === 5:
          return [259, length - 5, 0];
          break;

        case length === 6:
          return [260, length - 6, 0];
          break;

        case length === 7:
          return [261, length - 7, 0];
          break;

        case length === 8:
          return [262, length - 8, 0];
          break;

        case length === 9:
          return [263, length - 9, 0];
          break;

        case length === 10:
          return [264, length - 10, 0];
          break;

        case length <= 12:
          return [265, length - 11, 1];
          break;

        case length <= 14:
          return [266, length - 13, 1];
          break;

        case length <= 16:
          return [267, length - 15, 1];
          break;

        case length <= 18:
          return [268, length - 17, 1];
          break;

        case length <= 22:
          return [269, length - 19, 2];
          break;

        case length <= 26:
          return [270, length - 23, 2];
          break;

        case length <= 30:
          return [271, length - 27, 2];
          break;

        case length <= 34:
          return [272, length - 31, 2];
          break;

        case length <= 42:
          return [273, length - 35, 3];
          break;

        case length <= 50:
          return [274, length - 43, 3];
          break;

        case length <= 58:
          return [275, length - 51, 3];
          break;

        case length <= 66:
          return [276, length - 59, 3];
          break;

        case length <= 82:
          return [277, length - 67, 4];
          break;

        case length <= 98:
          return [278, length - 83, 4];
          break;

        case length <= 114:
          return [279, length - 99, 4];
          break;

        case length <= 130:
          return [280, length - 115, 4];
          break;

        case length <= 162:
          return [281, length - 131, 5];
          break;

        case length <= 194:
          return [282, length - 163, 5];
          break;

        case length <= 226:
          return [283, length - 195, 5];
          break;

        case length <= 257:
          return [284, length - 227, 5];
          break;

        case length === 258:
          return [285, length - 258, 0];
          break;

        default:
          throw 'invalid length: ' + length;
      }
    }

    return table;
  }());
  /**
   * 距離符号テーブル
   * @param {!number} dist 距離.
   * @return {!Array.<number>} コード、拡張ビット、拡張ビット長の配列.
   * @private
   */


  Zlib.RawDeflate.Lz77Match.prototype.getDistanceCode_ = function (dist) {
    /** @type {!Array.<number>} distance code table. */
    var r;

    switch (true) {
      case dist === 1:
        r = [0, dist - 1, 0];
        break;

      case dist === 2:
        r = [1, dist - 2, 0];
        break;

      case dist === 3:
        r = [2, dist - 3, 0];
        break;

      case dist === 4:
        r = [3, dist - 4, 0];
        break;

      case dist <= 6:
        r = [4, dist - 5, 1];
        break;

      case dist <= 8:
        r = [5, dist - 7, 1];
        break;

      case dist <= 12:
        r = [6, dist - 9, 2];
        break;

      case dist <= 16:
        r = [7, dist - 13, 2];
        break;

      case dist <= 24:
        r = [8, dist - 17, 3];
        break;

      case dist <= 32:
        r = [9, dist - 25, 3];
        break;

      case dist <= 48:
        r = [10, dist - 33, 4];
        break;

      case dist <= 64:
        r = [11, dist - 49, 4];
        break;

      case dist <= 96:
        r = [12, dist - 65, 5];
        break;

      case dist <= 128:
        r = [13, dist - 97, 5];
        break;

      case dist <= 192:
        r = [14, dist - 129, 6];
        break;

      case dist <= 256:
        r = [15, dist - 193, 6];
        break;

      case dist <= 384:
        r = [16, dist - 257, 7];
        break;

      case dist <= 512:
        r = [17, dist - 385, 7];
        break;

      case dist <= 768:
        r = [18, dist - 513, 8];
        break;

      case dist <= 1024:
        r = [19, dist - 769, 8];
        break;

      case dist <= 1536:
        r = [20, dist - 1025, 9];
        break;

      case dist <= 2048:
        r = [21, dist - 1537, 9];
        break;

      case dist <= 3072:
        r = [22, dist - 2049, 10];
        break;

      case dist <= 4096:
        r = [23, dist - 3073, 10];
        break;

      case dist <= 6144:
        r = [24, dist - 4097, 11];
        break;

      case dist <= 8192:
        r = [25, dist - 6145, 11];
        break;

      case dist <= 12288:
        r = [26, dist - 8193, 12];
        break;

      case dist <= 16384:
        r = [27, dist - 12289, 12];
        break;

      case dist <= 24576:
        r = [28, dist - 16385, 13];
        break;

      case dist <= 32768:
        r = [29, dist - 24577, 13];
        break;

      default:
        throw 'invalid distance';
    }

    return r;
  };
  /**
   * マッチ情報を LZ77 符号化配列で返す.
   * なお、ここでは以下の内部仕様で符号化している
   * [ CODE, EXTRA-BIT-LEN, EXTRA, CODE, EXTRA-BIT-LEN, EXTRA ]
   * @return {!Array.<number>} LZ77 符号化 byte array.
   */


  Zlib.RawDeflate.Lz77Match.prototype.toLz77Array = function () {
    /** @type {number} */
    var length = this.length;
    /** @type {number} */

    var dist = this.backwardDistance;
    /** @type {Array} */

    var codeArray = [];
    /** @type {number} */

    var pos = 0;
    /** @type {!Array.<number>} */

    var code; // length

    code = Zlib.RawDeflate.Lz77Match.LengthCodeTable[length];
    codeArray[pos++] = code & 0xffff;
    codeArray[pos++] = code >> 16 & 0xff;
    codeArray[pos++] = code >> 24; // distance

    code = this.getDistanceCode_(dist);
    codeArray[pos++] = code[0];
    codeArray[pos++] = code[1];
    codeArray[pos++] = code[2];
    return codeArray;
  };
  /**
   * LZ77 実装
   * @param {!(Array.<number>|Uint8Array)} dataArray LZ77 符号化するバイト配列.
   * @return {!(Array.<number>|Uint16Array)} LZ77 符号化した配列.
   */


  Zlib.RawDeflate.prototype.lz77 = function (dataArray) {
    /** @type {number} input position */
    var position;
    /** @type {number} input length */

    var length;
    /** @type {number} loop counter */

    var i;
    /** @type {number} loop limiter */

    var il;
    /** @type {number} chained-hash-table key */

    var matchKey;
    /** @type {Object.<number, Array.<number>>} chained-hash-table */

    var table = {};
    /** @const @type {number} */

    var windowSize = Zlib.RawDeflate.WindowSize;
    /** @type {Array.<number>} match list */

    var matchList;
    /** @type {Zlib.RawDeflate.Lz77Match} longest match */

    var longestMatch;
    /** @type {Zlib.RawDeflate.Lz77Match} previous longest match */

    var prevMatch;
    /** @type {!(Array.<number>|Uint16Array)} lz77 buffer */

    var lz77buf =  new Uint16Array(dataArray.length * 2) ;
    /** @type {number} lz77 output buffer pointer */

    var pos = 0;
    /** @type {number} lz77 skip length */

    var skipLength = 0;
    /** @type {!(Array.<number>|Uint32Array)} */

    var freqsLitLen = new ( Uint32Array )(286);
    /** @type {!(Array.<number>|Uint32Array)} */

    var freqsDist = new ( Uint32Array )(30);
    /** @type {number} */

    var lazy = this.lazy;
    /** @type {*} temporary variable */

    var tmp; // 初期化

    freqsLitLen[256] = 1; // EOB の最低出現回数は 1

    /**
     * マッチデータの書き込み
     * @param {Zlib.RawDeflate.Lz77Match} match LZ77 Match data.
     * @param {!number} offset スキップ開始位置(相対指定).
     * @private
     */

    function writeMatch(match, offset) {
      /** @type {Array.<number>} */
      var lz77Array = match.toLz77Array();
      /** @type {number} */

      var i;
      /** @type {number} */

      var il;

      for (i = 0, il = lz77Array.length; i < il; ++i) {
        lz77buf[pos++] = lz77Array[i];
      }

      freqsLitLen[lz77Array[0]]++;
      freqsDist[lz77Array[3]]++;
      skipLength = match.length + offset - 1;
      prevMatch = null;
    } // LZ77 符号化


    for (position = 0, length = dataArray.length; position < length; ++position) {
      // ハッシュキーの作成
      for (matchKey = 0, i = 0, il = Zlib.RawDeflate.Lz77MinLength; i < il; ++i) {
        if (position + i === length) {
          break;
        }

        matchKey = matchKey << 8 | dataArray[position + i];
      } // テーブルが未定義だったら作成する


      if (table[matchKey] === void 0) {
        table[matchKey] = [];
      }

      matchList = table[matchKey]; // skip

      if (skipLength-- > 0) {
        matchList.push(position);
        continue;
      } // マッチテーブルの更新 (最大戻り距離を超えているものを削除する)


      while (matchList.length > 0 && position - matchList[0] > windowSize) {
        matchList.shift();
      } // データ末尾でマッチしようがない場合はそのまま流しこむ


      if (position + Zlib.RawDeflate.Lz77MinLength >= length) {
        if (prevMatch) {
          writeMatch(prevMatch, -1);
        }

        for (i = 0, il = length - position; i < il; ++i) {
          tmp = dataArray[position + i];
          lz77buf[pos++] = tmp;
          ++freqsLitLen[tmp];
        }

        break;
      } // マッチ候補から最長のものを探す


      if (matchList.length > 0) {
        longestMatch = this.searchLongestMatch_(dataArray, position, matchList);

        if (prevMatch) {
          // 現在のマッチの方が前回のマッチよりも長い
          if (prevMatch.length < longestMatch.length) {
            // write previous literal
            tmp = dataArray[position - 1];
            lz77buf[pos++] = tmp;
            ++freqsLitLen[tmp]; // write current match

            writeMatch(longestMatch, 0);
          } else {
            // write previous match
            writeMatch(prevMatch, -1);
          }
        } else if (longestMatch.length < lazy) {
          prevMatch = longestMatch;
        } else {
          writeMatch(longestMatch, 0);
        } // 前回マッチしていて今回マッチがなかったら前回のを採用

      } else if (prevMatch) {
        writeMatch(prevMatch, -1);
      } else {
        tmp = dataArray[position];
        lz77buf[pos++] = tmp;
        ++freqsLitLen[tmp];
      }

      matchList.push(position); // マッチテーブルに現在の位置を保存
    } // 終端処理


    lz77buf[pos++] = 256;
    freqsLitLen[256]++;
    this.freqsLitLen = freqsLitLen;
    this.freqsDist = freqsDist;
    return (
      /** @type {!(Uint16Array|Array.<number>)} */
       lz77buf.subarray(0, pos) 
    );
  };
  /**
   * マッチした候補の中から最長一致を探す
   * @param {!Object} data plain data byte array.
   * @param {!number} position plain data byte array position.
   * @param {!Array.<number>} matchList 候補となる位置の配列.
   * @return {!Zlib.RawDeflate.Lz77Match} 最長かつ最短距離のマッチオブジェクト.
   * @private
   */


  Zlib.RawDeflate.prototype.searchLongestMatch_ = function (data, position, matchList) {
    var match,
        currentMatch,
        matchMax = 0,
        matchLength,
        i,
        j,
        l,
        dl = data.length; // 候補を後ろから 1 つずつ絞り込んでゆく

    permatch: for (i = 0, l = matchList.length; i < l; i++) {
      match = matchList[l - i - 1];
      matchLength = Zlib.RawDeflate.Lz77MinLength; // 前回までの最長一致を末尾から一致検索する

      if (matchMax > Zlib.RawDeflate.Lz77MinLength) {
        for (j = matchMax; j > Zlib.RawDeflate.Lz77MinLength; j--) {
          if (data[match + j - 1] !== data[position + j - 1]) {
            continue permatch;
          }
        }

        matchLength = matchMax;
      } // 最長一致探索


      while (matchLength < Zlib.RawDeflate.Lz77MaxLength && position + matchLength < dl && data[match + matchLength] === data[position + matchLength]) {
        ++matchLength;
      } // マッチ長が同じ場合は後方を優先


      if (matchLength > matchMax) {
        currentMatch = match;
        matchMax = matchLength;
      } // 最長が確定したら後の処理は省略


      if (matchLength === Zlib.RawDeflate.Lz77MaxLength) {
        break;
      }
    }

    return new Zlib.RawDeflate.Lz77Match(matchMax, position - currentMatch);
  };
  /**
   * Tree-Transmit Symbols の算出
   * reference: PuTTY Deflate implementation
   * @param {number} hlit HLIT.
   * @param {!(Array.<number>|Uint8Array)} litlenLengths リテラルと長さ符号の符号長配列.
   * @param {number} hdist HDIST.
   * @param {!(Array.<number>|Uint8Array)} distLengths 距離符号の符号長配列.
   * @return {{
   *   codes: !(Array.<number>|Uint32Array),
   *   freqs: !(Array.<number>|Uint8Array)
   * }} Tree-Transmit Symbols.
   */


  Zlib.RawDeflate.prototype.getTreeSymbols_ = function (hlit, litlenLengths, hdist, distLengths) {
    var src = new ( Uint32Array )(hlit + hdist),
        i,
        j,
        runLength,
        l,
        result = new ( Uint32Array )(286 + 30),
        nResult,
        rpt,
        freqs = new ( Uint8Array )(19);
    j = 0;

    for (i = 0; i < hlit; i++) {
      src[j++] = litlenLengths[i];
    }

    for (i = 0; i < hdist; i++) {
      src[j++] = distLengths[i];
    } // 初期化


    nResult = 0;

    for (i = 0, l = src.length; i < l; i += j) {
      // Run Length Encoding
      for (j = 1; i + j < l && src[i + j] === src[i]; ++j) {}

      runLength = j;

      if (src[i] === 0) {
        // 0 の繰り返しが 3 回未満ならばそのまま
        if (runLength < 3) {
          while (runLength-- > 0) {
            result[nResult++] = 0;
            freqs[0]++;
          }
        } else {
          while (runLength > 0) {
            // 繰り返しは最大 138 までなので切り詰める
            rpt = runLength < 138 ? runLength : 138;

            if (rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3;
            } // 3-10 回 -> 17


            if (rpt <= 10) {
              result[nResult++] = 17;
              result[nResult++] = rpt - 3;
              freqs[17]++; // 11-138 回 -> 18
            } else {
              result[nResult++] = 18;
              result[nResult++] = rpt - 11;
              freqs[18]++;
            }

            runLength -= rpt;
          }
        }
      } else {
        result[nResult++] = src[i];
        freqs[src[i]]++;
        runLength--; // 繰り返し回数が3回未満ならばランレングス符号は要らない

        if (runLength < 3) {
          while (runLength-- > 0) {
            result[nResult++] = src[i];
            freqs[src[i]]++;
          } // 3 回以上ならばランレングス符号化

        } else {
          while (runLength > 0) {
            // runLengthを 3-6 で分割
            rpt = runLength < 6 ? runLength : 6;

            if (rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3;
            }

            result[nResult++] = 16;
            result[nResult++] = rpt - 3;
            freqs[16]++;
            runLength -= rpt;
          }
        }
      }
    }

    return {
      codes:  result.subarray(0, nResult) ,
      freqs: freqs
    };
  };
  /**
   * ハフマン符号の長さを取得する
   * @param {!(Array.<number>|Uint8Array|Uint32Array)} freqs 出現カウント.
   * @param {number} limit 符号長の制限.
   * @return {!(Array.<number>|Uint8Array)} 符号長配列.
   * @private
   */


  Zlib.RawDeflate.prototype.getLengths_ = function (freqs, limit) {
    /** @type {number} */
    var nSymbols = freqs.length;
    /** @type {Zlib.Heap} */

    var heap = new Zlib.Heap(2 * Zlib.RawDeflate.HUFMAX);
    /** @type {!(Array.<number>|Uint8Array)} */

    var length = new ( Uint8Array )(nSymbols);
    /** @type {Array} */

    var nodes;
    /** @type {!(Array.<number>|Uint32Array)} */

    var values;
    /** @type {!(Array.<number>|Uint8Array)} */

    var codeLength;
    /** @type {number} */

    var i;
    /** @type {number} */

    var il; // 配列の初期化


    for (i = 0; i < nSymbols; ++i) {
      if (freqs[i] > 0) {
        heap.push(i, freqs[i]);
      }
    }

    nodes = new Array(heap.length / 2);
    values = new ( Uint32Array )(heap.length / 2); // 非 0 の要素が一つだけだった場合は、そのシンボルに符号長 1 を割り当てて終了

    if (nodes.length === 1) {
      length[heap.pop().index] = 1;
      return length;
    } // Reverse Package Merge Algorithm による Canonical Huffman Code の符号長決定


    for (i = 0, il = heap.length / 2; i < il; ++i) {
      nodes[i] = heap.pop();
      values[i] = nodes[i].value;
    }

    codeLength = this.reversePackageMerge_(values, values.length, limit);

    for (i = 0, il = nodes.length; i < il; ++i) {
      length[nodes[i].index] = codeLength[i];
    }

    return length;
  };
  /**
   * Reverse Package Merge Algorithm.
   * @param {!(Array.<number>|Uint32Array)} freqs sorted probability.
   * @param {number} symbols number of symbols.
   * @param {number} limit code length limit.
   * @return {!(Array.<number>|Uint8Array)} code lengths.
   */


  Zlib.RawDeflate.prototype.reversePackageMerge_ = function (freqs, symbols, limit) {
    /** @type {!(Array.<number>|Uint16Array)} */
    var minimumCost = new ( Uint16Array )(limit);
    /** @type {!(Array.<number>|Uint8Array)} */

    var flag = new ( Uint8Array )(limit);
    /** @type {!(Array.<number>|Uint8Array)} */

    var codeLength = new ( Uint8Array )(symbols);
    /** @type {Array} */

    var value = new Array(limit);
    /** @type {Array} */

    var type = new Array(limit);
    /** @type {Array.<number>} */

    var currentPosition = new Array(limit);
    /** @type {number} */

    var excess = (1 << limit) - symbols;
    /** @type {number} */

    var half = 1 << limit - 1;
    /** @type {number} */

    var i;
    /** @type {number} */

    var j;
    /** @type {number} */

    var t;
    /** @type {number} */

    var weight;
    /** @type {number} */

    var next;
    /**
     * @param {number} j
     */

    function takePackage(j) {
      /** @type {number} */
      var x = type[j][currentPosition[j]];

      if (x === symbols) {
        takePackage(j + 1);
        takePackage(j + 1);
      } else {
        --codeLength[x];
      }

      ++currentPosition[j];
    }

    minimumCost[limit - 1] = symbols;

    for (j = 0; j < limit; ++j) {
      if (excess < half) {
        flag[j] = 0;
      } else {
        flag[j] = 1;
        excess -= half;
      }

      excess <<= 1;
      minimumCost[limit - 2 - j] = (minimumCost[limit - 1 - j] / 2 | 0) + symbols;
    }

    minimumCost[0] = flag[0];
    value[0] = new Array(minimumCost[0]);
    type[0] = new Array(minimumCost[0]);

    for (j = 1; j < limit; ++j) {
      if (minimumCost[j] > 2 * minimumCost[j - 1] + flag[j]) {
        minimumCost[j] = 2 * minimumCost[j - 1] + flag[j];
      }

      value[j] = new Array(minimumCost[j]);
      type[j] = new Array(minimumCost[j]);
    }

    for (i = 0; i < symbols; ++i) {
      codeLength[i] = limit;
    }

    for (t = 0; t < minimumCost[limit - 1]; ++t) {
      value[limit - 1][t] = freqs[t];
      type[limit - 1][t] = t;
    }

    for (i = 0; i < limit; ++i) {
      currentPosition[i] = 0;
    }

    if (flag[limit - 1] === 1) {
      --codeLength[0];
      ++currentPosition[limit - 1];
    }

    for (j = limit - 2; j >= 0; --j) {
      i = 0;
      weight = 0;
      next = currentPosition[j + 1];

      for (t = 0; t < minimumCost[j]; t++) {
        weight = value[j + 1][next] + value[j + 1][next + 1];

        if (weight > freqs[i]) {
          value[j][t] = weight;
          type[j][t] = symbols;
          next += 2;
        } else {
          value[j][t] = freqs[i];
          type[j][t] = i;
          ++i;
        }
      }

      currentPosition[j] = 0;

      if (flag[j] === 1) {
        takePackage(j);
      }
    }

    return codeLength;
  };
  /**
   * 符号長配列からハフマン符号を取得する
   * reference: PuTTY Deflate implementation
   * @param {!(Array.<number>|Uint8Array)} lengths 符号長配列.
   * @return {!(Array.<number>|Uint16Array)} ハフマン符号配列.
   * @private
   */


  Zlib.RawDeflate.prototype.getCodesFromLengths_ = function (lengths) {
    var codes = new ( Uint16Array )(lengths.length),
        count = [],
        startCode = [],
        code = 0,
        i,
        il,
        j,
        m; // Count the codes of each length.

    for (i = 0, il = lengths.length; i < il; i++) {
      count[lengths[i]] = (count[lengths[i]] | 0) + 1;
    } // Determine the starting code for each length block.


    for (i = 1, il = Zlib.RawDeflate.MaxCodeLength; i <= il; i++) {
      startCode[i] = code;
      code += count[i] | 0;
      code <<= 1;
    } // Determine the code for each symbol. Mirrored, of course.


    for (i = 0, il = lengths.length; i < il; i++) {
      code = startCode[lengths[i]];
      startCode[lengths[i]] += 1;
      codes[i] = 0;

      for (j = 0, m = lengths[i]; j < m; j++) {
        codes[i] = codes[i] << 1 | code & 1;
        code >>>= 1;
      }
    }

    return codes;
  };
  /**
   * @param {!(Array.<number>|Uint8Array)} input input buffer.
   * @param {Object=} opt_params options.
   * @constructor
   */


  Zlib.Unzip = function (input, opt_params) {
    opt_params = opt_params || {};
    /** @type {!(Array.<number>|Uint8Array)} */

    this.input =  input instanceof Array ? new Uint8Array(input) : input;
    /** @type {number} */

    this.ip = 0;
    /** @type {number} */

    this.eocdrOffset;
    /** @type {number} */

    this.numberOfThisDisk;
    /** @type {number} */

    this.startDisk;
    /** @type {number} */

    this.totalEntriesThisDisk;
    /** @type {number} */

    this.totalEntries;
    /** @type {number} */

    this.centralDirectorySize;
    /** @type {number} */

    this.centralDirectoryOffset;
    /** @type {number} */

    this.commentLength;
    /** @type {(Array.<number>|Uint8Array)} */

    this.comment;
    /** @type {Array.<Zlib.Unzip.FileHeader>} */

    this.fileHeaderList;
    /** @type {Object.<string, number>} */

    this.filenameToIndex;
    /** @type {boolean} */

    this.verify = opt_params['verify'] || false;
    /** @type {(Array.<number>|Uint8Array)} */

    this.password = opt_params['password'];
  };

  Zlib.Unzip.CompressionMethod = Zlib.Zip.CompressionMethod;
  /**
   * @type {Array.<number>}
   * @const
   */

  Zlib.Unzip.FileHeaderSignature = Zlib.Zip.FileHeaderSignature;
  /**
   * @type {Array.<number>}
   * @const
   */

  Zlib.Unzip.LocalFileHeaderSignature = Zlib.Zip.LocalFileHeaderSignature;
  /**
   * @type {Array.<number>}
   * @const
   */

  Zlib.Unzip.CentralDirectorySignature = Zlib.Zip.CentralDirectorySignature;
  /**
   * @param {!(Array.<number>|Uint8Array)} input input buffer.
   * @param {number} ip input position.
   * @constructor
   */

  Zlib.Unzip.FileHeader = function (input, ip) {
    /** @type {!(Array.<number>|Uint8Array)} */
    this.input = input;
    /** @type {number} */

    this.offset = ip;
    /** @type {number} */

    this.length;
    /** @type {number} */

    this.version;
    /** @type {number} */

    this.os;
    /** @type {number} */

    this.needVersion;
    /** @type {number} */

    this.flags;
    /** @type {number} */

    this.compression;
    /** @type {number} */

    this.time;
    /** @type {number} */

    this.date;
    /** @type {number} */

    this.crc32;
    /** @type {number} */

    this.compressedSize;
    /** @type {number} */

    this.plainSize;
    /** @type {number} */

    this.fileNameLength;
    /** @type {number} */

    this.extraFieldLength;
    /** @type {number} */

    this.fileCommentLength;
    /** @type {number} */

    this.diskNumberStart;
    /** @type {number} */

    this.internalFileAttributes;
    /** @type {number} */

    this.externalFileAttributes;
    /** @type {number} */

    this.relativeOffset;
    /** @type {string} */

    this.filename;
    /** @type {!(Array.<number>|Uint8Array)} */

    this.extraField;
    /** @type {!(Array.<number>|Uint8Array)} */

    this.comment;
  };

  Zlib.Unzip.FileHeader.prototype.parse = function () {
    /** @type {!(Array.<number>|Uint8Array)} */
    var input = this.input;
    /** @type {number} */

    var ip = this.offset; // central file header signature

    if (input[ip++] !== Zlib.Unzip.FileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[3]) {
      throw new Error('invalid file header signature');
    } // version made by


    this.version = input[ip++];
    this.os = input[ip++]; // version needed to extract

    this.needVersion = input[ip++] | input[ip++] << 8; // general purpose bit flag

    this.flags = input[ip++] | input[ip++] << 8; // compression method

    this.compression = input[ip++] | input[ip++] << 8; // last mod file time

    this.time = input[ip++] | input[ip++] << 8; //last mod file date

    this.date = input[ip++] | input[ip++] << 8; // crc-32

    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // compressed size

    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // uncompressed size

    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name length

    this.fileNameLength = input[ip++] | input[ip++] << 8; // extra field length

    this.extraFieldLength = input[ip++] | input[ip++] << 8; // file comment length

    this.fileCommentLength = input[ip++] | input[ip++] << 8; // disk number start

    this.diskNumberStart = input[ip++] | input[ip++] << 8; // internal file attributes

    this.internalFileAttributes = input[ip++] | input[ip++] << 8; // external file attributes

    this.externalFileAttributes = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24; // relative offset of local header

    this.relativeOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name

    this.filename = String.fromCharCode.apply(null,  input.subarray(ip, ip += this.fileNameLength) ); // extra field

    this.extraField =  input.subarray(ip, ip += this.extraFieldLength) ; // file comment

    this.comment =  input.subarray(ip, ip + this.fileCommentLength) ;
    this.length = ip - this.offset;
  };
  /**
   * @param {!(Array.<number>|Uint8Array)} input input buffer.
   * @param {number} ip input position.
   * @constructor
   */


  Zlib.Unzip.LocalFileHeader = function (input, ip) {
    /** @type {!(Array.<number>|Uint8Array)} */
    this.input = input;
    /** @type {number} */

    this.offset = ip;
    /** @type {number} */

    this.length;
    /** @type {number} */

    this.needVersion;
    /** @type {number} */

    this.flags;
    /** @type {number} */

    this.compression;
    /** @type {number} */

    this.time;
    /** @type {number} */

    this.date;
    /** @type {number} */

    this.crc32;
    /** @type {number} */

    this.compressedSize;
    /** @type {number} */

    this.plainSize;
    /** @type {number} */

    this.fileNameLength;
    /** @type {number} */

    this.extraFieldLength;
    /** @type {string} */

    this.filename;
    /** @type {!(Array.<number>|Uint8Array)} */

    this.extraField;
  };

  Zlib.Unzip.LocalFileHeader.Flags = Zlib.Zip.Flags;

  Zlib.Unzip.LocalFileHeader.prototype.parse = function () {
    /** @type {!(Array.<number>|Uint8Array)} */
    var input = this.input;
    /** @type {number} */

    var ip = this.offset; // local file header signature

    if (input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[3]) {
      throw new Error('invalid local file header signature');
    } // version needed to extract


    this.needVersion = input[ip++] | input[ip++] << 8; // general purpose bit flag

    this.flags = input[ip++] | input[ip++] << 8; // compression method

    this.compression = input[ip++] | input[ip++] << 8; // last mod file time

    this.time = input[ip++] | input[ip++] << 8; //last mod file date

    this.date = input[ip++] | input[ip++] << 8; // crc-32

    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // compressed size

    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // uncompressed size

    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name length

    this.fileNameLength = input[ip++] | input[ip++] << 8; // extra field length

    this.extraFieldLength = input[ip++] | input[ip++] << 8; // file name

    this.filename = String.fromCharCode.apply(null,  input.subarray(ip, ip += this.fileNameLength) ); // extra field

    this.extraField =  input.subarray(ip, ip += this.extraFieldLength) ;
    this.length = ip - this.offset;
  };

  Zlib.Unzip.prototype.searchEndOfCentralDirectoryRecord = function () {
    /** @type {!(Array.<number>|Uint8Array)} */
    var input = this.input;
    /** @type {number} */

    var ip;

    for (ip = input.length - 12; ip > 0; --ip) {
      if (input[ip] === Zlib.Unzip.CentralDirectorySignature[0] && input[ip + 1] === Zlib.Unzip.CentralDirectorySignature[1] && input[ip + 2] === Zlib.Unzip.CentralDirectorySignature[2] && input[ip + 3] === Zlib.Unzip.CentralDirectorySignature[3]) {
        this.eocdrOffset = ip;
        return;
      }
    }

    throw new Error('End of Central Directory Record not found');
  };

  Zlib.Unzip.prototype.parseEndOfCentralDirectoryRecord = function () {
    /** @type {!(Array.<number>|Uint8Array)} */
    var input = this.input;
    /** @type {number} */

    var ip;

    if (!this.eocdrOffset) {
      this.searchEndOfCentralDirectoryRecord();
    }

    ip = this.eocdrOffset; // signature

    if (input[ip++] !== Zlib.Unzip.CentralDirectorySignature[0] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[1] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[2] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[3]) {
      throw new Error('invalid signature');
    } // number of this disk


    this.numberOfThisDisk = input[ip++] | input[ip++] << 8; // number of the disk with the start of the central directory

    this.startDisk = input[ip++] | input[ip++] << 8; // total number of entries in the central directory on this disk

    this.totalEntriesThisDisk = input[ip++] | input[ip++] << 8; // total number of entries in the central directory

    this.totalEntries = input[ip++] | input[ip++] << 8; // size of the central directory

    this.centralDirectorySize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // offset of start of central directory with respect to the starting disk number

    this.centralDirectoryOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // .ZIP file comment length

    this.commentLength = input[ip++] | input[ip++] << 8; // .ZIP file comment

    this.comment =  input.subarray(ip, ip + this.commentLength) ;
  };

  Zlib.Unzip.prototype.parseFileHeader = function () {
    /** @type {Array.<Zlib.Unzip.FileHeader>} */
    var filelist = [];
    /** @type {Object.<string, number>} */

    var filetable = {};
    /** @type {number} */

    var ip;
    /** @type {Zlib.Unzip.FileHeader} */

    var fileHeader;
    /*: @type {number} */

    var i;
    /*: @type {number} */

    var il;

    if (this.fileHeaderList) {
      return;
    }

    if (this.centralDirectoryOffset === void 0) {
      this.parseEndOfCentralDirectoryRecord();
    }

    ip = this.centralDirectoryOffset;

    for (i = 0, il = this.totalEntries; i < il; ++i) {
      fileHeader = new Zlib.Unzip.FileHeader(this.input, ip);
      fileHeader.parse();
      ip += fileHeader.length;
      filelist[i] = fileHeader;
      filetable[fileHeader.filename] = i;
    }

    if (this.centralDirectorySize < ip - this.centralDirectoryOffset) {
      throw new Error('invalid file header size');
    }

    this.fileHeaderList = filelist;
    this.filenameToIndex = filetable;
  };
  /**
   * @param {number} index file header index.
   * @param {Object=} opt_params
   * @return {!(Array.<number>|Uint8Array)} file data.
   */


  Zlib.Unzip.prototype.getFileData = function (index, opt_params) {
    opt_params = opt_params || {};
    /** @type {!(Array.<number>|Uint8Array)} */

    var input = this.input;
    /** @type {Array.<Zlib.Unzip.FileHeader>} */

    var fileHeaderList = this.fileHeaderList;
    /** @type {Zlib.Unzip.LocalFileHeader} */

    var localFileHeader;
    /** @type {number} */

    var offset;
    /** @type {number} */

    var length;
    /** @type {!(Array.<number>|Uint8Array)} */

    var buffer;
    /** @type {number} */

    var crc32;
    /** @type {Array.<number>|Uint32Array|Object} */

    var key;
    /** @type {number} */

    var i;
    /** @type {number} */

    var il;

    if (!fileHeaderList) {
      this.parseFileHeader();
    }

    if (fileHeaderList[index] === void 0) {
      throw new Error('wrong index');
    }

    offset = fileHeaderList[index].relativeOffset;
    localFileHeader = new Zlib.Unzip.LocalFileHeader(this.input, offset);
    localFileHeader.parse();
    offset += localFileHeader.length;
    length = localFileHeader.compressedSize; // decryption

    if ((localFileHeader.flags & Zlib.Unzip.LocalFileHeader.Flags.ENCRYPT) !== 0) {
      if (!(opt_params['password'] || this.password)) {
        throw new Error('please set password');
      }

      key = this.createDecryptionKey(opt_params['password'] || this.password); // encryption header

      for (i = offset, il = offset + 12; i < il; ++i) {
        this.decode(key, input[i]);
      }

      offset += 12;
      length -= 12; // decryption

      for (i = offset, il = offset + length; i < il; ++i) {
        input[i] = this.decode(key, input[i]);
      }
    }

    switch (localFileHeader.compression) {
      case Zlib.Unzip.CompressionMethod.STORE:
        buffer =  this.input.subarray(offset, offset + length) ;
        break;

      case Zlib.Unzip.CompressionMethod.DEFLATE:
        buffer = new Zlib.RawInflate(this.input, {
          'index': offset,
          'bufferSize': localFileHeader.plainSize
        }).decompress();
        break;

      default:
        throw new Error('unknown compression type');
    }

    if (this.verify) {
      crc32 = Zlib.CRC32.calc(buffer);

      if (localFileHeader.crc32 !== crc32) {
        throw new Error('wrong crc: file=0x' + localFileHeader.crc32.toString(16) + ', data=0x' + crc32.toString(16));
      }
    }

    return buffer;
  };
  /**
   * @return {Array.<string>}
   */


  Zlib.Unzip.prototype.getFilenames = function () {
    /** @type {Array.<string>} */
    var filenameList = [];
    /** @type {number} */

    var i;
    /** @type {number} */

    var il;
    /** @type {Array.<Zlib.Unzip.FileHeader>} */

    var fileHeaderList;

    if (!this.fileHeaderList) {
      this.parseFileHeader();
    }

    fileHeaderList = this.fileHeaderList;

    for (i = 0, il = fileHeaderList.length; i < il; ++i) {
      filenameList[i] = fileHeaderList[i].filename;
    }

    return filenameList;
  };
  /**
   * @param {string} filename extract filename.
   * @param {Object=} opt_params
   * @return {!(Array.<number>|Uint8Array)} decompressed data.
   */


  Zlib.Unzip.prototype.decompress = function (filename, opt_params) {
    /** @type {number} */
    var index;

    if (!this.filenameToIndex) {
      this.parseFileHeader();
    }

    index = this.filenameToIndex[filename];

    if (index === void 0) {
      throw new Error(filename + ' not found');
    }

    return this.getFileData(index, opt_params);
  };
  /**
   * @param {(Array.<number>|Uint8Array)} password
   */


  Zlib.Unzip.prototype.setPassword = function (password) {
    this.password = password;
  };
  /**
   * @param {(Array.<number>|Uint32Array|Object)} key
   * @param {number} n
   * @return {number}
   */


  Zlib.Unzip.prototype.decode = function (key, n) {
    n ^= this.getByte(
    /** @type {(Array.<number>|Uint32Array)} */
    key);
    this.updateKeys(
    /** @type {(Array.<number>|Uint32Array)} */
    key, n);
    return n;
  }; // common method


  Zlib.Unzip.prototype.updateKeys = Zlib.Zip.prototype.updateKeys;
  Zlib.Unzip.prototype.createDecryptionKey = Zlib.Zip.prototype.createEncryptionKey;
  Zlib.Unzip.prototype.getByte = Zlib.Zip.prototype.getByte;
  /**
   * @fileoverview 雑多な関数群をまとめたモジュール実装.
   */

  /**
   * Byte String から Byte Array に変換.
   * @param {!string} str byte string.
   * @return {!Array.<number>} byte array.
   */

  Zlib.Util.stringToByteArray = function (str) {
    /** @type {!Array.<(string|number)>} */
    var tmp = str.split('');
    /** @type {number} */

    var i;
    /** @type {number} */

    var il;

    for (i = 0, il = tmp.length; i < il; i++) {
      tmp[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
    }

    return tmp;
  };
  /**
   * @fileoverview Adler32 checksum 実装.
   */

  /**
   * Adler32 ハッシュ値の作成
   * @param {!(Array|Uint8Array|string)} array 算出に使用する byte array.
   * @return {number} Adler32 ハッシュ値.
   */


  Zlib.Adler32 = function (array) {
    if (typeof array === 'string') {
      array = Zlib.Util.stringToByteArray(array);
    }

    return Zlib.Adler32.update(1, array);
  };
  /**
   * Adler32 ハッシュ値の更新
   * @param {number} adler 現在のハッシュ値.
   * @param {!(Array|Uint8Array)} array 更新に使用する byte array.
   * @return {number} Adler32 ハッシュ値.
   */


  Zlib.Adler32.update = function (adler, array) {
    /** @type {number} */
    var s1 = adler & 0xffff;
    /** @type {number} */

    var s2 = adler >>> 16 & 0xffff;
    /** @type {number} array length */

    var len = array.length;
    /** @type {number} loop length (don't overflow) */

    var tlen;
    /** @type {number} array index */

    var i = 0;

    while (len > 0) {
      tlen = len > Zlib.Adler32.OptimizationParameter ? Zlib.Adler32.OptimizationParameter : len;
      len -= tlen;

      do {
        s1 += array[i++];
        s2 += s1;
      } while (--tlen);

      s1 %= 65521;
      s2 %= 65521;
    }

    return (s2 << 16 | s1) >>> 0;
  };
  /**
   * Adler32 最適化パラメータ
   * 現状では 1024 程度が最適.
   * @see http://jsperf.com/adler-32-simple-vs-optimized/3
   * @define {number}
   */


  Zlib.Adler32.OptimizationParameter = 1024;
  /**
   * ビットストリーム
   * @constructor
   * @param {!(Array|Uint8Array)=} buffer output buffer.
   * @param {number=} bufferPosition start buffer pointer.
   */

  Zlib.BitStream = function (buffer, bufferPosition) {
    /** @type {number} buffer index. */
    this.index = typeof bufferPosition === 'number' ? bufferPosition : 0;
    /** @type {number} bit index. */

    this.bitindex = 0;
    /** @type {!(Array|Uint8Array)} bit-stream output buffer. */

    this.buffer = buffer instanceof ( Uint8Array ) ? buffer : new ( Uint8Array )(Zlib.BitStream.DefaultBlockSize); // 入力された index が足りなかったら拡張するが、倍にしてもダメなら不正とする

    if (this.buffer.length * 2 <= this.index) {
      throw new Error("invalid index");
    } else if (this.buffer.length <= this.index) {
      this.expandBuffer();
    }
  };
  /**
   * デフォルトブロックサイズ.
   * @const
   * @type {number}
   */


  Zlib.BitStream.DefaultBlockSize = 0x8000;
  /**
   * expand buffer.
   * @return {!(Array|Uint8Array)} new buffer.
   */

  Zlib.BitStream.prototype.expandBuffer = function () {
    /** @type {!(Array|Uint8Array)} old buffer. */
    var oldbuf = this.buffer;
    /** @type {number} loop limiter. */

    var il = oldbuf.length;
    /** @type {!(Array|Uint8Array)} new buffer. */

    var buffer = new ( Uint8Array )(il << 1); // copy buffer

    {
      buffer.set(oldbuf);
    }

    return this.buffer = buffer;
  };
  /**
   * 数値をビットで指定した数だけ書き込む.
   * @param {number} number 書き込む数値.
   * @param {number} n 書き込むビット数.
   * @param {boolean=} reverse 逆順に書き込むならば true.
   */


  Zlib.BitStream.prototype.writeBits = function (number, n, reverse) {
    var buffer = this.buffer;
    var index = this.index;
    var bitindex = this.bitindex;
    /** @type {number} current octet. */

    var current = buffer[index];
    /** @type {number} loop counter. */

    var i;
    /**
     * 32-bit 整数のビット順を逆にする
     * @param {number} n 32-bit integer.
     * @return {number} reversed 32-bit integer.
     * @private
     */

    function rev32_(n) {
      return Zlib.BitStream.ReverseTable[n & 0xFF] << 24 | Zlib.BitStream.ReverseTable[n >>> 8 & 0xFF] << 16 | Zlib.BitStream.ReverseTable[n >>> 16 & 0xFF] << 8 | Zlib.BitStream.ReverseTable[n >>> 24 & 0xFF];
    }

    if (reverse && n > 1) {
      number = n > 8 ? rev32_(number) >> 32 - n : Zlib.BitStream.ReverseTable[number] >> 8 - n;
    } // Byte 境界を超えないとき


    if (n + bitindex < 8) {
      current = current << n | number;
      bitindex += n; // Byte 境界を超えるとき
    } else {
      for (i = 0; i < n; ++i) {
        current = current << 1 | number >> n - i - 1 & 1; // next byte

        if (++bitindex === 8) {
          bitindex = 0;
          buffer[index++] = Zlib.BitStream.ReverseTable[current];
          current = 0; // expand

          if (index === buffer.length) {
            buffer = this.expandBuffer();
          }
        }
      }
    }

    buffer[index] = current;
    this.buffer = buffer;
    this.bitindex = bitindex;
    this.index = index;
  };
  /**
   * ストリームの終端処理を行う
   * @return {!(Array|Uint8Array)} 終端処理後のバッファを byte array で返す.
   */


  Zlib.BitStream.prototype.finish = function () {
    var buffer = this.buffer;
    var index = this.index;
    /** @type {!(Array|Uint8Array)} output buffer. */

    var output; // bitindex が 0 の時は余分に index が進んでいる状態

    if (this.bitindex > 0) {
      buffer[index] <<= 8 - this.bitindex;
      buffer[index] = Zlib.BitStream.ReverseTable[buffer[index]];
      index++;
    } // array truncation


    {
      output = buffer.subarray(0, index);
    }

    return output;
  };
  /**
   * 0-255 のビット順を反転したテーブル
   * @const
   * @type {!(Uint8Array|Array.<number>)}
   */


  Zlib.BitStream.ReverseTable = function (table) {
    return table;
  }(function () {
    /** @type {!(Array|Uint8Array)} reverse table. */
    var table = new ( Uint8Array )(256);
    /** @type {number} loop counter. */

    var i; // generate

    for (i = 0; i < 256; ++i) {
      table[i] = function (n) {
        var r = n;
        var s = 7;

        for (n >>>= 1; n; n >>>= 1) {
          r <<= 1;
          r |= n & 1;
          --s;
        }

        return (r << s & 0xff) >>> 0;
      }(i);
    }

    return table;
  }());
  /**
   * CRC32 ハッシュ値を取得
   * @param {!(Array.<number>|Uint8Array)} data data byte array.
   * @param {number=} pos data position.
   * @param {number=} length data length.
   * @return {number} CRC32.
   */

  Zlib.CRC32.calc = function (data, pos, length) {
    return Zlib.CRC32.update(data, 0, pos, length);
  };
  /**
   * CRC32ハッシュ値を更新
   * @param {!(Array.<number>|Uint8Array)} data data byte array.
   * @param {number} crc CRC32.
   * @param {number=} pos data position.
   * @param {number=} length data length.
   * @return {number} CRC32.
   */


  Zlib.CRC32.update = function (data, crc, pos, length) {
    var table = Zlib.CRC32.Table;
    var i = typeof pos === 'number' ? pos : pos = 0;
    var il = typeof length === 'number' ? length : data.length;
    crc ^= 0xffffffff; // loop unrolling for performance

    for (i = il & 7; i--; ++pos) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 0xff];
    }

    for (i = il >> 3; i--; pos += 8) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 0xff];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 1]) & 0xff];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 2]) & 0xff];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 3]) & 0xff];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 4]) & 0xff];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 5]) & 0xff];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 6]) & 0xff];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 7]) & 0xff];
    }

    return (crc ^ 0xffffffff) >>> 0;
  };
  /**
   * @param {number} num
   * @param {number} crc
   * @returns {number}
   */


  Zlib.CRC32.single = function (num, crc) {
    return (Zlib.CRC32.Table[(num ^ crc) & 0xff] ^ num >>> 8) >>> 0;
  };
  /**
   * @type {Array.<number>}
   * @const
   * @private
   */


  Zlib.CRC32.Table_ = [0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d];
  /**
   * @type {!(Array.<number>|Uint32Array)} CRC-32 Table.
   * @const
   */

  Zlib.CRC32.Table =   new Uint32Array(Zlib.CRC32.Table_) ;
  /**
   * @fileoverview Deflate (RFC1951) 実装.
   * Deflateアルゴリズム本体は Zlib.RawDeflate で実装されている.
   */

  /**
   * Zlib Deflate
   * @constructor
   * @param {!(Array|Uint8Array)} input 符号化する対象の byte array.
   * @param {Object=} opt_params option parameters.
   */

  Zlib.Deflate = function (input, opt_params) {
    /** @type {!(Array|Uint8Array)} */
    this.input = input;
    /** @type {!(Array|Uint8Array)} */

    this.output = new ( Uint8Array )(Zlib.Deflate.DefaultBufferSize);
    /** @type {Zlib.Deflate.CompressionType} */

    this.compressionType = Zlib.Deflate.CompressionType.DYNAMIC;
    /** @type {Zlib.RawDeflate} */

    this.rawDeflate;
    /** @type {Object} */

    var rawDeflateOption = {};
    /** @type {string} */

    var prop; // option parameters

    if (opt_params || !(opt_params = {})) {
      if (typeof opt_params['compressionType'] === 'number') {
        this.compressionType = opt_params['compressionType'];
      }
    } // copy options


    for (prop in opt_params) {
      rawDeflateOption[prop] = opt_params[prop];
    } // set raw-deflate output buffer


    rawDeflateOption['outputBuffer'] = this.output;
    this.rawDeflate = new Zlib.RawDeflate(this.input, rawDeflateOption);
  };
  /**
   * @const
   * @type {number} デフォルトバッファサイズ.
   */


  Zlib.Deflate.DefaultBufferSize = 0x8000;
  /**
   * @enum {number}
   */

  Zlib.Deflate.CompressionType = Zlib.RawDeflate.CompressionType;
  /**
   * 直接圧縮に掛ける.
   * @param {!(Array|Uint8Array)} input target buffer.
   * @param {Object=} opt_params option parameters.
   * @return {!(Array|Uint8Array)} compressed data byte array.
   */

  Zlib.Deflate.compress = function (input, opt_params) {
    return new Zlib.Deflate(input, opt_params).compress();
  };
  /**
   * Deflate Compression.
   * @return {!(Array|Uint8Array)} compressed data byte array.
   */


  Zlib.Deflate.prototype.compress = function () {
    /** @type {Zlib.CompressionMethod} */
    var cm;
    /** @type {number} */

    var cinfo;
    /** @type {number} */

    var cmf;
    /** @type {number} */

    var flg;
    /** @type {number} */

    var fcheck;
    /** @type {number} */

    var fdict;
    /** @type {number} */

    var flevel;
    /** @type {number} */

    var adler;
    /** @type {!(Array|Uint8Array)} */

    var output;
    /** @type {number} */

    var pos = 0;
    output = this.output; // Compression Method and Flags

    cm = Zlib.CompressionMethod.DEFLATE;

    switch (cm) {
      case Zlib.CompressionMethod.DEFLATE:
        cinfo = Math.LOG2E * Math.log(Zlib.RawDeflate.WindowSize) - 8;
        break;

      default:
        throw new Error('invalid compression method');
    }

    cmf = cinfo << 4 | cm;
    output[pos++] = cmf; // Flags

    fdict = 0;

    switch (cm) {
      case Zlib.CompressionMethod.DEFLATE:
        switch (this.compressionType) {
          case Zlib.Deflate.CompressionType.NONE:
            flevel = 0;
            break;

          case Zlib.Deflate.CompressionType.FIXED:
            flevel = 1;
            break;

          case Zlib.Deflate.CompressionType.DYNAMIC:
            flevel = 2;
            break;

          default:
            throw new Error('unsupported compression type');
        }

        break;

      default:
        throw new Error('invalid compression method');
    }

    flg = flevel << 6 | fdict << 5;
    fcheck = 31 - (cmf * 256 + flg) % 31;
    flg |= fcheck;
    output[pos++] = flg; // Adler-32 checksum

    adler = Zlib.Adler32(this.input);
    this.rawDeflate.op = pos;
    output = this.rawDeflate.compress();
    pos = output.length;

    {
      // subarray 分を元にもどす
      output = new Uint8Array(output.buffer); // expand buffer

      if (output.length <= pos + 4) {
        this.output = new Uint8Array(output.length + 4);
        this.output.set(output);
        output = this.output;
      }

      output = output.subarray(0, pos + 4);
    } // adler32


    output[pos++] = adler >> 24 & 0xff;
    output[pos++] = adler >> 16 & 0xff;
    output[pos++] = adler >> 8 & 0xff;
    output[pos++] = adler & 0xff;
    return output;
  };

  var isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  var crossFetch = isNode ? require("node-fetch") : fetch;

  var BrowserLocalFile =
  /*#__PURE__*/
  function () {
    function BrowserLocalFile(blob) {
      _classCallCheck(this, BrowserLocalFile);

      this.file = blob;
    }

    _createClass(BrowserLocalFile, [{
      key: "read",
      value: function () {
        var _read = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(position, length) {
          var file;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  file = this.file;
                  return _context.abrupt("return", new Promise(function (fullfill, reject) {
                    var fileReader = new FileReader();

                    fileReader.onload = function (e) {
                      fullfill(fileReader.result);
                    };

                    fileReader.onerror = function (e) {
                      console.err("Error reading local file " + file.name);
                      reject(null, fileReader);
                    };

                    if (position !== undefined) {
                      var blob = file.slice(position, position + length);
                      fileReader.readAsArrayBuffer(blob);
                    } else {
                      fileReader.readAsArrayBuffer(file);
                    }
                  }));

                case 2:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function read(_x, _x2) {
          return _read.apply(this, arguments);
        }

        return read;
      }()
    }]);

    return BrowserLocalFile;
  }();

  var isNode$1 = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

  var RemoteFile =
  /*#__PURE__*/
  function () {
    function RemoteFile(args) {
      _classCallCheck(this, RemoteFile);

      this.config = args;
      this.url = mapUrl(args.path || args.url);
    }

    _createClass(RemoteFile, [{
      key: "read",
      value: function () {
        var _read = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2(position, length) {
          var headers, rangeString, url, token, isSafari, isChrome, isAmazonV4Signed, response, status, err, resolveToken, _resolveToken;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _resolveToken = function _ref2() {
                    _resolveToken = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee(token) {
                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              if (!(typeof token === 'function')) {
                                _context.next = 6;
                                break;
                              }

                              _context.next = 3;
                              return Promise.resolve(token());

                            case 3:
                              return _context.abrupt("return", _context.sent);

                            case 6:
                              return _context.abrupt("return", token);

                            case 7:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee);
                    }));
                    return _resolveToken.apply(this, arguments);
                  };

                  resolveToken = function _ref(_x3) {
                    return _resolveToken.apply(this, arguments);
                  };

                  headers = this.config.headers || {};
                  rangeString = "bytes=" + position + "-" + (position + length - 1);
                  headers['Range'] = rangeString;
                  url = this.url.slice(); // slice => copy

                  if (isNode$1) {
                    headers['User-Agent'] = 'straw';
                  } else {
                    if (this.config.oauthToken) {
                      token = resolveToken(this.config.oauthToken);
                      headers['Authorization'] = "Bearer ".concat(token);
                    }

                    isSafari = navigator.vendor.indexOf("Apple") == 0 && /\sSafari\//.test(navigator.userAgent);
                    isChrome = navigator.userAgent.indexOf('Chrome') > -1;
                    isAmazonV4Signed = this.url.indexOf("X-Amz-Signature") > -1;

                    if (isChrome && !isAmazonV4Signed) {
                      url = addParameter(url, "randomSeed", Math.random().toString(36));
                    }
                  }

                  if (this.config.apiKey) {
                    url = addParameter(url, "key", this.config.apiKey);
                  }

                  _context2.next = 10;
                  return crossFetch(url, {
                    method: 'GET',
                    headers: headers,
                    redirect: 'follow',
                    mode: 'cors'
                  });

                case 10:
                  response = _context2.sent;
                  status = response.status;

                  if (!(status >= 400)) {
                    _context2.next = 18;
                    break;
                  }

                  err = Error(response.statusText);
                  err.code = status;
                  throw err;

                case 18:
                  return _context2.abrupt("return", response.arrayBuffer());

                case 19:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function read(_x, _x2) {
          return _read.apply(this, arguments);
        }

        return read;
      }()
    }]);

    return RemoteFile;
  }();

  function mapUrl(url) {
    if (url.includes("//www.dropbox.com")) {
      return url.replace("//www.dropbox.com", "//dl.dropboxusercontent.com");
    } else if (url.startsWith("ftp://ftp.ncbi.nlm.nih.gov")) {
      return url.replace("ftp://", "https://");
    } else {
      return url;
    }
  }

  function addParameter(url, name, value) {
    var paramSeparator = url.includes("?") ? "&" : "?";
    return url + paramSeparator + name + "=" + value;
  }

  var ThrottledFile =
  /*#__PURE__*/
  function () {
    function ThrottledFile(file, rateLimiter) {
      _classCallCheck(this, ThrottledFile);

      this.file = file;
      this.rateLimiter = rateLimiter;
    }

    _createClass(ThrottledFile, [{
      key: "read",
      value: function () {
        var _read = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2(position, length) {
          var file, rateLimiter;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  file = this.file;
                  rateLimiter = this.rateLimiter;
                  return _context2.abrupt("return", new Promise(function (fulfill, reject) {
                    rateLimiter.limiter(
                    /*#__PURE__*/
                    function () {
                      var _ref = _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee(f) {
                        var result;
                        return regeneratorRuntime.wrap(function _callee$(_context) {
                          while (1) {
                            switch (_context.prev = _context.next) {
                              case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return f.read(position, length);

                              case 3:
                                result = _context.sent;
                                fulfill(result);
                                _context.next = 10;
                                break;

                              case 7:
                                _context.prev = 7;
                                _context.t0 = _context["catch"](0);
                                reject(_context.t0);

                              case 10:
                              case "end":
                                return _context.stop();
                            }
                          }
                        }, _callee, null, [[0, 7]]);
                      }));

                      return function (_x3) {
                        return _ref.apply(this, arguments);
                      };
                    }())(file);
                  }));

                case 3:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function read(_x, _x2) {
          return _read.apply(this, arguments);
        }

        return read;
      }()
    }]);

    return ThrottledFile;
  }();

  var RateLimiter =
  /*#__PURE__*/
  function () {
    function RateLimiter(wait) {
      _classCallCheck(this, RateLimiter);

      this.wait = wait === undefined ? 100 : wait;
      this.isCalled = false;
      this.calls = [];
    }

    _createClass(RateLimiter, [{
      key: "limiter",
      value: function limiter(fn) {
        var self = this;

        var caller = function caller() {
          if (self.calls.length && !self.isCalled) {
            self.isCalled = true;
            self.calls.shift().call();
            setTimeout(function () {
              self.isCalled = false;
              caller();
            }, self.wait);
          }
        };

        return function () {
          self.calls.push(fn.bind.apply(fn, [this].concat(Array.prototype.slice.call(arguments))));
          caller();
        };
      }
    }]);

    return RateLimiter;
  }();

  var BufferedFile =
  /*#__PURE__*/
  function () {
    function BufferedFile(args) {
      _classCallCheck(this, BufferedFile);

      this.file = args.file;
      this.size = args.size || 64000;
      this.position = 0;
      this.bufferStart = 0;
      this.bufferLength = 0;
      this.buffer = undefined;
    }

    _createClass(BufferedFile, [{
      key: "read",
      value: function () {
        var _read = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(position, length) {
          var start, end, bufferStart, bufferEnd, sliceStart, sliceEnd, l1, a1, l2, a2, _l, _sliceStart, _a, _l2, _a2;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  start = position;
                  end = position + length;
                  bufferStart = this.bufferStart;
                  bufferEnd = this.bufferStart + this.bufferLength;

                  if (!(length > this.size)) {
                    _context.next = 9;
                    break;
                  }

                  // Request larger than max buffer size,  pass through to underlying file
                  //console.log("0")
                  this.buffer = undefined;
                  this.bufferStart = 0;
                  this.bufferLength = 0;
                  return _context.abrupt("return", this.file.read(position, length));

                case 9:
                  if (!(start >= bufferStart && end <= bufferEnd)) {
                    _context.next = 15;
                    break;
                  }

                  // Request within buffer bounds
                  //console.log("1")
                  sliceStart = start - bufferStart;
                  sliceEnd = sliceStart + length;
                  return _context.abrupt("return", this.buffer.slice(sliceStart, sliceEnd));

                case 15:
                  if (!(start < bufferStart && end > bufferStart)) {
                    _context.next = 29;
                    break;
                  }

                  // Overlap left, here for completness but this is an unexpected case in straw.  We don't adjust the buffer.
                  //console.log("2")
                  l1 = bufferStart - start;
                  _context.next = 19;
                  return this.file.read(position, l1);

                case 19:
                  a1 = _context.sent;
                  l2 = length - l1;

                  if (!(l2 > 0)) {
                    _context.next = 26;
                    break;
                  }

                  //this.buffer = await this.file.read(bufferStart, this.size)
                  a2 = this.buffer.slice(0, l2);
                  return _context.abrupt("return", concatBuffers(a1, a2));

                case 26:
                  return _context.abrupt("return", a1);

                case 27:
                  _context.next = 63;
                  break;

                case 29:
                  if (!(start < bufferEnd && end > bufferEnd)) {
                    _context.next = 57;
                    break;
                  }

                  // Overlap right
                  // console.log("3")
                  _l = bufferEnd - start;
                  _sliceStart = this.bufferLength - _l;
                  _a = this.buffer.slice(_sliceStart, this.bufferLength);
                  _l2 = length - _l;

                  if (!(_l2 > 0)) {
                    _context.next = 54;
                    break;
                  }

                  _context.prev = 35;
                  _context.next = 38;
                  return this.file.read(bufferEnd, this.size);

                case 38:
                  this.buffer = _context.sent;
                  this.bufferStart = bufferEnd;
                  this.bufferLength = this.buffer.byteLength;
                  _a2 = this.buffer.slice(0, _l2);
                  return _context.abrupt("return", concatBuffers(_a, _a2));

                case 45:
                  _context.prev = 45;
                  _context.t0 = _context["catch"](35);

                  if (!(_context.t0.code && _context.t0.code === 416)) {
                    _context.next = 51;
                    break;
                  }

                  return _context.abrupt("return", _a);

                case 51:
                  throw _context.t0;

                case 52:
                  _context.next = 55;
                  break;

                case 54:
                  return _context.abrupt("return", _a);

                case 55:
                  _context.next = 63;
                  break;

                case 57:
                  _context.next = 59;
                  return this.file.read(position, this.size);

                case 59:
                  this.buffer = _context.sent;
                  this.bufferStart = position;
                  this.bufferLength = this.buffer.byteLength;
                  return _context.abrupt("return", this.buffer.slice(0, length));

                case 63:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[35, 45]]);
        }));

        function read(_x, _x2) {
          return _read.apply(this, arguments);
        }

        return read;
      }()
    }]);

    return BufferedFile;
  }();
  /**
   * concatenates 2 array buffers.
   * Credit: https://gist.github.com/72lions/4528834
   *
   * @private
   * @param {ArrayBuffers} buffer1 The first buffer.
   * @param {ArrayBuffers} buffer2 The second buffer.
   * @return {ArrayBuffers} The new ArrayBuffer created out of the two.
   */


  var concatBuffers = function concatBuffers(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  };

  // TODO -- big endian
  var BinaryParser = function BinaryParser(dataView, littleEndian) {
    this.littleEndian = littleEndian !== undefined ? littleEndian : true;
    this.position = 0;
    this.view = dataView;
    this.length = dataView.byteLength;
  };

  BinaryParser.prototype.available = function () {
    return this.length - this.position;
  };

  BinaryParser.prototype.remLength = function () {
    return this.length - this.position;
  };

  BinaryParser.prototype.hasNext = function () {
    return this.position < this.length - 1;
  };

  BinaryParser.prototype.getByte = function () {
    var retValue = this.view.getUint8(this.position, this.littleEndian);
    this.position++;
    return retValue;
  };

  BinaryParser.prototype.getShort = function () {
    var retValue = this.view.getInt16(this.position, this.littleEndian);
    this.position += 2;
    return retValue;
  };

  BinaryParser.prototype.getUShort = function () {
    // var byte1 = this.getByte(),
    //     byte2 = this.getByte(),
    //     retValue = ((byte2 << 24 >>> 16) + (byte1 << 24 >>> 24));
    //     return retValue;
    //
    var retValue = this.view.getUint16(this.position, this.littleEndian);
    this.position += 2;
    return retValue;
  };

  BinaryParser.prototype.getInt = function () {
    var retValue = this.view.getInt32(this.position, this.littleEndian);
    this.position += 4;
    return retValue;
  };

  BinaryParser.prototype.getUInt = function () {
    var retValue = this.view.getUint32(this.position, this.littleEndian);
    this.position += 4;
    return retValue;
  };

  BinaryParser.prototype.getLong = function () {
    // DataView doesn't support long. So we'll try manually
    var b = [];
    b[0] = this.view.getUint8(this.position);
    b[1] = this.view.getUint8(this.position + 1);
    b[2] = this.view.getUint8(this.position + 2);
    b[3] = this.view.getUint8(this.position + 3);
    b[4] = this.view.getUint8(this.position + 4);
    b[5] = this.view.getUint8(this.position + 5);
    b[6] = this.view.getUint8(this.position + 6);
    b[7] = this.view.getUint8(this.position + 7);
    var value = 0;

    if (this.littleEndian) {
      for (var i = b.length - 1; i >= 0; i--) {
        value = value * 256 + b[i];
      }
    } else {
      for (var i = 0; i < b.length; i++) {
        value = value * 256 + b[i];
      }
    }

    this.position += 8;
    return value;
  };

  BinaryParser.prototype.getString = function (len) {
    var s = "";
    var c;

    while ((c = this.view.getUint8(this.position++)) != 0) {
      s += String.fromCharCode(c);
      if (len && s.length == len) break;
    }

    return s;
  };

  BinaryParser.prototype.getFixedLengthString = function (len) {
    var s = "";
    var i;
    var c;

    for (i = 0; i < len; i++) {
      c = this.view.getUint8(this.position++);

      if (c > 0) {
        s += String.fromCharCode(c);
      }
    }

    return s;
  };

  BinaryParser.prototype.getFixedLengthTrimmedString = function (len) {
    var s = "";
    var i;
    var c;

    for (i = 0; i < len; i++) {
      c = this.view.getUint8(this.position++);

      if (c > 32) {
        s += String.fromCharCode(c);
      }
    }

    return s;
  };

  BinaryParser.prototype.getFloat = function () {
    var retValue = this.view.getFloat32(this.position, this.littleEndian);
    this.position += 4;
    return retValue;
  };

  BinaryParser.prototype.getDouble = function () {
    var retValue = this.view.getFloat64(this.position, this.littleEndian);
    this.position += 8;
    return retValue;
  };

  BinaryParser.prototype.skip = function (n) {
    this.position += n;
    return this.position;
  };
  /**
   * Return a bgzip (bam and tabix) virtual pointer
   * TODO -- why isn't 8th byte used ?
   * @returns {*}
   */


  BinaryParser.prototype.getVPointer = function () {
    var position = this.position,
        offset = this.view.getUint8(position + 1) << 8 | this.view.getUint8(position),
        byte6 = (this.view.getUint8(position + 6) & 0xff) * 0x100000000,
        byte5 = (this.view.getUint8(position + 5) & 0xff) * 0x1000000,
        byte4 = (this.view.getUint8(position + 4) & 0xff) * 0x10000,
        byte3 = (this.view.getUint8(position + 3) & 0xff) * 0x100,
        byte2 = this.view.getUint8(position + 2) & 0xff,
        block = byte6 + byte5 + byte4 + byte3 + byte2;
    this.position += 8; //       if (block == 0 && offset == 0) {
    //           return null;
    //       } else {

    return new VPointer(block, offset); //       }
  };

  function VPointer(block, offset) {
    this.block = block;
    this.offset = offset;
  }

  VPointer.prototype.isLessThan = function (vp) {
    return this.block < vp.block || this.block === vp.block && this.offset < vp.offset;
  };

  VPointer.prototype.isGreaterThan = function (vp) {
    return this.block > vp.block || this.block === vp.block && this.offset > vp.offset;
  };

  VPointer.prototype.print = function () {
    return "" + this.block + ":" + this.offset;
  };

  var Matrix =
  /*#__PURE__*/
  function () {
    function Matrix(chr1, chr2, zoomDataList) {
      _classCallCheck(this, Matrix);

      var self = this;
      this.chr1 = chr1;
      this.chr2 = chr2;
      this.bpZoomData = [];
      this.fragZoomData = [];
      zoomDataList.forEach(function (zd) {
        if (zd.zoom.unit === "BP") {
          self.bpZoomData.push(zd);
        } else {
          self.fragZoomData.push(zd);
        }
      });
    }

    _createClass(Matrix, [{
      key: "getZoomDataByIndex",
      value: function getZoomDataByIndex(index, unit) {
        var zdArray = "FRAG" === unit ? this.fragZoomData : this.bpZoomData;
        return zdArray[index];
      }
    }, {
      key: "findZoomForResolution",
      value: function findZoomForResolution(binSize, unit) {
        var zdArray = "FRAG" === unit ? this.fragZoomData : this.bpZoomData;

        for (var i = 1; i < zdArray.length; i++) {
          var zd = zdArray[i];

          if (zd.zoom.binSize < binSize) {
            return i - 1;
          }
        }

        return zdArray.length - 1;
      } // Legacy implementation, used only in tests.

    }, {
      key: "getZoomData",
      value: function getZoomData(zoom) {
        var zdArray = zoom.unit === "BP" ? this.bpZoomData : this.fragZoomData;

        for (var i = 0; i < zdArray.length; i++) {
          var zd = zdArray[i];

          if (zoom.binSize === zd.zoom.binSize) {
            return zd;
          }
        }

        return undefined;
      }
    }]);

    return Matrix;
  }();

  var MatrixZoomData =
  /*#__PURE__*/
  function () {
    function MatrixZoomData(chr1, chr2, zoom, blockBinCount, blockColumnCount, chr1Sites, chr2Sites) {
      _classCallCheck(this, MatrixZoomData);

      this.chr1 = chr1; // chromosome index

      this.chr2 = chr2;
      this.zoom = zoom;
      this.blockBinCount = blockBinCount;
      this.blockColumnCount = blockColumnCount;
      this.chr1Sites = chr1Sites;
      this.chr2Sites = chr2Sites;
    }

    _createClass(MatrixZoomData, [{
      key: "getKey",
      value: function getKey() {
        return this.chr1.name + "_" + this.chr2.name + "_" + this.zoom.unit + "_" + this.zoom.binSize;
      }
    }]);

    return MatrixZoomData;
  }();

  /*
   *  The MIT License (MIT)
   *
   * Copyright (c) 2016-2017 The Regents of the University of California
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
   * associated documentation files (the "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
   * following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all copies or substantial
   * portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
   * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
   * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
   * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
   * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *
   */

  /**
   * @author Jim Robinson
   */
  var NormalizationVector =
  /*#__PURE__*/
  function () {
    function NormalizationVector(type, chrIdx, unit, resolution, values) {
      _classCallCheck(this, NormalizationVector);

      var avg = mean(values),
          i;

      if (avg > 0) {
        for (i = 0; i < values.length; i++) {
          values[i] /= avg;
        }
      }

      this.type = type;
      this.chrIdx = chrIdx;
      this.unit = unit;
      this.resolution = resolution;
      this.data = values;
    }

    _createClass(NormalizationVector, [{
      key: "getKey",
      value: function getKey() {
        return NormalizationVector.getKey(this.type, this.chrIdx, this.unit, this.resolution);
      }
    }], [{
      key: "getNormalizationVectorKey",
      value: function getNormalizationVectorKey(type, chrIdx, unit, resolution) {
        return type + "_" + chrIdx + "_" + unit + "_" + resolution;
      }
    }]);

    return NormalizationVector;
  }();

  function mean(array) {
    var t = 0,
        n = 0,
        i;

    for (i = 0; i < array.length; i++) {
      if (!isNaN(array[i])) {
        t += array[i];
        n++;
      }
    }

    return n > 0 ? t / n : 0;
  }

  var ContactRecord =
  /*#__PURE__*/
  function () {
    function ContactRecord(bin1, bin2, counts) {
      _classCallCheck(this, ContactRecord);

      this.bin1 = bin1;
      this.bin2 = bin2;
      this.counts = counts;
    }

    _createClass(ContactRecord, [{
      key: "getKey",
      value: function getKey() {
        return "" + this.bin1 + "_" + this.bin2;
      }
    }]);

    return ContactRecord;
  }();

  var Short_MIN_VALUE = -32768;
  var googleRateLimiter = new RateLimiter(100);

  var Block = function Block(blockNumber, zoomData, records, idx) {
    _classCallCheck(this, Block);

    this.blockNumber = blockNumber;
    this.zoomData = zoomData;
    this.records = records;
    this.idx = idx;
  };

  var HicFile =
  /*#__PURE__*/
  function () {
    function HicFile(args) {
      _classCallCheck(this, HicFile);

      this.config = args;
      this.loadFragData = args.loadFragData;
      this.fragmentSitesCache = {};
      this.normVectorCache = {};
      this.normalizationTypes = ['NONE']; // args may specify an io.File object, a local path (Node only), or a url

      if (args.file) {
        this.file = args.file;
      } else if (args.blob) {
        this.file = new BrowserLocalFile(args.blob);
      } else {
        this.url = args.path || args.url;

        if (this.url.startsWith("http://") || this.url.startsWith("https://")) {
          this.remote = true; // Google drive must be rate limited.  Perhaps all

          var remoteFile = new RemoteFile(args);

          if (isGoogleDrive(this.url)) {
            this.file = new ThrottledFile(remoteFile, googleRateLimiter);
          } else {
            this.file = remoteFile;
          }
        } else {
          throw Error("Arguments must include file, blob, or url");
        }
      }
    }

    _createClass(HicFile, [{
      key: "init",
      value: function () {
        var _init = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!this.initialized) {
                    _context.next = 4;
                    break;
                  }

                  return _context.abrupt("return");

                case 4:
                  _context.next = 6;
                  return this.readHeader();

                case 6:
                  _context.next = 8;
                  return this.readFooter();

                case 8:
                  this.initialized = true;

                case 9:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function init() {
          return _init.apply(this, arguments);
        }

        return init;
      }()
    }, {
      key: "getMetaData",
      value: function () {
        var _getMetaData = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return this.init();

                case 2:
                  return _context2.abrupt("return", this.meta);

                case 3:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function getMetaData() {
          return _getMetaData.apply(this, arguments);
        }

        return getMetaData;
      }()
    }, {
      key: "readHeader",
      value: function () {
        var _readHeader = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3() {
          var data, binaryParser, nAttributes, nChrs, i, chr, nBpResolutions, nFragResolutions, nSites, _i, _Object$keys, chrName;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return this.file.read(0, 64000);

                case 2:
                  data = _context3.sent;

                  if (data) {
                    _context3.next = 5;
                    break;
                  }

                  return _context3.abrupt("return", undefined);

                case 5:
                  binaryParser = new BinaryParser(new DataView(data));
                  this.magic = binaryParser.getString();
                  this.version = binaryParser.getInt();
                  this.masterIndexPos = binaryParser.getLong();
                  this.genomeId = binaryParser.getString();
                  this.attributes = {};
                  nAttributes = binaryParser.getInt();

                  while (nAttributes-- > 0) {
                    this.attributes[binaryParser.getString()] = binaryParser.getString();
                  }

                  this.chromosomes = [];
                  this.chromosomeIndexMap = {};
                  nChrs = binaryParser.getInt();
                  i = 0;

                  while (nChrs-- > 0) {
                    chr = {
                      index: i,
                      name: binaryParser.getString(),
                      size: binaryParser.getInt()
                    };

                    if (chr.name.toLowerCase() === "all") {
                      this.wholeGenomeChromosome = chr;
                      this.wholeGenomeResolution = Math.round(chr.size * (1000 / 500)); // Hardcoded in juicer
                    }

                    this.chromosomes.push(chr);
                    this.chromosomeIndexMap[chr.name] = chr.index;
                    i++;
                  }

                  this.bpResolutions = [];
                  nBpResolutions = binaryParser.getInt();

                  while (nBpResolutions-- > 0) {
                    this.bpResolutions.push(binaryParser.getInt());
                  }

                  if (this.loadFragData) {
                    this.fragResolutions = [];
                    nFragResolutions = binaryParser.getInt();

                    while (nFragResolutions-- > 0) {
                      this.fragResolutions.push(binaryParser.getInt());
                    }

                    if (nFragResolutions > 0) {
                      this.sites = [];
                      nSites = binaryParser.getInt();

                      while (nSites-- > 0) {
                        this.sites.push(binaryParser.getInt());
                      }
                    }
                  } // Build lookup table for well-known chr aliases


                  this.chrAliasTable = {};

                  for (_i = 0, _Object$keys = Object.keys(this.chromosomeIndexMap); _i < _Object$keys.length; _i++) {
                    chrName = _Object$keys[_i];

                    if (chrName.startsWith("chr")) {
                      this.chrAliasTable[chrName.substr(3)] = chrName;
                    } else if (chrName === "MT") {
                      this.chrAliasTable["chrM"] = chrName;
                    } else {
                      this.chrAliasTable["chr" + chrName] = chrName;
                    }
                  } // Meta data for the API


                  this.meta = {
                    "version": this.version,
                    "genome": this.genomeId,
                    "chromosomes": this.chromosomes,
                    "resolutions": this.bpResolutions
                  };

                case 25:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function readHeader() {
          return _readHeader.apply(this, arguments);
        }

        return readHeader;
      }()
    }, {
      key: "readFooter",
      value: function () {
        var _readFooter = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4() {
          var data, binaryParser, nBytes, nEntries, miSize, range, key, pos, size;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return this.file.read(this.masterIndexPos, 8);

                case 2:
                  data = _context4.sent;

                  if (data) {
                    _context4.next = 5;
                    break;
                  }

                  return _context4.abrupt("return", null);

                case 5:
                  binaryParser = new BinaryParser(new DataView(data));
                  nBytes = binaryParser.getInt(); // Total size, master index + expected values

                  nEntries = binaryParser.getInt(); // Estimate the size of the master index. String length of key is unknown, be conservative (100 bytes)

                  miSize = nEntries * (100 + 64 + 32);
                  range = {
                    start: this.masterIndexPos + 8,
                    size: Math.min(miSize, nBytes - 4)
                  };
                  _context4.next = 12;
                  return this.file.read(this.masterIndexPos + 8, Math.min(miSize, nBytes - 4));

                case 12:
                  data = _context4.sent;
                  binaryParser = new BinaryParser(new DataView(data));
                  this.masterIndex = {};

                  while (nEntries-- > 0) {
                    key = binaryParser.getString();
                    pos = binaryParser.getLong();
                    size = binaryParser.getInt();
                    this.masterIndex[key] = {
                      start: pos,
                      size: size
                    };
                  }

                  this.expectedValueVectors = {};
                  nEntries = binaryParser.getInt(); // Expected values
                  // while (nEntries-- > 0) {
                  //     type = "NONE";
                  //     unit = binaryParser.getString();
                  //     binSize = binaryParser.getInt();
                  //     nValues = binaryParser.getInt();
                  //     values = [];
                  //     while (nValues-- > 0) {
                  //         values.push(binaryParser.getDouble());
                  //     }
                  //
                  //     nChrScaleFactors = binaryParser.getInt();
                  //     normFactors = {};
                  //     while (nChrScaleFactors-- > 0) {
                  //         normFactors[binaryParser.getInt()] = binaryParser.getDouble();
                  //     }
                  //
                  //     // key = unit + "_" + binSize + "_" + type;
                  //     //  NOT USED YET SO DON'T STORE
                  //     //  dataset.expectedValueVectors[key] =
                  //     //      new ExpectedValueFunction(type, unit, binSize, values, normFactors);
                  // }

                  this.normExpectedValueVectorsPosition = this.masterIndexPos + 4 + nBytes;
                  return _context4.abrupt("return", this);

                case 20:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function readFooter() {
          return _readFooter.apply(this, arguments);
        }

        return readFooter;
      }()
    }, {
      key: "readMatrix",
      value: function () {
        var _readMatrix = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee5(chrIdx1, chrIdx2) {
          var tmp, key, idx, data, dis, c1, c2, chr1, chr2, nResolutions, zdList, sites1, sites2, bytesAvailable, filePosition, zd, bytesUsed;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return this.init();

                case 2:
                  if (chrIdx1 > chrIdx2) {
                    tmp = chrIdx1;
                    chrIdx1 = chrIdx2;
                    chrIdx2 = tmp;
                  }

                  key = "" + chrIdx1 + "_" + chrIdx2;
                  idx = this.masterIndex[key];

                  if (idx) {
                    _context5.next = 7;
                    break;
                  }

                  return _context5.abrupt("return", undefined);

                case 7:
                  _context5.next = 9;
                  return this.file.read(idx.start, idx.size);

                case 9:
                  data = _context5.sent;

                  if (data) {
                    _context5.next = 12;
                    break;
                  }

                  return _context5.abrupt("return", undefined);

                case 12:
                  dis = new BinaryParser(new DataView(data));
                  c1 = dis.getInt(); // Should equal chrIdx1

                  c2 = dis.getInt(); // Should equal chrIdx2
                  // TODO validate this

                  chr1 = this.chromosomes[c1];
                  chr2 = this.chromosomes[c2]; // # of resolution levels (bp and frags)

                  nResolutions = dis.getInt();
                  zdList = [];
                  _context5.next = 21;
                  return this.getSites.call(this, chr1.name);

                case 21:
                  sites1 = _context5.sent;
                  _context5.next = 24;
                  return this.getSites.call(this, chr2.name);

                case 24:
                  sites2 = _context5.sent;
                  bytesAvailable = dis.available();
                  filePosition = idx.start;

                  while (nResolutions-- > 0) {
                    zd = parseMatixZoomData(chr1, chr2, sites1, sites2, dis);
                    bytesUsed = bytesAvailable - dis.available();
                    zd.idx = {
                      start: filePosition,
                      size: bytesUsed
                    };
                    bytesAvailable = dis.available();
                    zdList.push(zd); //console.log(`zd${z++}: ${bytesUsed}`)
                  }

                  return _context5.abrupt("return", new Matrix(chrIdx1, chrIdx2, zdList));

                case 30:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function readMatrix(_x, _x2) {
          return _readMatrix.apply(this, arguments);
        }

        return readMatrix;
      }()
      /***
       * Return the raw data for the block.  Function provided for testing and development
       * @param blockNumber
       * @param zd
       * @returns {Promise<void>}
       */

    }, {
      key: "readBlockData",
      value: function () {
        var _readBlockData = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee6(blockNumber, zd) {
          var idx, blockIndex;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  idx = null;
                  blockIndex = zd.blockIndexMap;

                  if (blockIndex) {
                    idx = blockIndex[blockNumber];
                  }

                  if (idx) {
                    _context6.next = 7;
                    break;
                  }

                  return _context6.abrupt("return", undefined);

                case 7:
                  return _context6.abrupt("return", this.file.read(idx.filePosition, idx.size));

                case 8:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        function readBlockData(_x3, _x4) {
          return _readBlockData.apply(this, arguments);
        }

        return readBlockData;
      }()
    }, {
      key: "readBlock",
      value: function () {
        var _readBlock = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee7(blockNumber, zd) {
          var self, idx, i, j, blockIndex, data, inflate, plain, parser, nRecords, records, binX, binY, counts, binXOffset, binYOffset, useShort, type, rowCount, colCount, nPts, w, row, col, bin1, bin2;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  self = this, idx = null;
                  blockIndex = zd.blockIndexMap;

                  if (blockIndex) {
                    idx = blockIndex[blockNumber];
                  }

                  if (idx) {
                    _context7.next = 7;
                    break;
                  }

                  return _context7.abrupt("return", undefined);

                case 7:
                  _context7.next = 9;
                  return this.file.read(idx.filePosition, idx.size);

                case 9:
                  data = _context7.sent;

                  if (data) {
                    _context7.next = 12;
                    break;
                  }

                  return _context7.abrupt("return", undefined);

                case 12:
                  inflate = new Zlib.Inflate(new Uint8Array(data));
                  plain = inflate.decompress(); //var plain = zlib.inflateSync(Buffer.from(data))   //.decompress();

                  data = plain.buffer;
                  parser = new BinaryParser(new DataView(data));
                  nRecords = parser.getInt();
                  records = [];

                  if (!(self.version < 7)) {
                    _context7.next = 22;
                    break;
                  }

                  for (i = 0; i < nRecords; i++) {
                    binX = parser.getInt();
                    binY = parser.getInt();
                    counts = parser.getFloat();
                    records.push(new ContactRecord(binX, binY, counts));
                  }

                  _context7.next = 38;
                  break;

                case 22:
                  binXOffset = parser.getInt();
                  binYOffset = parser.getInt();
                  useShort = parser.getByte() == 0;
                  type = parser.getByte();

                  if (!(type === 1)) {
                    _context7.next = 31;
                    break;
                  }

                  // List-of-rows representation
                  rowCount = parser.getShort();

                  for (i = 0; i < rowCount; i++) {
                    binY = binYOffset + parser.getShort();
                    colCount = parser.getShort();

                    for (j = 0; j < colCount; j++) {
                      binX = binXOffset + parser.getShort();
                      counts = useShort ? parser.getShort() : parser.getFloat();
                      records.push(new ContactRecord(binX, binY, counts));
                    }
                  }

                  _context7.next = 38;
                  break;

                case 31:
                  if (!(type == 2)) {
                    _context7.next = 37;
                    break;
                  }

                  nPts = parser.getInt();
                  w = parser.getShort();

                  for (i = 0; i < nPts; i++) {
                    //int idx = (p.y - binOffset2) * w + (p.x - binOffset1);
                    row = Math.floor(i / w);
                    col = i - row * w;
                    bin1 = binXOffset + col;
                    bin2 = binYOffset + row;

                    if (useShort) {
                      counts = parser.getShort();

                      if (counts != Short_MIN_VALUE) {
                        records.push(new ContactRecord(bin1, bin2, counts));
                      }
                    } else {
                      counts = parser.getFloat();

                      if (!isNaN(counts)) {
                        records.push(new ContactRecord(bin1, bin2, counts));
                      }
                    }
                  }

                  _context7.next = 38;
                  break;

                case 37:
                  throw new Error("Unknown block type: " + type);

                case 38:
                  return _context7.abrupt("return", new Block(blockNumber, zd, records, idx));

                case 39:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));

        function readBlock(_x5, _x6) {
          return _readBlock.apply(this, arguments);
        }

        return readBlock;
      }()
    }, {
      key: "getSites",
      value: function () {
        var _getSites = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee8(chrName) {
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  return _context8.abrupt("return", undefined);

                case 1:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8);
        }));

        function getSites(_x7) {
          return _getSites.apply(this, arguments);
        }

        return getSites;
      }()
    }, {
      key: "getNormalizationVector",
      value: function () {
        var _getNormalizationVector = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee9(type, chr, unit, binSize) {
          var chrIdx, canonicalName, key, normVectorIndex, idx, data, parser, nValues, values, allNaN, i;
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  _context9.next = 2;
                  return this.init();

                case 2:
                  if (Number.isInteger(chr)) {
                    chrIdx = chr;
                  } else {
                    canonicalName = this.getFileChrName(chr);
                    chrIdx = this.chromosomeIndexMap[canonicalName];
                  }

                  key = getNormalizationVectorKey(type, chrIdx, unit.toString(), binSize);

                  if (!this.normVectorCache.hasOwnProperty(key)) {
                    _context9.next = 6;
                    break;
                  }

                  return _context9.abrupt("return", Promise.resolve(this.normVectorCache[key]));

                case 6:
                  _context9.next = 8;
                  return this.getNormVectorIndex();

                case 8:
                  normVectorIndex = _context9.sent;

                  if (normVectorIndex) {
                    _context9.next = 11;
                    break;
                  }

                  return _context9.abrupt("return", undefined);

                case 11:
                  idx = normVectorIndex[key];

                  if (idx) {
                    _context9.next = 14;
                    break;
                  }

                  return _context9.abrupt("return", undefined);

                case 14:
                  _context9.next = 16;
                  return this.file.read(idx.filePosition, idx.size);

                case 16:
                  data = _context9.sent;

                  if (data) {
                    _context9.next = 19;
                    break;
                  }

                  return _context9.abrupt("return", undefined);

                case 19:
                  parser = new BinaryParser(new DataView(data));
                  nValues = parser.getInt();
                  values = [];
                  allNaN = true;

                  for (i = 0; i < nValues; i++) {
                    values[i] = parser.getDouble();

                    if (!isNaN(values[i])) {
                      allNaN = false;
                    }
                  }

                  if (!allNaN) {
                    _context9.next = 28;
                    break;
                  }

                  return _context9.abrupt("return", undefined);

                case 28:
                  return _context9.abrupt("return", new NormalizationVector(type, chrIdx, unit, binSize, values));

                case 29:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee9, this);
        }));

        function getNormalizationVector(_x8, _x9, _x10, _x11) {
          return _getNormalizationVector.apply(this, arguments);
        }

        return getNormalizationVector;
      }()
    }, {
      key: "getNormVectorIndex",
      value: function () {
        var _getNormVectorIndex = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee10() {
          var url, key, nviResponse, nvi, nviArray, range;
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  if (this.normVectorIndex) {
                    _context10.next = 27;
                    break;
                  }

                  if (!(!this.config.nvi && this.remote && this.url)) {
                    _context10.next = 12;
                    break;
                  }

                  url = new URL(this.url);
                  key = encodeURIComponent(url.hostname + url.pathname);
                  _context10.next = 6;
                  return crossFetch('https://t5dvc6kn3f.execute-api.us-east-1.amazonaws.com/dev/nvi/' + key);

                case 6:
                  nviResponse = _context10.sent;

                  if (!(nviResponse.status === 200)) {
                    _context10.next = 12;
                    break;
                  }

                  _context10.next = 10;
                  return nviResponse.text();

                case 10:
                  nvi = _context10.sent;

                  if (nvi) {
                    this.config.nvi = nvi;
                  }

                case 12:
                  if (!this.config.nvi) {
                    _context10.next = 18;
                    break;
                  }

                  nviArray = decodeURIComponent(this.config.nvi).split(",");
                  range = {
                    start: parseInt(nviArray[0]),
                    size: parseInt(nviArray[1])
                  };
                  return _context10.abrupt("return", this.readNormVectorIndex(range));

                case 18:
                  _context10.prev = 18;
                  _context10.next = 21;
                  return this.readNormExpectedValuesAndNormVectorIndex();

                case 21:
                  return _context10.abrupt("return", this.normVectorIndex);

                case 24:
                  _context10.prev = 24;
                  _context10.t0 = _context10["catch"](18);

                  if (_context10.t0.code === "416" || _context10.t0.code === 416) {
                    // This is expected if file does not contain norm vectors
                    this.normExpectedValueVectorsPosition = undefined;
                  } else {
                    console.error(_context10.t0);
                  }

                case 27:
                  return _context10.abrupt("return", this.normVectorIndex);

                case 28:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee10, this, [[18, 24]]);
        }));

        function getNormVectorIndex() {
          return _getNormVectorIndex.apply(this, arguments);
        }

        return getNormVectorIndex;
      }()
    }, {
      key: "getNormalizationOptions",
      value: function () {
        var _getNormalizationOptions = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee11() {
          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.next = 2;
                  return this.getNormVectorIndex();

                case 2:
                  return _context11.abrupt("return", this.normalizationTypes);

                case 3:
                case "end":
                  return _context11.stop();
              }
            }
          }, _callee11, this);
        }));

        function getNormalizationOptions() {
          return _getNormalizationOptions.apply(this, arguments);
        }

        return getNormalizationOptions;
      }()
      /**
       * Return a promise to load the normalization vector index
       *
       * @param dataset
       * @param range  -- file range {position, size}
       * @returns Promise for the normalization vector index
       */

    }, {
      key: "readNormVectorIndex",
      value: function () {
        var _readNormVectorIndex = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee12(range) {
          var data, binaryParser, nEntries;
          return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.next = 2;
                  return this.init();

                case 2:
                  this.normalizationVectorIndexRange = range;
                  _context12.next = 5;
                  return this.file.read(range.start, range.size);

                case 5:
                  data = _context12.sent;
                  binaryParser = new BinaryParser(new DataView(data));
                  this.normVectorIndex = {};
                  nEntries = binaryParser.getInt();

                  while (nEntries-- > 0) {
                    this.parseNormVectorEntry(binaryParser);
                  }

                  return _context12.abrupt("return", this.normVectorIndex);

                case 11:
                case "end":
                  return _context12.stop();
              }
            }
          }, _callee12, this);
        }));

        function readNormVectorIndex(_x12) {
          return _readNormVectorIndex.apply(this, arguments);
        }

        return readNormVectorIndex;
      }()
      /**
       * This function is used when the position of the norm vector index is unknown.  We must read through the expected
       * values to find the index
       *
       * @param dataset
       * @returns {Promise}
       */

    }, {
      key: "readNormExpectedValuesAndNormVectorIndex",
      value: function () {
        var _readNormExpectedValuesAndNormVectorIndex = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee14() {
          var nviStart, byteCount, data, binaryParser, nEntries, sizeEstimate, range, processEntries, _processEntries;

          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _processEntries = function _ref2() {
                    _processEntries = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee13(nEntries, data) {
                      var binaryParser, _sizeEstimate, _range, _data;

                      return regeneratorRuntime.wrap(function _callee13$(_context13) {
                        while (1) {
                          switch (_context13.prev = _context13.next) {
                            case 0:
                              binaryParser = new BinaryParser(new DataView(data));

                            case 1:
                              if (!(nEntries-- > 0)) {
                                _context13.next = 14;
                                break;
                              }

                              if (!(binaryParser.available() < 100)) {
                                _context13.next = 11;
                                break;
                              }

                              nEntries++; // Reset counter as entry is not processed

                              byteCount += binaryParser.position;
                              _sizeEstimate = Math.max(1000, nEntries * 30);
                              _range = {
                                start: nviStart + byteCount,
                                size: _sizeEstimate
                              };
                              _context13.next = 9;
                              return this.file.read(_range.start, _range.size);

                            case 9:
                              _data = _context13.sent;
                              return _context13.abrupt("return", processEntries.call(this, nEntries, _data));

                            case 11:
                              this.parseNormVectorEntry(binaryParser);
                              _context13.next = 1;
                              break;

                            case 14:
                              byteCount += binaryParser.position;

                            case 15:
                            case "end":
                              return _context13.stop();
                          }
                        }
                      }, _callee13, this);
                    }));
                    return _processEntries.apply(this, arguments);
                  };

                  processEntries = function _ref(_x13, _x14) {
                    return _processEntries.apply(this, arguments);
                  };

                  _context14.next = 4;
                  return this.init();

                case 4:
                  if (!(this.normExpectedValueVectorsPosition === undefined)) {
                    _context14.next = 6;
                    break;
                  }

                  return _context14.abrupt("return");

                case 6:
                  _context14.next = 8;
                  return this.skipExpectedValues(this.normExpectedValueVectorsPosition);

                case 8:
                  nviStart = _context14.sent;
                  byteCount = 4;
                  _context14.next = 12;
                  return this.file.read(nviStart, 4);

                case 12:
                  data = _context14.sent;
                  binaryParser = new BinaryParser(new DataView(data));
                  nEntries = binaryParser.getInt();
                  sizeEstimate = nEntries * 30;
                  range = {
                    start: nviStart + byteCount,
                    size: sizeEstimate
                  };
                  _context14.next = 19;
                  return this.file.read(range.start, range.size);

                case 19:
                  data = _context14.sent;
                  this.normalizedExpectedValueVectors = {};
                  this.normVectorIndex = {}; // Recursively process entries

                  _context14.next = 24;
                  return processEntries.call(this, nEntries, data);

                case 24:
                  this.config.nvi = nviStart.toString() + "," + byteCount;

                case 25:
                case "end":
                  return _context14.stop();
              }
            }
          }, _callee14, this);
        }));

        function readNormExpectedValuesAndNormVectorIndex() {
          return _readNormExpectedValuesAndNormVectorIndex.apply(this, arguments);
        }

        return readNormExpectedValuesAndNormVectorIndex;
      }()
      /**
       * This function is used when the position of the norm vector index is unknown.  We must read through the expected
       * values to find the index
       *
       * @param dataset
       * @returns {Promise}
       */

    }, {
      key: "skipExpectedValues",
      value: function () {
        var _skipExpectedValues = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee16(start) {
          var file, range, data, binaryParser, nEntries, parseNext, _parseNext;

          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  _parseNext = function _ref4() {
                    _parseNext = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee15(start, nEntries) {
                      var range, chunkSize, p0, data, binaryParser, nValues, nChrScaleFactors;
                      return regeneratorRuntime.wrap(function _callee15$(_context15) {
                        while (1) {
                          switch (_context15.prev = _context15.next) {
                            case 0:
                              range = {
                                start: start,
                                size: 500
                              };
                              chunkSize = 0;
                              p0 = start;
                              _context15.next = 5;
                              return file.read(range.start, range.size);

                            case 5:
                              data = _context15.sent;
                              binaryParser = new BinaryParser(new DataView(data));
                              binaryParser.getString(); // type

                              binaryParser.getString(); // unit

                              binaryParser.getInt(); // binSize

                              nValues = binaryParser.getInt();
                              chunkSize += binaryParser.position + nValues * 8;
                              range = {
                                start: start + chunkSize,
                                size: 4
                              };
                              _context15.next = 15;
                              return file.read(range.start, range.size);

                            case 15:
                              data = _context15.sent;
                              binaryParser = new BinaryParser(new DataView(data));
                              nChrScaleFactors = binaryParser.getInt();
                              chunkSize += 4 + nChrScaleFactors * (4 + 8);
                              nEntries--;

                              if (!(nEntries === 0)) {
                                _context15.next = 24;
                                break;
                              }

                              return _context15.abrupt("return", Promise.resolve(p0 + chunkSize));

                            case 24:
                              return _context15.abrupt("return", parseNext(p0 + chunkSize, nEntries));

                            case 25:
                            case "end":
                              return _context15.stop();
                          }
                        }
                      }, _callee15);
                    }));
                    return _parseNext.apply(this, arguments);
                  };

                  parseNext = function _ref3(_x16, _x17) {
                    return _parseNext.apply(this, arguments);
                  };

                  file = new BufferedFile({
                    file: this.file,
                    size: 256000
                  });
                  range = {
                    start: start,
                    size: 4
                  };
                  _context16.next = 6;
                  return file.read(range.start, range.size);

                case 6:
                  data = _context16.sent;
                  binaryParser = new BinaryParser(new DataView(data));
                  nEntries = binaryParser.getInt(); // Total # of expected value chunks

                  if (!(nEntries === 0)) {
                    _context16.next = 13;
                    break;
                  }

                  return _context16.abrupt("return", range.start + range.size);

                case 13:
                  return _context16.abrupt("return", parseNext(start + 4, nEntries));

                case 14:
                case "end":
                  return _context16.stop();
              }
            }
          }, _callee16, this);
        }));

        function skipExpectedValues(_x15) {
          return _skipExpectedValues.apply(this, arguments);
        }

        return skipExpectedValues;
      }()
    }, {
      key: "getZoomIndexForBinSize",
      value: function getZoomIndexForBinSize(binSize, unit) {
        unit = unit || "BP";
        var resolutionArray;

        if (unit === "BP") {
          resolutionArray = this.bpResolutions;
        } else if (unit === "FRAG") {
          resolutionArray = this.fragResolutions;
        } else {
          throw new Error("Invalid unit: " + unit);
        }

        for (var i = 0; i < resolutionArray.length; i++) {
          if (resolutionArray[i] === binSize) return i;
        }

        return -1;
      }
    }, {
      key: "parseNormVectorEntry",
      value: function parseNormVectorEntry(binaryParser) {
        var type = binaryParser.getString(); //15

        var chrIdx = binaryParser.getInt(); //4

        var unit = binaryParser.getString(); //3

        var binSize = binaryParser.getInt(); //4

        var filePosition = binaryParser.getLong(); //8

        var sizeInBytes = binaryParser.getInt(); //4

        var key = type + "_" + chrIdx + "_" + unit + "_" + binSize; // TODO -- why does this not work?  NormalizationVector.getNormalizationVectorKey(type, chrIdx, unit, binSize);

        if (!this.normalizationTypes.includes(type)) {
          this.normalizationTypes.push(type);
        }

        this.normVectorIndex[key] = {
          filePosition: filePosition,
          size: sizeInBytes
        };
      }
    }, {
      key: "getFileChrName",
      value: function getFileChrName(chrAlias) {
        if (this.chrAliasTable.hasOwnProperty(chrAlias)) {
          return this.chrAliasTable[chrAlias];
        } else {
          return chrAlias;
        }
      }
    }]);

    return HicFile;
  }();

  function parseMatixZoomData(chr1, chr2, chr1Sites, chr2Sites, dis) {
    var unit, sumCounts, occupiedCellCount, stdDev, percent95, binSize, zoom, blockBinCount, blockColumnCount, zd, nBlocks, blockIndex, nBins1, nBins2, avgCount, blockNumber, filePosition, blockSizeInBytes;
    unit = dis.getString();
    dis.getInt(); // Old "zoom" index -- not used, must be read
    // Stats.  Not used yet, but we need to read them anyway

    sumCounts = dis.getFloat();
    occupiedCellCount = dis.getFloat();
    stdDev = dis.getFloat();
    percent95 = dis.getFloat();
    binSize = dis.getInt();
    zoom = {
      unit: unit,
      binSize: binSize
    };
    blockBinCount = dis.getInt();
    blockColumnCount = dis.getInt();
    zd = new MatrixZoomData(chr1, chr2, zoom, blockBinCount, blockColumnCount, chr1Sites, chr2Sites);
    nBlocks = dis.getInt();
    blockIndex = {};

    while (nBlocks-- > 0) {
      blockNumber = dis.getInt();
      filePosition = dis.getLong();
      blockSizeInBytes = dis.getInt();
      blockIndex[blockNumber] = {
        filePosition: filePosition,
        size: blockSizeInBytes
      };
    }

    zd.blockIndexMap = blockIndex;
    nBins1 = chr1.size / binSize;
    nBins2 = chr2.size / binSize;
    avgCount = sumCounts / nBins1 / nBins2; // <= trying to avoid overflows

    zd.averageCount = avgCount;
    zd.sumCounts = sumCounts;
    zd.stdDev = stdDev;
    zd.occupiedCellCount = occupiedCellCount;
    zd.percent95 = percent95;
    return zd;
  }

  function getNormalizationVectorKey(type, chrIdx, unit, resolution) {
    return type + "_" + chrIdx + "_" + unit + "_" + resolution;
  }

  function isGoogleDrive(url) {
    return url.indexOf("drive.google.com") >= 0 || url.indexOf("www.googleapis.com/drive") > 0;
  }

  var Straw =
  /*#__PURE__*/
  function () {
    function Straw(config) {
      _classCallCheck(this, Straw);

      this.config = config;
      this.hicFile = new HicFile(config);
    }

    _createClass(Straw, [{
      key: "getMetaData",
      value: function () {
        var _getMetaData = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return this.hicFile.getMetaData();

                case 2:
                  return _context.abrupt("return", _context.sent);

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function getMetaData() {
          return _getMetaData.apply(this, arguments);
        }

        return getMetaData;
      }()
    }, {
      key: "getBlocks",
      value: function () {
        var _getBlocks = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2(region1, region2, units, binsize) {
          var chr1, chr2, idx1, idx2, x1, x2, y1, y2, matrix, z, zd, msg, blockBinCount, col1, col2, row1, row2, promises, sameChr, row, column, blockNumber;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return this.hicFile.init();

                case 2:
                  chr1 = this.hicFile.getFileChrName(region1.chr);
                  chr2 = this.hicFile.getFileChrName(region2.chr);
                  idx1 = this.hicFile.chromosomeIndexMap[chr1];
                  idx2 = this.hicFile.chromosomeIndexMap[chr2];

                  if (!(idx1 === undefined)) {
                    _context2.next = 8;
                    break;
                  }

                  return _context2.abrupt("return", []);

                case 8:
                  if (!(idx2 === undefined)) {
                    _context2.next = 10;
                    break;
                  }

                  return _context2.abrupt("return", []);

                case 10:
                  x1 = region1.start === undefined ? undefined : region1.start / binsize;
                  x2 = region1.end === undefined ? undefined : region1.end / binsize;
                  y1 = region2.start === undefined ? undefined : region2.start / binsize;
                  y2 = region2.end === undefined ? undefined : region2.end / binsize;
                  _context2.next = 16;
                  return this.hicFile.readMatrix(idx1, idx2);

                case 16:
                  matrix = _context2.sent;

                  if (matrix) {
                    _context2.next = 19;
                    break;
                  }

                  return _context2.abrupt("return", []);

                case 19:
                  // Find the requested resolution
                  z = undefined === binsize ? 0 : this.hicFile.getZoomIndexForBinSize(binsize, units);

                  if (!(z === -1)) {
                    _context2.next = 22;
                    break;
                  }

                  throw new Error("Invalid bin size");

                case 22:
                  zd = matrix.bpZoomData[z];

                  if (!(zd === null)) {
                    _context2.next = 26;
                    break;
                  }

                  msg = "No data avalailble for resolution: ".concat(binsize, "  for map ").concat(region1.chr, "-").concat(region2.chr);
                  throw new Error(msg);

                case 26:
                  blockBinCount = zd.blockBinCount; // Dimension in bins of a block (width = height = blockBinCount)

                  col1 = x1 === undefined ? 0 : Math.floor(x1 / blockBinCount);
                  col2 = x1 === undefined ? zd.blockColumnCount : Math.floor(x2 / blockBinCount);
                  row1 = y1 === undefined ? 0 : Math.floor(y1 / blockBinCount);
                  row2 = y2 === undefined ? zd.blockColumnCount : Math.floor(y2 / blockBinCount);
                  promises = [];
                  sameChr = idx1 === idx2;

                  for (row = row1; row <= row2; row++) {
                    for (column = col1; column <= col2; column++) {
                      blockNumber = void 0;

                      if (sameChr && row < column) {
                        blockNumber = column * zd.blockColumnCount + row;
                      } else {
                        blockNumber = row * zd.blockColumnCount + column;
                      }

                      promises.push(this.hicFile.readBlock(blockNumber, zd));
                    }
                  }

                  return _context2.abrupt("return", Promise.all(promises));

                case 35:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function getBlocks(_x, _x2, _x3, _x4) {
          return _getBlocks.apply(this, arguments);
        }

        return getBlocks;
      }() //straw <NONE/VC/VC_SQRT/KR> <ile> <chr1>[:x1:x2] <chr2>[:y1:y2] <BP/FRAG> <binsize>

    }, {
      key: "getContactRecords",
      value: function () {
        var _getContactRecords = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(normalization, region1, region2, units, binsize) {
          var blocks, chr1, chr2, x1, x2, y1, y2, normVector1, normVector2, isNorm, contactRecords, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, block, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, rec, x, y, nvnv, counts;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return this.getBlocks(region1, region2, units, binsize);

                case 2:
                  blocks = _context3.sent;

                  if (!(!blocks || blocks.length === 0)) {
                    _context3.next = 5;
                    break;
                  }

                  return _context3.abrupt("return", []);

                case 5:
                  chr1 = this.hicFile.getFileChrName(region1.chr);
                  chr2 = this.hicFile.getFileChrName(region2.chr);
                  x1 = region1.start === undefined ? undefined : region1.start / binsize;
                  x2 = region1.end === undefined ? undefined : region1.end / binsize;
                  y1 = region2.start === undefined ? undefined : region2.start / binsize;
                  y2 = region2.end === undefined ? undefined : region2.end / binsize;
                  isNorm = normalization && normalization !== "NONE";

                  if (!isNorm) {
                    _context3.next = 23;
                    break;
                  }

                  _context3.next = 15;
                  return this.hicFile.getNormalizationVector(normalization, chr1, units, binsize);

                case 15:
                  normVector1 = _context3.sent;

                  if (!(chr1 === chr2)) {
                    _context3.next = 20;
                    break;
                  }

                  normVector2 = normVector1;
                  _context3.next = 23;
                  break;

                case 20:
                  _context3.next = 22;
                  return this.hicFile.getNormalizationVector(normalization, chr2, units, binsize);

                case 22:
                  normVector2 = _context3.sent;

                case 23:
                  contactRecords = [];
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _iteratorError = undefined;
                  _context3.prev = 27;
                  _iterator = blocks[Symbol.iterator]();

                case 29:
                  if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                    _context3.next = 54;
                    break;
                  }

                  block = _step.value;

                  if (!block) {
                    _context3.next = 51;
                    break;
                  }

                  // This is most likely caused by a base pair range outside the chromosome
                  _iteratorNormalCompletion2 = true;
                  _didIteratorError2 = false;
                  _iteratorError2 = undefined;
                  _context3.prev = 35;

                  for (_iterator2 = block.records[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    rec = _step2.value;

                    // transpose?
                    if (x1 === undefined || rec.bin1 >= x1 && rec.bin1 <= x2 && rec.bin2 >= y1 && rec.bin2 <= y2) {
                      if (isNorm) {
                        x = rec.bin1;
                        y = rec.bin2;
                        nvnv = normVector1.data[x] * normVector2.data[y];

                        if (nvnv[x] !== 0 && !isNaN(nvnv)) {
                          counts = rec.counts / nvnv;
                          contactRecords.push(new ContactRecord(x, y, counts));
                        }
                      } else {
                        contactRecords.push(rec);
                      }
                    }
                  }

                  _context3.next = 43;
                  break;

                case 39:
                  _context3.prev = 39;
                  _context3.t0 = _context3["catch"](35);
                  _didIteratorError2 = true;
                  _iteratorError2 = _context3.t0;

                case 43:
                  _context3.prev = 43;
                  _context3.prev = 44;

                  if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                    _iterator2["return"]();
                  }

                case 46:
                  _context3.prev = 46;

                  if (!_didIteratorError2) {
                    _context3.next = 49;
                    break;
                  }

                  throw _iteratorError2;

                case 49:
                  return _context3.finish(46);

                case 50:
                  return _context3.finish(43);

                case 51:
                  _iteratorNormalCompletion = true;
                  _context3.next = 29;
                  break;

                case 54:
                  _context3.next = 60;
                  break;

                case 56:
                  _context3.prev = 56;
                  _context3.t1 = _context3["catch"](27);
                  _didIteratorError = true;
                  _iteratorError = _context3.t1;

                case 60:
                  _context3.prev = 60;
                  _context3.prev = 61;

                  if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                    _iterator["return"]();
                  }

                case 63:
                  _context3.prev = 63;

                  if (!_didIteratorError) {
                    _context3.next = 66;
                    break;
                  }

                  throw _iteratorError;

                case 66:
                  return _context3.finish(63);

                case 67:
                  return _context3.finish(60);

                case 68:
                  return _context3.abrupt("return", contactRecords);

                case 69:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this, [[27, 56, 60, 68], [35, 39, 43, 51], [44,, 46, 50], [61,, 63, 67]]);
        }));

        function getContactRecords(_x5, _x6, _x7, _x8, _x9) {
          return _getContactRecords.apply(this, arguments);
        }

        return getContactRecords;
      }()
    }, {
      key: "getNormalizationOptions",
      value: function () {
        var _getNormalizationOptions = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4() {
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  return _context4.abrupt("return", this.hicFile.getNormalizationOptions());

                case 1:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function getNormalizationOptions() {
          return _getNormalizationOptions.apply(this, arguments);
        }

        return getNormalizationOptions;
      }()
    }, {
      key: "getNVI",
      value: function () {
        var _getNVI = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee5() {
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return this.hicFile.getNormVectorIndex();

                case 2:
                  return _context5.abrupt("return", this.hicFile.config.nvi);

                case 3:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function getNVI() {
          return _getNVI.apply(this, arguments);
        }

        return getNVI;
      }()
    }, {
      key: "getFileChrName",
      value: function getFileChrName(chrAlias) {
        if (this.hicFile.chrAliasTable.hasOwnProperty(chrAlias)) {
          return this.hicFile.chrAliasTable[chrAlias];
        } else {
          return chrAlias;
        }
      }
    }]);

    return Straw;
  }();

  // Entry point for webpack.

  return Straw;

}));

