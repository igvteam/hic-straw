(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.HicStraw = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var runtime_1 = createCommonjsModule(function (module) {
	  /**
	   * Copyright (c) 2014-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   */
	  var runtime = function (exports) {

	    var Op = Object.prototype;
	    var hasOwn = Op.hasOwnProperty;
	    var undefined$1; // More compressible than void 0.

	    var $Symbol = typeof Symbol === "function" ? Symbol : {};
	    var iteratorSymbol = $Symbol.iterator || "@@iterator";
	    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	    function define(obj, key, value) {
	      Object.defineProperty(obj, key, {
	        value: value,
	        enumerable: true,
	        configurable: true,
	        writable: true
	      });
	      return obj[key];
	    }

	    try {
	      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
	      define({}, "");
	    } catch (err) {
	      define = function (obj, key, value) {
	        return obj[key] = value;
	      };
	    }

	    function wrap(innerFn, outerFn, self, tryLocsList) {
	      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	      var generator = Object.create(protoGenerator.prototype);
	      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
	      // .throw, and .return methods.

	      generator._invoke = makeInvokeMethod(innerFn, self, context);
	      return generator;
	    }

	    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
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
	        return {
	          type: "normal",
	          arg: fn.call(obj, arg)
	        };
	      } catch (err) {
	        return {
	          type: "throw",
	          arg: err
	        };
	      }
	    }

	    var GenStateSuspendedStart = "suspendedStart";
	    var GenStateSuspendedYield = "suspendedYield";
	    var GenStateExecuting = "executing";
	    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
	    // breaking out of the dispatch switch statement.

	    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
	    // .constructor.prototype properties for functions that return Generator
	    // objects. For full spec compliance, you may wish to configure your
	    // minifier not to mangle the names of these two functions.

	    function Generator() {}

	    function GeneratorFunction() {}

	    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
	    // don't natively support it.


	    var IteratorPrototype = {};

	    IteratorPrototype[iteratorSymbol] = function () {
	      return this;
	    };

	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }

	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	    GeneratorFunctionPrototype.constructor = GeneratorFunction;
	    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
	    // Iterator interface in terms of a single ._invoke method.

	    function defineIteratorMethods(prototype) {
	      ["next", "throw", "return"].forEach(function (method) {
	        define(prototype, method, function (arg) {
	          return this._invoke(method, arg);
	        });
	      });
	    }

	    exports.isGeneratorFunction = function (genFun) {
	      var ctor = typeof genFun === "function" && genFun.constructor;
	      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
	      // do is to check its .name property.
	      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	    };

	    exports.mark = function (genFun) {
	      if (Object.setPrototypeOf) {
	        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	      } else {
	        genFun.__proto__ = GeneratorFunctionPrototype;
	        define(genFun, toStringTagSymbol, "GeneratorFunction");
	      }

	      genFun.prototype = Object.create(Gp);
	      return genFun;
	    }; // Within the body of any async function, `await x` is transformed to
	    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	    // `hasOwn.call(value, "__await")` to determine if the yielded value is
	    // meant to be awaited.


	    exports.awrap = function (arg) {
	      return {
	        __await: arg
	      };
	    };

	    function AsyncIterator(generator, PromiseImpl) {
	      function invoke(method, arg, resolve, reject) {
	        var record = tryCatch(generator[method], generator, arg);

	        if (record.type === "throw") {
	          reject(record.arg);
	        } else {
	          var result = record.arg;
	          var value = result.value;

	          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
	            return PromiseImpl.resolve(value.__await).then(function (value) {
	              invoke("next", value, resolve, reject);
	            }, function (err) {
	              invoke("throw", err, resolve, reject);
	            });
	          }

	          return PromiseImpl.resolve(value).then(function (unwrapped) {
	            // When a yielded Promise is resolved, its final value becomes
	            // the .value of the Promise<{value,done}> result for the
	            // current iteration.
	            result.value = unwrapped;
	            resolve(result);
	          }, function (error) {
	            // If a rejected Promise was yielded, throw the rejection back
	            // into the async generator function so it can be handled there.
	            return invoke("throw", error, resolve, reject);
	          });
	        }
	      }

	      var previousPromise;

	      function enqueue(method, arg) {
	        function callInvokeWithMethodAndArg() {
	          return new PromiseImpl(function (resolve, reject) {
	            invoke(method, arg, resolve, reject);
	          });
	        }

	        return previousPromise = // If enqueue has been called before, then we want to wait until
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
	        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
	        // invocations of the iterator.
	        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	      } // Define the unified helper method that is used to implement .next,
	      // .throw, and .return (see defineIteratorMethods).


	      this._invoke = enqueue;
	    }

	    defineIteratorMethods(AsyncIterator.prototype);

	    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	      return this;
	    };

	    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
	    // AsyncIterator objects; they just return a Promise for the value of
	    // the final result produced by the iterator.

	    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	      if (PromiseImpl === void 0) PromiseImpl = Promise;
	      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
	      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function (result) {
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
	          } // Be forgiving, per 25.3.3.3.3 of the spec:
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
	            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

	            if (record.arg === ContinueSentinel) {
	              continue;
	            }

	            return {
	              value: record.arg,
	              done: context.done
	            };
	          } else if (record.type === "throw") {
	            state = GenStateCompleted; // Dispatch the exception by looping back around to the
	            // context.dispatchException(context.arg) call above.

	            context.method = "throw";
	            context.arg = record.arg;
	          }
	        }
	      };
	    } // Call delegate.iterator[context.method](context.arg) and handle the
	    // result, either by returning a { value, done } result from the
	    // delegate iterator, or by modifying context.method and context.arg,
	    // setting context.delegate to null, and returning the ContinueSentinel.


	    function maybeInvokeDelegate(delegate, context) {
	      var method = delegate.iterator[context.method];

	      if (method === undefined$1) {
	        // A .throw or .return when the delegate iterator has no .throw
	        // method always terminates the yield* loop.
	        context.delegate = null;

	        if (context.method === "throw") {
	          // Note: ["return"] must be used for ES3 parsing compatibility.
	          if (delegate.iterator["return"]) {
	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            context.method = "return";
	            context.arg = undefined$1;
	            maybeInvokeDelegate(delegate, context);

	            if (context.method === "throw") {
	              // If maybeInvokeDelegate(context) changed context.method from
	              // "return" to "throw", let that override the TypeError below.
	              return ContinueSentinel;
	            }
	          }

	          context.method = "throw";
	          context.arg = new TypeError("The iterator does not provide a 'throw' method");
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

	      if (!info) {
	        context.method = "throw";
	        context.arg = new TypeError("iterator result is not an object");
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      if (info.done) {
	        // Assign the result of the finished delegate to the temporary
	        // variable specified by delegate.resultName (see delegateYield).
	        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

	        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
	        // exception, let the outer generator proceed normally. If
	        // context.method was "next", forget context.arg since it has been
	        // "consumed" by the delegate iterator. If context.method was
	        // "return", allow the original .return call to continue in the
	        // outer generator.

	        if (context.method !== "return") {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	      } else {
	        // Re-yield the result returned by the delegate method.
	        return info;
	      } // The delegate iterator is finished, so forget it and continue with
	      // the outer generator.


	      context.delegate = null;
	      return ContinueSentinel;
	    } // Define Generator.prototype.{next,throw,return} in terms of the
	    // unified ._invoke helper method.


	    defineIteratorMethods(Gp);
	    define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
	    // @@iterator function is called on it. Some browsers' implementations of the
	    // iterator prototype chain incorrectly implement this, causing the Generator
	    // object to not be returned from this call. This ensures that doesn't happen.
	    // See https://github.com/facebook/regenerator/issues/274 for more details.

	    Gp[iteratorSymbol] = function () {
	      return this;
	    };

	    Gp.toString = function () {
	      return "[object Generator]";
	    };

	    function pushTryEntry(locs) {
	      var entry = {
	        tryLoc: locs[0]
	      };

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
	      this.tryEntries = [{
	        tryLoc: "root"
	      }];
	      tryLocsList.forEach(pushTryEntry, this);
	      this.reset(true);
	    }

	    exports.keys = function (object) {
	      var keys = [];

	      for (var key in object) {
	        keys.push(key);
	      }

	      keys.reverse(); // Rather than returning an object with a next method, we keep
	      // things simple and return the next function itself.

	      return function next() {
	        while (keys.length) {
	          var key = keys.pop();

	          if (key in object) {
	            next.value = key;
	            next.done = false;
	            return next;
	          }
	        } // To avoid creating an additional object, we just hang the .value
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
	          var i = -1,
	              next = function next() {
	            while (++i < iterable.length) {
	              if (hasOwn.call(iterable, i)) {
	                next.value = iterable[i];
	                next.done = false;
	                return next;
	              }
	            }

	            next.value = undefined$1;
	            next.done = true;
	            return next;
	          };

	          return next.next = next;
	        }
	      } // Return an iterator with no values.


	      return {
	        next: doneResult
	      };
	    }

	    exports.values = values;

	    function doneResult() {
	      return {
	        value: undefined$1,
	        done: true
	      };
	    }

	    Context.prototype = {
	      constructor: Context,
	      reset: function (skipTempReset) {
	        this.prev = 0;
	        this.next = 0; // Resetting context._sent for legacy support of Babel's
	        // function.sent implementation.

	        this.sent = this._sent = undefined$1;
	        this.done = false;
	        this.delegate = null;
	        this.method = "next";
	        this.arg = undefined$1;
	        this.tryEntries.forEach(resetTryEntry);

	        if (!skipTempReset) {
	          for (var name in this) {
	            // Not sure about the optimal order of these conditions:
	            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	              this[name] = undefined$1;
	            }
	          }
	        }
	      },
	      stop: function () {
	        this.done = true;
	        var rootEntry = this.tryEntries[0];
	        var rootRecord = rootEntry.completion;

	        if (rootRecord.type === "throw") {
	          throw rootRecord.arg;
	        }

	        return this.rval;
	      },
	      dispatchException: function (exception) {
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
	            context.arg = undefined$1;
	          }

	          return !!caught;
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
	      abrupt: function (type, arg) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	            var finallyEntry = entry;
	            break;
	          }
	        }

	        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
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
	      complete: function (record, afterLoc) {
	        if (record.type === "throw") {
	          throw record.arg;
	        }

	        if (record.type === "break" || record.type === "continue") {
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
	      finish: function (finallyLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.finallyLoc === finallyLoc) {
	            this.complete(entry.completion, entry.afterLoc);
	            resetTryEntry(entry);
	            return ContinueSentinel;
	          }
	        }
	      },
	      "catch": function (tryLoc) {
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
	        } // The context.catch method must only be called with a location
	        // argument that corresponds to a known catch block.


	        throw new Error("illegal catch attempt");
	      },
	      delegateYield: function (iterable, resultName, nextLoc) {
	        this.delegate = {
	          iterator: values(iterable),
	          resultName: resultName,
	          nextLoc: nextLoc
	        };

	        if (this.method === "next") {
	          // Deliberately forget the last sent value so that we don't
	          // accidentally pass it on to the delegate.
	          this.arg = undefined$1;
	        }

	        return ContinueSentinel;
	      }
	    }; // Regardless of whether this script is executing as a CommonJS module
	    // or not, return the runtime object so that we can declare the variable
	    // regeneratorRuntime in the outer scope, which allows this module to be
	    // injected easily by `bin/regenerator --include-runtime script.js`.

	    return exports;
	  }( // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	   module.exports );

	  try {
	    regeneratorRuntime = runtime;
	  } catch (accidentalStrictMode) {
	    // This module should not be running in strict mode, so the above
	    // assignment should always work unless something is misconfigured. Just
	    // in case runtime.js accidentally runs in strict mode, we can escape
	    // strict mode using a global Function call. This could conceivably fail
	    // if a Content Security Policy forbids using Function, but in that case
	    // the proper solution is to fix the accidental strict mode problem. If
	    // you've misconfigured your bundler to force strict mode and applied a
	    // CSP to forbid Function, and you're not willing to fix either of those
	    // problems, please detail your unique predicament in a GitHub issue.
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	});

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

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _createForOfIteratorHelper(o, allowArrayLike) {
	  var it;

	  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
	    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
	      if (it) o = it;
	      var i = 0;

	      var F = function () {};

	      return {
	        s: F,
	        n: function () {
	          if (i >= o.length) return {
	            done: true
	          };
	          return {
	            done: false,
	            value: o[i++]
	          };
	        },
	        e: function (e) {
	          throw e;
	        },
	        f: F
	      };
	    }

	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }

	  var normalCompletion = true,
	      didErr = false,
	      err;
	  return {
	    s: function () {
	      it = o[Symbol.iterator]();
	    },
	    n: function () {
	      var step = it.next();
	      normalCompletion = step.done;
	      return step;
	    },
	    e: function (e) {
	      didErr = true;
	      err = e;
	    },
	    f: function () {
	      try {
	        if (!normalCompletion && it.return != null) it.return();
	      } finally {
	        if (didErr) throw err;
	      }
	    }
	  };
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global_1 = // eslint-disable-next-line no-undef
	check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
	Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, {
	    get: function () {
	      return 7;
	    }
	  })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
	  1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;
	var objectPropertyIsEnumerable = {
	  f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string

	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) {
	    /* empty */
	  }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};
	var objectGetOwnPropertyDescriptor = {
	  f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  }

	  return it;
	};

	var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty

	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) {
	    /* empty */
	  }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};
	var objectDefineProperty = {
	  f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  }

	  return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});
	var sharedStore = store;

	var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	  (module.exports = function (key, value) {
	    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	  })('versions', []).push({
	    version: '3.6.5',
	    mode:  'global',
	    copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	  });
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;

	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    }

	    return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;

	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };

	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;

	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };

	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	  var getInternalState = internalState.get;
	  var enforceInternalState = internalState.enforce;
	  var TEMPLATE = String(String).split('String');
	  (module.exports = function (O, key, value, options) {
	    var unsafe = options ? !!options.unsafe : false;
	    var simple = options ? !!options.enumerable : false;
	    var noTargetGet = options ? !!options.noTargetGet : false;

	    if (typeof value == 'function') {
	      if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	    }

	    if (O === global_1) {
	      if (simple) O[key] = value;else setGlobal(key, value);
	      return;
	    } else if (!unsafe) {
	      delete O[key];
	    } else if (!noTargetGet && O[key]) {
	      simple = true;
	    }

	    if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	  })(Function.prototype, 'toString', function toString() {
	    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	  });
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger

	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength

	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value; // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare

	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++]; // eslint-disable-next-line no-self-compare

	      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
	    } else for (; length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    }
	    return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;

	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }

	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
	  f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;
	var objectGetOwnPropertySymbols = {
	  f: f$4
	};

	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';
	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/

	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }

	  if (target) for (key in source) {
	    sourceProperty = source[key];

	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];

	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    } // add a flag to not completely full polyfills


	    if (options.sham || targetProperty && targetProperty.sham) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    } // extend global


	    redefine(target, key, sourceProperty, options);
	  }
	};

	// https://tc39.github.io/ecma262/#sec-isarray

	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	// https://tc39.github.io/ecma262/#sec-toobject

	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
	&& !Symbol.sham // eslint-disable-next-line no-undef
	&& typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  }

	  return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate

	var arraySpeciesCreate = function (originalArray, length) {
	  var C;

	  if (isArray(originalArray)) {
	    C = originalArray.constructor; // cross-realm fallback

	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  }

	  return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process$1 = global_1.process;
	var versions = process$1 && process$1.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);

	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};

	    constructor[SPECIES$1] = function () {
	      return {
	        foo: 1
	      };
	    };

	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded'; // We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679

	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});
	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species

	_export({
	  target: 'Array',
	  proto: true,
	  forced: FORCED
	}, {
	  concat: function concat(arg) {
	    // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;

	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];

	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }

	    A.length = n;
	    return A;
	  }
	});

	// https://tc39.github.io/ecma262/#sec-object.keys

	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// https://tc39.github.io/ecma262/#sec-object.defineproperties

	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;

	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () {
	  /* empty */
	};

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	}; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak

	  return temp;
	}; // Create object with fake `null` prototype: use iframe Object with cleared prototype


	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	}; // Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug


	var activeXDocument;

	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) {
	    /* ignore */
	  }

	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;

	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true; // `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create

	var objectCreate = Object.create || function create(O, Properties) {
	  var result;

	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();

	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype; // Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	} // add a key to Array.prototype[@@unscopables]


	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var defineProperty = Object.defineProperty;
	var cache = {};

	var thrower = function (it) {
	  throw it;
	};

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;
	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = {
	      length: -1
	    };
	    if (ACCESSORS) defineProperty(O, 1, {
	      enumerable: true,
	      get: thrower
	    });else O[1] = 1;
	    method.call(O, argument0, argument1);
	  });
	};

	var $includes = arrayIncludes.includes;
	var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	}); // `Array.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.includes

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !USES_TO_LENGTH
	}, {
	  includes: function includes(el
	  /* , fromIndex = 0 */
	  ) {
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	}); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables('includes');

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () {
	      throw 1;
	    }, 1);
	  });
	};

	var $indexOf = arrayIncludes.indexOf;
	var nativeIndexOf = [].indexOf;
	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH$1 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	}); // `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof

	_export({
	  target: 'Array',
	  proto: true,
	  forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH$1
	}, {
	  indexOf: function indexOf(searchElement
	  /* , fromIndex = 0 */
	  ) {
	    return NEGATIVE_ZERO // convert -0 to +0
	    ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var iterators = {};

	var correctPrototypeGetter = !fails(function () {
	  function F() {
	    /* empty */
	  }

	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype; // `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof

	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];

	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  }

	  return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () {
	  return this;
	}; // `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object


	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

	if ( !has(IteratorPrototype, ITERATOR)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var defineProperty$1 = objectDefineProperty.f;
	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
	    defineProperty$1(it, TO_STRING_TAG, {
	      configurable: true,
	      value: TAG
	    });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

	var returnThis$1 = function () {
	  return this;
	};

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, {
	    next: createPropertyDescriptor(1, next)
	  });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  }

	  return it;
	};

	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.

	/* eslint-disable no-proto */

	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;

	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) {
	    /* empty */
	  }

	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$1 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () {
	  return this;
	};

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];

	    switch (KIND) {
	      case KEYS:
	        return function keys() {
	          return new IteratorConstructor(this, KIND);
	        };

	      case VALUES:
	        return function values() {
	          return new IteratorConstructor(this, KIND);
	        };

	      case ENTRIES:
	        return function entries() {
	          return new IteratorConstructor(this, KIND);
	        };
	    }

	    return function () {
	      return new IteratorConstructor(this);
	    };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$1] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY; // fix native

	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));

	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
	        }
	      } // Set @@toStringTag to native iterators


	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  } // fix Array#{values, @@iterator}.name in V8 / FF


	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;

	    defaultIterator = function values() {
	      return nativeIterator.call(this);
	    };
	  } // define iterator


	  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
	  }

	  iterators[NAME] = defaultIterator; // export additional methods

	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({
	      target: NAME,
	      proto: true,
	      forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME
	    }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(ARRAY_ITERATOR); // `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator

	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated),
	    // target
	    index: 0,
	    // next index
	    kind: kind // kind

	  }); // `%ArrayIteratorPrototype%.next` method
	  // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;

	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return {
	      value: undefined,
	      done: true
	    };
	  }

	  if (kind == 'keys') return {
	    value: index,
	    done: false
	  };
	  if (kind == 'values') return {
	    value: target[index],
	    done: false
	  };
	  return {
	    value: [index, target[index]],
	    done: false
	  };
	}, 'values'); // argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject

	iterators.Arguments = iterators.Array; // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  }

	  return it;
	};

	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;

	  switch (length) {
	    case 0:
	      return function () {
	        return fn.call(that);
	      };

	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };

	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };

	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }

	  return function ()
	  /* ...args */
	  {
	    return fn.apply(that, arguments);
	  };
	};

	var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;

	    for (; length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);

	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	            case 3:
	              return true;
	            // some

	            case 5:
	              return value;
	            // find

	            case 6:
	              return index;
	            // findIndex

	            case 2:
	              push.call(target, value);
	            // filter
	          } else if (IS_EVERY) return false; // every
	      }
	    }

	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var $map = arrayIteration.map;
	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map'); // FF49- issue

	var USES_TO_LENGTH$2 = arrayMethodUsesToLength('map'); // `Array.prototype.map` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.map
	// with adding support of @@species

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$2
	}, {
	  map: function map(callbackfn
	  /* , thisArg */
	  ) {
	    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var defineProperty$2 = objectDefineProperty.f;
	var FunctionPrototype = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name'; // Function instances `.name` property
	// https://tc39.github.io/ecma262/#sec-function-instances-name

	if (descriptors && !(NAME in FunctionPrototype)) {
	  defineProperty$2(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if ( // it can work only with native `setPrototypeOf`
	  objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	  typeof (NewTarget = dummy.constructor) == 'function' && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$'); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

	var createMethod$2 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$2(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$2(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$2(3)
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var defineProperty$3 = objectDefineProperty.f;
	var trim = stringTrim.trim;
	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype; // Opera ~12 has broken Object#toString

	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER; // `ToNumber` abstract operation
	// https://tc39.github.io/ecma262/#sec-tonumber

	var toNumber = function (argument) {
	  var it = toPrimitive(argument, false);
	  var first, third, radix, maxCode, digits, length, index, code;

	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = it.charCodeAt(0);

	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66:
	        case 98:
	          radix = 2;
	          maxCode = 49;
	          break;
	        // fast equal of /^0b[01]+$/i

	        case 79:
	        case 111:
	          radix = 8;
	          maxCode = 55;
	          break;
	        // fast equal of /^0o[0-7]+$/i

	        default:
	          return +it;
	      }

	      digits = it.slice(2);
	      length = digits.length;

	      for (index = 0; index < length; index++) {
	        code = digits.charCodeAt(index); // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols

	        if (code < 48 || code > maxCode) return NaN;
	      }

	      return parseInt(digits, radix);
	    }
	  }

	  return +it;
	}; // `Number` constructor
	// https://tc39.github.io/ecma262/#sec-number-constructor


	if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
	  var NumberWrapper = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var dummy = this;
	    return dummy instanceof NumberWrapper // check on 1..constructor(foo) case
	    && (BROKEN_CLASSOF ? fails(function () {
	      NumberPrototype.valueOf.call(dummy);
	    }) : classofRaw(dummy) != NUMBER) ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
	  };

	  for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : ( // ES3:
	  'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' + // ES2015 (in case, if modules with ES2015 Number statics required before):
	  'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j = 0, key; keys$1.length > j; j++) {
	    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
	      defineProperty$3(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
	    }
	  }

	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	var floor$1 = Math.floor; // `Number.isInteger` method implementation
	// https://tc39.github.io/ecma262/#sec-number.isinteger

	var isInteger = function isInteger(it) {
	  return !isObject(it) && isFinite(it) && floor$1(it) === it;
	};

	// https://tc39.github.io/ecma262/#sec-number.isinteger

	_export({
	  target: 'Number',
	  stat: true
	}, {
	  isInteger: isInteger
	});

	var FAILS_ON_PRIMITIVES = fails(function () {
	  objectKeys(1);
	}); // `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys

	_export({
	  target: 'Object',
	  stat: true,
	  forced: FAILS_ON_PRIMITIVES
	}, {
	  keys: function keys(it) {
	    return objectKeys(toObject(it));
	  }
	});

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test = {};
	test[TO_STRING_TAG$1] = 'z';
	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag'); // ES3 wrong here

	var CORRECT_ARGUMENTS = classofRaw(function () {
	  return arguments;
	}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) {
	    /* empty */
	  }
	}; // getting tag from ES6+ `Object.prototype.toString`


	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
	  : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag // builtinTag case
	  : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
	  : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring


	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring

	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, {
	    unsafe: true
	  });
	}

	var nativePromiseConstructor = global_1.Promise;

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);

	  return target;
	};

	var SPECIES$2 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$2]) {
	    defineProperty(Constructor, SPECIES$2, {
	      configurable: true,
	      get: function () {
	        return this;
	      }
	    });
	  }
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  }

	  return it;
	};

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype; // check on default Array iterator

	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$2] === it);
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$3] || it['@@iterator'] || iterators[classof(it)];
	};

	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	  var Result = function (stopped, result) {
	    this.stopped = stopped;
	    this.result = result;
	  };

	  var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	    var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	    var iterator, iterFn, index, length, result, next, step;

	    if (IS_ITERATOR) {
	      iterator = iterable;
	    } else {
	      iterFn = getIteratorMethod(iterable);
	      if (typeof iterFn != 'function') throw TypeError('Target is not iterable'); // optimisation for array iterators

	      if (isArrayIteratorMethod(iterFn)) {
	        for (index = 0, length = toLength(iterable.length); length > index; index++) {
	          result = AS_ENTRIES ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
	          if (result && result instanceof Result) return result;
	        }

	        return new Result(false);
	      }

	      iterator = iterFn.call(iterable);
	    }

	    next = iterator.next;

	    while (!(step = next.call(iterator)).done) {
	      result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	      if (typeof result == 'object' && result && result instanceof Result) return result;
	    }

	    return new Result(false);
	  };

	  iterate.stop = function (result) {
	    return new Result(true, result);
	  };
	});

	var ITERATOR$4 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return {
	        done: !!called++
	      };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };

	  iteratorWithReturn[ITERATOR$4] = function () {
	    return this;
	  }; // eslint-disable-next-line no-throw-literal


	  Array.from(iteratorWithReturn, function () {
	    throw 2;
	  });
	} catch (error) {
	  /* empty */
	}

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;

	  try {
	    var object = {};

	    object[ITERATOR$4] = function () {
	      return {
	        next: function () {
	          return {
	            done: ITERATION_SUPPORT = true
	          };
	        }
	      };
	    };

	    exec(object);
	  } catch (error) {
	    /* empty */
	  }

	  return ITERATION_SUPPORT;
	};

	var SPECIES$3 = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor

	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$1 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process$2 = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	}; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


	if (!set$1 || !clear) {
	  set$1 = function setImmediate(fn) {
	    var args = [];
	    var i = 1;

	    while (arguments.length > i) args.push(arguments[i++]);

	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };

	    defer(counter);
	    return counter;
	  };

	  clear = function clearImmediate(id) {
	    delete queue[id];
	  }; // Node.js 0.8-


	  if (classofRaw(process$2) == 'process') {
	    defer = function (id) {
	      process$2.nextTick(runner(id));
	    }; // Sphere (JS game engine) Dispatch API

	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    }; // Browsers with MessageChannel, includes WebWorkers
	    // except iOS - https://github.com/zloirock/core-js/issues/624

	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
	    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post) && location.protocol !== 'file:') {
	    defer = post;
	    global_1.addEventListener('message', listener, false); // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    }; // Rest old browsers

	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task = {
	  set: set$1,
	  clear: clear
	};

	var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
	var macrotask = task.set;
	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$3 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$3) == 'process'; // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`

	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$3(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
	var flush, head, last, notify, toggle, node, promise, then; // modern engines have queueMicrotask method

	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$3.domain)) parent.exit();

	    while (head) {
	      fn = head.fn;
	      head = head.next;

	      try {
	        fn();
	      } catch (error) {
	        if (head) notify();else last = undefined;
	        throw error;
	      }
	    }

	    last = undefined;
	    if (parent) parent.enter();
	  }; // Node.js


	  if (IS_NODE) {
	    notify = function () {
	      process$3.nextTick(flush);
	    }; // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339

	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, {
	      characterData: true
	    });

	    notify = function () {
	      node.data = toggle = !toggle;
	    }; // environments with maybe non-completely correct, but existent Promise

	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;

	    notify = function () {
	      then.call(promise, flush);
	    }; // for other environments - macrotask based on:
	    // - setImmediate
	    // - MessageChannel
	    // - window.postMessag
	    // - onreadystatechange
	    // - setTimeout

	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global_1, flush);
	    };
	  }
	}

	var microtask = queueMicrotask || function (fn) {
	  var task = {
	    fn: fn,
	    next: undefined
	  };
	  if (last) last.next = task;

	  if (!head) {
	    head = task;
	    notify();
	  }

	  last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	}; // 25.4.1.5 NewPromiseCapability(C)


	var f$5 = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability = {
	  f: f$5
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;

	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return {
	      error: false,
	      value: exec()
	    };
	  } catch (error) {
	    return {
	      error: true,
	      value: error
	    };
	  }
	};

	var task$1 = task.set;
	var SPECIES$4 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState$1 = internalState.get;
	var setInternalState$1 = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$4 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$4) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;
	var FORCED$1 = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);

	  if (!GLOBAL_CORE_JS_PROMISE) {
	    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // We can't detect it synchronously, so just check versions
	    if (engineV8Version === 66) return true; // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test

	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
	  } // We need Promise#finally in the pure version for preventing prototype pollution
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679

	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false; // Detect correctness of subclassing with @@species support

	  var promise = PromiseConstructor.resolve(1);

	  var FakePromise = function (exec) {
	    exec(function () {
	      /* empty */
	    }, function () {
	      /* empty */
	    });
	  };

	  var constructor = promise.constructor = {};
	  constructor[SPECIES$4] = FakePromise;
	  return !(promise.then(function () {
	    /* empty */
	  }) instanceof FakePromise);
	});
	var INCORRECT_ITERATION = FORCED$1 || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () {
	    /* empty */
	  });
	}); // helpers

	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0; // variable length - can't use forEach

	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;

	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
	            state.rejection = HANDLED;
	          }

	          if (handler === true) result = value;else {
	            if (domain) domain.enter();
	            result = handler(value); // can throw

	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }

	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }

	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(promise, state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;

	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = {
	    promise: promise,
	    reason: reason
	  };

	  if (handler = global_1['on' + name]) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;

	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$4.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$4.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};

	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};

	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;

	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);

	    if (then) {
	      microtask(function () {
	        var wrapper = {
	          done: false
	        };

	        try {
	          then.call(value, bind(internalResolve, promise, wrapper, state), bind(internalReject, promise, wrapper, state));
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, {
	      done: false
	    }, error, state);
	  }
	}; // constructor polyfill


	if (FORCED$1) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState$1(this);

	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  }; // eslint-disable-next-line no-unused-vars


	  Internal = function Promise(executor) {
	    setInternalState$1(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };

	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$4.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify$1(this, state, false);
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });

	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState$1(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };

	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
	  };

	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then; // wrap native Promise#then for native async functions

	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected); // https://github.com/zloirock/core-js/issues/640
	    }, {
	      unsafe: true
	    }); // wrap fetch result

	    if (typeof $fetch == 'function') _export({
	      global: true,
	      enumerable: true,
	      forced: true
	    }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input
	      /* , init */
	      ) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    });
	  }
	}

	_export({
	  global: true,
	  wrap: true,
	  forced: FORCED$1
	}, {
	  Promise: PromiseConstructor
	});
	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);
	PromiseWrapper = getBuiltIn(PROMISE); // statics

	_export({
	  target: PROMISE,
	  stat: true,
	  forced: FORCED$1
	}, {
	  // `Promise.reject` method
	  // https://tc39.github.io/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced:  FORCED$1
	}, {
	  // `Promise.resolve` method
	  // https://tc39.github.io/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced: INCORRECT_ITERATION
	}, {
	  // `Promise.all` method
	  // https://tc39.github.io/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.github.io/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// so we use an intermediate function.


	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});
	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});
	var regexpStickyHelpers = {
	  UNSUPPORTED_Y: UNSUPPORTED_Y,
	  BROKEN_CARET: BROKEN_CARET
	};

	var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.

	var nativeReplace = String.prototype.replace;
	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	}();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET; // nonparticipating capturing group, copied from es5-shim's String#split patch.

	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');

	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex); // Support anchored sticky behavior.

	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      } // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.


	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }

	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }

	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({
	  target: 'RegExp',
	  proto: true,
	  forced: /./.exec !== regexpExec
	}, {
	  exec: regexpExec
	});

	var TO_STRING = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING];
	var NOT_GENERIC = fails(function () {
	  return nativeToString.call({
	    source: 'a',
	    flags: 'b'
	  }) != '/a/b';
	}); // FF44- RegExp#toString has a wrong name

	var INCORRECT_NAME = nativeToString.name != TO_STRING; // `RegExp.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring

	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, {
	    unsafe: true
	  });
	}

	var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp

	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw TypeError("The method doesn't accept regular expressions");
	  }

	  return it;
	};

	var MATCH$1 = wellKnownSymbol('match');

	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;

	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (e) {
	    try {
	      regexp[MATCH$1] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (f) {
	      /* empty */
	    }
	  }

	  return false;
	};

	// https://tc39.github.io/ecma262/#sec-string.prototype.includes


	_export({
	  target: 'String',
	  proto: true,
	  forced: !correctIsRegexpLogic('includes')
	}, {
	  includes: function includes(searchString
	  /* , position = 0 */
	  ) {
	    return !!~String(requireObjectCoercible(this)).indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var createMethod$3 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$3(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$3(true)
	};

	var charAt = stringMultibyte.charAt;
	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$2 = internalState.set;
	var getInternalState$2 = internalState.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator

	defineIterator(String, 'String', function (iterated) {
	  setInternalState$2(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  }); // `%StringIteratorPrototype%.next` method
	  // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$2(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return {
	    value: undefined,
	    done: true
	  };
	  point = charAt(string, index);
	  state.index += point.length;
	  return {
	    value: point,
	    done: false
	  };
	});

	var SPECIES$5 = wellKnownSymbol('species');
	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;

	  re.exec = function () {
	    var result = [];
	    result.groups = {
	      a: '7'
	    };
	    return result;
	  };

	  return ''.replace(re, '$<a>') !== '7';
	}); // IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0

	var REPLACE_KEEPS_$0 = function () {
	  return 'a'.replace(/./, '$0') === '$0';
	}();

	var REPLACE = wellKnownSymbol('replace'); // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string

	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }

	  return false;
	}(); // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper


	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;

	  re.exec = function () {
	    return originalExec.apply(this, arguments);
	  };

	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);
	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};

	    O[SYMBOL] = function () {
	      return 7;
	    };

	    return ''[KEY](O) != 7;
	  });
	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {}; // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.

	      re.constructor = {};

	      re.constructor[SPECIES$5] = function () {
	        return re;
	      };

	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () {
	      execCalled = true;
	      return null;
	    };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return {
	            done: true,
	            value: nativeRegExpMethod.call(regexp, str, arg2)
	          };
	        }

	        return {
	          done: true,
	          value: nativeMethod.call(str, regexp, arg2)
	        };
	      }

	      return {
	        done: false
	      };
	    }, {
	      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
	      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];
	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	    ? function (string, arg) {
	      return regexMethod.call(string, this, arg);
	    } // 21.2.5.6 RegExp.prototype[@@match](string)
	    // 21.2.5.9 RegExp.prototype[@@search](string)
	    : function (string) {
	      return regexMethod.call(string, this);
	    });
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var charAt$1 = stringMultibyte.charAt; // `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex

	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt$1(S, index).length : 1);
	};

	// https://tc39.github.io/ecma262/#sec-regexpexec

	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;

	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);

	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }

	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var arrayPush = [].push;
	var min$2 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

	var SUPPORTS_Y = !fails(function () {
	  return !RegExp(MAX_UINT32, 'y');
	}); // @@split logic

	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;

	  if ('abbc'.split(/(b)*/)[1] == 'c' || 'test'.split(/(?:)/, -1).length != 4 || 'ab'.split(/(?:ab)*/).length != 2 || '.'.split(/(.?)(.?)/).length != 4 || '.'.split(/()()/).length > 1 || ''.split(/.?/).length) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string]; // If `separator` is not a regex, use native split

	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }

	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0; // Make `global` and avoid `lastIndex` issues by working with a copy

	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;

	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;

	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }

	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }

	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));

	      return output.length > lim ? output.slice(0, lim) : output;
	    }; // Chakra, V8

	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [// `String.prototype.split` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.split
	  function split(separator, limit) {
	    var O = requireObjectCoercible(this);
	    var splitter = separator == undefined ? undefined : separator[SPLIT];
	    return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
	  }, // `RegExp.prototype[@@split]` method
	  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	  //
	  // NOTE: This cannot be properly polyfilled in engines that don't support
	  // the 'y' flag.
	  function (regexp, limit) {
	    var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	    if (res.done) return res.value;
	    var rx = anObject(regexp);
	    var S = String(this);
	    var C = speciesConstructor(rx, RegExp);
	    var unicodeMatching = rx.unicode;
	    var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
	    // simulate the 'y' flag.

	    var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	    var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	    if (lim === 0) return [];
	    if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	    var p = 0;
	    var q = 0;
	    var A = [];

	    while (q < S.length) {
	      splitter.lastIndex = SUPPORTS_Y ? q : 0;
	      var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	      var e;

	      if (z === null || (e = min$2(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
	        q = advanceStringIndex(S, q, unicodeMatching);
	      } else {
	        A.push(S.slice(p, q));
	        if (A.length === lim) return A;

	        for (var i = 1; i <= z.length - 1; i++) {
	          A.push(z[i]);
	          if (A.length === lim) return A;
	        }

	        q = p = e;
	      }
	    }

	    A.push(S.slice(p));
	    return A;
	  }];
	}, !SUPPORTS_Y);

	var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;
	var nativeStartsWith = ''.startsWith;
	var min$3 = Math.min;
	var CORRECT_IS_REGEXP_LOGIC = correctIsRegexpLogic('startsWith'); // https://github.com/zloirock/core-js/pull/702

	var MDN_POLYFILL_BUG =  !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor$4(String.prototype, 'startsWith');
	  return descriptor && !descriptor.writable;
	}(); // `String.prototype.startsWith` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.startswith

	_export({
	  target: 'String',
	  proto: true,
	  forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC
	}, {
	  startsWith: function startsWith(searchString
	  /* , position = 0 */
	  ) {
	    var that = String(requireObjectCoercible(this));
	    notARegexp(searchString);
	    var index = toLength(min$3(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = String(searchString);
	    return nativeStartsWith ? nativeStartsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
	  }
	});

	var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

	var defineProperty$4 = objectDefineProperty.f;
	var Int8Array$1 = global_1.Int8Array;
	var Int8ArrayPrototype = Int8Array$1 && Int8Array$1.prototype;
	var Uint8ClampedArray = global_1.Uint8ClampedArray;
	var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
	var TypedArray = Int8Array$1 && objectGetPrototypeOf(Int8Array$1);
	var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
	var ObjectPrototype$1 = Object.prototype;
	var isPrototypeOf = ObjectPrototype$1.isPrototypeOf;
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG'); // Fixing native typed arrays in Opera Presto crashes the browser, see #595

	var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferNative && !!objectSetPrototypeOf && classof(global_1.opera) !== 'Opera';
	var TYPED_ARRAY_TAG_REQIRED = false;
	var NAME$1;
	var TypedArrayConstructorsList = {
	  Int8Array: 1,
	  Uint8Array: 1,
	  Uint8ClampedArray: 1,
	  Int16Array: 2,
	  Uint16Array: 2,
	  Int32Array: 4,
	  Uint32Array: 4,
	  Float32Array: 4,
	  Float64Array: 8
	};

	var isView = function isView(it) {
	  var klass = classof(it);
	  return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
	};

	var isTypedArray = function (it) {
	  return isObject(it) && has(TypedArrayConstructorsList, classof(it));
	};

	var aTypedArray = function (it) {
	  if (isTypedArray(it)) return it;
	  throw TypeError('Target is not a typed array');
	};

	var aTypedArrayConstructor = function (C) {
	  if (objectSetPrototypeOf) {
	    if (isPrototypeOf.call(TypedArray, C)) return C;
	  } else for (var ARRAY in TypedArrayConstructorsList) if (has(TypedArrayConstructorsList, NAME$1)) {
	    var TypedArrayConstructor = global_1[ARRAY];

	    if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
	      return C;
	    }
	  }

	  throw TypeError('Target is not a typed array constructor');
	};

	var exportTypedArrayMethod = function (KEY, property, forced) {
	  if (!descriptors) return;
	  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
	    var TypedArrayConstructor = global_1[ARRAY];

	    if (TypedArrayConstructor && has(TypedArrayConstructor.prototype, KEY)) {
	      delete TypedArrayConstructor.prototype[KEY];
	    }
	  }

	  if (!TypedArrayPrototype[KEY] || forced) {
	    redefine(TypedArrayPrototype, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property);
	  }
	};

	var exportTypedArrayStaticMethod = function (KEY, property, forced) {
	  var ARRAY, TypedArrayConstructor;
	  if (!descriptors) return;

	  if (objectSetPrototypeOf) {
	    if (forced) for (ARRAY in TypedArrayConstructorsList) {
	      TypedArrayConstructor = global_1[ARRAY];

	      if (TypedArrayConstructor && has(TypedArrayConstructor, KEY)) {
	        delete TypedArrayConstructor[KEY];
	      }
	    }

	    if (!TypedArray[KEY] || forced) {
	      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
	      try {
	        return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8Array$1[KEY] || property);
	      } catch (error) {
	        /* empty */
	      }
	    } else return;
	  }

	  for (ARRAY in TypedArrayConstructorsList) {
	    TypedArrayConstructor = global_1[ARRAY];

	    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
	      redefine(TypedArrayConstructor, KEY, property);
	    }
	  }
	};

	for (NAME$1 in TypedArrayConstructorsList) {
	  if (!global_1[NAME$1]) NATIVE_ARRAY_BUFFER_VIEWS = false;
	} // WebKit bug - typed arrays constructors prototype is Object.prototype


	if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
	  // eslint-disable-next-line no-shadow
	  TypedArray = function TypedArray() {
	    throw TypeError('Incorrect invocation');
	  };

	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1], TypedArray);
	  }
	}

	if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$1) {
	  TypedArrayPrototype = TypedArray.prototype;
	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1].prototype, TypedArrayPrototype);
	  }
	} // WebKit bug - one more object in Uint8ClampedArray prototype chain


	if (NATIVE_ARRAY_BUFFER_VIEWS && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
	  objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
	}

	if (descriptors && !has(TypedArrayPrototype, TO_STRING_TAG$3)) {
	  TYPED_ARRAY_TAG_REQIRED = true;
	  defineProperty$4(TypedArrayPrototype, TO_STRING_TAG$3, {
	    get: function () {
	      return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
	    }
	  });

	  for (NAME$1 in TypedArrayConstructorsList) if (global_1[NAME$1]) {
	    createNonEnumerableProperty(global_1[NAME$1], TYPED_ARRAY_TAG, NAME$1);
	  }
	}

	var arrayBufferViewCore = {
	  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
	  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
	  aTypedArray: aTypedArray,
	  aTypedArrayConstructor: aTypedArrayConstructor,
	  exportTypedArrayMethod: exportTypedArrayMethod,
	  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
	  isView: isView,
	  isTypedArray: isTypedArray,
	  TypedArray: TypedArray,
	  TypedArrayPrototype: TypedArrayPrototype
	};

	/* eslint-disable no-new */

	var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
	var ArrayBuffer$1 = global_1.ArrayBuffer;
	var Int8Array$2 = global_1.Int8Array;
	var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails(function () {
	  Int8Array$2(1);
	}) || !fails(function () {
	  new Int8Array$2(-1);
	}) || !checkCorrectnessOfIteration(function (iterable) {
	  new Int8Array$2();
	  new Int8Array$2(null);
	  new Int8Array$2(1.5);
	  new Int8Array$2(iterable);
	}, true) || fails(function () {
	  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
	  return new Int8Array$2(new ArrayBuffer$1(2), 1, undefined).length !== 1;
	});

	// https://tc39.github.io/ecma262/#sec-toindex

	var toIndex = function (it) {
	  if (it === undefined) return 0;
	  var number = toInteger(it);
	  var length = toLength(number);
	  if (number !== length) throw RangeError('Wrong length or index');
	  return length;
	};

	// IEEE754 conversions based on https://github.com/feross/ieee754
	// eslint-disable-next-line no-shadow-restricted-names
	var Infinity = 1 / 0;
	var abs = Math.abs;
	var pow = Math.pow;
	var floor$2 = Math.floor;
	var log = Math.log;
	var LN2 = Math.LN2;

	var pack = function (number, mantissaLength, bytes) {
	  var buffer = new Array(bytes);
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
	  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
	  var index = 0;
	  var exponent, mantissa, c;
	  number = abs(number); // eslint-disable-next-line no-self-compare

	  if (number != number || number === Infinity) {
	    // eslint-disable-next-line no-self-compare
	    mantissa = number != number ? 1 : 0;
	    exponent = eMax;
	  } else {
	    exponent = floor$2(log(number) / LN2);

	    if (number * (c = pow(2, -exponent)) < 1) {
	      exponent--;
	      c *= 2;
	    }

	    if (exponent + eBias >= 1) {
	      number += rt / c;
	    } else {
	      number += rt * pow(2, 1 - eBias);
	    }

	    if (number * c >= 2) {
	      exponent++;
	      c /= 2;
	    }

	    if (exponent + eBias >= eMax) {
	      mantissa = 0;
	      exponent = eMax;
	    } else if (exponent + eBias >= 1) {
	      mantissa = (number * c - 1) * pow(2, mantissaLength);
	      exponent = exponent + eBias;
	    } else {
	      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
	      exponent = 0;
	    }
	  }

	  for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);

	  exponent = exponent << mantissaLength | mantissa;
	  exponentLength += mantissaLength;

	  for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);

	  buffer[--index] |= sign * 128;
	  return buffer;
	};

	var unpack = function (buffer, mantissaLength) {
	  var bytes = buffer.length;
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var nBits = exponentLength - 7;
	  var index = bytes - 1;
	  var sign = buffer[index--];
	  var exponent = sign & 127;
	  var mantissa;
	  sign >>= 7;

	  for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);

	  mantissa = exponent & (1 << -nBits) - 1;
	  exponent >>= -nBits;
	  nBits += mantissaLength;

	  for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);

	  if (exponent === 0) {
	    exponent = 1 - eBias;
	  } else if (exponent === eMax) {
	    return mantissa ? NaN : sign ? -Infinity : Infinity;
	  } else {
	    mantissa = mantissa + pow(2, mantissaLength);
	    exponent = exponent - eBias;
	  }

	  return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
	};

	var ieee754 = {
	  pack: pack,
	  unpack: unpack
	};

	// https://tc39.github.io/ecma262/#sec-array.prototype.fill


	var arrayFill = function fill(value
	/* , start = 0, end = @length */
	) {
	  var O = toObject(this);
	  var length = toLength(O.length);
	  var argumentsLength = arguments.length;
	  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
	  var end = argumentsLength > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);

	  while (endPos > index) O[index++] = value;

	  return O;
	};

	var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
	var defineProperty$5 = objectDefineProperty.f;
	var getInternalState$3 = internalState.get;
	var setInternalState$3 = internalState.set;
	var ARRAY_BUFFER = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE$1 = 'prototype';
	var WRONG_LENGTH = 'Wrong length';
	var WRONG_INDEX = 'Wrong index';
	var NativeArrayBuffer = global_1[ARRAY_BUFFER];
	var $ArrayBuffer = NativeArrayBuffer;
	var $DataView = global_1[DATA_VIEW];
	var $DataViewPrototype = $DataView && $DataView[PROTOTYPE$1];
	var ObjectPrototype$2 = Object.prototype;
	var RangeError$1 = global_1.RangeError;
	var packIEEE754 = ieee754.pack;
	var unpackIEEE754 = ieee754.unpack;

	var packInt8 = function (number) {
	  return [number & 0xFF];
	};

	var packInt16 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF];
	};

	var packInt32 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
	};

	var unpackInt32 = function (buffer) {
	  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
	};

	var packFloat32 = function (number) {
	  return packIEEE754(number, 23, 4);
	};

	var packFloat64 = function (number) {
	  return packIEEE754(number, 52, 8);
	};

	var addGetter = function (Constructor, key) {
	  defineProperty$5(Constructor[PROTOTYPE$1], key, {
	    get: function () {
	      return getInternalState$3(this)[key];
	    }
	  });
	};

	var get$1 = function (view, count, index, isLittleEndian) {
	  var intIndex = toIndex(index);
	  var store = getInternalState$3(view);
	  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
	  var bytes = getInternalState$3(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = bytes.slice(start, start + count);
	  return isLittleEndian ? pack : pack.reverse();
	};

	var set$2 = function (view, count, index, conversion, value, isLittleEndian) {
	  var intIndex = toIndex(index);
	  var store = getInternalState$3(view);
	  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
	  var bytes = getInternalState$3(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = conversion(+value);

	  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
	};

	if (!arrayBufferNative) {
	  $ArrayBuffer = function ArrayBuffer(length) {
	    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
	    var byteLength = toIndex(length);
	    setInternalState$3(this, {
	      bytes: arrayFill.call(new Array(byteLength), 0),
	      byteLength: byteLength
	    });
	    if (!descriptors) this.byteLength = byteLength;
	  };

	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    anInstance(this, $DataView, DATA_VIEW);
	    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
	    var bufferLength = getInternalState$3(buffer).byteLength;
	    var offset = toInteger(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
	    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
	    if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
	    setInternalState$3(this, {
	      buffer: buffer,
	      byteLength: byteLength,
	      byteOffset: offset
	    });

	    if (!descriptors) {
	      this.buffer = buffer;
	      this.byteLength = byteLength;
	      this.byteOffset = offset;
	    }
	  };

	  if (descriptors) {
	    addGetter($ArrayBuffer, 'byteLength');
	    addGetter($DataView, 'buffer');
	    addGetter($DataView, 'byteLength');
	    addGetter($DataView, 'byteOffset');
	  }

	  redefineAll($DataView[PROTOTYPE$1], {
	    getInt8: function getInt8(byteOffset) {
	      return get$1(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset) {
	      return get$1(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset
	    /* , littleEndian */
	    ) {
	      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset
	    /* , littleEndian */
	    ) {
	      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset
	    /* , littleEndian */
	    ) {
	      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
	    },
	    getUint32: function getUint32(byteOffset
	    /* , littleEndian */
	    ) {
	      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset
	    /* , littleEndian */
	    ) {
	      return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
	    },
	    getFloat64: function getFloat64(byteOffset
	    /* , littleEndian */
	    ) {
	      return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
	    },
	    setInt8: function setInt8(byteOffset, value) {
	      set$2(this, 1, byteOffset, packInt8, value);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      set$2(this, 1, byteOffset, packInt8, value);
	    },
	    setInt16: function setInt16(byteOffset, value
	    /* , littleEndian */
	    ) {
	      set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setUint16: function setUint16(byteOffset, value
	    /* , littleEndian */
	    ) {
	      set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setInt32: function setInt32(byteOffset, value
	    /* , littleEndian */
	    ) {
	      set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setUint32: function setUint32(byteOffset, value
	    /* , littleEndian */
	    ) {
	      set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setFloat32: function setFloat32(byteOffset, value
	    /* , littleEndian */
	    ) {
	      set$2(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setFloat64: function setFloat64(byteOffset, value
	    /* , littleEndian */
	    ) {
	      set$2(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
	    }
	  });
	} else {
	  if (!fails(function () {
	    NativeArrayBuffer(1);
	  }) || !fails(function () {
	    new NativeArrayBuffer(-1); // eslint-disable-line no-new
	  }) || fails(function () {
	    new NativeArrayBuffer(); // eslint-disable-line no-new

	    new NativeArrayBuffer(1.5); // eslint-disable-line no-new

	    new NativeArrayBuffer(NaN); // eslint-disable-line no-new

	    return NativeArrayBuffer.name != ARRAY_BUFFER;
	  })) {
	    $ArrayBuffer = function ArrayBuffer(length) {
	      anInstance(this, $ArrayBuffer);
	      return new NativeArrayBuffer(toIndex(length));
	    };

	    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE$1] = NativeArrayBuffer[PROTOTYPE$1];

	    for (var keys$2 = getOwnPropertyNames$1(NativeArrayBuffer), j$1 = 0, key$1; keys$2.length > j$1;) {
	      if (!((key$1 = keys$2[j$1++]) in $ArrayBuffer)) {
	        createNonEnumerableProperty($ArrayBuffer, key$1, NativeArrayBuffer[key$1]);
	      }
	    }

	    ArrayBufferPrototype.constructor = $ArrayBuffer;
	  } // WebKit bug - the same parent prototype for typed arrays and data view


	  if (objectSetPrototypeOf && objectGetPrototypeOf($DataViewPrototype) !== ObjectPrototype$2) {
	    objectSetPrototypeOf($DataViewPrototype, ObjectPrototype$2);
	  } // iOS Safari 7.x bug


	  var testView = new $DataView(new $ArrayBuffer(2));
	  var nativeSetInt8 = $DataViewPrototype.setInt8;
	  testView.setInt8(0, 2147483648);
	  testView.setInt8(1, 2147483649);
	  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataViewPrototype, {
	    setInt8: function setInt8(byteOffset, value) {
	      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
	    }
	  }, {
	    unsafe: true
	  });
	}

	setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	setToStringTag($DataView, DATA_VIEW);
	var arrayBuffer = {
	  ArrayBuffer: $ArrayBuffer,
	  DataView: $DataView
	};

	var toPositiveInteger = function (it) {
	  var result = toInteger(it);
	  if (result < 0) throw RangeError("The argument can't be less than 0");
	  return result;
	};

	var toOffset = function (it, BYTES) {
	  var offset = toPositiveInteger(it);
	  if (offset % BYTES) throw RangeError('Wrong offset');
	  return offset;
	};

	var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;

	var typedArrayFrom = function from(source
	/* , mapfn, thisArg */
	) {
	  var O = toObject(source);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var i, length, result, step, iterator, next;

	  if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    O = [];

	    while (!(step = next.call(iterator)).done) {
	      O.push(step.value);
	    }
	  }

	  if (mapping && argumentsLength > 2) {
	    mapfn = functionBindContext(mapfn, arguments[2], 2);
	  }

	  length = toLength(O.length);
	  result = new (aTypedArrayConstructor$1(this))(length);

	  for (i = 0; length > i; i++) {
	    result[i] = mapping ? mapfn(O[i], i) : O[i];
	  }

	  return result;
	};

	var typedArrayConstructor = createCommonjsModule(function (module) {

	  var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	  var forEach = arrayIteration.forEach;
	  var getInternalState = internalState.get;
	  var setInternalState = internalState.set;
	  var nativeDefineProperty = objectDefineProperty.f;
	  var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  var round = Math.round;
	  var RangeError = global_1.RangeError;
	  var ArrayBuffer = arrayBuffer.ArrayBuffer;
	  var DataView = arrayBuffer.DataView;
	  var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
	  var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
	  var TypedArray = arrayBufferViewCore.TypedArray;
	  var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
	  var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
	  var isTypedArray = arrayBufferViewCore.isTypedArray;
	  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	  var WRONG_LENGTH = 'Wrong length';

	  var fromList = function (C, list) {
	    var index = 0;
	    var length = list.length;
	    var result = new (aTypedArrayConstructor(C))(length);

	    while (length > index) result[index] = list[index++];

	    return result;
	  };

	  var addGetter = function (it, key) {
	    nativeDefineProperty(it, key, {
	      get: function () {
	        return getInternalState(this)[key];
	      }
	    });
	  };

	  var isArrayBuffer = function (it) {
	    var klass;
	    return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
	  };

	  var isTypedArrayIndex = function (target, key) {
	    return isTypedArray(target) && typeof key != 'symbol' && key in target && String(+key) == String(key);
	  };

	  var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
	    return isTypedArrayIndex(target, key = toPrimitive(key, true)) ? createPropertyDescriptor(2, target[key]) : nativeGetOwnPropertyDescriptor(target, key);
	  };

	  var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
	    if (isTypedArrayIndex(target, key = toPrimitive(key, true)) && isObject(descriptor) && has(descriptor, 'value') && !has(descriptor, 'get') && !has(descriptor, 'set') // TODO: add validation descriptor w/o calling accessors
	    && !descriptor.configurable && (!has(descriptor, 'writable') || descriptor.writable) && (!has(descriptor, 'enumerable') || descriptor.enumerable)) {
	      target[key] = descriptor.value;
	      return target;
	    }

	    return nativeDefineProperty(target, key, descriptor);
	  };

	  if (descriptors) {
	    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	      objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
	      objectDefineProperty.f = wrappedDefineProperty;
	      addGetter(TypedArrayPrototype, 'buffer');
	      addGetter(TypedArrayPrototype, 'byteOffset');
	      addGetter(TypedArrayPrototype, 'byteLength');
	      addGetter(TypedArrayPrototype, 'length');
	    }

	    _export({
	      target: 'Object',
	      stat: true,
	      forced: !NATIVE_ARRAY_BUFFER_VIEWS
	    }, {
	      getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
	      defineProperty: wrappedDefineProperty
	    });

	    module.exports = function (TYPE, wrapper, CLAMPED) {
	      var BYTES = TYPE.match(/\d+$/)[0] / 8;
	      var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
	      var GETTER = 'get' + TYPE;
	      var SETTER = 'set' + TYPE;
	      var NativeTypedArrayConstructor = global_1[CONSTRUCTOR_NAME];
	      var TypedArrayConstructor = NativeTypedArrayConstructor;
	      var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
	      var exported = {};

	      var getter = function (that, index) {
	        var data = getInternalState(that);
	        return data.view[GETTER](index * BYTES + data.byteOffset, true);
	      };

	      var setter = function (that, index, value) {
	        var data = getInternalState(that);
	        if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
	        data.view[SETTER](index * BYTES + data.byteOffset, value, true);
	      };

	      var addElement = function (that, index) {
	        nativeDefineProperty(that, index, {
	          get: function () {
	            return getter(this, index);
	          },
	          set: function (value) {
	            return setter(this, index, value);
	          },
	          enumerable: true
	        });
	      };

	      if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	        TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
	          anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
	          var index = 0;
	          var byteOffset = 0;
	          var buffer, byteLength, length;

	          if (!isObject(data)) {
	            length = toIndex(data);
	            byteLength = length * BYTES;
	            buffer = new ArrayBuffer(byteLength);
	          } else if (isArrayBuffer(data)) {
	            buffer = data;
	            byteOffset = toOffset(offset, BYTES);
	            var $len = data.byteLength;

	            if ($length === undefined) {
	              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
	              byteLength = $len - byteOffset;
	              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
	            } else {
	              byteLength = toLength($length) * BYTES;
	              if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
	            }

	            length = byteLength / BYTES;
	          } else if (isTypedArray(data)) {
	            return fromList(TypedArrayConstructor, data);
	          } else {
	            return typedArrayFrom.call(TypedArrayConstructor, data);
	          }

	          setInternalState(that, {
	            buffer: buffer,
	            byteOffset: byteOffset,
	            byteLength: byteLength,
	            length: length,
	            view: new DataView(buffer)
	          });

	          while (index < length) addElement(that, index++);
	        });
	        if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	        TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
	      } else if (typedArrayConstructorsRequireWrappers) {
	        TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
	          anInstance(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
	          return inheritIfRequired(function () {
	            if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
	            if (isArrayBuffer(data)) return $length !== undefined ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length) : typedArrayOffset !== undefined ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES)) : new NativeTypedArrayConstructor(data);
	            if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
	            return typedArrayFrom.call(TypedArrayConstructor, data);
	          }(), dummy, TypedArrayConstructor);
	        });
	        if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	        forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
	          if (!(key in TypedArrayConstructor)) {
	            createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
	          }
	        });
	        TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
	      }

	      if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
	        createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
	      }

	      if (TYPED_ARRAY_TAG) {
	        createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
	      }

	      exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;
	      _export({
	        global: true,
	        forced: TypedArrayConstructor != NativeTypedArrayConstructor,
	        sham: !NATIVE_ARRAY_BUFFER_VIEWS
	      }, exported);

	      if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
	        createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
	      }

	      if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
	        createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
	      }

	      setSpecies(CONSTRUCTOR_NAME);
	    };
	  } else module.exports = function () {
	    /* empty */
	  };
	});

	// https://tc39.github.io/ecma262/#sec-typedarray-objects

	typedArrayConstructor('Uint8', function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	var min$4 = Math.min; // `Array.prototype.copyWithin` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.copywithin

	var arrayCopyWithin = [].copyWithin || function copyWithin(target
	/* = 0 */
	, start
	/* = 0, end = @length */
	) {
	  var O = toObject(this);
	  var len = toLength(O.length);
	  var to = toAbsoluteIndex(target, len);
	  var from = toAbsoluteIndex(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = min$4((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
	  var inc = 1;

	  if (from < to && to < from + count) {
	    inc = -1;
	    from += count - 1;
	    to += count - 1;
	  }

	  while (count-- > 0) {
	    if (from in O) O[to] = O[from];else delete O[to];
	    to += inc;
	    from += inc;
	  }

	  return O;
	};

	var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.copyWithin` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.copywithin

	exportTypedArrayMethod$1('copyWithin', function copyWithin(target, start
	/* , end */
	) {
	  return arrayCopyWithin.call(aTypedArray$1(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	});

	var $every = arrayIteration.every;
	var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.every` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.every

	exportTypedArrayMethod$2('every', function every(callbackfn
	/* , thisArg */
	) {
	  return $every(aTypedArray$2(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.fill` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.fill
	// eslint-disable-next-line no-unused-vars

	exportTypedArrayMethod$3('fill', function fill(value
	/* , start, end */
	) {
	  return arrayFill.apply(aTypedArray$3(this), arguments);
	});

	var $filter = arrayIteration.filter;
	var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.filter` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.filter

	exportTypedArrayMethod$4('filter', function filter(callbackfn
	/* , thisArg */
	) {
	  var list = $filter(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  var C = speciesConstructor(this, this.constructor);
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor$2(C))(length);

	  while (length > index) result[index] = list[index++];

	  return result;
	});

	var $find = arrayIteration.find;
	var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.find` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.find

	exportTypedArrayMethod$5('find', function find(predicate
	/* , thisArg */
	) {
	  return $find(aTypedArray$5(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $findIndex = arrayIteration.findIndex;
	var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.findIndex` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.findindex

	exportTypedArrayMethod$6('findIndex', function findIndex(predicate
	/* , thisArg */
	) {
	  return $findIndex(aTypedArray$6(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $forEach = arrayIteration.forEach;
	var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.foreach

	exportTypedArrayMethod$7('forEach', function forEach(callbackfn
	/* , thisArg */
	) {
	  $forEach(aTypedArray$7(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $includes$1 = arrayIncludes.includes;
	var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.includes

	exportTypedArrayMethod$8('includes', function includes(searchElement
	/* , fromIndex */
	) {
	  return $includes$1(aTypedArray$8(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $indexOf$1 = arrayIncludes.indexOf;
	var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.indexof

	exportTypedArrayMethod$9('indexOf', function indexOf(searchElement
	/* , fromIndex */
	) {
	  return $indexOf$1(aTypedArray$9(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var Uint8Array$1 = global_1.Uint8Array;
	var arrayValues = es_array_iterator.values;
	var arrayKeys = es_array_iterator.keys;
	var arrayEntries = es_array_iterator.entries;
	var aTypedArray$a = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;
	var nativeTypedArrayIterator = Uint8Array$1 && Uint8Array$1.prototype[ITERATOR$5];
	var CORRECT_ITER_NAME = !!nativeTypedArrayIterator && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

	var typedArrayValues = function values() {
	  return arrayValues.call(aTypedArray$a(this));
	}; // `%TypedArray%.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.entries


	exportTypedArrayMethod$a('entries', function entries() {
	  return arrayEntries.call(aTypedArray$a(this));
	}); // `%TypedArray%.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.keys

	exportTypedArrayMethod$a('keys', function keys() {
	  return arrayKeys.call(aTypedArray$a(this));
	}); // `%TypedArray%.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.values

	exportTypedArrayMethod$a('values', typedArrayValues, !CORRECT_ITER_NAME); // `%TypedArray%.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype-@@iterator

	exportTypedArrayMethod$a(ITERATOR$5, typedArrayValues, !CORRECT_ITER_NAME);

	var aTypedArray$b = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;
	var $join = [].join; // `%TypedArray%.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.join
	// eslint-disable-next-line no-unused-vars

	exportTypedArrayMethod$b('join', function join(separator) {
	  return $join.apply(aTypedArray$b(this), arguments);
	});

	var min$5 = Math.min;
	var nativeLastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO$1 = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD$1 = arrayMethodIsStrict('lastIndexOf'); // For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method

	var USES_TO_LENGTH$3 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	});
	var FORCED$2 = NEGATIVE_ZERO$1 || !STRICT_METHOD$1 || !USES_TO_LENGTH$3; // `Array.prototype.lastIndexOf` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

	var arrayLastIndexOf = FORCED$2 ? function lastIndexOf(searchElement
	/* , fromIndex = @[*-1] */
	) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO$1) return nativeLastIndexOf.apply(this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = toLength(O.length);
	  var index = length - 1;
	  if (arguments.length > 1) index = min$5(index, toInteger(arguments[1]));
	  if (index < 0) index = length + index;

	  for (; index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;

	  return -1;
	} : nativeLastIndexOf;

	var aTypedArray$c = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.lastIndexOf` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.lastindexof
	// eslint-disable-next-line no-unused-vars

	exportTypedArrayMethod$c('lastIndexOf', function lastIndexOf(searchElement
	/* , fromIndex */
	) {
	  return arrayLastIndexOf.apply(aTypedArray$c(this), arguments);
	});

	var $map$1 = arrayIteration.map;
	var aTypedArray$d = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.map` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.map

	exportTypedArrayMethod$d('map', function map(mapfn
	/* , thisArg */
	) {
	  return $map$1(aTypedArray$d(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
	    return new (aTypedArrayConstructor$3(speciesConstructor(O, O.constructor)))(length);
	  });
	});

	var createMethod$4 = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    aFunction$1(callbackfn);
	    var O = toObject(that);
	    var self = indexedObject(O);
	    var length = toLength(O.length);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }

	      index += i;

	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw TypeError('Reduce of empty array with no initial value');
	      }
	    }

	    for (; IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }

	    return memo;
	  };
	};

	var arrayReduce = {
	  // `Array.prototype.reduce` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
	  left: createMethod$4(false),
	  // `Array.prototype.reduceRight` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
	  right: createMethod$4(true)
	};

	var $reduce = arrayReduce.left;
	var aTypedArray$e = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.reduce` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduce

	exportTypedArrayMethod$e('reduce', function reduce(callbackfn
	/* , initialValue */
	) {
	  return $reduce(aTypedArray$e(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $reduceRight = arrayReduce.right;
	var aTypedArray$f = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.reduceRicht` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduceright

	exportTypedArrayMethod$f('reduceRight', function reduceRight(callbackfn
	/* , initialValue */
	) {
	  return $reduceRight(aTypedArray$f(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$g = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;
	var floor$3 = Math.floor; // `%TypedArray%.prototype.reverse` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reverse

	exportTypedArrayMethod$g('reverse', function reverse() {
	  var that = this;
	  var length = aTypedArray$g(that).length;
	  var middle = floor$3(length / 2);
	  var index = 0;
	  var value;

	  while (index < middle) {
	    value = that[index];
	    that[index++] = that[--length];
	    that[length] = value;
	  }

	  return that;
	});

	var aTypedArray$h = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;
	var FORCED$3 = fails(function () {
	  // eslint-disable-next-line no-undef
	  new Int8Array(1).set({});
	}); // `%TypedArray%.prototype.set` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.set

	exportTypedArrayMethod$h('set', function set(arrayLike
	/* , offset */
	) {
	  aTypedArray$h(this);
	  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
	  var length = this.length;
	  var src = toObject(arrayLike);
	  var len = toLength(src.length);
	  var index = 0;
	  if (len + offset > length) throw RangeError('Wrong length');

	  while (index < len) this[offset + index] = src[index++];
	}, FORCED$3);

	var aTypedArray$i = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$4 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;
	var $slice = [].slice;
	var FORCED$4 = fails(function () {
	  // eslint-disable-next-line no-undef
	  new Int8Array(1).slice();
	}); // `%TypedArray%.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.slice

	exportTypedArrayMethod$i('slice', function slice(start, end) {
	  var list = $slice.call(aTypedArray$i(this), start, end);
	  var C = speciesConstructor(this, this.constructor);
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor$4(C))(length);

	  while (length > index) result[index] = list[index++];

	  return result;
	}, FORCED$4);

	var $some = arrayIteration.some;
	var aTypedArray$j = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.some` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.some

	exportTypedArrayMethod$j('some', function some(callbackfn
	/* , thisArg */
	) {
	  return $some(aTypedArray$j(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$k = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;
	var $sort = [].sort; // `%TypedArray%.prototype.sort` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.sort

	exportTypedArrayMethod$k('sort', function sort(comparefn) {
	  return $sort.call(aTypedArray$k(this), comparefn);
	});

	var aTypedArray$l = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod; // `%TypedArray%.prototype.subarray` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.subarray

	exportTypedArrayMethod$l('subarray', function subarray(begin, end) {
	  var O = aTypedArray$l(this);
	  var length = O.length;
	  var beginIndex = toAbsoluteIndex(begin, length);
	  return new (speciesConstructor(O, O.constructor))(O.buffer, O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT, toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex));
	});

	var Int8Array$3 = global_1.Int8Array;
	var aTypedArray$m = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;
	var $toLocaleString = [].toLocaleString;
	var $slice$1 = [].slice; // iOS Safari 6.x fails here

	var TO_LOCALE_STRING_BUG = !!Int8Array$3 && fails(function () {
	  $toLocaleString.call(new Int8Array$3(1));
	});
	var FORCED$5 = fails(function () {
	  return [1, 2].toLocaleString() != new Int8Array$3([1, 2]).toLocaleString();
	}) || !fails(function () {
	  Int8Array$3.prototype.toLocaleString.call([1, 2]);
	}); // `%TypedArray%.prototype.toLocaleString` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tolocalestring

	exportTypedArrayMethod$m('toLocaleString', function toLocaleString() {
	  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice$1.call(aTypedArray$m(this)) : aTypedArray$m(this), arguments);
	}, FORCED$5);

	var exportTypedArrayMethod$n = arrayBufferViewCore.exportTypedArrayMethod;
	var Uint8Array$2 = global_1.Uint8Array;
	var Uint8ArrayPrototype = Uint8Array$2 && Uint8Array$2.prototype || {};
	var arrayToString = [].toString;
	var arrayJoin = [].join;

	if (fails(function () {
	  arrayToString.call({});
	})) {
	  arrayToString = function toString() {
	    return arrayJoin.call(this);
	  };
	}

	var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString; // `%TypedArray%.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tostring

	exportTypedArrayMethod$n('toString', arrayToString, IS_NOT_ARRAY_METHOD);

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var ITERATOR$6 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;

	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR$6] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype, ITERATOR$6, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR$6] = ArrayValues;
	    }

	    if (!CollectionPrototype[TO_STRING_TAG$4]) {
	      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$4, COLLECTION_NAME);
	    }

	    if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	var ITERATOR$7 = wellKnownSymbol('iterator');
	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return isPure && !url.toJSON || !searchParams.sort || url.href !== 'http://a/c%20d?a=1&c=3' || searchParams.get('c') !== '3' || String(new URLSearchParams('?a=1')) !== 'a=1' || !searchParams[ITERATOR$7] // throws in Edge
	  || new URL('https://a@b').username !== 'a' || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b' // not punycoded in Edge
	  || new URL('http://тест').host !== 'xn--e1aybc' // not escaped in Chrome 62-
	  || new URL('http://a#б').hash !== '#%D0%B1' // fails in Chrome 66-
	  || result !== 'a1c3' // throws in Safari
	  || new URL('http://x', undefined).host !== 'x';
	});

	var nativeAssign = Object.assign;
	var defineProperty$6 = Object.defineProperty; // `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign

	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({
	    b: 1
	  }, nativeAssign(defineProperty$6({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$6(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), {
	    b: 2
	  })).b !== 1) return true; // should work with symbols and should have deterministic property order (V8 bug)

	  var A = {};
	  var B = {}; // eslint-disable-next-line no-undef

	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) {
	    B[chr] = chr;
	  });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) {
	  // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;

	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;

	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  }

	  return T;
	} : nativeAssign;

	// https://tc39.github.io/ecma262/#sec-array.from


	var arrayFrom = function from(arrayLike
	/* , mapfn = undefined, thisArg = undefined */
	) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2); // if the target is not iterable or it's an array with the default iterator - use a simple case

	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();

	    for (; !(step = next.call(iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);

	    for (; length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }

	  result.length = index;
	  return result;
	};

	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80

	var delimiter = '-'; // '\x2D'

	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars

	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;
	var floor$4 = Math.floor;
	var stringFromCharCode = String.fromCharCode;
	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */

	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;

	  while (counter < length) {
	    var value = string.charCodeAt(counter++);

	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = string.charCodeAt(counter++);

	      if ((extra & 0xFC00) == 0xDC00) {
	        // Low surrogate.
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }

	  return output;
	};
	/**
	 * Converts a digit/integer into a basic code point.
	 */


	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};
	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */


	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$4(delta / damp) : delta >> 1;
	  delta += floor$4(delta / numPoints);

	  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$4(delta / baseMinusTMin);
	  }

	  return floor$4(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};
	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	// eslint-disable-next-line  max-statements


	var encode = function (input) {
	  var output = []; // Convert the input in UCS-2 to an array of Unicode code points.

	  input = ucs2decode(input); // Cache the length.

	  var inputLength = input.length; // Initialize the state.

	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue; // Handle the basic code points.

	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];

	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.

	  var handledCPCount = basicLength; // number of code points that have been handled;
	  // Finish the basic string with a delimiter unless it's empty.

	  if (basicLength) {
	    output.push(delimiter);
	  } // Main encoding loop:


	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];

	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    } // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.


	    var handledCPCountPlusOne = handledCPCount + 1;

	    if (m - n > floor$4((maxInt - delta) / handledCPCountPlusOne)) {
	      throw RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];

	      if (currentValue < n && ++delta > maxInt) {
	        throw RangeError(OVERFLOW_ERROR);
	      }

	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;

	        for (var k = base;;
	        /* no condition */
	        k += base) {
	          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$4(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;
	  }

	  return output.join('');
	};

	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
	  var i, label;

	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
	  }

	  return encoded.join('.');
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);

	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  }

	  return anObject(iteratorMethod.call(it));
	};

	var $fetch$1 = getBuiltIn('fetch');
	var Headers = getBuiltIn('Headers');
	var ITERATOR$8 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$4 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);
	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;

	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }

	    return result;
	  }
	};

	var find = /[!'()~]|%20/g;
	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replace[match];
	};

	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find, replacer);
	};

	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;

	    while (index < attributes.length) {
	      attribute = attributes[index++];

	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};

	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw TypeError('Not enough arguments');
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$4(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;

	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  }

	  return step;
	}); // `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams

	var URLSearchParamsConstructor = function URLSearchParams()
	/* init */
	{
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;
	  setInternalState$4(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () {
	      /* empty */
	    },
	    updateSearchParams: updateSearchParams
	  });

	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);

	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;

	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if ((first = entryNext.call(entryIterator)).done || (second = entryNext.call(entryIterator)).done || !entryNext.call(entryIterator).done) throw TypeError('Expected sequence with length 2');
	          entries.push({
	            key: first.value + '',
	            value: second.value + ''
	          });
	        }
	      } else for (key in init) if (has(init, key)) entries.push({
	        key: key,
	        value: init[key] + ''
	      });
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;
	redefineAll(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.appent` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({
	      key: name + '',
	      value: value + ''
	    });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;

	    while (index < entries.length) {
	      if (entries[index].key === key) entries.splice(index, 1);else index++;
	    }

	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;

	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }

	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;

	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) result.push(entries[index].value);
	    }

	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;

	    while (index < entries.length) {
	      if (entries[index++].key === key) return true;
	    }

	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;

	    for (; index < entries.length; index++) {
	      entry = entries[index];

	      if (entry.key === key) {
	        if (found) entries.splice(index--, 1);else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }

	    if (!found) entries.push({
	      key: key,
	      value: val
	    });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries; // Array#sort is not stable in some engines

	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;

	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];

	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }

	      if (entriesIndex === sliceIndex) entries.push(entry);
	    }

	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback
	  /* , thisArg */
	  ) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;

	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, {
	  enumerable: true
	}); // `URLSearchParams.prototype[@@iterator]` method

	redefine(URLSearchParamsPrototype, ITERATOR$8, URLSearchParamsPrototype.entries); // `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior

	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;

	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  }

	  return result.join('&');
	}, {
	  enumerable: true
	});
	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	_export({
	  global: true,
	  forced: !nativeUrl
	}, {
	  URLSearchParams: URLSearchParamsConstructor
	}); // Wrap `fetch` for correct work with polyfilled `URLSearchParams`
	// https://github.com/zloirock/core-js/issues/674

	if (!nativeUrl && typeof $fetch$1 == 'function' && typeof Headers == 'function') {
	  _export({
	    global: true,
	    enumerable: true,
	    forced: true
	  }, {
	    fetch: function fetch(input
	    /* , init */
	    ) {
	      var args = [input];
	      var init, body, headers;

	      if (arguments.length > 1) {
	        init = arguments[1];

	        if (isObject(init)) {
	          body = init.body;

	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers(init.headers) : new Headers();

	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }

	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }

	        args.push(init);
	      }

	      return $fetch$1.apply(this, args);
	    }
	  });
	}

	var web_urlSearchParams = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	var codeAt = stringMultibyte.codeAt;
	var NativeURL = global_1.URL;
	var URLSearchParams$1 = web_urlSearchParams.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams.getState;
	var setInternalState$5 = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var floor$5 = Math.floor;
	var pow$1 = Math.pow;
	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';
	var ALPHA = /[A-Za-z]/;
	var ALPHANUMERIC = /[\d+-.A-Za-z]/;
	var DIGIT = /\d/;
	var HEX_START = /^(0x|0X)/;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\dA-Fa-f]+$/; // eslint-disable-next-line no-control-regex

	var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/; // eslint-disable-next-line no-control-regex

	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/; // eslint-disable-next-line no-control-regex

	var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g; // eslint-disable-next-line no-control-regex

	var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
	var EOF;

	var parseHost = function (url, input) {
	  var result, codePoints, index;

	  if (input.charAt(0) == '[') {
	    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
	    result = parseIPv6(input.slice(1, -1));
	    if (!result) return INVALID_HOST;
	    url.host = result; // opaque host
	  } else if (!isSpecial(url)) {
	    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
	    result = '';
	    codePoints = arrayFrom(input);

	    for (index = 0; index < codePoints.length; index++) {
	      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	    }

	    url.host = result;
	  } else {
	    input = stringPunycodeToAscii(input);
	    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
	    result = parseIPv4(input);
	    if (result === null) return INVALID_HOST;
	    url.host = result;
	  }
	};

	var parseIPv4 = function (input) {
	  var parts = input.split('.');
	  var partsLength, numbers, index, part, radix, number, ipv4;

	  if (parts.length && parts[parts.length - 1] == '') {
	    parts.pop();
	  }

	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];

	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part == '') return input;
	    radix = 10;

	    if (part.length > 1 && part.charAt(0) == '0') {
	      radix = HEX_START.test(part) ? 16 : 8;
	      part = part.slice(radix == 8 ? 1 : 2);
	    }

	    if (part === '') {
	      number = 0;
	    } else {
	      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
	      number = parseInt(part, radix);
	    }

	    numbers.push(number);
	  }

	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];

	    if (index == partsLength - 1) {
	      if (number >= pow$1(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }

	  ipv4 = numbers.pop();

	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow$1(256, 3 - index);
	  }

	  return ipv4;
	}; // eslint-disable-next-line max-statements


	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var char = function () {
	    return input.charAt(pointer);
	  };

	  if (char() == ':') {
	    if (input.charAt(1) != ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }

	  while (char()) {
	    if (pieceIndex == 8) return;

	    if (char() == ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }

	    value = length = 0;

	    while (length < 4 && HEX.test(char())) {
	      value = value * 16 + parseInt(char(), 16);
	      pointer++;
	      length++;
	    }

	    if (char() == '.') {
	      if (length == 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;

	      while (char()) {
	        ipv4Piece = null;

	        if (numbersSeen > 0) {
	          if (char() == '.' && numbersSeen < 4) pointer++;else return;
	        }

	        if (!DIGIT.test(char())) return;

	        while (DIGIT.test(char())) {
	          number = parseInt(char(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;else if (ipv4Piece == 0) return;else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }

	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
	      }

	      if (numbersSeen != 4) return;
	      break;
	    } else if (char() == ':') {
	      pointer++;
	      if (!char()) return;
	    } else if (char()) return;

	    address[pieceIndex++] = value;
	  }

	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;

	    while (pieceIndex != 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex != 8) return;

	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;

	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }

	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }

	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }

	  return maxIndex;
	};

	var serializeHost = function (host) {
	  var result, index, compress, ignore0; // ipv4

	  if (typeof host == 'number') {
	    result = [];

	    for (index = 0; index < 4; index++) {
	      result.unshift(host % 256);
	      host = floor$5(host / 256);
	    }

	    return result.join('.'); // ipv6
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);

	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;

	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += host[index].toString(16);
	        if (index < 7) result += ':';
	      }
	    }

	    return '[' + result + ']';
	  }

	  return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1,
	  '"': 1,
	  '<': 1,
	  '>': 1,
	  '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1,
	  '?': 1,
	  '{': 1,
	  '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1,
	  ':': 1,
	  ';': 1,
	  '=': 1,
	  '@': 1,
	  '[': 1,
	  '\\': 1,
	  ']': 1,
	  '^': 1,
	  '|': 1
	});

	var percentEncode = function (char, set) {
	  var code = codeAt(char, 0);
	  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
	};

	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	var isSpecial = function (url) {
	  return has(specialSchemes, url.scheme);
	};

	var includesCredentials = function (url) {
	  return url.username != '' || url.password != '';
	};

	var cannotHaveUsernamePasswordPort = function (url) {
	  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
	};

	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length == 2 && ALPHA.test(string.charAt(0)) && ((second = string.charAt(1)) == ':' || !normalized && second == '|');
	};

	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (string.length == 2 || (third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#');
	};

	var shortenURLsPath = function (url) {
	  var path = url.path;
	  var pathSize = path.length;

	  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
	    path.pop();
	  }
	};

	var isSingleDot = function (segment) {
	  return segment === '.' || segment.toLowerCase() === '%2e';
	};

	var isDoubleDot = function (segment) {
	  segment = segment.toLowerCase();
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	}; // States:


	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {}; // eslint-disable-next-line max-statements

	var parseURL = function (url, input, stateOverride, base) {
	  var state = stateOverride || SCHEME_START;
	  var pointer = 0;
	  var buffer = '';
	  var seenAt = false;
	  var seenBracket = false;
	  var seenPasswordToken = false;
	  var codePoints, char, bufferCodePoints, failure;

	  if (!stateOverride) {
	    url.scheme = '';
	    url.username = '';
	    url.password = '';
	    url.host = null;
	    url.port = null;
	    url.path = [];
	    url.query = null;
	    url.fragment = null;
	    url.cannotBeABaseURL = false;
	    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
	  }

	  input = input.replace(TAB_AND_NEW_LINE, '');
	  codePoints = arrayFrom(input);

	  while (pointer <= codePoints.length) {
	    char = codePoints[pointer];

	    switch (state) {
	      case SCHEME_START:
	        if (char && ALPHA.test(char)) {
	          buffer += char.toLowerCase();
	          state = SCHEME;
	        } else if (!stateOverride) {
	          state = NO_SCHEME;
	          continue;
	        } else return INVALID_SCHEME;

	        break;

	      case SCHEME:
	        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
	          buffer += char.toLowerCase();
	        } else if (char == ':') {
	          if (stateOverride && (isSpecial(url) != has(specialSchemes, buffer) || buffer == 'file' && (includesCredentials(url) || url.port !== null) || url.scheme == 'file' && !url.host)) return;
	          url.scheme = buffer;

	          if (stateOverride) {
	            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
	            return;
	          }

	          buffer = '';

	          if (url.scheme == 'file') {
	            state = FILE;
	          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
	            state = SPECIAL_RELATIVE_OR_AUTHORITY;
	          } else if (isSpecial(url)) {
	            state = SPECIAL_AUTHORITY_SLASHES;
	          } else if (codePoints[pointer + 1] == '/') {
	            state = PATH_OR_AUTHORITY;
	            pointer++;
	          } else {
	            url.cannotBeABaseURL = true;
	            url.path.push('');
	            state = CANNOT_BE_A_BASE_URL_PATH;
	          }
	        } else if (!stateOverride) {
	          buffer = '';
	          state = NO_SCHEME;
	          pointer = 0;
	          continue;
	        } else return INVALID_SCHEME;

	        break;

	      case NO_SCHEME:
	        if (!base || base.cannotBeABaseURL && char != '#') return INVALID_SCHEME;

	        if (base.cannotBeABaseURL && char == '#') {
	          url.scheme = base.scheme;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          url.cannotBeABaseURL = true;
	          state = FRAGMENT;
	          break;
	        }

	        state = base.scheme == 'file' ? FILE : RELATIVE;
	        continue;

	      case SPECIAL_RELATIVE_OR_AUTHORITY:
	        if (char == '/' && codePoints[pointer + 1] == '/') {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          pointer++;
	        } else {
	          state = RELATIVE;
	          continue;
	        }

	        break;

	      case PATH_OR_AUTHORITY:
	        if (char == '/') {
	          state = AUTHORITY;
	          break;
	        } else {
	          state = PATH;
	          continue;
	        }

	      case RELATIVE:
	        url.scheme = base.scheme;

	        if (char == EOF) {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	        } else if (char == '/' || char == '\\' && isSpecial(url)) {
	          state = RELATIVE_SLASH;
	        } else if (char == '?') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          state = FRAGMENT;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.path.pop();
	          state = PATH;
	          continue;
	        }

	        break;

	      case RELATIVE_SLASH:
	        if (isSpecial(url) && (char == '/' || char == '\\')) {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        } else if (char == '/') {
	          state = AUTHORITY;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          state = PATH;
	          continue;
	        }

	        break;

	      case SPECIAL_AUTHORITY_SLASHES:
	        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
	        pointer++;
	        break;

	      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	        if (char != '/' && char != '\\') {
	          state = AUTHORITY;
	          continue;
	        }

	        break;

	      case AUTHORITY:
	        if (char == '@') {
	          if (seenAt) buffer = '%40' + buffer;
	          seenAt = true;
	          bufferCodePoints = arrayFrom(buffer);

	          for (var i = 0; i < bufferCodePoints.length; i++) {
	            var codePoint = bufferCodePoints[i];

	            if (codePoint == ':' && !seenPasswordToken) {
	              seenPasswordToken = true;
	              continue;
	            }

	            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	            if (seenPasswordToken) url.password += encodedCodePoints;else url.username += encodedCodePoints;
	          }

	          buffer = '';
	        } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url)) {
	          if (seenAt && buffer == '') return INVALID_AUTHORITY;
	          pointer -= arrayFrom(buffer).length + 1;
	          buffer = '';
	          state = HOST;
	        } else buffer += char;

	        break;

	      case HOST:
	      case HOSTNAME:
	        if (stateOverride && url.scheme == 'file') {
	          state = FILE_HOST;
	          continue;
	        } else if (char == ':' && !seenBracket) {
	          if (buffer == '') return INVALID_HOST;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PORT;
	          if (stateOverride == HOSTNAME) return;
	        } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url)) {
	          if (isSpecial(url) && buffer == '') return INVALID_HOST;
	          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PATH_START;
	          if (stateOverride) return;
	          continue;
	        } else {
	          if (char == '[') seenBracket = true;else if (char == ']') seenBracket = false;
	          buffer += char;
	        }

	        break;

	      case PORT:
	        if (DIGIT.test(char)) {
	          buffer += char;
	        } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url) || stateOverride) {
	          if (buffer != '') {
	            var port = parseInt(buffer, 10);
	            if (port > 0xFFFF) return INVALID_PORT;
	            url.port = isSpecial(url) && port === specialSchemes[url.scheme] ? null : port;
	            buffer = '';
	          }

	          if (stateOverride) return;
	          state = PATH_START;
	          continue;
	        } else return INVALID_PORT;

	        break;

	      case FILE:
	        url.scheme = 'file';
	        if (char == '/' || char == '\\') state = FILE_SLASH;else if (base && base.scheme == 'file') {
	          if (char == EOF) {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	          } else if (char == '?') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	              url.host = base.host;
	              url.path = base.path.slice();
	              shortenURLsPath(url);
	            }

	            state = PATH;
	            continue;
	          }
	        } else {
	          state = PATH;
	          continue;
	        }
	        break;

	      case FILE_SLASH:
	        if (char == '/' || char == '\\') {
	          state = FILE_HOST;
	          break;
	        }

	        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);else url.host = base.host;
	        }

	        state = PATH;
	        continue;

	      case FILE_HOST:
	        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
	          if (!stateOverride && isWindowsDriveLetter(buffer)) {
	            state = PATH;
	          } else if (buffer == '') {
	            url.host = '';
	            if (stateOverride) return;
	            state = PATH_START;
	          } else {
	            failure = parseHost(url, buffer);
	            if (failure) return failure;
	            if (url.host == 'localhost') url.host = '';
	            if (stateOverride) return;
	            buffer = '';
	            state = PATH_START;
	          }

	          continue;
	        } else buffer += char;

	        break;

	      case PATH_START:
	        if (isSpecial(url)) {
	          state = PATH;
	          if (char != '/' && char != '\\') continue;
	        } else if (!stateOverride && char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          state = PATH;
	          if (char != '/') continue;
	        }

	        break;

	      case PATH:
	        if (char == EOF || char == '/' || char == '\\' && isSpecial(url) || !stateOverride && (char == '?' || char == '#')) {
	          if (isDoubleDot(buffer)) {
	            shortenURLsPath(url);

	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else if (isSingleDot(buffer)) {
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else {
	            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	              if (url.host) url.host = '';
	              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
	            }

	            url.path.push(buffer);
	          }

	          buffer = '';

	          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
	            while (url.path.length > 1 && url.path[0] === '') {
	              url.path.shift();
	            }
	          }

	          if (char == '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          }
	        } else {
	          buffer += percentEncode(char, pathPercentEncodeSet);
	        }

	        break;

	      case CANNOT_BE_A_BASE_URL_PATH:
	        if (char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
	        }

	        break;

	      case QUERY:
	        if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          if (char == "'" && isSpecial(url)) url.query += '%27';else if (char == '#') url.query += '%23';else url.query += percentEncode(char, C0ControlPercentEncodeSet);
	        }

	        break;

	      case FRAGMENT:
	        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
	        break;
	    }

	    pointer++;
	  }
	}; // `URL` constructor
	// https://url.spec.whatwg.org/#url-class


	var URLConstructor = function URL(url
	/* , base */
	) {
	  var that = anInstance(this, URLConstructor, 'URL');
	  var base = arguments.length > 1 ? arguments[1] : undefined;
	  var urlString = String(url);
	  var state = setInternalState$5(that, {
	    type: 'URL'
	  });
	  var baseState, failure;

	  if (base !== undefined) {
	    if (base instanceof URLConstructor) baseState = getInternalURLState(base);else {
	      failure = parseURL(baseState = {}, String(base));
	      if (failure) throw TypeError(failure);
	    }
	  }

	  failure = parseURL(state, urlString, null, baseState);
	  if (failure) throw TypeError(failure);
	  var searchParams = state.searchParams = new URLSearchParams$1();
	  var searchParamsState = getInternalSearchParamsState(searchParams);
	  searchParamsState.updateSearchParams(state.query);

	  searchParamsState.updateURL = function () {
	    state.query = String(searchParams) || null;
	  };

	  if (!descriptors) {
	    that.href = serializeURL.call(that);
	    that.origin = getOrigin.call(that);
	    that.protocol = getProtocol.call(that);
	    that.username = getUsername.call(that);
	    that.password = getPassword.call(that);
	    that.host = getHost.call(that);
	    that.hostname = getHostname.call(that);
	    that.port = getPort.call(that);
	    that.pathname = getPathname.call(that);
	    that.search = getSearch.call(that);
	    that.searchParams = getSearchParams.call(that);
	    that.hash = getHash.call(that);
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var serializeURL = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var username = url.username;
	  var password = url.password;
	  var host = url.host;
	  var port = url.port;
	  var path = url.path;
	  var query = url.query;
	  var fragment = url.fragment;
	  var output = scheme + ':';

	  if (host !== null) {
	    output += '//';

	    if (includesCredentials(url)) {
	      output += username + (password ? ':' + password : '') + '@';
	    }

	    output += serializeHost(host);
	    if (port !== null) output += ':' + port;
	  } else if (scheme == 'file') output += '//';

	  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	  if (query !== null) output += '?' + query;
	  if (fragment !== null) output += '#' + fragment;
	  return output;
	};

	var getOrigin = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var port = url.port;
	  if (scheme == 'blob') try {
	    return new URL(scheme.path[0]).origin;
	  } catch (error) {
	    return 'null';
	  }
	  if (scheme == 'file' || !isSpecial(url)) return 'null';
	  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
	};

	var getProtocol = function () {
	  return getInternalURLState(this).scheme + ':';
	};

	var getUsername = function () {
	  return getInternalURLState(this).username;
	};

	var getPassword = function () {
	  return getInternalURLState(this).password;
	};

	var getHost = function () {
	  var url = getInternalURLState(this);
	  var host = url.host;
	  var port = url.port;
	  return host === null ? '' : port === null ? serializeHost(host) : serializeHost(host) + ':' + port;
	};

	var getHostname = function () {
	  var host = getInternalURLState(this).host;
	  return host === null ? '' : serializeHost(host);
	};

	var getPort = function () {
	  var port = getInternalURLState(this).port;
	  return port === null ? '' : String(port);
	};

	var getPathname = function () {
	  var url = getInternalURLState(this);
	  var path = url.path;
	  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	};

	var getSearch = function () {
	  var query = getInternalURLState(this).query;
	  return query ? '?' + query : '';
	};

	var getSearchParams = function () {
	  return getInternalURLState(this).searchParams;
	};

	var getHash = function () {
	  var fragment = getInternalURLState(this).fragment;
	  return fragment ? '#' + fragment : '';
	};

	var accessorDescriptor = function (getter, setter) {
	  return {
	    get: getter,
	    set: setter,
	    configurable: true,
	    enumerable: true
	  };
	};

	if (descriptors) {
	  objectDefineProperties(URLPrototype, {
	    // `URL.prototype.href` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-href
	    href: accessorDescriptor(serializeURL, function (href) {
	      var url = getInternalURLState(this);
	      var urlString = String(href);
	      var failure = parseURL(url, urlString);
	      if (failure) throw TypeError(failure);
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.origin` getter
	    // https://url.spec.whatwg.org/#dom-url-origin
	    origin: accessorDescriptor(getOrigin),
	    // `URL.prototype.protocol` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-protocol
	    protocol: accessorDescriptor(getProtocol, function (protocol) {
	      var url = getInternalURLState(this);
	      parseURL(url, String(protocol) + ':', SCHEME_START);
	    }),
	    // `URL.prototype.username` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-username
	    username: accessorDescriptor(getUsername, function (username) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(username));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.username = '';

	      for (var i = 0; i < codePoints.length; i++) {
	        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.password` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-password
	    password: accessorDescriptor(getPassword, function (password) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(password));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.password = '';

	      for (var i = 0; i < codePoints.length; i++) {
	        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.host` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-host
	    host: accessorDescriptor(getHost, function (host) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(host), HOST);
	    }),
	    // `URL.prototype.hostname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hostname
	    hostname: accessorDescriptor(getHostname, function (hostname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(hostname), HOSTNAME);
	    }),
	    // `URL.prototype.port` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-port
	    port: accessorDescriptor(getPort, function (port) {
	      var url = getInternalURLState(this);
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      port = String(port);
	      if (port == '') url.port = null;else parseURL(url, port, PORT);
	    }),
	    // `URL.prototype.pathname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-pathname
	    pathname: accessorDescriptor(getPathname, function (pathname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      url.path = [];
	      parseURL(url, pathname + '', PATH_START);
	    }),
	    // `URL.prototype.search` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-search
	    search: accessorDescriptor(getSearch, function (search) {
	      var url = getInternalURLState(this);
	      search = String(search);

	      if (search == '') {
	        url.query = null;
	      } else {
	        if ('?' == search.charAt(0)) search = search.slice(1);
	        url.query = '';
	        parseURL(url, search, QUERY);
	      }

	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.searchParams` getter
	    // https://url.spec.whatwg.org/#dom-url-searchparams
	    searchParams: accessorDescriptor(getSearchParams),
	    // `URL.prototype.hash` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hash
	    hash: accessorDescriptor(getHash, function (hash) {
	      var url = getInternalURLState(this);
	      hash = String(hash);

	      if (hash == '') {
	        url.fragment = null;
	        return;
	      }

	      if ('#' == hash.charAt(0)) hash = hash.slice(1);
	      url.fragment = '';
	      parseURL(url, hash, FRAGMENT);
	    })
	  });
	} // `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson


	redefine(URLPrototype, 'toJSON', function toJSON() {
	  return serializeURL.call(this);
	}, {
	  enumerable: true
	}); // `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior

	redefine(URLPrototype, 'toString', function toString() {
	  return serializeURL.call(this);
	}, {
	  enumerable: true
	});

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL; // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  // eslint-disable-next-line no-unused-vars

	  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
	    return nativeCreateObjectURL.apply(NativeURL, arguments);
	  }); // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  // eslint-disable-next-line no-unused-vars

	  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
	    return nativeRevokeObjectURL.apply(NativeURL, arguments);
	  });
	}

	setToStringTag(URLConstructor, 'URL');
	_export({
	  global: true,
	  forced: !nativeUrl,
	  sham: !descriptors
	}, {
	  URL: URLConstructor
	});

	var nativeJoin = [].join;
	var ES3_STRINGS = indexedObject != Object;
	var STRICT_METHOD$2 = arrayMethodIsStrict('join', ','); // `Array.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.join

	_export({
	  target: 'Array',
	  proto: true,
	  forced: ES3_STRINGS || !STRICT_METHOD$2
	}, {
	  join: function join(separator) {
	    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH$4 = arrayMethodUsesToLength('slice', {
	  ACCESSORS: true,
	  0: 0,
	  1: 2
	});
	var SPECIES$6 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max; // `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$4
	}, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length); // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible

	    var Constructor, result, n;

	    if (isArray(O)) {
	      Constructor = O.constructor; // cross-realm fallback

	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$6];
	        if (Constructor === null) Constructor = undefined;
	      }

	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }

	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));

	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);

	    result.length = n;
	    return result;
	  }
	});

	var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y; // `RegExp.prototype.flags` getter
	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags

	if (descriptors && (/./g.flags != 'g' || UNSUPPORTED_Y$2)) {
	  objectDefineProperty.f(RegExp.prototype, 'flags', {
	    configurable: true,
	    get: regexpFlags
	  });
	}

	// https://tc39.github.io/ecma262/#sec-typedarray-objects

	typedArrayConstructor('Uint16', function (init) {
	  return function Uint16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// https://tc39.github.io/ecma262/#sec-typedarray-objects

	typedArrayConstructor('Uint32', function (init) {
	  return function Uint32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

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

	      case length === 4:
	        return [258, length - 4, 0];

	      case length === 5:
	        return [259, length - 5, 0];

	      case length === 6:
	        return [260, length - 6, 0];

	      case length === 7:
	        return [261, length - 7, 0];

	      case length === 8:
	        return [262, length - 8, 0];

	      case length === 9:
	        return [263, length - 9, 0];

	      case length === 10:
	        return [264, length - 10, 0];

	      case length <= 12:
	        return [265, length - 11, 1];

	      case length <= 14:
	        return [266, length - 13, 1];

	      case length <= 16:
	        return [267, length - 15, 1];

	      case length <= 18:
	        return [268, length - 17, 1];

	      case length <= 22:
	        return [269, length - 19, 2];

	      case length <= 26:
	        return [270, length - 23, 2];

	      case length <= 30:
	        return [271, length - 27, 2];

	      case length <= 34:
	        return [272, length - 31, 2];

	      case length <= 42:
	        return [273, length - 35, 3];

	      case length <= 50:
	        return [274, length - 43, 3];

	      case length <= 58:
	        return [275, length - 51, 3];

	      case length <= 66:
	        return [276, length - 59, 3];

	      case length <= 82:
	        return [277, length - 67, 4];

	      case length <= 98:
	        return [278, length - 83, 4];

	      case length <= 114:
	        return [279, length - 99, 4];

	      case length <= 130:
	        return [280, length - 115, 4];

	      case length <= 162:
	        return [281, length - 131, 5];

	      case length <= 194:
	        return [282, length - 163, 5];

	      case length <= 226:
	        return [283, length - 195, 5];

	      case length <= 257:
	        return [284, length - 227, 5];

	      case length === 258:
	        return [285, length - 258, 0];

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

	var BrowserLocalFile = /*#__PURE__*/function () {
	  function BrowserLocalFile(blob) {
	    _classCallCheck(this, BrowserLocalFile);

	    this.file = blob;
	  }

	  _createClass(BrowserLocalFile, [{
	    key: "read",
	    value: function () {
	      var _read = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(position, length) {
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
	var fs;
	var fsOpen;
	var fsRead;

	if (isNode$1) {
	  var util = require('util');

	  fs = require('fs');
	  fsOpen = fs && util.promisify(fs.open);
	  fsRead = fs && util.promisify(fs.read);
	}

	var NodeLocalFile = /*#__PURE__*/function () {
	  function NodeLocalFile(args) {
	    _classCallCheck(this, NodeLocalFile);

	    this.path = args.path;
	  }

	  _createClass(NodeLocalFile, [{
	    key: "read",
	    value: function () {
	      var _read = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(position, length) {
	        var buffer, fd, result, b, arrayBuffer;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                buffer = Buffer.alloc(length);
	                _context.next = 3;
	                return fsOpen(this.path, 'r');

	              case 3:
	                fd = _context.sent;
	                _context.next = 6;
	                return fsRead(fd, buffer, 0, length, position);

	              case 6:
	                result = _context.sent;
	                fs.close(fd, function (error) {// TODO Do something with error
	                }); //TODO -- compare result.bytesRead with length

	                b = result.buffer;
	                arrayBuffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
	                return _context.abrupt("return", arrayBuffer);

	              case 11:
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

	  return NodeLocalFile;
	}();

	var max$2 = Math.max;
	var min$6 = Math.min;
	var floor$6 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	}; // @@replace logic


	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
	  return [// `String.prototype.replace` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	  function replace(searchValue, replaceValue) {
	    var O = requireObjectCoercible(this);
	    var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	    return replacer !== undefined ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
	  }, // `RegExp.prototype[@@replace]` method
	  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	  function (regexp, replaceValue) {
	    if (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0 || typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1) {
	      var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	      if (res.done) return res.value;
	    }

	    var rx = anObject(regexp);
	    var S = String(this);
	    var functionalReplace = typeof replaceValue === 'function';
	    if (!functionalReplace) replaceValue = String(replaceValue);
	    var global = rx.global;

	    if (global) {
	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	    }

	    var results = [];

	    while (true) {
	      var result = regexpExecAbstract(rx, S);
	      if (result === null) break;
	      results.push(result);
	      if (!global) break;
	      var matchStr = String(result[0]);
	      if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	    }

	    var accumulatedResult = '';
	    var nextSourcePosition = 0;

	    for (var i = 0; i < results.length; i++) {
	      result = results[i];
	      var matched = String(result[0]);
	      var position = max$2(min$6(toInteger(result.index), S.length), 0);
	      var captures = []; // NOTE: This is equivalent to
	      //   captures = result.slice(1).map(maybeToString)
	      // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	      // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	      // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

	      for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));

	      var namedCaptures = result.groups;

	      if (functionalReplace) {
	        var replacerArgs = [matched].concat(captures, position, S);
	        if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	        var replacement = String(replaceValue.apply(undefined, replacerArgs));
	      } else {
	        replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	      }

	      if (position >= nextSourcePosition) {
	        accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	        nextSourcePosition = position + matched.length;
	      }
	    }

	    return accumulatedResult + S.slice(nextSourcePosition);
	  }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }

	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;

	      switch (ch.charAt(0)) {
	        case '$':
	          return '$';

	        case '&':
	          return matched;

	        case '`':
	          return str.slice(0, position);

	        case "'":
	          return str.slice(tailPos);

	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;

	        default:
	          // \d\d?
	          var n = +ch;
	          if (n === 0) return match;

	          if (n > m) {
	            var f = floor$6(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }

	          capture = captures[n - 1];
	      }

	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	var isNode$2 = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

	var RemoteFile = /*#__PURE__*/function () {
	  function RemoteFile(args) {
	    _classCallCheck(this, RemoteFile);

	    this.config = args;
	    this.url = mapUrl(args.path || args.url);
	  }

	  _createClass(RemoteFile, [{
	    key: "read",
	    value: function () {
	      var _read = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(position, length) {
	        var headers, rangeString, url, token, isSafari, isChrome, isAmazonV4Signed, response, status, err, resolveToken, _resolveToken;

	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _resolveToken = function _resolveToken3() {
	                  _resolveToken = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(token) {
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

	                resolveToken = function _resolveToken2(_x3) {
	                  return _resolveToken.apply(this, arguments);
	                };

	                length = Math.ceil(length);
	                headers = this.config.headers || {};
	                rangeString = "bytes=" + position + "-" + (position + length - 1);
	                headers['Range'] = rangeString;
	                url = this.url.slice(); // slice => copy

	                if (isNode$2) {
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

	                _context2.next = 11;
	                return crossFetch(url, {
	                  method: 'GET',
	                  headers: headers,
	                  redirect: 'follow',
	                  mode: 'cors'
	                });

	              case 11:
	                response = _context2.sent;
	                status = response.status;

	                if (!(status >= 400)) {
	                  _context2.next = 20;
	                  break;
	                }

	                console.error("".concat(status, "  ").concat(this.config.url));
	                err = Error(response.statusText);
	                err.code = status;
	                throw err;

	              case 20:
	                return _context2.abrupt("return", response.arrayBuffer());

	              case 21:
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

	var ThrottledFile = /*#__PURE__*/function () {
	  function ThrottledFile(file, rateLimiter) {
	    _classCallCheck(this, ThrottledFile);

	    this.file = file;
	    this.rateLimiter = rateLimiter;
	  }

	  _createClass(ThrottledFile, [{
	    key: "read",
	    value: function () {
	      var _read = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(position, length) {
	        var file, rateLimiter;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                file = this.file;
	                rateLimiter = this.rateLimiter;
	                return _context2.abrupt("return", new Promise(function (fulfill, reject) {
	                  rateLimiter.limiter( /*#__PURE__*/function () {
	                    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(f) {
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

	var RateLimiter = /*#__PURE__*/function () {
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

	var BufferedFile = /*#__PURE__*/function () {
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
	      var _read = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(position, length) {
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

	var log$1 = Math.log;
	var LN2$1 = Math.LN2; // `Math.log2` method
	// https://tc39.github.io/ecma262/#sec-math.log2

	_export({
	  target: 'Math',
	  stat: true
	}, {
	  log2: function log2(x) {
	    return log$1(x) / LN2$1;
	  }
	});

	var MatrixZoomData = /*#__PURE__*/function () {
	  function MatrixZoomData(chr1, chr2) {
	    _classCallCheck(this, MatrixZoomData);

	    this.chr1 = chr1; // chromosome index

	    this.chr2 = chr2;
	  }

	  _createClass(MatrixZoomData, [{
	    key: "getKey",
	    value: function getKey() {
	      return this.chr1.name + "_" + this.chr2.name + "_" + this.zoom.unit + "_" + this.zoom.binSize;
	    }
	  }, {
	    key: "getBlockNumbers",
	    value: function getBlockNumbers(region1, region2, version) {
	      // Verify region chromosomes and swap if neccessary
	      if (region1.chr == this.chr2 && region2.chr === this.chr1) {
	        var tmp = region1;
	        region1 = region2;
	        region2 = tmp;
	      }

	      var sameChr = this.chr1 === this.chr2;
	      var binsize = this.zoom.binSize;
	      var blockBinCount = this.blockBinCount;
	      var blockColumnCount = this.blockColumnCount;
	      return version < 9 || !sameChr ? getBlockNumbersV8() : getBlockNumbersV9();

	      function getBlockNumbersV8() {
	        var x1 = region1.start / binsize;
	        var x2 = region1.end / binsize;
	        var y1 = region2.start / binsize;
	        var y2 = region2.end / binsize;
	        var col1 = Math.floor(x1 / blockBinCount);
	        var col2 = Math.floor((x2 - 1) / blockBinCount);
	        var row1 = Math.floor(y1 / blockBinCount);
	        var row2 = Math.floor((y2 - 1) / blockBinCount);
	        var blockNumbers = [];

	        for (var row = row1; row <= row2; row++) {
	          for (var column = col1; column <= col2; column++) {
	            var blockNumber = void 0;

	            if (sameChr && row < column) {
	              blockNumber = column * blockColumnCount + row;
	            } else {
	              blockNumber = row * blockColumnCount + column;
	            }

	            if (!blockNumbers.includes(blockNumber)) {
	              // possible from transposition
	              blockNumbers.push(blockNumber);
	            }
	          }
	        }

	        return blockNumbers;
	      }

	      function getBlockNumbersV9() {
	        var binX1 = region1.start / binsize;
	        var binX2 = region1.end / binsize;
	        var binY1 = region2.start / binsize;
	        var binY2 = region2.end / binsize; // PAD = positionAlongDiagonal (~projected)
	        // Depth is axis perpendicular to diagonal; nearer means closer to diagonal

	        var translatedLowerPAD = Math.floor((binX1 + binY1) / 2 / blockBinCount);
	        var translatedHigherPAD = Math.floor((binX2 + binY2) / 2 / blockBinCount);
	        var translatedNearerDepth = Math.floor(Math.log2(1 + Math.abs(binX1 - binY2) / Math.sqrt(2) / blockBinCount));
	        var translatedFurtherDepth = Math.floor(Math.log2(1 + Math.abs(binX2 - binY1) / Math.sqrt(2) / blockBinCount)); // because code above assume above diagonal; but we could be below diagonal

	        var containsDiagonal = (binX2 - binY1) * (binX1 - binY2) < 0; // i.e. sign of (x-y) opposite on 2 corners

	        var nearerDepth = containsDiagonal ? 0 : Math.min(translatedNearerDepth, translatedFurtherDepth);
	        var furtherDepth = Math.max(translatedNearerDepth, translatedFurtherDepth);
	        var blockNumbers = [];

	        for (var depth = nearerDepth; depth <= furtherDepth; depth++) {
	          for (var pad = translatedLowerPAD; pad <= translatedHigherPAD; pad++) {
	            var block_number = depth * blockColumnCount + pad;
	            blockNumbers.push(block_number);
	          }
	        }

	        return blockNumbers;
	      }
	    }
	  }], [{
	    key: "parseMatrixZoomData",
	    value: function parseMatrixZoomData(chr1, chr2, dis) {
	      var zd = new MatrixZoomData(chr1, chr2);
	      var unit = dis.getString();
	      var zoomIndex = dis.getInt();
	      var sumCounts = dis.getFloat();
	      var occupiedCellCount = dis.getFloat();
	      var stdDev = dis.getFloat();
	      var percent95 = dis.getFloat();
	      var binSize = dis.getInt();
	      zd.blockBinCount = dis.getInt();
	      zd.blockColumnCount = dis.getInt();
	      var nBlocks = dis.getInt();
	      zd.zoom = {
	        index: zoomIndex,
	        unit: unit,
	        binSize: binSize
	      };
	      zd.blockIndex = new StaticBlockIndex(nBlocks, dis);
	      var nBins1 = chr1.size / binSize;
	      var nBins2 = chr2.size / binSize;
	      var avgCount = sumCounts / nBins1 / nBins2; // <= trying to avoid overflows

	      zd.averageCount = avgCount;
	      zd.sumCounts = sumCounts;
	      zd.stdDev = stdDev;
	      zd.occupiedCellCount = occupiedCellCount;
	      zd.percent95 = percent95;
	      return zd;
	    }
	  }]);

	  return MatrixZoomData;
	}();

	var StaticBlockIndex = /*#__PURE__*/function () {
	  function StaticBlockIndex(nBlocks, dis) {
	    _classCallCheck(this, StaticBlockIndex);

	    this.blockIndex = {};

	    while (nBlocks-- > 0) {
	      var blockNumber = dis.getInt();
	      var filePosition = dis.getLong();
	      var size = dis.getInt();
	      this.blockIndex[blockNumber] = {
	        filePosition: filePosition,
	        size: size
	      };
	    }
	  }

	  _createClass(StaticBlockIndex, [{
	    key: "getBlockIndexEntry",
	    value: function getBlockIndexEntry(blockNumber) {
	      return this.blockIndex[blockNumber];
	    }
	  }]);

	  return StaticBlockIndex;
	}();

	var Matrix = /*#__PURE__*/function () {
	  function Matrix(chr1, chr2, zoomDataList) {
	    _classCallCheck(this, Matrix);

	    this.chr1 = chr1;
	    this.chr2 = chr2;
	    this.bpZoomData = [];
	    this.fragZoomData = [];

	    var _iterator = _createForOfIteratorHelper(zoomDataList),
	        _step;

	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var zd = _step.value;

	        if (zd.zoom.unit === "BP") {
	          this.bpZoomData.push(zd);
	        } else {
	          this.fragZoomData.push(zd);
	        }
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	  }
	  /**
	   * Find the best zoom level for the given bin size
	   * @param binSize
	   * @param unit
	   * @returns {number}
	   */


	  _createClass(Matrix, [{
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
	    }
	    /**
	     * Fetch zoom data by bin size.  If no matching level exists return undefined.
	     *
	     * @param unit
	     * @param binSize
	     * @param zoom
	     * @returns {undefined|*}
	     */

	  }, {
	    key: "getZoomData",
	    value: function getZoomData(binSize, unit) {
	      unit = unit || "BP";
	      var zdArray = unit === "BP" ? this.bpZoomData : this.fragZoomData;

	      for (var i = 0; i < zdArray.length; i++) {
	        var zd = zdArray[i];

	        if (binSize === zd.zoom.binSize) {
	          return zd;
	        }
	      }

	      return undefined;
	    }
	    /**
	     * Return zoom data by resolution index.
	     * @param index
	     * @param unit
	     * @returns {*}
	     */

	  }, {
	    key: "getZoomDataByIndex",
	    value: function getZoomDataByIndex(index, unit) {
	      var zdArray = "FRAG" === unit ? this.fragZoomData : this.bpZoomData;
	      return zdArray[index];
	    }
	  }], [{
	    key: "parseMatrix",
	    value: function parseMatrix(data, chromosomes) {
	      var dis = new BinaryParser(new DataView(data));
	      var c1 = dis.getInt(); // Should equal chrIdx1

	      var c2 = dis.getInt(); // Should equal chrIdx2
	      // TODO validate this

	      var chr1 = chromosomes[c1];
	      var chr2 = chromosomes[c2]; // # of resolution levels (bp and frags)

	      var nResolutions = dis.getInt();
	      var zdList = [];

	      while (nResolutions-- > 0) {
	        var zd = MatrixZoomData.parseMatrixZoomData(chr1, chr2, dis);
	        zdList.push(zd);
	      }

	      return new Matrix(c1, c2, zdList);
	    }
	  }]);

	  return Matrix;
	}();

	var ContactRecord = /*#__PURE__*/function () {
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

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	  var defineProperty = objectDefineProperty.f;
	  var METADATA = uid('meta');
	  var id = 0;

	  var isExtensible = Object.isExtensible || function () {
	    return true;
	  };

	  var setMetadata = function (it) {
	    defineProperty(it, METADATA, {
	      value: {
	        objectID: 'O' + ++id,
	        // object ID
	        weakData: {} // weak collections IDs

	      }
	    });
	  };

	  var fastKey = function (it, create) {
	    // return a primitive with prefix
	    if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

	    if (!has(it, METADATA)) {
	      // can't set metadata to uncaught frozen object
	      if (!isExtensible(it)) return 'F'; // not necessary to add metadata

	      if (!create) return 'E'; // add missing metadata

	      setMetadata(it); // return object ID
	    }

	    return it[METADATA].objectID;
	  };

	  var getWeakData = function (it, create) {
	    if (!has(it, METADATA)) {
	      // can't set metadata to uncaught frozen object
	      if (!isExtensible(it)) return true; // not necessary to add metadata

	      if (!create) return false; // add missing metadata

	      setMetadata(it); // return the store of weak collections IDs
	    }

	    return it[METADATA].weakData;
	  }; // add metadata on freeze-family methods calling


	  var onFreeze = function (it) {
	    if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	    return it;
	  };

	  var meta = module.exports = {
	    REQUIRED: false,
	    fastKey: fastKey,
	    getWeakData: getWeakData,
	    onFreeze: onFreeze
	  };
	  hiddenKeys[METADATA] = true;
	});
	var internalMetadata_1 = internalMetadata.REQUIRED;
	var internalMetadata_2 = internalMetadata.fastKey;
	var internalMetadata_3 = internalMetadata.getWeakData;
	var internalMetadata_4 = internalMetadata.onFreeze;

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var nativeMethod = NativePrototype[KEY];
	    redefine(NativePrototype, KEY, KEY == 'add' ? function add(value) {
	      nativeMethod.call(this, value === 0 ? 0 : value);
	      return this;
	    } : KEY == 'delete' ? function (key) {
	      return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : KEY == 'get' ? function get(key) {
	      return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : KEY == 'has' ? function has(key) {
	      return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : function set(key, value) {
	      nativeMethod.call(this, key === 0 ? 0 : key, value);
	      return this;
	    });
	  }; // eslint-disable-next-line max-len


	  if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	    new NativeConstructor().entries().next();
	  })))) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor(); // early implementations not supports chaining

	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false

	    var THROWS_ON_PRIMITIVES = fails(function () {
	      instance.has(1);
	    }); // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new

	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) {
	      new NativeConstructor(iterable);
	    }); // for early implementations -0 and +0 not the same

	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;

	      while (index--) $instance[ADDER](index, index);

	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({
	    global: true,
	    forced: Constructor != NativeConstructor
	  }, exported);
	  setToStringTag(Constructor, CONSTRUCTOR_NAME);
	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
	  return Constructor;
	};

	var defineProperty$7 = objectDefineProperty.f;
	var fastKey = internalMetadata.fastKey;
	var setInternalState$6 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;
	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$6(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });
	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index; // change existing entry

	      if (entry) {
	        entry.value = value; // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;else that.size++; // add to index

	        if (index !== 'F') state.index[index] = entry;
	      }

	      return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that); // fast case

	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index]; // frozen object case

	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key == key) return entry;
	      }
	    };

	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var data = state.index;
	        var entry = state.first;

	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          delete data[entry.index];
	          entry = entry.next;
	        }

	        state.first = state.last = undefined;
	        if (descriptors) state.size = 0;else that.size = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);

	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first == entry) state.first = next;
	          if (state.last == entry) state.last = prev;
	          if (descriptors) state.size--;else that.size--;
	        }

	        return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn
	      /* , that = undefined */
	      ) {
	        var state = getInternalState(this);
	        var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;

	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this); // revert to the last existing entry

	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });
	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.1.3.6 Map.prototype.get(key)
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // 23.1.3.9 Map.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // 23.2.3.1 Set.prototype.add(value)
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineProperty$7(C.prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return C;
	  },
	  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME); // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11

	    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$6(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last; // revert to the last existing entry

	      while (entry && entry.removed) entry = entry.previous; // get next entry


	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = undefined;
	        return {
	          value: undefined,
	          done: true
	        };
	      } // return step by kind


	      if (kind == 'keys') return {
	        value: entry.key,
	        done: false
	      };
	      if (kind == 'values') return {
	        value: entry.value,
	        done: false
	      };
	      return {
	        value: [entry.key, entry.value],
	        done: false
	      };
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};

	// https://tc39.github.io/ecma262/#sec-map-objects


	var es_map = collection('Map', function (init) {
	  return function Map() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	}, collectionStrong);

	var LRU = /*#__PURE__*/function () {
	  function LRU() {
	    var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

	    _classCallCheck(this, LRU);

	    this.max = max;
	    this.map = new Map();
	  }

	  _createClass(LRU, [{
	    key: "get",
	    value: function get(key) {
	      var item = this.map.get(key);

	      if (item) {
	        // refresh key
	        this.map.delete(key);
	        this.map.set(key, item);
	      }

	      return item;
	    }
	  }, {
	    key: "set",
	    value: function set(key, val) {
	      // refresh key
	      if (this.map.has(key)) this.map.delete(key); // evict oldest
	      else if (this.map.size == this.max) {
	          this.map.delete(this.first());
	        }
	      this.map.set(key, val);
	    }
	  }, {
	    key: "has",
	    value: function has(key) {
	      return this.map.has(key);
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      this.map.clear();
	    }
	  }, {
	    key: "first",
	    value: function first() {
	      return this.map.keys().next().value;
	    }
	  }]);

	  return LRU;
	}(); //ref https://stackoverflow.com/questions/996505/lru-cache-implementation-in-javascript

	var DOUBLE = 8;

	var NormalizationVector = /*#__PURE__*/function () {
	  function NormalizationVector(file, filePosition, nValues, dataType) {
	    _classCallCheck(this, NormalizationVector);

	    this.file = file;
	    this.filePosition = filePosition;
	    this.nValues = nValues;
	    this.dataType = dataType;
	    this.cache = undefined;
	  }

	  _createClass(NormalizationVector, [{
	    key: "getValues",
	    value: function () {
	      var _getValues = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(start, end) {
	        var adjustedStart, adjustedEnd, startPosition, n, sizeInBytes, data, parser, values, i, sliceStart, sliceEnd;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!(!this.cache || start < this.cache.start || end > this.cache.end)) {
	                  _context.next = 15;
	                  break;
	                }

	                adjustedStart = Math.max(0, start - 1000);
	                adjustedEnd = Math.min(this.nValues, end + 1000);
	                startPosition = this.filePosition + adjustedStart * this.dataType;
	                n = adjustedEnd - adjustedStart;
	                sizeInBytes = n * this.dataType;
	                _context.next = 8;
	                return this.file.read(startPosition, sizeInBytes);

	              case 8:
	                data = _context.sent;

	                if (data) {
	                  _context.next = 11;
	                  break;
	                }

	                return _context.abrupt("return", undefined);

	              case 11:
	                parser = new BinaryParser(new DataView(data));
	                values = [];

	                for (i = 0; i < n; i++) {
	                  values[i] = this.dataType === DOUBLE ? parser.getDouble() : parser.getFloat();
	                }

	                this.cache = {
	                  start: adjustedStart,
	                  end: adjustedEnd,
	                  values: values
	                };

	              case 15:
	                sliceStart = start - this.cache.start;
	                sliceEnd = sliceStart + (end - start);
	                return _context.abrupt("return", this.cache.values.slice(sliceStart, sliceEnd));

	              case 18:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function getValues(_x, _x2) {
	        return _getValues.apply(this, arguments);
	      }

	      return getValues;
	    }()
	  }, {
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

	var isNode$3 = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
	var Short_MIN_VALUE = -32768;
	var DOUBLE$1 = 8;
	var FLOAT = 4;
	var INT = 4;
	var GoogleRateLimiter = new RateLimiter(100);

	var HicFile = /*#__PURE__*/function () {
	  function HicFile(args) {
	    _classCallCheck(this, HicFile);

	    this.config = args;
	    this.loadFragData = args.loadFragData;
	    this.fragmentSitesCache = {};
	    this.normVectorCache = new LRU(10);
	    this.normalizationTypes = ['NONE'];
	    this.matrixCache = new LRU(10);
	    this.blockCache = new BlockCache(); // args may specify an io.File object, a local path (Node only), or a url

	    if (args.file) {
	      this.file = args.file;
	    } else if (args.blob) {
	      this.file = new BrowserLocalFile(args.blob);
	    } else if (args.url || args.path && !isNode$3) {
	      this.url = args.url || this.path;
	      this.remote = true; // Google drive must be rate limited.  Perhaps all remote files should be rate limited?

	      var remoteFile = new RemoteFile(args);

	      if (isGoogleDrive(this.url)) {
	        this.file = new ThrottledFile(remoteFile, GoogleRateLimiter);
	      } else {
	        this.file = remoteFile;
	      }
	    } else if (args.path) {
	      // path argument, assumed local file
	      this.file = new NodeLocalFile({
	        path: args.path
	      });
	    } else {
	      throw Error("Arguments must include file, blob, url, or path");
	    }
	  }

	  _createClass(HicFile, [{
	    key: "init",
	    value: function () {
	      var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
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
	    key: "getVersion",
	    value: function () {
	      var _getVersion = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
	        var data, binaryParser;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!(this.version === undefined)) {
	                  _context2.next = 12;
	                  break;
	                }

	                _context2.next = 3;
	                return this.file.read(0, 128);

	              case 3:
	                data = _context2.sent;

	                if (data) {
	                  _context2.next = 6;
	                  break;
	                }

	                return _context2.abrupt("return", undefined);

	              case 6:
	                binaryParser = new BinaryParser(new DataView(data));
	                this.magic = binaryParser.getString();
	                this.version = binaryParser.getInt();
	                return _context2.abrupt("return", this.version);

	              case 12:
	                return _context2.abrupt("return", this.version);

	              case 13:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function getVersion() {
	        return _getVersion.apply(this, arguments);
	      }

	      return getVersion;
	    }()
	  }, {
	    key: "getMetaData",
	    value: function () {
	      var _getMetaData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return this.init();

	              case 2:
	                return _context3.abrupt("return", this.meta);

	              case 3:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function getMetaData() {
	        return _getMetaData.apply(this, arguments);
	      }

	      return getMetaData;
	    }()
	  }, {
	    key: "readHeader",
	    value: function () {
	      var _readHeader = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
	        var data, binaryParser, nAttributes, nChrs, i, chr, nBpResolutions, nFragResolutions, _i, _Object$keys, chrName;

	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this.file.read(0, 64000);

	              case 2:
	                data = _context4.sent;

	                if (data) {
	                  _context4.next = 5;
	                  break;
	                }

	                return _context4.abrupt("return", undefined);

	              case 5:
	                binaryParser = new BinaryParser(new DataView(data));
	                this.magic = binaryParser.getString();
	                this.version = binaryParser.getInt();

	                if (!(this.version < 5)) {
	                  _context4.next = 10;
	                  break;
	                }

	                throw Error("Unsupported hic version: " + this.version);

	              case 10:
	                this.footerPosition = binaryParser.getLong();
	                this.genomeId = binaryParser.getString();

	                if (this.version >= 9) {
	                  this.normVectorIndexPosition = binaryParser.getLong();
	                  this.normVectorIndexSize = binaryParser.getLong();
	                }

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
	                    size: this.version < 9 ? binaryParser.getInt() : binaryParser.getLong()
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

	                  if (nFragResolutions > 0) {
	                    while (nFragResolutions-- > 0) {
	                      this.fragResolutions.push(binaryParser.getInt());
	                    } // this.sites = [];
	                    // for(let i=0; i<this.chromosomes.length - 1; i++) {
	                    //     const chrSites = [];
	                    //     this.sites.push(chrSites);
	                    //     let nSites = binaryParser.getInt();
	                    //     console.log(nSites);
	                    //     for(let s=0; s<nSites; s++) {
	                    //         chrSites.push(binaryParser.getInt());
	                    //     }
	                    // }

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

	              case 28:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function readHeader() {
	        return _readHeader.apply(this, arguments);
	      }

	      return readHeader;
	    }()
	  }, {
	    key: "readFooter",
	    value: function () {
	      var _readFooter = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
	        var skip, data, binaryParser, nBytes, nEntries, miSize, key, pos, size, _skip;

	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                skip = this.version < 9 ? 8 : 12;
	                _context5.next = 3;
	                return this.file.read(this.footerPosition, skip);

	              case 3:
	                data = _context5.sent;

	                if (data) {
	                  _context5.next = 6;
	                  break;
	                }

	                return _context5.abrupt("return", null);

	              case 6:
	                binaryParser = new BinaryParser(new DataView(data));
	                nBytes = this.version < 9 ? binaryParser.getInt() : binaryParser.getLong(); // Total size, master index + expected values

	                nEntries = binaryParser.getInt(); // Estimate the size of the master index. String length of key is unknown, be conservative (100 bytes)

	                miSize = nEntries * (100 + 64 + 32);
	                _context5.next = 12;
	                return this.file.read(this.footerPosition + skip, Math.min(miSize, nBytes));

	              case 12:
	                data = _context5.sent;
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

	                this.expectedValueVectors = {}; // Expected values
	                // const nExpValues = binaryParser.readInt();
	                // while (nExpValues-- > 0) {
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
	                // normalized expected values start after expected value.  Add 4 for

	                if (this.version > 5) {
	                  _skip = this.version < 9 ? 4 : 8;
	                  this.normExpectedValueVectorsPosition = this.footerPosition + _skip + nBytes;
	                }

	                return _context5.abrupt("return", this);

	              case 19:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));

	      function readFooter() {
	        return _readFooter.apply(this, arguments);
	      }

	      return readFooter;
	    }()
	  }, {
	    key: "printIndexStats",
	    value: function () {
	      var _printIndexStats = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
	        var totalSize, maxSize, _i2, _Object$keys2, key, entry;

	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                totalSize = 0;
	                maxSize = 0;
	                _context6.next = 4;
	                return this.init();

	              case 4:
	                for (_i2 = 0, _Object$keys2 = Object.keys(this.masterIndex); _i2 < _Object$keys2.length; _i2++) {
	                  key = _Object$keys2[_i2];
	                  entry = this.masterIndex[key]; //  console.log(`${key}\t${entry.start}\t${entry.size}`)

	                  totalSize += entry.size;

	                  if (entry.size > maxSize) {
	                    maxSize = entry.size;
	                  }
	                } // console.log(`Total size  = ${totalSize}`);


	              case 5:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));

	      function printIndexStats() {
	        return _printIndexStats.apply(this, arguments);
	      }

	      return printIndexStats;
	    }()
	  }, {
	    key: "getMatrix",
	    value: function () {
	      var _getMatrix = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(chrIdx1, chrIdx2) {
	        var key, matrix;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                key = "".concat(chrIdx1, "__").concat(chrIdx2);

	                if (!this.matrixCache.has(key)) {
	                  _context7.next = 5;
	                  break;
	                }

	                return _context7.abrupt("return", this.matrixCache.get(key));

	              case 5:
	                matrix = this.readMatrix(chrIdx1, chrIdx2);
	                this.matrixCache.set(key, matrix);
	                return _context7.abrupt("return", matrix);

	              case 8:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this);
	      }));

	      function getMatrix(_x, _x2) {
	        return _getMatrix.apply(this, arguments);
	      }

	      return getMatrix;
	    }()
	  }, {
	    key: "readMatrix",
	    value: function () {
	      var _readMatrix = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(chrIdx1, chrIdx2) {
	        var tmp, key, idx, data;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                _context8.next = 2;
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
	                  _context8.next = 7;
	                  break;
	                }

	                return _context8.abrupt("return", undefined);

	              case 7:
	                _context8.next = 9;
	                return this.file.read(idx.start, idx.size);

	              case 9:
	                data = _context8.sent;

	                if (data) {
	                  _context8.next = 12;
	                  break;
	                }

	                return _context8.abrupt("return", undefined);

	              case 12:
	                return _context8.abrupt("return", Matrix.parseMatrix(data, this.chromosomes));

	              case 13:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));

	      function readMatrix(_x3, _x4) {
	        return _readMatrix.apply(this, arguments);
	      }

	      return readMatrix;
	    }()
	  }, {
	    key: "getContactRecords",
	    value: function () {
	      var _getContactRecords = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(normalization, region1, region2, units, binsize) {
	        var allRecords,
	            idx1,
	            idx2,
	            transpose,
	            tmp,
	            blocks,
	            contactRecords,
	            x1,
	            x2,
	            y1,
	            y2,
	            nvX1,
	            nvX2,
	            nvY1,
	            nvY2,
	            _iterator,
	            _step,
	            block,
	            normVector1,
	            normVector2,
	            isNorm,
	            chr1,
	            chr2,
	            nv1,
	            nv2,
	            _iterator2,
	            _step2,
	            rec,
	            x,
	            y,
	            nvnv,
	            counts,
	            _args9 = arguments;

	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                allRecords = _args9.length > 5 && _args9[5] !== undefined ? _args9[5] : false;
	                _context9.next = 3;
	                return this.init();

	              case 3:
	                idx1 = this.chromosomeIndexMap[this.getFileChrName(region1.chr)];
	                idx2 = this.chromosomeIndexMap[this.getFileChrName(region2.chr)];
	                transpose = idx1 > idx2 || idx1 === idx2 && region1.start >= region2.end;

	                if (transpose) {
	                  tmp = region1;
	                  region1 = region2;
	                  region2 = tmp;
	                }

	                _context9.next = 9;
	                return this.getBlocks(region1, region2, units, binsize);

	              case 9:
	                blocks = _context9.sent;

	                if (!(!blocks || blocks.length === 0)) {
	                  _context9.next = 12;
	                  break;
	                }

	                return _context9.abrupt("return", []);

	              case 12:
	                contactRecords = [];
	                x1 = region1.start / binsize;
	                x2 = region1.end / binsize;
	                y1 = region2.start / binsize;
	                y2 = region2.end / binsize;
	                nvX1 = Math.floor(x1);
	                nvX2 = Math.ceil(x2);
	                nvY1 = Math.floor(y1);
	                nvY2 = Math.ceil(y2);
	                _iterator = _createForOfIteratorHelper(blocks);
	                _context9.prev = 22;

	                _iterator.s();

	              case 24:
	                if ((_step = _iterator.n()).done) {
	                  _context9.next = 58;
	                  break;
	                }

	                block = _step.value;

	                if (!block) {
	                  _context9.next = 56;
	                  break;
	                }

	                // An undefined block is most likely caused by a base pair range outside the chromosome
	                normVector1 = void 0;
	                normVector2 = void 0;
	                isNorm = normalization && normalization !== "NONE";
	                chr1 = this.getFileChrName(region1.chr);
	                chr2 = this.getFileChrName(region2.chr);

	                if (!isNorm) {
	                  _context9.next = 54;
	                  break;
	                }

	                _context9.next = 35;
	                return this.getNormalizationVector(normalization, chr1, units, binsize);

	              case 35:
	                nv1 = _context9.sent;

	                if (!(chr1 === chr2)) {
	                  _context9.next = 40;
	                  break;
	                }

	                _context9.t0 = nv1;
	                _context9.next = 43;
	                break;

	              case 40:
	                _context9.next = 42;
	                return this.getNormalizationVector(normalization, chr2, units, binsize);

	              case 42:
	                _context9.t0 = _context9.sent;

	              case 43:
	                nv2 = _context9.t0;

	                if (!(nv1 && nv2)) {
	                  _context9.next = 53;
	                  break;
	                }

	                _context9.next = 47;
	                return nv1.getValues(nvX1, nvX2);

	              case 47:
	                normVector1 = _context9.sent;
	                _context9.next = 50;
	                return nv2.getValues(nvY1, nvY2);

	              case 50:
	                normVector2 = _context9.sent;
	                _context9.next = 54;
	                break;

	              case 53:
	                isNorm = false; // Raise message and switch pulldown

	              case 54:
	                _iterator2 = _createForOfIteratorHelper(block.records);

	                try {
	                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                    rec = _step2.value;

	                    if (allRecords || rec.bin1 >= x1 && rec.bin1 < x2 && rec.bin2 >= y1 && rec.bin2 < y2) {
	                      if (isNorm) {
	                        x = rec.bin1;
	                        y = rec.bin2;
	                        nvnv = normVector1[x - nvX1] * normVector2[y - nvY1];

	                        if (nvnv !== 0 && !isNaN(nvnv)) {
	                          counts = rec.counts / nvnv;
	                          contactRecords.push(new ContactRecord(x, y, counts));
	                        }
	                      } else {
	                        contactRecords.push(rec);
	                      }
	                    }
	                  }
	                } catch (err) {
	                  _iterator2.e(err);
	                } finally {
	                  _iterator2.f();
	                }

	              case 56:
	                _context9.next = 24;
	                break;

	              case 58:
	                _context9.next = 63;
	                break;

	              case 60:
	                _context9.prev = 60;
	                _context9.t1 = _context9["catch"](22);

	                _iterator.e(_context9.t1);

	              case 63:
	                _context9.prev = 63;

	                _iterator.f();

	                return _context9.finish(63);

	              case 66:
	                return _context9.abrupt("return", contactRecords);

	              case 67:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this, [[22, 60, 63, 66]]);
	      }));

	      function getContactRecords(_x5, _x6, _x7, _x8, _x9) {
	        return _getContactRecords.apply(this, arguments);
	      }

	      return getContactRecords;
	    }()
	  }, {
	    key: "getBlocks",
	    value: function () {
	      var _getBlocks = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(region1, region2, unit, binSize) {
	        var _this = this;

	        var chr1, chr2, idx1, idx2, matrix, zd, msg, blockNumbers, blocks, blockNumbersToQuery, _iterator3, _step3, num, promises, newBlocks, _iterator4, _step4, block;

	        return regeneratorRuntime.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                _context10.next = 2;
	                return this.init();

	              case 2:
	                chr1 = this.getFileChrName(region1.chr);
	                chr2 = this.getFileChrName(region2.chr);
	                idx1 = this.chromosomeIndexMap[chr1];
	                idx2 = this.chromosomeIndexMap[chr2];

	                if (!(idx1 === undefined)) {
	                  _context10.next = 8;
	                  break;
	                }

	                return _context10.abrupt("return", []);

	              case 8:
	                if (!(idx2 === undefined)) {
	                  _context10.next = 10;
	                  break;
	                }

	                return _context10.abrupt("return", []);

	              case 10:
	                _context10.next = 12;
	                return this.getMatrix(idx1, idx2);

	              case 12:
	                matrix = _context10.sent;

	                if (matrix) {
	                  _context10.next = 15;
	                  break;
	                }

	                return _context10.abrupt("return", []);

	              case 15:
	                zd = matrix.getZoomData(binSize, unit);

	                if (zd) {
	                  _context10.next = 19;
	                  break;
	                }

	                msg = "No data avalailble for resolution: ".concat(binSize, "  for map ").concat(region1.chr, "-").concat(region2.chr);
	                throw new Error(msg);

	              case 19:
	                blockNumbers = zd.getBlockNumbers(region1, region2, this.version);
	                blocks = [];
	                blockNumbersToQuery = [];
	                _iterator3 = _createForOfIteratorHelper(blockNumbers);

	                try {
	                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	                    num = _step3.value;

	                    if (this.blockCache.has(binSize, num)) {
	                      blocks.push(this.blockCache.get(binSize, num));
	                    } else {
	                      blockNumbersToQuery.push(num);
	                    }
	                  }
	                } catch (err) {
	                  _iterator3.e(err);
	                } finally {
	                  _iterator3.f();
	                }

	                promises = blockNumbersToQuery.map(function (blockNumber) {
	                  return _this.readBlock(blockNumber, zd);
	                });
	                _context10.next = 27;
	                return Promise.all(promises);

	              case 27:
	                newBlocks = _context10.sent;
	                _iterator4 = _createForOfIteratorHelper(newBlocks);

	                try {
	                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	                    block = _step4.value;

	                    if (block) {
	                      this.blockCache.set(binSize, block.blockNumber, block);
	                    }
	                  }
	                } catch (err) {
	                  _iterator4.e(err);
	                } finally {
	                  _iterator4.f();
	                }

	                return _context10.abrupt("return", blocks.concat(newBlocks));

	              case 31:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this);
	      }));

	      function getBlocks(_x10, _x11, _x12, _x13) {
	        return _getBlocks.apply(this, arguments);
	      }

	      return getBlocks;
	    }()
	  }, {
	    key: "readBlock",
	    value: function () {
	      var _readBlock = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(blockNumber, zd) {
	        var idx, data, inflate, plain, parser, nRecords, records, i, binX, binY, counts, binXOffset, binYOffset, useFloatContact, useIntXPos, useIntYPos, type, rowCount, _i3, dy, _binY, colCount, j, dx, _binX, _counts, nPts, w, _i4, row, col, bin1, bin2, _counts2, _counts3;

	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                _context11.next = 2;
	                return zd.blockIndex.getBlockIndexEntry(blockNumber);

	              case 2:
	                idx = _context11.sent;

	                if (idx) {
	                  _context11.next = 7;
	                  break;
	                }

	                return _context11.abrupt("return", undefined);

	              case 7:
	                _context11.next = 9;
	                return this.file.read(idx.filePosition, idx.size);

	              case 9:
	                data = _context11.sent;

	                if (data) {
	                  _context11.next = 12;
	                  break;
	                }

	                return _context11.abrupt("return", undefined);

	              case 12:
	                inflate = new Zlib.Inflate(new Uint8Array(data));
	                plain = inflate.decompress(); //var plain = zlib.inflateSync(Buffer.from(data))   //.decompress();

	                data = plain.buffer;
	                parser = new BinaryParser(new DataView(data));
	                nRecords = parser.getInt();
	                records = [];

	                if (!(this.version < 7)) {
	                  _context11.next = 22;
	                  break;
	                }

	                for (i = 0; i < nRecords; i++) {
	                  binX = parser.getInt();
	                  binY = parser.getInt();
	                  counts = parser.getFloat();
	                  records.push(new ContactRecord(binX, binY, counts));
	                }

	                _context11.next = 40;
	                break;

	              case 22:
	                binXOffset = parser.getInt();
	                binYOffset = parser.getInt();
	                useFloatContact = parser.getByte() === 1;
	                useIntXPos = this.version < 9 ? false : parser.getByte() == 1;
	                useIntYPos = this.version < 9 ? false : parser.getByte() == 1;
	                type = parser.getByte();

	                if (!(type === 1)) {
	                  _context11.next = 33;
	                  break;
	                }

	                // List-of-rows representation
	                rowCount = useIntYPos ? parser.getInt() : parser.getShort();

	                for (_i3 = 0; _i3 < rowCount; _i3++) {
	                  dy = useIntYPos ? parser.getInt() : parser.getShort();
	                  _binY = binYOffset + dy;
	                  colCount = useIntXPos ? parser.getInt() : parser.getShort();

	                  for (j = 0; j < colCount; j++) {
	                    dx = useIntXPos ? parser.getInt() : parser.getShort();
	                    _binX = binXOffset + dx;
	                    _counts = useFloatContact ? parser.getFloat() : parser.getShort();
	                    records.push(new ContactRecord(_binX, _binY, _counts));
	                  }
	                }

	                _context11.next = 40;
	                break;

	              case 33:
	                if (!(type == 2)) {
	                  _context11.next = 39;
	                  break;
	                }

	                nPts = parser.getInt();
	                w = parser.getShort();

	                for (_i4 = 0; _i4 < nPts; _i4++) {
	                  //int idx = (p.y - binOffset2) * w + (p.x - binOffset1);
	                  row = Math.floor(_i4 / w);
	                  col = _i4 - row * w;
	                  bin1 = binXOffset + col;
	                  bin2 = binYOffset + row;

	                  if (useFloatContact) {
	                    _counts2 = parser.getFloat();

	                    if (!isNaN(_counts2)) {
	                      records.push(new ContactRecord(bin1, bin2, _counts2));
	                    }
	                  } else {
	                    _counts3 = parser.getShort();

	                    if (_counts3 != Short_MIN_VALUE) {
	                      records.push(new ContactRecord(bin1, bin2, _counts3));
	                    }
	                  }
	                }

	                _context11.next = 40;
	                break;

	              case 39:
	                throw new Error("Unknown block type: " + type);

	              case 40:
	                return _context11.abrupt("return", new Block(blockNumber, zd, records, idx));

	              case 41:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this);
	      }));

	      function readBlock(_x14, _x15) {
	        return _readBlock.apply(this, arguments);
	      }

	      return readBlock;
	    }()
	  }, {
	    key: "hasNormalizationVector",
	    value: function () {
	      var _hasNormalizationVector = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(type, chr, unit, binSize) {
	        var chrIdx, canonicalName, key, normVectorIndex;
	        return regeneratorRuntime.wrap(function _callee12$(_context12) {
	          while (1) {
	            switch (_context12.prev = _context12.next) {
	              case 0:
	                _context12.next = 2;
	                return this.init();

	              case 2:
	                if (Number.isInteger(chr)) {
	                  chrIdx = chr;
	                } else {
	                  canonicalName = this.getFileChrName(chr);
	                  chrIdx = this.chromosomeIndexMap[canonicalName];
	                }

	                key = getNormalizationVectorKey(type, chrIdx, unit.toString(), binSize);
	                _context12.next = 6;
	                return this.getNormVectorIndex();

	              case 6:
	                normVectorIndex = _context12.sent;
	                return _context12.abrupt("return", normVectorIndex && normVectorIndex[key]);

	              case 8:
	              case "end":
	                return _context12.stop();
	            }
	          }
	        }, _callee12, this);
	      }));

	      function hasNormalizationVector(_x16, _x17, _x18, _x19) {
	        return _hasNormalizationVector.apply(this, arguments);
	      }

	      return hasNormalizationVector;
	    }()
	  }, {
	    key: "getNormalizationVector",
	    value: function () {
	      var _getNormalizationVector = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(type, chr, unit, binSize) {
	        var chrIdx, canonicalName, key, normVectorIndex, idx, data, parser, nValues, dataType, filePosition, nv;
	        return regeneratorRuntime.wrap(function _callee13$(_context13) {
	          while (1) {
	            switch (_context13.prev = _context13.next) {
	              case 0:
	                _context13.next = 2;
	                return this.init();

	              case 2:
	                if (Number.isInteger(chr)) {
	                  chrIdx = chr;
	                } else {
	                  canonicalName = this.getFileChrName(chr);
	                  chrIdx = this.chromosomeIndexMap[canonicalName];
	                }

	                key = getNormalizationVectorKey(type, chrIdx, unit.toString(), binSize);

	                if (!this.normVectorCache.has(key)) {
	                  _context13.next = 6;
	                  break;
	                }

	                return _context13.abrupt("return", this.normVectorCache.get(key));

	              case 6:
	                _context13.next = 8;
	                return this.getNormVectorIndex();

	              case 8:
	                normVectorIndex = _context13.sent;

	                if (normVectorIndex) {
	                  _context13.next = 11;
	                  break;
	                }

	                return _context13.abrupt("return", undefined);

	              case 11:
	                idx = normVectorIndex[key];

	                if (idx) {
	                  _context13.next = 14;
	                  break;
	                }

	                return _context13.abrupt("return", undefined);

	              case 14:
	                _context13.next = 16;
	                return this.file.read(idx.filePosition, 8);

	              case 16:
	                data = _context13.sent;

	                if (data) {
	                  _context13.next = 19;
	                  break;
	                }

	                return _context13.abrupt("return", undefined);

	              case 19:
	                parser = new BinaryParser(new DataView(data));
	                nValues = this.version < 9 ? parser.getInt() : parser.getLong();
	                dataType = this.version < 9 ? DOUBLE$1 : FLOAT;
	                filePosition = this.version < 9 ? idx.filePosition + 4 : idx.filePosition + 8;
	                nv = new NormalizationVector(this.file, filePosition, nValues, dataType);
	                this.normVectorCache.set(key, nv);
	                return _context13.abrupt("return", nv);

	              case 26:
	              case "end":
	                return _context13.stop();
	            }
	          }
	        }, _callee13, this);
	      }));

	      function getNormalizationVector(_x20, _x21, _x22, _x23) {
	        return _getNormalizationVector.apply(this, arguments);
	      }

	      return getNormalizationVector;
	    }()
	  }, {
	    key: "getNormVectorIndex",
	    value: function () {
	      var _getNormVectorIndex = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
	        var url, key, nviResponse, nvi, nviArray, range;
	        return regeneratorRuntime.wrap(function _callee14$(_context14) {
	          while (1) {
	            switch (_context14.prev = _context14.next) {
	              case 0:
	                if (!(this.version < 6)) {
	                  _context14.next = 2;
	                  break;
	                }

	                return _context14.abrupt("return", undefined);

	              case 2:
	                if (this.normVectorIndex) {
	                  _context14.next = 29;
	                  break;
	                }

	                if (!(!this.config.nvi && this.remote && this.url)) {
	                  _context14.next = 14;
	                  break;
	                }

	                url = new URL(this.url);
	                key = encodeURIComponent(url.hostname + url.pathname);
	                _context14.next = 8;
	                return crossFetch('https://t5dvc6kn3f.execute-api.us-east-1.amazonaws.com/dev/nvi/' + key);

	              case 8:
	                nviResponse = _context14.sent;

	                if (!(nviResponse.status === 200)) {
	                  _context14.next = 14;
	                  break;
	                }

	                _context14.next = 12;
	                return nviResponse.text();

	              case 12:
	                nvi = _context14.sent;

	                if (nvi) {
	                  this.config.nvi = nvi;
	                }

	              case 14:
	                if (!this.config.nvi) {
	                  _context14.next = 20;
	                  break;
	                }

	                nviArray = decodeURIComponent(this.config.nvi).split(",");
	                range = {
	                  start: parseInt(nviArray[0]),
	                  size: parseInt(nviArray[1])
	                };
	                return _context14.abrupt("return", this.readNormVectorIndex(range));

	              case 20:
	                _context14.prev = 20;
	                _context14.next = 23;
	                return this.readNormExpectedValuesAndNormVectorIndex();

	              case 23:
	                return _context14.abrupt("return", this.normVectorIndex);

	              case 26:
	                _context14.prev = 26;
	                _context14.t0 = _context14["catch"](20);

	                if (_context14.t0.code === "416" || _context14.t0.code === 416) {
	                  // This is expected if file does not contain norm vectors
	                  this.normExpectedValueVectorsPosition = undefined;
	                } else {
	                  console.error(_context14.t0);
	                }

	              case 29:
	                return _context14.abrupt("return", this.normVectorIndex);

	              case 30:
	              case "end":
	                return _context14.stop();
	            }
	          }
	        }, _callee14, this, [[20, 26]]);
	      }));

	      function getNormVectorIndex() {
	        return _getNormVectorIndex.apply(this, arguments);
	      }

	      return getNormVectorIndex;
	    }()
	  }, {
	    key: "getNormalizationOptions",
	    value: function () {
	      var _getNormalizationOptions = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
	        return regeneratorRuntime.wrap(function _callee15$(_context15) {
	          while (1) {
	            switch (_context15.prev = _context15.next) {
	              case 0:
	                _context15.next = 2;
	                return this.getNormVectorIndex();

	              case 2:
	                return _context15.abrupt("return", this.normalizationTypes);

	              case 3:
	              case "end":
	                return _context15.stop();
	            }
	          }
	        }, _callee15, this);
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
	      var _readNormVectorIndex = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(range) {
	        var data, binaryParser, nEntries;
	        return regeneratorRuntime.wrap(function _callee16$(_context16) {
	          while (1) {
	            switch (_context16.prev = _context16.next) {
	              case 0:
	                _context16.next = 2;
	                return this.init();

	              case 2:
	                this.normalizationVectorIndexRange = range;
	                _context16.next = 5;
	                return this.file.read(range.start, range.size);

	              case 5:
	                data = _context16.sent;
	                binaryParser = new BinaryParser(new DataView(data));
	                this.normVectorIndex = {};
	                nEntries = binaryParser.getInt();

	                while (nEntries-- > 0) {
	                  this.parseNormVectorEntry(binaryParser);
	                }

	                return _context16.abrupt("return", this.normVectorIndex);

	              case 11:
	              case "end":
	                return _context16.stop();
	            }
	          }
	        }, _callee16, this);
	      }));

	      function readNormVectorIndex(_x24) {
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
	      var _readNormExpectedValuesAndNormVectorIndex = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
	        var nviStart, byteCount, data, binaryParser, nEntries, sizeEstimate, range, processEntries, _processEntries;

	        return regeneratorRuntime.wrap(function _callee18$(_context18) {
	          while (1) {
	            switch (_context18.prev = _context18.next) {
	              case 0:
	                _processEntries = function _processEntries3() {
	                  _processEntries = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(nEntries, data) {
	                    var binaryParser, _sizeEstimate, _range, _data;

	                    return regeneratorRuntime.wrap(function _callee17$(_context17) {
	                      while (1) {
	                        switch (_context17.prev = _context17.next) {
	                          case 0:
	                            binaryParser = new BinaryParser(new DataView(data));

	                          case 1:
	                            if (!(nEntries-- > 0)) {
	                              _context17.next = 14;
	                              break;
	                            }

	                            if (!(binaryParser.available() < 100)) {
	                              _context17.next = 11;
	                              break;
	                            }

	                            nEntries++; // Reset counter as entry is not processed

	                            byteCount += binaryParser.position;
	                            _sizeEstimate = Math.max(1000, nEntries * 30);
	                            _range = {
	                              start: nviStart + byteCount,
	                              size: _sizeEstimate
	                            };
	                            _context17.next = 9;
	                            return this.file.read(_range.start, _range.size);

	                          case 9:
	                            _data = _context17.sent;
	                            return _context17.abrupt("return", processEntries.call(this, nEntries, _data));

	                          case 11:
	                            this.parseNormVectorEntry(binaryParser);
	                            _context17.next = 1;
	                            break;

	                          case 14:
	                            byteCount += binaryParser.position;

	                          case 15:
	                          case "end":
	                            return _context17.stop();
	                        }
	                      }
	                    }, _callee17, this);
	                  }));
	                  return _processEntries.apply(this, arguments);
	                };

	                processEntries = function _processEntries2(_x25, _x26) {
	                  return _processEntries.apply(this, arguments);
	                };

	                _context18.next = 4;
	                return this.init();

	              case 4:
	                if (!(this.normExpectedValueVectorsPosition === undefined)) {
	                  _context18.next = 6;
	                  break;
	                }

	                return _context18.abrupt("return");

	              case 6:
	                _context18.next = 8;
	                return this.skipExpectedValues(this.normExpectedValueVectorsPosition);

	              case 8:
	                nviStart = _context18.sent;
	                byteCount = INT;
	                _context18.next = 12;
	                return this.file.read(nviStart, INT);

	              case 12:
	                data = _context18.sent;

	                if (!(data.byteLength === 0)) {
	                  _context18.next = 15;
	                  break;
	                }

	                return _context18.abrupt("return");

	              case 15:
	                binaryParser = new BinaryParser(new DataView(data));
	                nEntries = binaryParser.getInt();
	                sizeEstimate = nEntries * 30;
	                range = {
	                  start: nviStart + byteCount,
	                  size: sizeEstimate
	                };
	                _context18.next = 21;
	                return this.file.read(range.start, range.size);

	              case 21:
	                data = _context18.sent;
	                this.normalizedExpectedValueVectors = {};
	                this.normVectorIndex = {}; // Recursively process entries

	                _context18.next = 26;
	                return processEntries.call(this, nEntries, data);

	              case 26:
	                this.config.nvi = nviStart.toString() + "," + byteCount;

	              case 27:
	              case "end":
	                return _context18.stop();
	            }
	          }
	        }, _callee18, this);
	      }));

	      function readNormExpectedValuesAndNormVectorIndex() {
	        return _readNormExpectedValuesAndNormVectorIndex.apply(this, arguments);
	      }

	      return readNormExpectedValuesAndNormVectorIndex;
	    }()
	    /**
	     * This function is used when the position of the norm vector index is unknown.  We must read through the
	     * normalized expected values to find the index
	     *
	     * @param dataset
	     * @returns {Promise}
	     */

	  }, {
	    key: "skipExpectedValues",
	    value: function () {
	      var _skipExpectedValues = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(start) {
	        var version, file, range, data, binaryParser, nEntries, parseNext, _parseNext;

	        return regeneratorRuntime.wrap(function _callee20$(_context20) {
	          while (1) {
	            switch (_context20.prev = _context20.next) {
	              case 0:
	                _parseNext = function _parseNext3() {
	                  _parseNext = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(start, nEntries) {
	                    var range, chunkSize, p0, data, binaryParser, type, unit, binSize, nValues, nChrScaleFactors;
	                    return regeneratorRuntime.wrap(function _callee19$(_context19) {
	                      while (1) {
	                        switch (_context19.prev = _context19.next) {
	                          case 0:
	                            range = {
	                              start: start,
	                              size: 500
	                            };
	                            chunkSize = 0;
	                            p0 = start;
	                            _context19.next = 5;
	                            return file.read(range.start, range.size);

	                          case 5:
	                            data = _context19.sent;
	                            binaryParser = new BinaryParser(new DataView(data));
	                            type = binaryParser.getString(); // type

	                            unit = binaryParser.getString(); // unit

	                            binSize = binaryParser.getInt(); // binSize

	                            nValues = version < 9 ? binaryParser.getInt() : binaryParser.getLong();
	                            chunkSize += binaryParser.position + nValues * (version < 9 ? DOUBLE$1 : FLOAT);
	                            range = {
	                              start: start + chunkSize,
	                              size: INT
	                            };
	                            _context19.next = 15;
	                            return file.read(range.start, range.size);

	                          case 15:
	                            data = _context19.sent;
	                            binaryParser = new BinaryParser(new DataView(data));
	                            nChrScaleFactors = binaryParser.getInt();
	                            chunkSize += INT + nChrScaleFactors * (INT + (version < 9 ? DOUBLE$1 : FLOAT));
	                            nEntries--;

	                            if (!(nEntries === 0)) {
	                              _context19.next = 24;
	                              break;
	                            }

	                            return _context19.abrupt("return", p0 + chunkSize);

	                          case 24:
	                            return _context19.abrupt("return", parseNext(p0 + chunkSize, nEntries));

	                          case 25:
	                          case "end":
	                            return _context19.stop();
	                        }
	                      }
	                    }, _callee19);
	                  }));
	                  return _parseNext.apply(this, arguments);
	                };

	                parseNext = function _parseNext2(_x28, _x29) {
	                  return _parseNext.apply(this, arguments);
	                };

	                version = this.version;
	                file = new BufferedFile({
	                  file: this.file,
	                  size: 256000
	                });
	                range = {
	                  start: start,
	                  size: INT
	                };
	                _context20.next = 7;
	                return file.read(range.start, range.size);

	              case 7:
	                data = _context20.sent;
	                binaryParser = new BinaryParser(new DataView(data));
	                nEntries = binaryParser.getInt(); // Total # of expected value chunks

	                if (!(nEntries === 0)) {
	                  _context20.next = 14;
	                  break;
	                }

	                return _context20.abrupt("return", start + INT);

	              case 14:
	                return _context20.abrupt("return", parseNext(start + INT, nEntries));

	              case 15:
	              case "end":
	                return _context20.stop();
	            }
	          }
	        }, _callee20, this);
	      }));

	      function skipExpectedValues(_x27) {
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

	      var sizeInBytes = this.version < 9 ? binaryParser.getInt() : binaryParser.getLong(); //4:8

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
	    } // NOTE sties are not currently used
	    // async getSites(chrName) {
	    //     let sites = this.fragmentSitesCache[chrName];
	    //     if (!sites) {
	    //         if (this.fragmentSitesIndex) {
	    //             const entry = self.fragmentSitesIndex[chrName];
	    //             if (entry && entry.nSites > 0) {
	    //                 sites = await this.readSites(entry.position, entry.nSites)
	    //                 this.fragmentSitesCache[chrName] = sites;
	    //             }
	    //         }
	    //     }
	    //     return sites;
	    // }
	    //

	  }]);

	  return HicFile;
	}();

	function getNormalizationVectorKey(type, chrIdx, unit, resolution) {
	  return type + "_" + chrIdx + "_" + unit + "_" + resolution;
	}

	function isGoogleDrive(url) {
	  return url.indexOf("drive.google.com") >= 0 || url.indexOf("www.googleapis.com/drive") > 0;
	}

	var Block = function Block(blockNumber, zoomData, records, idx) {
	  _classCallCheck(this, Block);

	  this.blockNumber = blockNumber;
	  this.zoomData = zoomData;
	  this.records = records;
	  this.idx = idx;
	};

	var BlockCache = /*#__PURE__*/function () {
	  function BlockCache() {
	    _classCallCheck(this, BlockCache);

	    this.resolution = undefined;
	    this.map = new LRU(6);
	  }

	  _createClass(BlockCache, [{
	    key: "set",
	    value: function set(resolution, key, value) {
	      if (this.resolution !== resolution) {
	        this.map.clear();
	      }

	      this.resolution = resolution;
	      this.map.set(key, value);
	    }
	  }, {
	    key: "get",
	    value: function get(resolution, key) {
	      return this.resolution === resolution ? this.map.get(key) : undefined;
	    }
	  }, {
	    key: "has",
	    value: function has(resolution, key) {
	      return this.resolution === resolution && this.map.has(key);
	    }
	  }]);

	  return BlockCache;
	}();

	var Straw = /*#__PURE__*/function () {
	  function Straw(config) {
	    _classCallCheck(this, Straw);

	    this.config = config;
	    this.hicFile = new HicFile(config);
	  }

	  _createClass(Straw, [{
	    key: "getMetaData",
	    value: function () {
	      var _getMetaData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
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
	    }() //straw <NONE/VC/VC_SQRT/KR> <ile> <chr1>[:x1:x2] <chr2>[:y1:y2] <BP/FRAG> <binsize>

	  }, {
	    key: "getContactRecords",
	    value: function () {
	      var _getContactRecords = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(normalization, region1, region2, units, binsize) {
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                return _context2.abrupt("return", this.hicFile.getContactRecords(normalization, region1, region2, units, binsize));

	              case 1:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function getContactRecords(_x, _x2, _x3, _x4, _x5) {
	        return _getContactRecords.apply(this, arguments);
	      }

	      return getContactRecords;
	    }()
	  }, {
	    key: "getNormalizationOptions",
	    value: function () {
	      var _getNormalizationOptions = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                return _context3.abrupt("return", this.hicFile.getNormalizationOptions());

	              case 1:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function getNormalizationOptions() {
	        return _getNormalizationOptions.apply(this, arguments);
	      }

	      return getNormalizationOptions;
	    }()
	  }, {
	    key: "getNVI",
	    value: function () {
	      var _getNVI = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this.hicFile.getNormVectorIndex();

	              case 2:
	                return _context4.abrupt("return", this.hicFile.config.nvi);

	              case 3:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function getNVI() {
	        return _getNVI.apply(this, arguments);
	      }

	      return getNVI;
	    }()
	  }, {
	    key: "printIndexStats",
	    value: function () {
	      var _printIndexStats = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return this.hicFile.printIndexStats();

	              case 2:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));

	      function printIndexStats() {
	        return _printIndexStats.apply(this, arguments);
	      }

	      return printIndexStats;
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

	return Straw;

})));
